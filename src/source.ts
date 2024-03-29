import fs from 'fs';
import fsPromises from 'fs/promises';
import { copyFile } from 'fs/promises';
import { https } from 'follow-redirects';
import { loadPDF, extractYear, updateAllFuelSurcharges, REGULAR, SMALL_BUSINESS, e2eProcess } from './autoload';
import { getHighestYear, resetDB, deleteRatesByYear, setWriteDB } from './db/sqlite3';
import { logger } from './log';
import path from 'path';
export interface updateresults {
    regular: { update: boolean, year: number },
    smallBusiness: { update: boolean, year: number }
}
export const checkAndUpdate = async (): Promise<void> => {
    const currentYear = new Date().getFullYear();
    let currentHighestYear;
    let datacheck: updateresults;
    let dataLoadDbPath: string;
    const fileReading = fs.readFileSync(path.join(__dirname,'resources/isUpdating.json'));
    const state = JSON.parse(fileReading.toString());
    try {
        if (state.isUpdating) {
            logger.info('Not updating the database because it is currently updating');
            return Promise.resolve();
        }

        currentHighestYear = await getHighestYear();
        if (currentYear === currentHighestYear) {
            logger.info(`Current year ${currentYear} matches current highest year ${currentHighestYear}, therefore not updating`);
            return Promise.resolve();
        }
        await setUpdating(state, true);
        datacheck = await savePDFS(currentYear, currentHighestYear);
        if (!datacheck.regular && !datacheck.smallBusiness) {
            logger.info('Nothing updated, because data check came back as not needed');
            return Promise.resolve(); // all good
        }

        dataLoadDbPath = path.join(__dirname, `cplib_interim.db`);
        logger.info('Updating the fuel surcharge on the source db');
        await updateAllFuelSurcharges();
        await copyFile(path.join(__dirname, `resources/cplib.db`), dataLoadDbPath);
        logger.info('Copied the current db file to use for updating (interim)');
        // close all write only db connections, and open to copied db file
        logger.info('Make all writes go to the new temporary db');
        await setWriteDB(dataLoadDbPath);
    } catch (e) {
        logger.error('Error occurred during preparatory processing ', e);
        await setUpdating(state, false);
        return Promise.reject(e);
    }
    try {
        if (datacheck.regular.update) {
            logger.debug("Data check regular update");
            const numberDeletedRows = await deleteRatesByYear(datacheck.regular.year, 'regular');
            logger.debug(`Number of rows deleted for year ${datacheck.regular.year} type regular: ${numberDeletedRows}`);
            await e2eProcess(datacheck.regular.year, REGULAR);
            logger.debug(`Done e2e process for regular`);
        }
        if (datacheck.smallBusiness.update) {
            logger.info("Data check small business update");
            const numberDeletedRows = await deleteRatesByYear(datacheck.smallBusiness.year, 'small_business');
            logger.debug(`Number of rows deleted for year ${datacheck.smallBusiness.year} type small business: ${numberDeletedRows}`);
            await e2eProcess(datacheck.smallBusiness.year, SMALL_BUSINESS);
        }
        logger.info('Done e2e process');
        logger.info(`Copy over the updated db from ${dataLoadDbPath} to ${__dirname}/resources/cplib.db`);
        await copyFile(dataLoadDbPath, path.join(__dirname, `resources/cplib.db`));
        logger.info('Closing db');
        await resetDB();
        logger.info('Delete temp db');
        await fsPromises.unlink(dataLoadDbPath);
        await setUpdating(state, false);
        return Promise.resolve();
    } catch (err) {
        return Promise.reject(err);
    }
}

