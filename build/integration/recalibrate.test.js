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
const fs_1 = __importDefault(require("fs"));
const tc = __importStar(require("./testcases"));
const sinon = __importStar(require("sinon"));
const child_process = require('child_process');
const message_handler = {
    on: (event, cb) => {
        cb();
    }
};
let allRecalibrations = "";
describe('Table Tests - Canada Regular Parcel - 0.75 - 2.5kg', () => {
    const newTestCases = tc.allTestCases;
    let forkStb;
    before(async () => {
        forkStb = sinon.stub(child_process, 'fork').returns(message_handler);
        await db.setDB(__dirname + "/cplib_int.db");
    });
    after(async () => {
        forkStb.restore();
        const recalibratedCanada = "export let allTestCases = " + JSON.stringify(newTestCases, null, 4);
        allRecalibrations = recalibratedCanada;
        await db.resetDB();
    });
    const totalCases = Object.keys(tc.allTestCases).length;
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
        const rateCode = Object.keys(tc.allTestCases)[i];
        Object.keys(tc.allTestCases[rateCode].weights).forEach(weight => {
            it(`Rate Code: ${rateCode} : Weight (kg) ${weight}`, async () => {
                sourceAddr.postalCode = tc.allTestCases[rateCode].postalCodes.src;
                destinationAddr.postalCode = tc.allTestCases[rateCode].postalCodes.dest;
                const result = await calculate_1.calculateShipping(sourceAddr, destinationAddr, parseFloat(weight), 'regular', 'small_business');
                newTestCases[rateCode].weights[weight] = result;
            });
        });
    }
});
describe('Table Tests - American Small_Packet and Expedited - 0.75 - 2.5kg', () => {
    let forkStb;
    before(async () => {
        forkStb = sinon.stub(child_process, 'fork').returns(message_handler);
        await db.setDB(__dirname + "/cplib_int.db");
    });
    after(async () => {
        forkStb.restore();
        const recalibratedAmerican = "export let americanTestCases = " + JSON.stringify(tc.americanTestCases, null, 4);
        allRecalibrations = allRecalibrations + "\n" + recalibratedAmerican;
        await db.resetDB();
    });
    const totalCases = Object.keys(tc.americanTestCases).length;
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
        const rateCode = Object.keys(tc.americanTestCases)[i];
        Object.keys(tc.americanTestCases[rateCode].weights).forEach(weight => {
            it(`Rate Code: ${rateCode} : Weight (kg) ${weight}`, async () => {
                sourceAddr.region = tc.americanTestCases[rateCode].region.src;
                destinationAddr.region = tc.americanTestCases[rateCode].region.dest;
                const result = await calculate_1.calculateShipping(sourceAddr, destinationAddr, parseFloat(weight), tc.americanTestCases[rateCode].delivery_type, 'small_business');
                tc.americanTestCases[rateCode].weights[weight] = result;
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
        const recalibratedInternational = "export let internationalTestCases = " + JSON.stringify(tc.internationalTestCases, null, 4);
        allRecalibrations = allRecalibrations + "\n" + recalibratedInternational;
        fs_1.default.writeFile(__dirname + "/testcases.ts", allRecalibrations, function (err) {
            if (err) {
                console.log(err);
            }
        });
        await db.resetDB();
    });
    const totalCases = Object.keys(tc.internationalTestCases).length;
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
        const rateCode = Object.keys(tc.internationalTestCases)[i];
        Object.keys(tc.internationalTestCases[rateCode].weights).forEach(weight => {
            it(`Rate Code: ${rateCode} : Weight (kg) ${weight}`, async () => {
                sourceAddr.country = tc.internationalTestCases[rateCode].country.src;
                destinationAddr.country = tc.internationalTestCases[rateCode].country.dest;
                const result = await calculate_1.calculateShipping(sourceAddr, destinationAddr, parseFloat(weight), tc.internationalTestCases[rateCode].delivery_type, 'small_business');
                tc.internationalTestCases[rateCode].weights[weight] = result;
            });
        });
    }
});
