import * as sinon from 'sinon';

import { db } from './sqlite3';
import * as localDB from './sqlite3';
import * as chai from 'chai';
import chaiAsPromised from 'chai-as-promised';

// Load chai-as-promised support
chai.use(chaiAsPromised);

// Initialise should API (attaches as a property on Object)
chai.should();
import { getRateCode, saveToDb, getRate, getMaxRate, options, getProvince, updateFuelSurcharge, getFuelSurcharge, FuelSurcharge } from './sqlite3'
import { fail } from 'assert';

const expect = chai.expect;
const fakeStmt = {
    get: function () { },
    finalize: function () { },
    all: function () { },
    run: function () { }
};
const fakeDB = {
    close: function () { },
    prepare: function () { }
};

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
        try {
            const rateCode = await getRateCode('K1V2R9', 'J9H5V8');
            expect(rateCode).to.equal('A5');
        } catch (e) {
            fail();
        }

    });

    it('Returns an error from db', async () => {
        dbGetStb.yields(new Error('SQLITE3 Error:'));
        return getRateCode('K1V2R9', 'J9H5V8').should.be.rejectedWith('SQLITE3 Error:');
    });

    it('Returns an empty row from db', async () => {
        dbGetStb.yields(null, null);
        return getRateCode('K1V2R9', 'J9H5V8').should.be.rejectedWith('Failed to find rate code for the given postal codes');
    });
});

describe('Save to db', () => {
    let dbPrepareStb;
    let dbRunStb;
    let openForWriteStb;
    let stmFinalizeStb;
    let dbClose;
    beforeEach(() => {
        openForWriteStb = sinon.stub(localDB, 'writedb').returns(fakeDB);
        dbPrepareStb = sinon.stub(localDB.writedb, 'prepare').returns(fakeStmt);
        stmFinalizeStb = sinon.stub(fakeStmt, 'finalize');
        dbRunStb = sinon.stub(fakeStmt, 'run');
        dbClose = sinon.stub(fakeDB, 'close').yields(null);
    });
    afterEach(() => {
        dbPrepareStb.restore();
        dbRunStb.restore();
        openForWriteStb.restore();
        stmFinalizeStb.restore();
        dbClose.restore();
    });

    it('Successfully saves to the database', async () => {
        dbRunStb.yields(null);
        const result = await saveToDb('insert into test values(\'helloworld\')');
        expect(result).to.equal('Success');
    });

    it('Returns an error from db', async () => {
        dbRunStb.yields({ message: 'SQLITE3 Error:' });
        saveToDb('insert into test values(\'helloworld\')').should.be.rejectedWith('SQLITE3 Error:');
    });
});

describe('GetRate from db', () => {
    let dbPrepareStb;
    let dbRunStb;
    let stmtFinalizeStb;
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
        stmtFinalizeStb = sinon.stub(fakeStmt, 'finalize');
    });
    afterEach(() => {
        dbPrepareStb.restore();
        dbRunStb.restore();
        stmtFinalizeStb.restore();
    });

    it('Successfully retrieves row', async () => {
        dbRunStb.yields(null, { price: '10.22' });
        const result = await getRate(rateCode, 1.0, opts);
        expect(result).to.equal(10.22);
    });

    it('Call to db returns no rows', () => {
        dbRunStb.yields(null, null);
        return getRate(rateCode, 1.0, opts).should.be.rejectedWith('Failed to find price for those parameters');
    });

    it('Returns an error from db', () => {
        dbRunStb.yields('SQLITE3 Error:');
        return getRate(rateCode, 1.0, opts).should.be.rejectedWith('SQLITE3 Error:');
    });
});