export const savePDFS = async (year: number, currentHighestYear: number): Promise<updateresults> => {
    const tmpDir = path.join(__dirname, 'resources/tmp');
    // tmp directory to load the pdf into so we can check if new pdf has been posted
    if (!fs.existsSync(tmpDir)) {
        const newPath = fs.mkdirSync(tmpDir, { recursive: true });
    }
    const regularPDF = `${tmpDir}/RegularRates_${year}.pdf`;
    const regularOptions = {
        followAllRedirects: true,
        hostname: 'www.canadapost-postescanada.ca',
        port: 443,
        path: '/tools/pg/prices/CPprices-e.pdf',
        method: 'GET',
        headers: {
            'Content-Type': 'application/pdf',
            Accept: 'application/pdf',
        },
    };
    const regularRatesAPI = new Promise<boolean>((resolve, reject) => {
        const req = https.request(regularOptions, res => {
            res.on('error', (e) => {
                reject(e);
            });
            res.pipe(fs.createWriteStream(regularPDF)).on('finish', () => {
                resolve(true);
            }).on('error', (e) => {
                reject(e);
            });
        });
        req.on('error', (error) => {
            logger.error(`Failed to download regular rates pdf with ${error}`);
            reject(error);
        });
        req.end();
    });

    const smallBusinessPDF = `${tmpDir}/SmallBusiness_Rates_${year}.pdf`;
    const smallBusinessOptions = {
        followAllRedirects: true,
        hostname: 'www.canadapost-postescanada.ca',
        port: 443,
        path: '/tools/pg/prices/SBPrices-e.pdf',
        method: 'GET',
        headers: {
            'Content-Type': 'application/pdf',
            Accept: 'application/pdf',
        },
    };
    const smallBusinessRatesAPI = new Promise<boolean>((resolve, reject) => {
        const req = https.request(smallBusinessOptions, res => {
            res.pipe(fs.createWriteStream(smallBusinessPDF).on('finish', () => {
                resolve(true);
            })).on('error', e => {
                reject(e);
            });
        });

        req.on('error', (error) => {
            reject(error);
        });
        req.end();
    });
    try {
        await Promise.all([regularRatesAPI, smallBusinessRatesAPI]);
    } catch (error) {
        return Promise.reject('Failed to download the files, ending the data load process now')
    }

    // check the year of the pdf returned for regular customers.
    // this is done by extracting the first page and seeing the year displayed there
    const regularPDFFirstPage = await loadPDF(regularPDF);
    const yearOfRegular = extractYear(regularPDFFirstPage);
    const updateRates: updateresults = {
        regular: {
            update: false,
            year: yearOfRegular
        },
        smallBusiness: {
            update: false,
            year
        }
    };
    if (isNaN(yearOfRegular)) {
        return Promise.reject('Failed to extract year from the title page of the regular rates pdf from canada post');
    }
    if (currentHighestYear !== yearOfRegular && yearOfRegular > currentHighestYear) {
        // copy the regular pdf, rename it to its final destination
        updateRates.regular.update = true;
        let regularPdfDest = path.join(__dirname, `resources/regular/${yearOfRegular}`);
        if (!fs.existsSync(regularPdfDest)) {
            fs.mkdirSync(regularPdfDest);
        }
        regularPdfDest = regularPdfDest + `/Rates_${yearOfRegular}.pdf`;
        try {
            await copyFile(regularPDF, regularPdfDest);
        } catch (e) {
            logger.error(`Error when copying from ${regularPDF} to ${regularPdfDest} Error:  ${e}`);
        }
    } else {
        logger.info(`The year in PDF is not higher than currentHighestYear ${currentHighestYear} Year found in pdf: ${yearOfRegular}`);
    }
    const smallBusinessPDFFirstPage = await loadPDF(smallBusinessPDF);
    const yearOfSmallBusiness = extractYear(smallBusinessPDFFirstPage);
    if (isNaN(yearOfSmallBusiness)) {
        return Promise.reject('Failed to extract year from the title page of the small business rates pdf from canada post');
    }
    if (currentHighestYear !== yearOfSmallBusiness && yearOfSmallBusiness > currentHighestYear) {
        updateRates.smallBusiness.update = true;
        updateRates.smallBusiness.year = yearOfSmallBusiness;
        let smallBusinessPdfDest = path.join(__dirname, `resources/small_business/${yearOfRegular}`);
        if (!fs.existsSync(smallBusinessPdfDest)) {
            fs.mkdirSync(smallBusinessPdfDest);
        }
        smallBusinessPdfDest = path.join(smallBusinessPdfDest, `Rates_${yearOfRegular}.pdf`);
        try {
            await copyFile(smallBusinessPDF, smallBusinessPdfDest);
        } catch (e) {
            logger.error(`Error when copying from ${smallBusinessPDF} to ${smallBusinessPdfDest} Error:  ${e}`);
        }
    }
    await cleanUp();
    return Promise.resolve(updateRates);
}

export const cleanUp = async (): Promise<boolean> => {
    const tmpDir = path.join(__dirname, 'resources/tmp');
    return new Promise<boolean>((resolve, reject) => {
        fs.rmdir(tmpDir, { recursive: true }, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve(true);
            }
        })
    });
}
const setUpdating = async (currentValue: { isUpdating: boolean }, newValue: boolean): Promise<void> => {
    if (newValue) {
        currentValue.isUpdating = true;
    } else {
        currentValue.isUpdating = false;
    }
    return new Promise<void>((resolve, reject) => {
        fs.writeFile(path.join(__dirname, 'resources/isUpdating.json'), JSON.stringify(currentValue, null, 4), err => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

// commented to disable auto update
/*checkAndUpdate().catch(err => {
    if (err && err.length > 0 && err.indexOf('409') >= 0) {
        (<any>process).send({ isError: '409' });
    }
}); */