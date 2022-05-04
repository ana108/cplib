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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const calculate_1 = require("../calculate");
const db = __importStar(require("../db/sqlite3"));
const chai = __importStar(require("chai"));
const testcases_1 = require("./testcases");
const sinon = __importStar(require("sinon"));
const path_1 = __importDefault(require("path"));
const child_process = require('child_process');
const message_handler = {
    on: (event, cb) => {
        cb();
    }
};
const expect = chai.expect;
const compiledSrcLocation = path_1.default.join(__dirname, '../../build/source.js');
describe('Table Tests - Canada Regular Parcel - 0.75 - 2.5kg', () => {
    let forkStb;
    before(async () => {
        // setLocation(compiledSrcLocation);
        forkStb = sinon.stub(child_process, 'fork').returns(message_handler);
        await db.setDB(path_1.default.join(__dirname, "cplib_int.db"));
    });
    after(async () => {
        forkStb.restore();
        await db.resetDB();
    });
    const totalCases = Object.keys(testcases_1.allTestCases).length;
    const sourceAddr = {
        streetAddress: '812 Terravita Pvt',
        city: 'Ottawa',
        region: 'ON',
        postalCode: 'K1V2R9',
        country: 'CA'
    };
    const destinationAddr = {
        streetAddress: '115 Prentiss Rue',
        city: 'New York',
        region: 'ON',
        postalCode: 'J9H5V8',
        country: 'CA'
    };
    for (let i = 0; i < totalCases; i++) {
        const rateCode = Object.keys(testcases_1.allTestCases)[i];
        Object.keys(testcases_1.allTestCases[rateCode].weights).forEach(weight => {
            it(`Rate Code: ${rateCode} : Weight (kg) ${weight}`, async () => {
                sourceAddr.postalCode = testcases_1.allTestCases[rateCode].postalCodes.src;
                destinationAddr.postalCode = testcases_1.allTestCases[rateCode].postalCodes.dest;
                const result = await calculate_1.calculateShipping(sourceAddr, destinationAddr, parseFloat(weight), 'regular', 'small_business');
                expect(result).to.equal(testcases_1.allTestCases[rateCode].weights[weight]);
            });
        });
    }
});
describe('Table Tests - American Small_Packet and Expedited - 0.75 - 2.5kg', () => {
    let forkStb;
    before(async () => {
        forkStb = sinon.stub(child_process, 'fork').returns(message_handler);
        // setLocation(compiledSrcLocation);
        await db.setDB(path_1.default.join(__dirname, "cplib_int.db"));
    });
    after(async () => {
        forkStb.restore();
        await db.resetDB();
    });
    const totalCases = Object.keys(testcases_1.americanTestCases).length;
    const sourceAddr = {
        streetAddress: '812 Terravita Pvt',
        city: 'Ottawa',
        region: 'ON',
        postalCode: 'K1V2R9',
        country: 'CA'
    };
    const destinationAddr = {
        streetAddress: '115 Prentiss Rue',
        city: 'New York',
        region: 'NY',
        postalCode: 'J9H5V8',
        country: 'USA'
    };
    for (let i = 0; i < totalCases; i++) {
        const rateCode = Object.keys(testcases_1.americanTestCases)[i];
        Object.keys(testcases_1.americanTestCases[rateCode].weights).forEach(weight => {
            it(`Rate Code: ${rateCode} : Weight (kg) ${weight}`, async () => {
                sourceAddr.region = testcases_1.americanTestCases[rateCode].region.src;
                destinationAddr.region = testcases_1.americanTestCases[rateCode].region.dest;
                const result = await calculate_1.calculateShipping(sourceAddr, destinationAddr, parseFloat(weight), testcases_1.americanTestCases[rateCode].delivery_type, 'small_business');
                expect(result).to.equal(testcases_1.americanTestCases[rateCode].weights[weight]);
            });
        });
    }
});
describe('Table Tests - International Small_Packet_Air and Surface - 0.75 - 2.5kg', () => {
    let forkStb;
    before(async () => {
        forkStb = sinon.stub(child_process, 'fork').returns(message_handler);
        await db.setDB(__dirname + "/cplib_int.db");
    });
    after(async () => {
        forkStb.restore();
        await db.resetDB();
    });
    const totalCases = Object.keys(testcases_1.internationalTestCases).length;
    const sourceAddr = {
        streetAddress: '812 Terravita Pvt',
        city: 'Ottawa',
        region: 'ON',
        postalCode: 'K1V2R9',
        country: 'CA'
    };
    const destinationAddr = {
        streetAddress: '115 Prentiss Rue',
        city: 'New York',
        region: 'NY',
        postalCode: 'J9H5V8',
        country: 'USA'
    };
    for (let i = 0; i < totalCases; i++) {
        const rateCode = Object.keys(testcases_1.internationalTestCases)[i];
        Object.keys(testcases_1.internationalTestCases[rateCode].weights).forEach(weight => {
            it(`Rate Code: ${rateCode} : Weight (kg) ${weight}`, async () => {
                sourceAddr.country = testcases_1.internationalTestCases[rateCode].country.src;
                destinationAddr.country = testcases_1.internationalTestCases[rateCode].country.dest;
                const result = await calculate_1.calculateShipping(sourceAddr, destinationAddr, parseFloat(weight), testcases_1.internationalTestCases[rateCode].delivery_type, 'small_business');
                expect(result).to.equal(testcases_1.internationalTestCases[rateCode].weights[weight]);
            });
        });
    }
});
