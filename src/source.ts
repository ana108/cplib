import fs from 'fs';
// import https from 'https';
import { https } from 'follow-redirects';

// this will check if update needs to happen and call 
// all the functions below
export const checkAndUpdate = async () => {

}

export const savePDFS = async (year: number) => {
    const tmpDir = __dirname + '/resources/tmp';
    if (!fs.existsSync(tmpDir)) {
        fs.mkdirSync(tmpDir);
    }
    const regularPDF = `Rates_${year}.pdf`;
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
            res.pipe(fs.createWriteStream(`${tmpDir}/${regularPDF}`)).on('finish', () => {
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

    const smallBusinessPDF = `SBprices-e-${year}.pdf`;
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
        const req = https.request(smallBusinessOptions).pipe(fs.createWriteStream(`${tmpDir}/${smallBusinessPDF}`).on('finish', () => {
            resolve(true);
        }).on('error', (error) => {
            reject(error);
        }));
        req.on('error', (error) => {
            reject(error);
        });
        req.end();
    });
    Promise.all([regularRatesAPI, smallBusinessRatesAPI]).then();
    // create a tmp directory under resources
    // download pdfs and save under tmp
    // figure out the year that the pdf is for
    // do a list of 
}
export const cleanUp = async () => {
    const tmpDir = __dirname + '/resources/tmp';
    fs.rmdir(tmpDir, { recursive: true }, (err) => {
        // to do if fails to clean up
    })
}

export const loadData = async () => {
    // create a copy of cplib.db
    // update fuel surcharge on it
    // do data load using autoload
    // if autoload fails, run clean up
    // if autoload succeeds, copy over the db
}