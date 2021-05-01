import { calculateShipping } from '../calculate';

import * as db from '../db/sqlite3';
import * as chai from 'chai';
import { allTestCases, americanTestCases, internationalTestCases } from './testcases';

const expect = chai.expect;

describe('Table Tests - Canada Regular Parcel - 0.75 - 2.5kg', () => {

    before(() => {
        db.setDB(__dirname + "/cplib_2021_int.db");
    });
    after(() => {
        db.resetDB();
    });
    let totalCases = Object.keys(allTestCases).length;
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
        let rateCode = Object.keys(allTestCases)[i];
        Object.keys(allTestCases[rateCode].weights).forEach(weight => {
            it(`Rate Code: ${rateCode} : Weight (kg) ${weight}`, async () => {
                sourceAddr.postalCode = allTestCases[rateCode].postalCodes.src;
                destinationAddr.postalCode = allTestCases[rateCode].postalCodes.dest;
                let result = await calculateShipping(sourceAddr, destinationAddr, parseFloat(weight), 'regular', 'small_business');
                expect(result).to.equal(allTestCases[rateCode].weights[weight]);
            });
        });
    }
});

describe('Table Tests - American Small_Packet and Expedited - 0.75 - 2.5kg', () => {

    before(() => {
        db.setDB(__dirname + "/cplib_2021_int.db");
    });
    after(() => {
        db.resetDB();
    });
    let totalCases = Object.keys(americanTestCases).length;
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
        let rateCode = Object.keys(americanTestCases)[i];
        Object.keys(americanTestCases[rateCode].weights).forEach(weight => {
            it(`Rate Code: ${rateCode} : Weight (kg) ${weight}`, async () => {
                sourceAddr.region = americanTestCases[rateCode].region.src;
                destinationAddr.region = americanTestCases[rateCode].region.dest;
                let result = await calculateShipping(sourceAddr, destinationAddr, parseFloat(weight), americanTestCases[rateCode].delivery_type, 'small_business');
                expect(result).to.equal(americanTestCases[rateCode].weights[weight]);
            });
        });
    }
});

describe('Table Tests - International Small_Packet_Air and Surface - 0.75 - 2.5kg', () => {

    before(() => {
        db.setDB(__dirname + "/cplib_2021_int.db");
    });
    after(() => {
        db.resetDB();
    });
    let totalCases = Object.keys(internationalTestCases).length;
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
        let rateCode = Object.keys(internationalTestCases)[i];
        Object.keys(internationalTestCases[rateCode].weights).forEach(weight => {
            it(`Rate Code: ${rateCode} : Weight (kg) ${weight}`, async () => {
                sourceAddr.country = internationalTestCases[rateCode].country.src;
                destinationAddr.country = internationalTestCases[rateCode].country.dest;
                let result = await calculateShipping(sourceAddr, destinationAddr, parseFloat(weight), internationalTestCases[rateCode].delivery_type, 'small_business');
                expect(result).to.equal(internationalTestCases[rateCode].weights[weight]);
            });
        });
    }
});