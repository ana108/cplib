import * as fs from 'fs';
import 'mocha';
import * as chai from 'chai';
import { getHighestYear } from './db/sqlite3';
import { savePDFS, checkAndUpdate } from './source';
import { fail } from 'assert';
const expect = chai.expect;
const YEAR = new Date().getFullYear();

describe('Download and save pdfs - integration', () => {
    it.skip('Create dir and download pdfs', async () => {
        const currentHighestYear = await getHighestYear();
        const result = await savePDFS(YEAR, currentHighestYear);
        let pdfFound = false;
        if (result.regular.update) { // if regular was found, then check if new year was created
            const regularDir = __dirname + `/resources/regular/${result.regular.year}`;
            if (!fs.existsSync(regularDir)) {
                fail('Failed to find the regular directory that was supposed to be created');
            }

            fs.readdirSync(regularDir).forEach(file => {
                if (file === `Rates_${result.regular.year}.pdf`) pdfFound = true;
            });
            expect(pdfFound).to.equal(true);
            pdfFound = false;
        } else {
            expect(true, "Years match, no data will be updated for regular customers").to.equal(true);
        }
        if (result.smallBusiness.update) {
            const smallBusinessDir = __dirname + `/resources/small_business/${result.smallBusiness.year}`;
            if (!fs.existsSync(smallBusinessDir)) {
                fail('Failed to find the small business directory that was supposed to be created');
            }
            fs.readdirSync(smallBusinessDir).forEach(file => {
                if (file === `Rates_${YEAR}.pdf`) pdfFound = true;
            });
            expect(pdfFound).to.equal(true);
        } else {
            expect(true, "Years match, no data will be updated for small business customers").to.equal(true);
        }
        const tmpDir = __dirname + '/tmp';
        if (fs.existsSync(tmpDir)) {
            fail("The temporary directory was supposed to be removed but wasn't");
        }
    });
    it('Check and update e2e', async () => {
        // do nothing, by virtue of importing it calls the function
    });
});