//import { calculateShippingCost } from "/home/ana/GitHub/cplib/src/calculate";

import fs from 'fs';
import readline from 'readline';
import { once } from 'events';
import sqlite3 from 'sqlite3';

/*exports.calculateShippingCost = function (sourceAddress: any, destinationAddress: any, packageDetails: any): any {
    return calculateShippingCost(sourceAddress, destinationAddress, packageDetails);
}*/
//exports.calculateShippingCost = calculateShippingCost;
let postalData: sqlite3.Database;
// const db_name = 'C:/Users/flute/Documents/GitHub/cplib/resources/cplib2.db';
const db_name = '/home/ana/GitHub/cplib/resources/cplib1.db';

// for unit testing; stub database
export const setDB = function (anyNewDB: any): void {
    postalData = anyNewDB;
}

export const writeToDB = async function (sqlStmt: string): Promise<string> {
    const saveToDb = async function (resolve, reject) {
        console.log('SQL STMT ' + sqlStmt);
        const stmt = postalData.prepare(sqlStmt);
        stmt.run([], (err: Error) => {
            if (err) {
                console.log('Error! ' + err.message);
                reject(err.message);
            } else {
                resolve('Success');
            }
        });
    }
    const prom = new Promise<string>((resolve, reject) => {
        if (!postalData) {
            console.log('Open Database');
            postalData = new sqlite3.Database(db_name, sqlite3.OPEN_READWRITE, (err: any) => {
                if (err) {
                    console.log(err);
                    reject(err);
                } else {
                    saveToDb(resolve, reject);
                }
            });
        } else {
            saveToDb(resolve, reject);
        }
    });
    return prom;
}

export const readFile = async function (fileName: string, type: string, year: number, customer_type: string): Promise<any> {
    console.log(`Start reading file ${fileName}`);
    const stream = fs.createReadStream(fileName, { emitClose: true });
    const rl = readline.createInterface(stream);
    let labels: string[] = [];
    let isFirst = true;
    const inputsAll: string[] = [];
    rl.on('line', async (input: string) => {
        if (isFirst) {
            labels = input.split(' ');
            isFirst = false;
        } else {
            const tokens = input.split(' ');
            console.log('INPUT Exepct rate code to be token')
            const maxWeight = tokens[0];
            for (let i = 2; i < labels.length; i++) {
                const price = tokens[i];
                const rate_code = labels[i];
                console.log('Rate Code ' + rate_code);
                const insertDataSQL = `insert into RATES(year, max_weight, weight_type, rate_code, price, type, country, customer_type)
                 VALUES(${year}, ${maxWeight}, 'kg', '${rate_code}', ${price}, ${type}, 'Canada', ${customer_type})`;
                inputsAll.push(insertDataSQL);
            }
        }
    });
    await once(rl, 'close');
    console.log(`Done Reading  ${fileName}`);
    return Promise.all(inputsAll.map(async entry => {
        try {
            return await module.exports.writeToDB(entry);
        } catch (error) {
            console.log('Error occured: ' + error);
            return error;
        }
    }));
}

export const files = async function (): Promise<any> {
    const YEAR = new Date().getFullYear();
    const regular_rate_base_dir = `../resources/regular/${YEAR}/`;
    let dataPrepared = fs.existsSync(regular_rate_base_dir)
    if (!dataPrepared) {
        return `Failed to find directory ${regular_rate_base_dir} Please prepare data for year ${YEAR} or set the year variable to previous year`;
    }
    const FILES = {
        'express': ['express_canada_1.txt', 'express_canada_2.txt'],
        'priority': ['priority_canada_1.txt', 'priority_canada_2.txt'],
        'regular': ['regular_canada_1.txt', 'regular_canada_2.txt']
    };

    await Promise.all(Object.keys(FILES).map(async fileType => {
        FILES[fileType].forEach(fileName => {
            const filePath = __dirname + '/' + regular_rate_base_dir + fileName;
            return module.exports.readFile(filePath, fileType, YEAR, 'regular');            
        });

    }));
    
    const small_business_base_dir = `../resources/small_business/${YEAR}/`;
    dataPrepared = fs.existsSync(small_business_base_dir)
    if (!dataPrepared) {
        return `Failed to find directory ${small_business_base_dir} Please prepare data for year ${YEAR} or set the year variable to previous year`;
    }

    await Promise.all(Object.keys(FILES).map(async fileType => {
        FILES[fileType].forEach(fileName => {
            const filePath = __dirname + '/' + small_business_base_dir + fileName;
            return module.exports.readFile(filePath, fileType, YEAR, 'small_business');            
        });

    }));

    return `Successfully loaded the data for year ${YEAR}`;

}