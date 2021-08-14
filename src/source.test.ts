import * as sinon from 'sinon';
import * as fs from 'fs';
import 'mocha';
import * as chai from 'chai';
import http from 'http';
import { savePDFS } from './source';
import { fail } from 'assert';
import { assert } from 'console';
const expect = chai.expect;
const YEAR = new Date().getFullYear();

describe('Download and save pdfs - integration', () => {
    let requestStb;
    before(async () => {
        // requestStb = sinon.stub(http, 'request');
    });
    after(async () => {
        // requestStb.restore();
    });
    it('Create dir and download pdfs', async () => {
        const year = YEAR - 1;
        const result = await savePDFS(year);
        let pdfFound = false;
        if (result.regular) { // if regular was found, then check if new year was created
            const regularDir = __dirname + `/resources/regular/${YEAR}`;
            if (!fs.existsSync(regularDir)) {
                fail('Failed to find the regular directory that was supposed to be created');
            }

            fs.readdirSync(regularDir).forEach(file => {
                if (file === `Rates_${YEAR}.pdf`) pdfFound = true;
            });
            expect(pdfFound).to.equal(true);
            pdfFound = false;
        } else {
            expect(true, "Years match, no data will be updated for regular customers").to.equal(true);
        }
        if (result.smallBusiness) {
            const smallBusinessDir = __dirname + `/resources/small_business/${YEAR}`;
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
});