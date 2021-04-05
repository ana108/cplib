import fs from 'fs';
import readline from 'readline';
import { once } from 'events';
import { saveToDb } from './db/sqlite3';
var os = require("os");

export const readFile = async function (fileName: string, type: string, year: number, customer_type: string, country: string): Promise<any> {
    const stream = fs.createReadStream(fileName, { emitClose: true });
    const rl = readline.createInterface(stream);
    let labels: string[] = [];
    let isFirst = true;
    const inputsAll: string[] = [];
    rl.on('line', (input: string) => {
        if (isFirst) {
            labels = input.split(' ');
            isFirst = false;
        } else {
            const tokens = input.split(' ');
            const maxWeight = tokens[0];
            for (let i = 2; i < labels.length; i++) {
                const price = tokens[i];
                const rate_code = labels[i];
                const insertDataSQL = `insert into RATES(year, max_weight, weight_type, rate_code, price, type, country, customer_type)
                 VALUES(${year}, ${maxWeight}, 'kg', '${rate_code}', ${price}, '${type}', '${country}', '${customer_type}')`;
                inputsAll.push(insertDataSQL);
            }
        }
    });
    await once(rl, 'close');
    return Promise.all(inputsAll.map(async entry => {
        return saveToDb(entry)
    }));
}
export const automatePriorityFile = async (): Promise<any> => {
    const stream = fs.createReadStream(`C:/Users/flute/Documents/GitHub/cplib/resources/small_business/2021/express_usa_prices.txt`, { emitClose: true });
    const rl = readline.createInterface(stream);
    let isFirst = true;
    const rates: string[] = [];
    const weightClass: string[] = [];
    rl.on('line', (input: string) => {
        rates.push(input);
    });
    await once(rl, 'close');
    console.log('Done closing file. Starting with weight class');
    const streamTwo = fs.createReadStream(`C:/Users/flute/Documents/GitHub/cplib/resources/small_business/2021/express_usa_weight_class.txt`, { emitClose: true });
    const r2 = readline.createInterface(streamTwo);
    r2.on('line', (input: string) => {
        weightClass.push(input);
    });
    await once(r2, 'close');
    console.log('Done closing weight class. Start processing');

    var logger = fs.createWriteStream(`C:/Users/flute/Documents/GitHub/cplib/resources/small_business/2021/express_usa.txt`, {
        flags: 'a' // 'a' means appending (old data will be preserved)
    });
    logger.write(rates[0] + os.EOL);
    for (var i = 0; i < weightClass.length; i++) {
        logger.write(weightClass[i] + ' ' + rates[i + 1] + os.EOL);
    };
    logger.end();
    return;
}
export const oneTimePopulate = async (deliveryType: string): Promise<any> => { // Promise<any>
    let sqlStmt = `insert into INTERNATIONAL_CODES values("$country_name", '$country_code', '$rate_code', '${deliveryType}')`;
    let inputsAll: string[] = [];

    const stream = fs.createReadStream(`${__dirname}/../resources/international_rate_code_mapping_${deliveryType}.txt`, { emitClose: true });
    const rl = readline.createInterface(stream);
    let isFirst = true;
    const mappingRows: string[] = [];
    rl.on('line', (input: string) => {
        if (isFirst) {
            isFirst = !isFirst
        } else {
            mappingRows.push(input);
        }
    });
    await once(rl, 'close');
    mappingRows.forEach(row => {
        let tokens = row.split(' ');
        let numTokens = tokens.length;
        let endOfCountryName = row.indexOf(tokens[numTokens - 4]);
        let sql = sqlStmt.replace('$country_name', row.substr(0, endOfCountryName).toUpperCase().trim()).replace('$country_code', tokens[numTokens - 4].toUpperCase().trim()).replace('$rate_code', tokens[numTokens - 3].toUpperCase().trim());
        inputsAll.push(sql);
    });
    return Promise.all(inputsAll.map(async entry => {
        // console.log(entry);
        return saveToDb(entry)
    }));
}
export const files = async function (): Promise<any> {
    const YEAR = new Date().getFullYear();
    const regular_rate_base_dir = `${__dirname}/../resources/regular/${YEAR}/`;
    let dataPrepared = fs.existsSync(regular_rate_base_dir)
    if (!dataPrepared) {
        console.log('Could not find the directory ' + regular_rate_base_dir);
        return `Failed to find directory ${regular_rate_base_dir} Please prepare data for year ${YEAR} or set the year variable to previous year`;
    }

    /*const FILES = {
        'express': ['express_canada_1.txt', 'express_canada_2.txt'],
        'priority': ['priority_canada_1.txt', 'priority_canada_2.txt'],
        'regular': ['regular_canada_1.txt', 'regular_canada_2.txt']
    }; */
    const FILES = {
        'express': ['express_usa_.txt'],
        'priority': ['priority_international_.txt']
    }; 

    await Promise.all(Object.keys(FILES).map(async fileType => {
        return Promise.all(FILES[fileType].map(async fileName => {
            const filePath = regular_rate_base_dir + fileName;
            const country = fileName.split('_')[1];
            return module.exports.readFile(filePath, fileType, YEAR, 'regular', country);
        }));
    }));
    const small_business_base_dir = `${__dirname}/../resources/small_business/${YEAR}/`;
    dataPrepared = fs.existsSync(small_business_base_dir)
    if (!dataPrepared) {
        return `Failed to find directory ${small_business_base_dir} Please prepare data for year ${YEAR} or set the year variable to previous year`;
    }

    await Promise.all(Object.keys(FILES).map(async fileType => {
        return Promise.all(FILES[fileType].map(async fileName => {
            const filePath = small_business_base_dir + fileName;
            const country = fileName.split('_')[1];
            return module.exports.readFile(filePath, fileType, YEAR, 'small_business', country);
        }));
    }));
    return `Successfully loaded the data for year ${YEAR}`;
}
/* Instructions for loading next years data:
1. Go to CP and download the rates document for regular
and small business rates
2. Copy the rate code prices into a text file under the year.
Follow the existing format thats under the previous year (ie a new file for priority, express, etc)
Be sure to include the rate code header. Make sure there are no leading spaces*/