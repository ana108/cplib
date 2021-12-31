import fs from 'fs';
import fsPromises from 'fs/promises';
import { copyFile } from 'fs/promises';
import { https } from 'follow-redirects';
import { loadPDF, extractYear, updateAllFuelSurcharges, REGULAR, SMALL_BUSINESS, e2eProcess } from './autoload';
import { getHighestYear, resetDB, deleteRatesByYear, setWriteDB } from './db/sqlite3';

export interface updateresults {
    regular: boolean,
    smallBusiness: boolean
}
export const checkAndUpdate = async (): Promise<void> => {
    const currentYear = new Date().getFullYear();
    let datacheck: updateresults;
    let dataLoadDbPath: string;
    const fileReading = fs.readFileSync(__dirname + '/resources/isUpdating.json');
    let state = JSON.parse(fileReading.toString());
    try {
        if (state.isUpdating) {
            console.log('Not updating the database because it is currently updating');
            return Promise.resolve();
        }

        const currentHighestYear = await getHighestYear();
        if (currentYear === currentHighestYear) {
            console.log(`Current year ${currentYear} matches current highest year ${currentHighestYear}, therefore not updating`);
            return Promise.resolve();
        }
        await setUpdating(state, true);
        datacheck = await savePDFS(currentYear, currentHighestYear);
        if (!datacheck.regular && !datacheck.smallBusiness) {
            console.log('Nothing updated, because data check came back as not needed');
            return Promise.resolve(); // all good
        }

        dataLoadDbPath = `${__dirname}/cplib_interim.db`;
        console.log('Updating the fuel surcharge on the source db');
        await updateAllFuelSurcharges();
        await copyFile(`${__dirname}/resources/cplib.db`, dataLoadDbPath);
        console.log('Copied the db file');
        // close all write only db connections, and open to copied db file
        console.log('Set the writing db to be temp db');
        await setWriteDB(dataLoadDbPath);
    } catch (e) {
        console.log('Error occurred during preparatory processing ', e);
        await setUpdating(state, false);
        return Promise.reject(e);
    }
    try {
        if (datacheck.regular) {
            const numberDeletedRows = await deleteRatesByYear(currentYear, 'regular');
            console.log(`Number of rows deleted for year ${currentYear} type regular: `, numberDeletedRows);
            await e2eProcess(currentYear, REGULAR);
        }
        if (datacheck.smallBusiness) {
            const numberDeletedRows = await deleteRatesByYear(currentYear, 'small_business');
            console.log(`Number of rows deleted for year ${currentYear} type small business: `, numberDeletedRows);
            await e2eProcess(currentYear, SMALL_BUSINESS);
        }
        console.log('Done e2e process');
        console.log(`Copy over the updated db from ${dataLoadDbPath} to ${__dirname}/resources/cplib.db`);
        await copyFile(dataLoadDbPath, `${__dirname}/resources/cplib.db`);
        console.log('Closing db');
        await resetDB();
        console.log('Delete temp db');
        await fsPromises.unlink(dataLoadDbPath);
        await setUpdating(state, false);
        return Promise.resolve();
    } catch (err) {
        return Promise.reject(err);
    }
}

export const savePDFS = async (year: number, currentHighestYear: number): Promise<updateresults> => {
    const tmpDir = __dirname + '/resources/tmp';
    // tmp directory to load the pdf into so we can check if new pdf has been posted
    if (!fs.existsSync(tmpDir)) {
        fs.mkdirSync(tmpDir);
    }
    const regularPDF = `${tmpDir}/Regular_Rates_${year}.pdf`;
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
            console.log(`Failed with error ${error}`);
            reject(error);
        });
        req.end();
    });

    const smallBusinessPDF = `${tmpDir}/Rates_${year}.pdf`;
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
        regular: false,
        smallBusiness: false
    };
    if (isNaN(yearOfRegular)) {
        return Promise.reject('Failed to extract year from the title page of the regular rates pdf from canada post');
    }
    if (currentHighestYear !== yearOfRegular && yearOfRegular > currentHighestYear) {
        // copy the regular pdf, rename it to its final destination
        updateRates.regular = true;
        let regularPdfDest = __dirname + `/resources/regular/${yearOfRegular}`;
        if (!fs.existsSync(regularPdfDest)) {
            fs.mkdirSync(regularPdfDest);
        }
        regularPdfDest = regularPdfDest + `/Rates_${yearOfRegular}.pdf`;
        try {
            await copyFile(regularPDF, regularPdfDest);
        } catch (e) {
            console.log('Error on copy ', e);
        }
    } else {
        console.log(`The year in PDF is not higher than currentHighestYear ${currentHighestYear} Year found in pdf: ${yearOfRegular}`);
    }
    const smallBusinessPDFFirstPage = await loadPDF(smallBusinessPDF);
    const yearOfSmallBusiness = extractYear(smallBusinessPDFFirstPage);
    if (isNaN(yearOfSmallBusiness)) {
        return Promise.reject('Failed to extract year from the title page of the small business rates pdf from canada post');
    }
    if (currentHighestYear !== yearOfSmallBusiness && yearOfSmallBusiness > currentHighestYear) {
        updateRates.smallBusiness = true;
        let smallBusinessPdfDest = __dirname + `/resources/small_business/${yearOfRegular}`;
        if (!fs.existsSync(smallBusinessPdfDest)) {
            fs.mkdirSync(smallBusinessPdfDest);
        }
        smallBusinessPdfDest = smallBusinessPdfDest + `/Rates_${yearOfRegular}.pdf`;
        try {
            await copyFile(smallBusinessPDF, smallBusinessPdfDest);
        } catch (e) {
            console.log('Small Business Copy Error ', e);
        }
    }
    await cleanUp();
    return Promise.resolve(updateRates);
}

export const cleanUp = async (): Promise<boolean> => {
    const tmpDir = __dirname + '/resources/tmp';
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
        fs.writeFile(__dirname + '/resources/isUpdating.json', JSON.stringify(currentValue, null, 4), err => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

checkAndUpdate().catch(err => {
    if (err && err.indexOf('409') >= 0) {
        (<any>process).send({ isError: '409' });
    }
})