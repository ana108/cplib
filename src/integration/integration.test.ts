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

const expect = chai.expect;
db.setDB(__dirname + "/cplib_2021_int.db");

describe('Calculate Shipping Cost By Postal Code', () => {

    beforeEach(() => {

    });
    afterEach(() => {

    });

    it.skip('A5 - Regular - 0.7kg - 10.89', async () => {

    });
});