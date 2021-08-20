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
        let tmpTst = new Promise((resolve, reject) => {
            let i = 0;
            e2eProcess(YEAR, REGULAR).then(regularRateTables => {
                loadByType(regularRateTables, YEAR, REGULAR).then(() => {
                    console.log('Done regular');
                    i++;
                    if (i == 2) resolve(true);
                });
            });
            e2eProcess(YEAR, SMALL_BUSINESS).then(smallBusinessRateTables => {
                loadByType(smallBusinessRateTables, YEAR, SMALL_BUSINESS).then(() => {
                    console.log('Done small business');
                    i++;
                    if (i == 2) resolve(true);
                });
            });
        });
        tmpTst.then(() => {
            console.log('done done');
            done();
        });
    });
});