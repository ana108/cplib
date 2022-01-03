import { calculateShipping } from '../calculate';

import * as db from '../db/sqlite3';
import * as chai from 'chai';
import { allTestCases, americanTestCases, internationalTestCases } from './testcases';
import * as sinon from 'sinon';
const child_process = require('child_process');

const message_handler = {
    on: (event: any, cb) => {
        cb()
    }
}

const expect = chai.expect;
const compiledSrcLocation: string = __dirname + '/../../build/source.js';

describe('Table Tests - Canada Regular Parcel - 0.75 - 2.5kg', () => {
    let forkStb;
    before(async () => {
        // setLocation(compiledSrcLocation);
        forkStb = sinon.stub(child_process, 'fork').returns(message_handler);
        await db.setDB(__dirname + "/cplib_int.db");
    });
    after(async () => {
        forkStb.restore();
        await db.resetDB();
    });
    const totalCases = Object.keys(allTestCases).length;
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
        const rateCode = Object.keys(allTestCases)[i];
        Object.keys(allTestCases[rateCode].weights).forEach(weight => {
            it(`Rate Code: ${rateCode} : Weight (kg) ${weight}`, async () => {
                sourceAddr.postalCode = allTestCases[rateCode].postalCodes.src;
                destinationAddr.postalCode = allTestCases[rateCode].postalCodes.dest;
                const result = await calculateShipping(sourceAddr, destinationAddr, parseFloat(weight), 'regular', 'small_business');
                expect(result).to.equal(allTestCases[rateCode].weights[weight]);
            });
        });
    }
});

describe('Table Tests - American Small_Packet and Expedited - 0.75 - 2.5kg', () => {
    let forkStb;
    before(async () => {
        forkStb = sinon.stub(child_process, 'fork').returns(message_handler);
        // setLocation(compiledSrcLocation);
        await db.setDB(__dirname + "/cplib_int.db");
    });
    after(async () => {
        forkStb.restore();
        await db.resetDB();
    });
    const totalCases = Object.keys(americanTestCases).length;
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
        const rateCode = Object.keys(americanTestCases)[i];
        Object.keys(americanTestCases[rateCode].weights).forEach(weight => {
            it(`Rate Code: ${rateCode} : Weight (kg) ${weight}`, async () => {
                sourceAddr.region = americanTestCases[rateCode].region.src;
                destinationAddr.region = americanTestCases[rateCode].region.dest;
                const result = await calculateShipping(sourceAddr, destinationAddr, parseFloat(weight), americanTestCases[rateCode].delivery_type, 'small_business');
                expect(result).to.equal(americanTestCases[rateCode].weights[weight]);
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
    const totalCases = Object.keys(internationalTestCases).length;
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
        const rateCode = Object.keys(internationalTestCases)[i];
        Object.keys(internationalTestCases[rateCode].weights).forEach(weight => {
            it(`Rate Code: ${rateCode} : Weight (kg) ${weight}`, async () => {
                sourceAddr.country = internationalTestCases[rateCode].country.src;
                destinationAddr.country = internationalTestCases[rateCode].country.dest;
                const result = await calculateShipping(sourceAddr, destinationAddr, parseFloat(weight), internationalTestCases[rateCode].delivery_type, 'small_business');
                expect(result).to.equal(internationalTestCases[rateCode].weights[weight]);
            });
        });
    }
});