describe('Get Max Rate from db', () => {
    let dbPrepareStb;
    let dbAllStb;
    let stmtFinalizeStb;

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
        dbAllStb = sinon.stub(fakeStmt, 'all');
        stmtFinalizeStb = sinon.stub(fakeStmt, 'finalize');
    });
    afterEach(() => {
        dbPrepareStb.restore();
        dbAllStb.restore();
        stmtFinalizeStb.restore();
    });

    it('Successfully retrieves two rows', async () => {
        dbAllStb.yields(null, [{ price: '5.22' }, { price: '10.22' }]);
        const result = await getMaxRate(rateCode, opts);
        const expected = {
            maxRate: 10.22,
            incrementalRate: 5.22
        };
        expect(result).to.deep.equal(expected);
    });

    it('Fails if only one row is returned', () => {
        dbAllStb.yields(null, [{ price: '5.22' }]);
        return getMaxRate(rateCode, opts).should.be.rejectedWith('Failed to find price for those parameters');
    });

    it('Call to db returns no rows', () => {
        dbAllStb.yields(null, null);
        return getMaxRate(rateCode, opts).should.be.rejectedWith('Failed to find price for those parameters');
    });

    it('Returns an error from db', () => {
        dbAllStb.yields('SQLITE3 Error:');
        return getMaxRate(rateCode, opts).should.be.rejectedWith('SQLITE3 Error:');
    });
});
describe('GetProvince from db', () => {
    let dbPrepareStb;
    let dbGetStb;
    let stmtFinalizeStb;

    beforeEach(() => {
        dbPrepareStb = sinon.stub(db, 'prepare').returns(fakeStmt);
        dbGetStb = sinon.stub(fakeStmt, 'get');
        stmtFinalizeStb = sinon.stub(fakeStmt, 'finalize');
    });
    afterEach(() => {
        dbPrepareStb.restore();
        dbGetStb.restore();
        stmtFinalizeStb.restore();
    });

    it('Successfully retrieves row', async () => {
        dbGetStb.yields(null, { province: 'ON' });
        const result = await getProvince('K1V');
        expect(result).to.equal('ON');
    });

    it('Call to db returns no rows', async () => {
        dbGetStb.yields(null, null);
        return getProvince('Z1K').should.be.rejectedWith('No province found for the given postal code Z1K');
    });

    it('Returns an error from db', async () => {
        dbGetStb.yields('SQLITE3 Error:');
        return getProvince('111').should.be.rejectedWith('SQLITE3 Error:');
    });
});

describe('Update Fuel Surcharge', () => {
    let dbPrepareStb;
    let dbRunStb;
    let openForWriteStb;
    let stmtFinalizeStb;
    let dbClose;
    const newCharges = {
        "Domestic Services": 11.00,
        "USA and International Parcel Services": 9.25,
        "USA and International Packet Services": 7.25,
        "Priority Worldwide": 6.00,
        "Expiry_Date": new Date()
    };

    beforeEach(() => {
        dbPrepareStb = sinon.stub(localDB.writedb, 'prepare').returns(fakeStmt);
        dbRunStb = sinon.stub(fakeStmt, 'run');
        openForWriteStb = sinon.stub(localDB, 'openForWrite').returns(fakeDB);
        stmtFinalizeStb = sinon.stub(fakeStmt, 'finalize');
        dbClose = sinon.stub(fakeDB, 'close').yields(null);
    });
    afterEach(() => {
        dbPrepareStb.restore();
        dbRunStb.restore();
        openForWriteStb.restore();
        stmtFinalizeStb.restore();
        dbClose.restore();
    });

    it('Successfully updates table', async () => {
        dbRunStb.yields(null, null);
        try {
            await updateFuelSurcharge(newCharges);
        } catch (e) {
            fail('Failed to update row');
        }
    });

    it('Returns an error from db', async () => {
        dbRunStb.yields('SQLITE3 Error:');
        updateFuelSurcharge(newCharges).should.be.rejectedWith('SQLITE3 Error:');
    });
});

describe('Get Fuel Surcharge', () => {
    let dbPrepareStb;
    let dbGetStb;
    let stmtFinalizeStb;

    beforeEach(() => {
        dbPrepareStb = sinon.stub(db, 'prepare').returns(fakeStmt);
        dbGetStb = sinon.stub(fakeStmt, 'get');
        stmtFinalizeStb = sinon.stub(fakeStmt, 'finalize');
    });
    afterEach(() => {
        dbPrepareStb.restore();
        dbGetStb.restore();
        stmtFinalizeStb.restore();
    });

    it('Successfully retrieves percentage from db table', async () => {
        dbGetStb.yields(null, { percentage: '0.08', expiryUnixTimestamp: 1011111 });
        try {
            const fuelSurcharge = await getFuelSurcharge('Canada', 'express');
            expect(fuelSurcharge.percentage).to.equal(0.08);
        } catch (e) {
            fail('Failed to update row');
        }
    });

    it('Returns an error from db', async () => {
        dbGetStb.yields('SQLITE3 Error:');
        return getFuelSurcharge('Canada', 'regular').should.be.rejectedWith('SQLITE3 Error:');
    });
});