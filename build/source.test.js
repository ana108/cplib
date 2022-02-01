"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
require("mocha");
const chai = __importStar(require("chai"));
const sqlite3_1 = require("./db/sqlite3");
const source_1 = require("./source");
const assert_1 = require("assert");
const expect = chai.expect;
const YEAR = new Date().getFullYear();
describe('Download and save pdfs - integration', () => {
    it('Create dir and download pdfs', async () => {
        const currentHighestYear = await sqlite3_1.getHighestYear();
        const result = await source_1.savePDFS(YEAR, currentHighestYear);
        let pdfFound = false;
        if (result.regular.update) { // if regular was found, then check if new year was created
            const regularDir = __dirname + `/resources/regular/${result.regular.year}`;
            if (!fs.existsSync(regularDir)) {
                assert_1.fail('Failed to find the regular directory that was supposed to be created');
            }
            fs.readdirSync(regularDir).forEach(file => {
                if (file === `Rates_${result.regular.year}.pdf`)
                    pdfFound = true;
            });
            expect(pdfFound).to.equal(true);
            pdfFound = false;
        }
        else {
            expect(true, "Years match, no data will be updated for regular customers").to.equal(true);
        }
        if (result.smallBusiness.update) {
            const smallBusinessDir = __dirname + `/resources/small_business/${result.smallBusiness.year}`;
            if (!fs.existsSync(smallBusinessDir)) {
                assert_1.fail('Failed to find the small business directory that was supposed to be created');
            }
            fs.readdirSync(smallBusinessDir).forEach(file => {
                if (file === `Rates_${YEAR}.pdf`)
                    pdfFound = true;
            });
            expect(pdfFound).to.equal(true);
        }
        else {
            expect(true, "Years match, no data will be updated for small business customers").to.equal(true);
        }
        const tmpDir = __dirname + '/tmp';
        if (fs.existsSync(tmpDir)) {
            assert_1.fail("The temporary directory was supposed to be removed but wasn't");
        }
    });
    it('Check and update e2e', async () => {
        try {
            await source_1.checkAndUpdate();
        }
        catch (e) {
            assert_1.fail('Error caught while loading data');
        }
    });
});
