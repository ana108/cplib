import {
    validateAddress, Address, calculateTax,
    calculateShippingCanada, calculateShipping, calculateShippingUSA, calculateShippingInternational,
    mapProvinceToCode
} from '../calculate';
import * as calculate from '../calculate';
import * as sinon from 'sinon';

import * as db from '../db/sqlite3';
import * as chai from 'chai';
import { fail } from 'assert';
import { maxRates } from '../db/sqlite3';
import { allTestCases } from './testcases';

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
    for (let i = 0; i < 1; i++) {
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
    it.skip('A5 - Regular - 0.7kg - 10.89', async () => {

    });
});