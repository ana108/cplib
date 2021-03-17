import fs from 'fs';
import readline from 'readline';
import { once } from 'events';
import { saveToDb } from './db/sqlite3';

export const readFile = async function (fileName: string, type: string, year: number, customer_type: string): Promise<any> {
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
                 VALUES(${year}, ${maxWeight}, 'kg', '${rate_code}', ${price}, '${type}', 'Canada', '${customer_type}')`;
                inputsAll.push(insertDataSQL);
            }
        }
    });
    await once(rl, 'close');
    return Promise.all(inputsAll.map(async entry => {
        return saveToDb(entry)
        }
    ));
}

export const files = async function (): Promise<any> {
    const YEAR = new Date().getFullYear();
    const regular_rate_base_dir = `${__dirname}/../resources/regular/${YEAR}/`;
    let dataPrepared = fs.existsSync(regular_rate_base_dir)
    if (!dataPrepared) {
        console.log('Could not find the directory ' + regular_rate_base_dir);
        return `Failed to find directory ${regular_rate_base_dir} Please prepare data for year ${YEAR} or set the year variable to previous year`;
    }

    const FILES = {
        'express': ['express_canada_1.txt', 'express_canada_2.txt'],
        'priority': ['priority_canada_1.txt', 'priority_canada_2.txt'],
        'regular': ['regular_canada_1.txt', 'regular_canada_2.txt']
    };

    await Promise.all(Object.keys(FILES).map(async fileType => {
        return Promise.all(FILES[fileType].map(async fileName => {
            const filePath = regular_rate_base_dir + fileName;
            return module.exports.readFile(filePath, fileType, YEAR, 'regular');            
        }));
    }));
    const small_business_base_dir =  `${__dirname}/../resources/small_business/${YEAR}/`;
    dataPrepared = fs.existsSync(small_business_base_dir)
    if (!dataPrepared) {
        return `Failed to find directory ${small_business_base_dir} Please prepare data for year ${YEAR} or set the year variable to previous year`;
    }

    await Promise.all(Object.keys(FILES).map(async fileType => {
        return Promise.all(FILES[fileType].map(async fileName => {
            const filePath = small_business_base_dir + fileName;
            return module.exports.readFile(filePath, fileType, YEAR, 'small_business');            
        }));
    }));
    return `Successfully loaded the data for year ${YEAR}`;
}