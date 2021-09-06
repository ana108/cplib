import fs from 'fs';
import fsPromises from 'fs/promises';
import { copyFile } from 'fs/promises';
import { https } from 'follow-redirects';
import { loadPDF, extractYear, updateAllFuelSurcharges, REGULAR, SMALL_BUSINESS, e2eProcess } from './autoload';
import { setDB, getHighestYear, updateFuelSurcharge, resetDB } from './db/sqlite3';
// this will check if update needs to happen and call 
// all the functions below
export interface updateresults {
    regular: boolean,
    smallBusiness: boolean
};
export const checkAndUpdate = async () => {
    const currentYear = new Date().getFullYear();
    let datacheck: updateresults;
    let dataLoadDbPath: string;
    try {
        datacheck = await savePDFS(currentYear);
        if (!datacheck.regular && !datacheck.smallBusiness) {
            console.log('Nothing updated, because data check came back as not needed');
            return Promise.resolve(); // all good
        }
        dataLoadDbPath = `${__dirname}/cplib_interim.db`;
        // step one - take a copy of the current cplib
        await copyFile(`${__dirname}/resources/cplib.db`, dataLoadDbPath);
        console.log('Copied the db file');
        // close all db connections, and open to copied db file
        await setDB(dataLoadDbPath);
        console.log('Set the db');
        // update all fuel surcharge
        //await updateAllFuelSurcharges();
        //console.log('Updated the fuel surcharge on the interim db');
    } catch (e) {
        console.log('Error occurred during preparatory processing ', e);
        Promise.reject(e);
    }
    return new Promise<void>(async (resolve, reject) => {
        try {
            if (datacheck.regular) {
                await e2eProcess(currentYear, REGULAR);
            }
            if (datacheck.smallBusiness) {
                await e2eProcess(currentYear, SMALL_BUSINESS);
            }
            console.log(`Copy over the updated db from ${dataLoadDbPath} to ${__dirname}/resources/cplib.db`);
            await copyFile(dataLoadDbPath, `${__dirname}/resources/cplib.db`);
            console.log('Closing db');
            await resetDB();
            console.log('Delete temp db');
            await fsPromises.unlink(dataLoadDbPath);
            resolve();
        } catch (err) {
            reject(err);
        }
    });
}

export const savePDFS = async (year): Promise<updateresults> => {
    const currentHighestYear = await getHighestYear();
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
    const regularRatesAPI = new Promise<any>((resolve, reject) => {
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
    const smallBusinessRatesAPI = new Promise<any>((resolve, reject) => {
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
        return Promise.reject('Failed to download the files, ending the data load process now');
    };

    // check the year of the pdf returned for regular customers.
    // this is done by extracting the first page and seeing the year displayed there
    const regularPDFFirstPage = await loadPDF(regularPDF);
    const yearOfRegular = extractYear(regularPDFFirstPage);
    let updateRates: updateresults = {
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
        await copyFile(regularPDF, regularPdfDest);
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
        await copyFile(smallBusinessPDF, smallBusinessPdfDest);
    }
    await cleanUp();
    return Promise.resolve(updateRates);
}

export const cleanUp = async () => {
    const tmpDir = __dirname + '/resources/tmp';
    return new Promise<any>((resolve, reject) => {
        fs.rmdir(tmpDir, { recursive: true }, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve(true);
            }
        })
    });
}

export const loadData = async () => {
    // create a copy of cplib.db
    // update fuel surcharge on it
    // do data load using autoload
    // if autoload fails, run clean up
    // if autoload succeeds, copy over the db
}