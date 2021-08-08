import { calculateShipping } from '../calculate';

import * as db from '../db/sqlite3';
import * as chai from 'chai';
import fs from 'fs';
import * as tc from './testcases';

const expect = chai.expect;

let allRecalibrations = "";

describe('Table Tests - Canada Regular Parcel - 0.75 - 2.5kg', () => {
    let newTestCases = tc.allTestCases;
    before(() => {
        db.setDB(__dirname + "/cplib_2021_int.db");
    });
    after(() => {
        let recalibratedCanada = "export let allTestCases = " + JSON.stringify(newTestCases, null, 4);
        allRecalibrations = recalibratedCanada;
    });
    let totalCases = Object.keys(tc.allTestCases).length;
    let sourceAddr = {
        streetAddress: '812 Terravita Pvt',
        city: 'Ottawa',
        region: 'ON',
        postalCode: 'K1V2R9',
        country: 'CA'
    };
    let destinationAddr = {
        streetAddress: '115 Prentiss Rue',
        city: 'New York',
        region: 'ON',
        postalCode: 'J9H5V8',
        country: 'CA'
    };
    for (let i = 0; i < totalCases; i++) {
        let rateCode = Object.keys(tc.allTestCases)[i];
        Object.keys(tc.allTestCases[rateCode].weights).forEach(weight => {
            it(`Rate Code: ${rateCode} : Weight (kg) ${weight}`, async () => {
                sourceAddr.postalCode = tc.allTestCases[rateCode].postalCodes.src;
                destinationAddr.postalCode = tc.allTestCases[rateCode].postalCodes.dest;
                let result = await calculateShipping(sourceAddr, destinationAddr, parseFloat(weight), 'regular', 'small_business');
                newTestCases[rateCode].weights[weight] = result;
            });
        });
    }
});

describe('Table Tests - American Small_Packet and Expedited - 0.75 - 2.5kg', () => {
    after(() => {
        let recalibratedAmerican = "export let americanTestCases = " + JSON.stringify(tc.americanTestCases, null, 4);
        allRecalibrations = allRecalibrations + "\n" + recalibratedAmerican;
    });
    let totalCases = Object.keys(tc.americanTestCases).length;
    let sourceAddr = {
        streetAddress: '812 Terravita Pvt',
        city: 'Ottawa',
        region: 'ON',
        postalCode: 'K1V2R9',
        country: 'CA'
    };
    let destinationAddr = {
        streetAddress: '115 Prentiss Rue',
        city: 'New York',
        region: 'NY',
        postalCode: 'J9H5V8',
        country: 'USA'
    };
    for (let i = 0; i < totalCases; i++) {
        let rateCode = Object.keys(tc.americanTestCases)[i];
        Object.keys(tc.americanTestCases[rateCode].weights).forEach(weight => {
            it(`Rate Code: ${rateCode} : Weight (kg) ${weight}`, async () => {
                sourceAddr.region = tc.americanTestCases[rateCode].region.src;
                destinationAddr.region = tc.americanTestCases[rateCode].region.dest;
                let result = await calculateShipping(sourceAddr, destinationAddr, parseFloat(weight), tc.americanTestCases[rateCode].delivery_type, 'small_business');
                tc.americanTestCases[rateCode].weights[weight] = result;
            });
        });
    }
});

describe('Table Tests - International Small_Packet_Air and Surface - 0.75 - 2.5kg', () => {

    after(() => {
        let recalibratedInternational = "export let internationalTestCases = " + JSON.stringify(tc.internationalTestCases, null, 4);
        allRecalibrations = allRecalibrations + "\n" + recalibratedInternational;
        fs.writeFile(__dirname + "/testcases.ts", allRecalibrations, function (err) {
            if (err) {
                console.log(err);
            } else {
                // console.log('Successfully wrote ' + allRecalibrations);
            }
        });
    });
    let totalCases = Object.keys(tc.internationalTestCases).length;
    let sourceAddr = {
        streetAddress: '812 Terravita Pvt',
        city: 'Ottawa',
        region: 'ON',
        postalCode: 'K1V2R9',
        country: 'CA'
    };
    let destinationAddr = {
        streetAddress: '115 Prentiss Rue',
        city: 'New York',
        region: 'NY',
        postalCode: 'J9H5V8',
        country: 'USA'
    };
    for (let i = 0; i < totalCases; i++) {
        let rateCode = Object.keys(tc.internationalTestCases)[i];
        Object.keys(tc.internationalTestCases[rateCode].weights).forEach(weight => {
            it(`Rate Code: ${rateCode} : Weight (kg) ${weight}`, async () => {
                sourceAddr.country = tc.internationalTestCases[rateCode].country.src;
                destinationAddr.country = tc.internationalTestCases[rateCode].country.dest;
                let result = await calculateShipping(sourceAddr, destinationAddr, parseFloat(weight), tc.internationalTestCases[rateCode].delivery_type, 'small_business');
                tc.internationalTestCases[rateCode].weights[weight] = result;
            });
        });
    }
});
