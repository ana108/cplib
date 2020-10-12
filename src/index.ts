import { calculateShippingCost } from './calculate';
import fs from 'fs';
import readline from 'readline';
import { once } from 'events';
import sqlite3 from 'sqlite3';

exports.calculateShippingCost = function (sourceAddress: any, destinationAddress: any, packageDetails: any): any {
    return calculateShippingCost(sourceAddress, destinationAddress, packageDetails);
}
let postalData: sqlite3.Database;
const db_name = 'C:/Users/flute/Documents/GitHub/cplib/resources/cplib2.db';

// for unit testing; stub database
export const setDB = function (anyNewDB: any): void {
    postalData = anyNewDB;
}

export const writeToDB = async function (sqlStmt: string): Promise<string> {
    const saveToDb = async function (resolve, reject) {
        const stmt = postalData.prepare(sqlStmt, []);
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
            postalData = new sqlite3.Database(db_name, sqlite3.OPEN_READWRITE, (err: string) => {
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

export const readFile = async function (fileName: string): Promise<any> {
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
            const maxWeight = tokens[0];
            for (let i = 2; i < labels.length; i++) {
                const price = tokens[i];
                const rate_code = labels[i];
                const insertDataSQL = `insert into RATES(year, max_weight, weight_type, rate_code, price, type, country) VALUES(2020, ${maxWeight}, 'kg', '${rate_code}', ${price}, 'express', 'Canada')`;
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
    const base_dir = `../resources/${YEAR}/`;
    const FILES = ['express_canada_1.txt', 'express_canada_2.txt', 'priority_canada_1.txt', 'priority_canada_2.txt', 'express_canada_1.txt', 'express_canada_2.txt'];
    await Promise.all(FILES.map(async fileName => {
        const filePath = __dirname + '\\' + base_dir + fileName;
        return module.exports.readFile(filePath);
    }));
    return `Successfully loaded the data for year ${YEAR}`;

}