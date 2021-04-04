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
    }));
}
export const oneTimePopulate = (): any => { // Promise<any>
    const sqlStmt = `insert into rate_code_mapping values('$source', '$destination', '$rate_code', 'USA')`;
    const sources = ['AL', 'AK', 'AS', 'AZ', 'AR', 'AE', 'AA', 'AE', 'AE', 'AE', 'AP', 'CA', 'CO', 'CT',
        'DE', 'DC', 'FL', 'GA', 'GU', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MH', 'MD', 'MA', 'MI', 'FM',
        'MN', 'UM', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'MP', 'OH', 'OK', 'OR', 'PW', 'PA',
        'PR', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'VI', 'WA', 'WV', 'WI', 'WY'];
    const zoneA = [5, 7, 7, 7, 5, 2, 5, 2, 2, 2, 7, 7, 6, 2, 3, 3, 5, 4, 7, 7, 7, 4, 4, 5, 5, 4, 5, 1, 7, 3, 2, 3, 7, 5, 7, 5, 5, 6, 5, 7, 1, 3, 6,
        2, 4, 5, 7, 3, 5, 7, 7, 3, 7, 2, 4, 5, 4, 6, 7, 1, 3, 7, 7, 3, 4, 6];
    const zoneB = [4, 7, 7, 6, 4, 1, 5, 1, 1, 1, 7, 7, 6, 2, 2, 2, 5, 4, 7, 7, 6, 3, 3, 4, 5, 3, 5, 3, 7, 2,
        2, 3, 7, 2, 7, 6, 5, 1, 3, 3, 7, 7, 4, 7, 7, 1, 7, 6, 5, 2, 7, 6, 7, 7, 7, 2, 6, 5, 3, 7, 7, 7, 1, 6, 3, 6];
    const zoneC = [6, 7, 7, 4, 5, 7, 7, 7, 7, 7, 4, 4, 3, 7, 7, 7, 7, 6, 7, 7, 2, 5, 5, 3, 4, 6, 6, 7, 7, 7, 7, 5, 7, 2, 7, 6, 5, 1, 3, 3, 7, 7, 4, 7, 7, 1, 7, 6, 5, 2, 7, 6, 7, 7, 7,
        2, 6, 5, 3, 7, 7, 7, 1, 6, 3, 2];
    const zoneD = [7, 7, 7, 7, 7, 6, 7, 6, 6, 6, 7, 7, 6, 6, 6, 6, 7, 7, 7, 7, 5, 6, 6, 6, 6, 6, 7, 5, 7, 6, 5, 5, 7, 5, 7, 7, 6, 5, 6, 6, 5, 6, 7, 6, 7, 5, 7, 6, 7, 5, 7, 6, 7, 6, 7, 5, 7, 7, 6, 5, 6, 7, 5, 6, 5, 5];
    let inputsAll: string[] = [];
    for (var i = 0; i < 66; i++) {
        let tempSql = sqlStmt.replace('$source', sources[i]);
        // zone a
        let zA = tempSql.replace('$rate_code', zoneA[i].toString());
        let NL = zA.replace('$destination', 'NL');
        let NS = zA.replace('$destination', 'NS');
        let PEI = zA.replace('$destination', 'PEI');
        let NB = zA.replace('$destination', 'NB');

        inputsAll.push(NL);
        inputsAll.push(NS);
        inputsAll.push(PEI);
        inputsAll.push(NB);

        // zone b
        let zB = tempSql.replace('$rate_code', zoneB[i].toString());
        let QC = zB.replace('$destination', 'QC');
        let ON = zB.replace('$destination', 'ON');
        inputsAll.push(QC);
        inputsAll.push(ON);

        // zone c
        let zC = tempSql.replace('$rate_code', zoneC[i].toString());
        let MB = zC.replace('$destination', 'MB');
        let SK = zC.replace('$destination', 'SK');
        let AB = zC.replace('$destination', 'AB');
        let BC = zC.replace('$destination', 'BC');
        inputsAll.push(MB);
        inputsAll.push(SK);
        inputsAll.push(AB);
        inputsAll.push(BC);

        // zone d
        let zD = tempSql.replace('$rate_code', zoneD[i].toString());
        let YT = zD.replace('$destination', 'YT');
        let NU = zD.replace('$destination', 'NU');
        let NWT = zD.replace('$destination', 'NWT');
        inputsAll.push(YT);
        inputsAll.push(NU);
        inputsAll.push(NWT);
    }
    return Promise.all(inputsAll.map(async entry => {
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
    const small_business_base_dir = `${__dirname}/../resources/small_business/${YEAR}/`;
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
/* Instructions for loading next years data:
1. Go to CP and download the rates document for regular
and small business rates
2. Copy the rate code prices into a text file under the year.
Follow the existing format thats under the previous year (ie a new file for priority, express, etc)
Be sure to include the rate code header. Make sure there are no leading spaces*/