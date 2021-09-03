import * as db from './db/sqlite3';
import { e2eProcess } from './autoload';
import 'mocha';
import { RateTables, saveTableEntries, loadByType, SMALL_BUSINESS, REGULAR } from './autoload';
import * as chai from 'chai';
const expect = chai.expect;
const YEAR = new Date().getFullYear();

describe('Preload data for next test case - regular', () => {
    let regularRateTables: RateTables;
    let smallBusinessRateTables: RateTables;
    const YEAR = 2021;
    before(async () => {
        await db.setDB(__dirname + "/integration/cplib_int.db");
        let numDeleted = await db.deleteRatesByYear(YEAR);
        console.log(`Deleted ${numDeleted} rows`);


    });
    after(async () => {
        await db.resetDB();
    });
    it('Test - Empty', (done) => {
        let tmpTst = new Promise(async (resolve, reject) => {
            await e2eProcess(YEAR, REGULAR);
            await e2eProcess(YEAR, SMALL_BUSINESS);
            resolve(true);
        });
        tmpTst.then(() => {
            console.log('done done');
            done();
        });
    });
});