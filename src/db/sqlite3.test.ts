import * as sinon from 'sinon';

import { db } from './sqlite3';
import * as chai from 'chai';
import { getRateCode, saveToDb, getRate, options, getProvince, updateFuelSurcharge, getFuelSurcharge } from './sqlite3'
import { fail } from 'assert';

const expect = chai.expect;

describe('GetRateCode from db', () => {
    let dbGetStb;
    beforeEach(() => {
        dbGetStb = sinon.stub(db, 'get');
    });
    afterEach(() => {
        dbGetStb.restore();
    });

    it('Returns rate code from db', async () => {
        dbGetStb.yields(null, { rate_code: 'A5' });
        let rateCode = await getRateCode('K1V2R9', 'J9H5V8');
        expect(rateCode).to.equal('A5');
    });

    it('Returns an error from db', async () => {
        dbGetStb.yields(new Error('SQLITE3 Error:'));
        try {
            await getRateCode('K1V2R9', 'J9H5V8');
            fail('Broken promise not rejected');
        } catch (e) {
            expect(e.message).to.equal('SQLITE3 Error:');
        }
    });

    it('Returns an empty row from db', async () => {
        dbGetStb.yields(null, null);
        try {
            await getRateCode('K1V2R9', 'J9H5V8');
            fail('Broken promise not rejected');
        } catch (e) {
            expect(e.message).to.equal('Failed to find rate code for the given postal codes');
        }
    });
});

describe('Save to db', () => {
    let dbPrepareStb;
    let dbRunStb;
    const fakeStmt = {
        run: function () { }
    }

    beforeEach(() => {
        dbPrepareStb = sinon.stub(db, 'prepare').returns(fakeStmt);
        dbRunStb = sinon.stub(fakeStmt, 'run');
    });
    afterEach(() => {
        dbPrepareStb.restore();
        dbRunStb.restore();
    });

    it('Successfully saves to the database', async () => {
        dbRunStb.yields(null);
        const result = await saveToDb('insert into test values(\'helloworld\')');
        expect(result).to.equal('Success');
    });

    it('Returns an error from db', async () => {
        try {
            dbRunStb.yields({ message: 'SQLITE3 Error:' });
            const result = await saveToDb('insert into test values(\'helloworld\')');
            fail('Expected exception to be thrown');
        } catch (e) {
            expect(e).to.equal('SQLITE3 Error:');
        }
    });
});

describe('GetRate from db', () => {
    let dbPrepareStb;
    let dbRunStb;
    const fakeStmt = {
        get: function () { }
    }
    const rateCode = 'A5';
    const opts: options = {
        country: 'Canada',
        weight_type: 'kg',
        type: 'regular',
        customerType: 'regular',
        year: 2021
    };
    beforeEach(() => {
        dbPrepareStb = sinon.stub(db, 'prepare').returns(fakeStmt);
        dbRunStb = sinon.stub(fakeStmt, 'get');
    });
    afterEach(() => {
        dbPrepareStb.restore();
        dbRunStb.restore();
    });

    it('Successfully retrieves row', async () => {
        dbRunStb.yields(null, { price: '10.22' });
        const result = await getRate(rateCode, 1.0, opts);
        expect(result).to.equal(10.22);
    });

    it('Call to db returns no rows', async () => {
        try {
            dbRunStb.yields(null, null);
            await getRate(rateCode, 1.0, opts);
            fail('Expected exception to be thrown');
        } catch (e) {
            expect(e.message).to.equal('Failed to find price for those parameters');
        }
    });

    it('Returns an error from db', async () => {
        try {
            dbRunStb.yields('SQLITE3 Error:');
            await getRate(rateCode, 1.0, opts);
            fail('Expected exception to be thrown');
        } catch (e) {
            expect(e).to.equal('SQLITE3 Error:');
        }
    });
});

describe('GetProvince from db', () => {
    let dbPrepareStb;
    let dbGetStb;
    const fakeStmt = {
        get: function () { }
    }

    beforeEach(() => {
        dbPrepareStb = sinon.stub(db, 'prepare').returns(fakeStmt);
        dbGetStb = sinon.stub(fakeStmt, 'get');
    });
    afterEach(() => {
        dbPrepareStb.restore();
        dbGetStb.restore();
    });

    it('Successfully retrieves row', async () => {
        dbGetStb.yields(null, { province: 'ON' });
        const result = await getProvince('K1V');
        expect(result).to.equal('ON');
    });

    it('Call to db returns no rows', async () => {
        try {
            dbGetStb.yields(null, null);
            await getProvince('Z1K');
            fail('Expected exception to be thrown');
        } catch (e) {
            expect(e.message).to.equal('No province found for the given postal code Z1K');
        }
    });

    it('Returns an error from db', async () => {
        try {
            dbGetStb.yields('SQLITE3 Error:');
            await getProvince('111');
            fail('Expected exception to be thrown');
        } catch (e) {
            expect(e).to.equal('SQLITE3 Error:');
        }
    });
});

describe('Update Fuel Surcharge', () => {
    let dbPrepareStb;
    let dbRunStb;
    const fakeStmt = {
        run: function () { }
    }

    beforeEach(() => {
        dbPrepareStb = sinon.stub(db, 'prepare').returns(fakeStmt);
        dbRunStb = sinon.stub(fakeStmt, 'run');
    });
    afterEach(() => {
        dbPrepareStb.restore();
        dbRunStb.restore();
    });

    it('Successfully updates table', async () => {
        dbRunStb.yields(null, null);
        try {
            await updateFuelSurcharge(11);
        } catch (e) {
            fail('Failed to update row');
        }
    });

    it('Fails to update if percentage is a negative number', async () => {
        try {
            dbRunStb.yields(null, null);
            await updateFuelSurcharge(-1);
            fail('Expected exception to be thrown');
        } catch (e) {
            expect(e).to.equal('Percentage must be specified between 0.00 and 99.99');
        }
    });

    it('Fails to update if percentage is greater than 100', async () => {
        try {
            dbRunStb.yields(null, null);
            await updateFuelSurcharge(101);
            fail('Expected exception to be thrown');
        } catch (e) {
            expect(e).to.equal('Percentage must be specified between 0.00 and 99.99');
        }
    });

    it('Returns an error from db', async () => {
        try {
            dbRunStb.yields('SQLITE3 Error:');
            await updateFuelSurcharge(12);
            fail('Expected exception to be thrown');
        } catch (e) {
            expect(e).to.equal('SQLITE3 Error:');
        }
    });
});

describe('Get Fuel Surcharge', () => {
    let dbPrepareStb;
    let dbGetStb;
    const fakeStmt = {
        get: function () { }
    }

    beforeEach(() => {
        dbPrepareStb = sinon.stub(db, 'prepare').returns(fakeStmt);
        dbGetStb = sinon.stub(fakeStmt, 'get');
    });
    afterEach(() => {
        dbPrepareStb.restore();
        dbGetStb.restore();
    });

    it('Successfully updates table', async () => {
        dbGetStb.yields(null, { percentage: '8' });
        try {
            const fuelSurcharge = await getFuelSurcharge();
            expect(fuelSurcharge).to.equal(8);
        } catch (e) {
            fail('Failed to update row');
        }
    });

    it('Returns an error from db', async () => {
        try {
            dbGetStb.yields('SQLITE3 Error:');
            await getFuelSurcharge();
            fail('Expected exception to be thrown');
        } catch (e) {
            expect(e).to.equal('SQLITE3 Error:');
        }
    });
});