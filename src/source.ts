import fs from 'fs';
import { copyFile } from 'fs/promises';
import { https } from 'follow-redirects';
import { loadPDF, extractYear } from './autoload';
// this will check if update needs to happen and call 
// all the functions below
export const checkAndUpdate = async () => {

}

export const savePDFS = async (year: number): Promise<any> => {
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
    let updateRates = {
        regular: false,
        smallBusiness: false
    };
    if (isNaN(yearOfRegular)) {
        return Promise.reject('Failed to extract year from the title page of the regular rates pdf from canada post');
    }
    if (year !== yearOfRegular && yearOfRegular > year) {
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
    if (year !== yearOfSmallBusiness && yearOfSmallBusiness > year) {
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