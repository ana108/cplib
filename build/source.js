"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanUp = exports.savePDFS = exports.checkAndUpdate = void 0;
const fs_1 = __importDefault(require("fs"));
const promises_1 = __importDefault(require("fs/promises"));
const promises_2 = require("fs/promises");
const follow_redirects_1 = require("follow-redirects");
const autoload_1 = require("./autoload");
const sqlite3_1 = require("./db/sqlite3");
const log_1 = require("./log");
exports.checkAndUpdate = async () => {
    const currentYear = new Date().getFullYear();
    let currentHighestYear;
    let datacheck;
    let dataLoadDbPath;
    const fileReading = fs_1.default.readFileSync(__dirname + '/resources/isUpdating.json');
    const state = JSON.parse(fileReading.toString());
    try {
        if (state.isUpdating) {
            log_1.logger.info('Not updating the database because it is currently updating');
            return Promise.resolve();
        }
        currentHighestYear = await sqlite3_1.getHighestYear();
        if (currentYear === currentHighestYear) {
            log_1.logger.info(`Current year ${currentYear} matches current highest year ${currentHighestYear}, therefore not updating`);
            return Promise.resolve();
        }
        await setUpdating(state, true);
        datacheck = await exports.savePDFS(currentYear, currentHighestYear);
        if (!datacheck.regular && !datacheck.smallBusiness) {
            log_1.logger.info('Nothing updated, because data check came back as not needed');
            return Promise.resolve(); // all good
        }
        dataLoadDbPath = `${__dirname}/cplib_interim.db`;
        log_1.logger.info('Updating the fuel surcharge on the source db');
        await autoload_1.updateAllFuelSurcharges();
        await promises_2.copyFile(`${__dirname}/resources/cplib.db`, dataLoadDbPath);
        log_1.logger.info('Copied the current db file to use for updating (interim)');
        // close all write only db connections, and open to copied db file
        log_1.logger.info('Make all writes go to the new temporary db');
        await sqlite3_1.setWriteDB(dataLoadDbPath);
    }
    catch (e) {
        log_1.logger.error('Error occurred during preparatory processing ', e);
        await setUpdating(state, false);
        return Promise.reject(e);
    }
    try {
        if (datacheck.regular.update) {
            log_1.logger.debug("Data check regular update");
            const numberDeletedRows = await sqlite3_1.deleteRatesByYear(datacheck.regular.year, 'regular');
            log_1.logger.debug(`Number of rows deleted for year ${datacheck.regular.year} type regular: ${numberDeletedRows}`);
            await autoload_1.e2eProcess(datacheck.regular.year, autoload_1.REGULAR);
            log_1.logger.debug(`Done e2e process for regular`);
        }
        if (datacheck.smallBusiness.update) {
            log_1.logger.info("Data check small business update");
            const numberDeletedRows = await sqlite3_1.deleteRatesByYear(datacheck.smallBusiness.year, 'small_business');
            log_1.logger.debug(`Number of rows deleted for year ${datacheck.smallBusiness.year} type small business: ${numberDeletedRows}`);
            await autoload_1.e2eProcess(datacheck.smallBusiness.year, autoload_1.SMALL_BUSINESS);
        }
        log_1.logger.info('Done e2e process');
        log_1.logger.info(`Copy over the updated db from ${dataLoadDbPath} to ${__dirname}/resources/cplib.db`);
        await promises_2.copyFile(dataLoadDbPath, `${__dirname}/resources/cplib.db`);
        log_1.logger.info('Closing db');
        await sqlite3_1.resetDB();
        log_1.logger.info('Delete temp db');
        await promises_1.default.unlink(dataLoadDbPath);
        await setUpdating(state, false);
        return Promise.resolve();
    }
    catch (err) {
        return Promise.reject(err);
    }
};
exports.savePDFS = async (year, currentHighestYear) => {
    const tmpDir = __dirname + '/resources/tmp';
    // tmp directory to load the pdf into so we can check if new pdf has been posted
    if (!fs_1.default.existsSync(tmpDir)) {
        const newPath = fs_1.default.mkdirSync(tmpDir, { recursive: true });
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
    const regularRatesAPI = new Promise((resolve, reject) => {
        const req = follow_redirects_1.https.request(regularOptions, res => {
            res.on('error', (e) => {
                reject(e);
            });
            res.pipe(fs_1.default.createWriteStream(regularPDF)).on('finish', () => {
                resolve(true);
            }).on('error', (e) => {
                reject(e);
            });
        });
        req.on('error', (error) => {
            log_1.logger.error(`Failed to download regular rates pdf with ${error}`);
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
    const smallBusinessRatesAPI = new Promise((resolve, reject) => {
        const req = follow_redirects_1.https.request(smallBusinessOptions, res => {
            res.pipe(fs_1.default.createWriteStream(smallBusinessPDF).on('finish', () => {
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
    }
    catch (error) {
        return Promise.reject('Failed to download the files, ending the data load process now');
    }
    // check the year of the pdf returned for regular customers.
    // this is done by extracting the first page and seeing the year displayed there
    const regularPDFFirstPage = await autoload_1.loadPDF(regularPDF);
    const yearOfRegular = autoload_1.extractYear(regularPDFFirstPage);
    const updateRates = {
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
        let regularPdfDest = __dirname + `/resources/regular/${yearOfRegular}`;
        if (!fs_1.default.existsSync(regularPdfDest)) {
            fs_1.default.mkdirSync(regularPdfDest);
        }
        regularPdfDest = regularPdfDest + `/Rates_${yearOfRegular}.pdf`;
        try {
            await promises_2.copyFile(regularPDF, regularPdfDest);
        }
        catch (e) {
            log_1.logger.error(`Error when copying from ${regularPDF} to ${regularPdfDest} Error:  ${e}`);
        }
    }
    else {
        log_1.logger.info(`The year in PDF is not higher than currentHighestYear ${currentHighestYear} Year found in pdf: ${yearOfRegular}`);
    }
    const smallBusinessPDFFirstPage = await autoload_1.loadPDF(smallBusinessPDF);
    const yearOfSmallBusiness = autoload_1.extractYear(smallBusinessPDFFirstPage);
    if (isNaN(yearOfSmallBusiness)) {
        return Promise.reject('Failed to extract year from the title page of the small business rates pdf from canada post');
    }
    if (currentHighestYear !== yearOfSmallBusiness && yearOfSmallBusiness > currentHighestYear) {
        updateRates.smallBusiness.update = true;
        updateRates.smallBusiness.year = yearOfSmallBusiness;
        let smallBusinessPdfDest = __dirname + `/resources/small_business/${yearOfRegular}`;
        if (!fs_1.default.existsSync(smallBusinessPdfDest)) {
            fs_1.default.mkdirSync(smallBusinessPdfDest);
        }
        smallBusinessPdfDest = smallBusinessPdfDest + `/Rates_${yearOfRegular}.pdf`;
        try {
            await promises_2.copyFile(smallBusinessPDF, smallBusinessPdfDest);
        }
        catch (e) {
            log_1.logger.error(`Error when copying from ${smallBusinessPDF} to ${smallBusinessPdfDest} Error:  ${e}`);
        }
    }
    await exports.cleanUp();
    return Promise.resolve(updateRates);
};
exports.cleanUp = async () => {
    const tmpDir = __dirname + '/resources/tmp';
    return new Promise((resolve, reject) => {
        fs_1.default.rmdir(tmpDir, { recursive: true }, (err) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(true);
            }
        });
    });
};
const setUpdating = async (currentValue, newValue) => {
    if (newValue) {
        currentValue.isUpdating = true;
    }
    else {
        currentValue.isUpdating = false;
    }
    return new Promise((resolve, reject) => {
        fs_1.default.writeFile(__dirname + '/resources/isUpdating.json', JSON.stringify(currentValue, null, 4), err => {
            if (err) {
                reject(err);
            }
            else {
                resolve();
            }
        });
    });
};
exports.checkAndUpdate().catch(err => {
    if (err && err.length > 0 && err.indexOf('409') >= 0) {
        process.send({ isError: '409' });
    }
});
