import * as db from './db/sqlite3';
import { e2eProcess } from './autoload';
import 'mocha';
import { RateTables, saveTableEntries, loadBoth } from './autoload';
import * as chai from 'chai';
const expect = chai.expect;
const YEAR = new Date().getFullYear();

describe('Preload data for next test case', () => {
    let allRateTables: RateTables[];
    const YEAR = 2021;
    before(async () => {
        db.setDB(__dirname + "/resources/cplib_autoload.db");
        allRateTables = await e2eProcess(YEAR);
        await loadBoth(allRateTables, YEAR);
    });
    after(async () => {
        db.resetDB();
    });
    it.skip('Test - Empty', () => {

    });
});