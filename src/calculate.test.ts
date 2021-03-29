import { calculateShippingByPostalCode, calculateTax, validateAddress, Address } from './calculate';
import * as sinon from 'sinon';

import * as db from './db/sqlite3';
import * as mocha from 'mocha';
import * as chai from 'chai';

const expect = chai.expect;
/*
Calculate Tax Unit Tests:
sourceProvince, destinationProvice, shippingCost (1.00), shippingType = regular
-------------------------------------------------------------------------------
ON              NB
QC              ON
NL              QC
NWT,NU           NWT,NU


sourceProvince, destinationProvice, shippingCost (10.00), shippingType = regular
ON              NB
QC              ON
NL              QC
NWT,NU          NWT,NU
YT              YT

sourceProvince, destinationProvice, shippingCost (10.00), shippingType = express
-------------------------------------------------------
YT              YT
ON              YT
YT              ON


sourceProvince, destinationProvice, shippingCost (5.00), shippingType = express
-------------------------------------------------------------------------------
PEI              PEI

*/
describe('    Source Dest Shipping Speed', () => {

  it('ON     NB   1.00     regular', () => {
    expect(calculateTax('ON', 'NB', 1.00, 'regular')).to.equal(0.13);
  });

  it('QC     ON   1.00     regular', () => {
    expect(calculateTax('QC', 'NB', 1.00, 'regular')).to.equal(0.14975);
  });

  it('NL     QC   1.00     regular', () => {
    expect(calculateTax('NL', 'QC', 1.00, 'regular')).to.equal(0.15);
  });

  it('NWT,NU NWT,NU   1.00     regular', () => {
    expect(calculateTax('NWT,NU', 'NWT,NU', 1.00, 'regular')).to.equal(0.00);
  });

  it('ON     NB   10.00   regular', () => {
    expect(calculateTax('ON', 'NB', 10.00, 'regular')).to.equal(0.5);
  });

  it('QC     ON   10.00   regular', () => {
    expect(calculateTax('QC', 'ON', 10.00, 'regular')).to.equal(0.5);
  });

  it('YT     YT   10.00   regular', () => {
    expect(calculateTax('YT', 'YT', 10.00, 'regular')).to.equal(0.5);
  });

  it('YT     YT   10.00   express', () => {
    expect(calculateTax('YT', 'YT', 10.00, 'express')).to.equal(0.5);
  });

  it('ON     YT   10.00   express', () => {
    expect(calculateTax('ON', 'YT', 10.00, 'express')).to.equal(0.5);
  });

  it('YT     ON   10.00   express', () => {
    expect(calculateTax('YT', 'ON', 10.00, 'express')).to.equal(1.3);
  });

  it('PEI     PEI   5.00   express', () => {
    expect(calculateTax('PEI', 'PEI', 5.00, 'express')).to.equal(0.25);
  });

  it('PEI     PEI   1.00   express', () => {
    expect(calculateTax('PEI', 'PEI', 1.00, 'express')).to.equal(0.05);
  });
});

describe('Calculate Shipping Cost By Postal Code', () => {
  const fuelSurchargePercentage = 0.09;
  let getRateCodeStb;
  let getRateStb;
  let getFuelSurchargeStb;
  let getProvinceStb;
  beforeEach(() => {
    getRateCodeStb = sinon.stub(db, 'getRateCode').resolves('A5');
    getRateStb = sinon.stub(db, 'getRate');
    getFuelSurchargeStb = sinon.stub(db, 'getFuelSurcharge').resolves(0.09);
    getProvinceStb = sinon.stub(db, 'getProvince');
  });
  afterEach(() => {
    getRateCodeStb.restore();
    getRateStb.restore();
    getFuelSurchargeStb.restore();
    getProvinceStb.restore();
  });

  it('A5 - Regular - 0.7kg - 10.89', async () => {
    getRateStb.resolves(10.89);
    getProvinceStb.onCall(0).resolves('ON');
    getProvinceStb.onCall(1).resolves('QC');
    let cost = await calculateShippingByPostalCode('K1V2R9', 'J9H5V8', 0.70);
    expect(cost).to.equal(12.46);
  });

  it('A5 - Regular - 1.0kg - 11.45', async () => {
    getRateStb.resolves(11.45);
    getProvinceStb.onCall(0).resolves('ON');
    getProvinceStb.onCall(1).resolves('QC');
    let cost = await calculateShippingByPostalCode('K1V2R9', 'J9H5V8', 1.0);
    expect(cost).to.equal(13.1);
  });

  it('A5 - Regular - 1.3kg - 11.99', async () => {
    getRateStb.resolves(11.99);
    getProvinceStb.onCall(0).resolves('ON');
    getProvinceStb.onCall(1).resolves('QC');
    let cost = await calculateShippingByPostalCode('K1V2R9', 'J9H5V8', 1.3);
    expect(cost).to.equal(13.72);
  });

  it('A5 - Regular - 30.0kg - 34.39', async () => {
    getRateStb.resolves(34.39);
    getProvinceStb.onCall(0).resolves('ON');
    getProvinceStb.onCall(1).resolves('QC');
    let cost = await calculateShippingByPostalCode('K1V2R9', 'J9H5V8', 30);
    expect(cost).to.equal(39.36);
  });

  it('A5 - Regular - 30+kg - 34.39', async () => {
    getRateStb.rejects();
    getProvinceStb.onCall(0).resolves('ON');
    getProvinceStb.onCall(1).resolves('QC');
    try {
      await calculateShippingByPostalCode('K1V2R9', 'J9H5V8', 33);
    } catch (err) {
      expect(err).to.equal('Weight of package too big');
    }
  });

  it('A5 - Express - 0.7kg - 11.51', async () => {
    getRateStb.resolves(11.51);
    getProvinceStb.onCall(0).resolves('ON');
    getProvinceStb.onCall(1).resolves('QC');
    let cost = await calculateShippingByPostalCode('K1V2R9', 'J9H5V8', 0.7, 'express');
    expect(cost).to.equal(13.17);
  });

  it('A5 - Express - 1.0kg - 13.39', async () => {
    getRateStb.resolves(13.39);
    getProvinceStb.onCall(0).resolves('ON');
    getProvinceStb.onCall(1).resolves('QC');
    let cost = await calculateShippingByPostalCode('K1V2R9', 'J9H5V8', 1.0, 'express');
    expect(cost).to.equal(15.32);
  });

  it('A5 - Express - 1.3kg - 15.68', async () => {
    getRateStb.resolves(15.68);
    getProvinceStb.onCall(0).resolves('ON');
    getProvinceStb.onCall(1).resolves('QC');
    let cost = await calculateShippingByPostalCode('K1V2R9', 'J9H5V8', 1.3, 'express');
    expect(cost).to.equal(17.95);
  });

  it('A5 - Express - 30.0kg - 40.32', async () => {
    getRateStb.resolves(40.32);
    getProvinceStb.onCall(0).resolves('ON');
    getProvinceStb.onCall(1).resolves('QC');
    let cost = await calculateShippingByPostalCode('K1V2R9', 'J9H5V8', 30.0, 'express');
    expect(cost).to.equal(46.15);
  });

  it('A5 - Priority - 0.7kg - 23.74', async () => {
    getRateStb.resolves(23.74);
    getProvinceStb.onCall(0).resolves('ON');
    getProvinceStb.onCall(1).resolves('QC');
    let cost = await calculateShippingByPostalCode('K1V2R9', 'J9H5V8', 0.7, 'priority');
    expect(cost).to.equal(27.17);
  });

  it('A5 - Priority - 1.0kg - 24.47', async () => {
    getRateStb.resolves(24.47);
    getProvinceStb.onCall(0).resolves('ON');
    getProvinceStb.onCall(1).resolves('QC');
    let cost = await calculateShippingByPostalCode('K1V2R9', 'J9H5V8', 1.0, 'priority');
    expect(cost).to.equal(28.01);
  });

  it('A5 - Priority - 1.3kg - 24.96', async () => {
    getRateStb.resolves(24.96);
    getProvinceStb.onCall(0).resolves('ON');
    getProvinceStb.onCall(1).resolves('QC');
    let cost = await calculateShippingByPostalCode('K1V2R9', 'J9H5V8', 1.0, 'priority');
    expect(cost).to.equal(28.57);
  });

  it('A5 - Priority - 30,0kg - 59.60', async () => {
    getRateStb.resolves(59.60);
    getProvinceStb.onCall(0).resolves('ON');
    getProvinceStb.onCall(1).resolves('QC');
    let cost = await calculateShippingByPostalCode('K1V2R9', 'J9H5V8', 30.0, 'priority');
    expect(cost).to.equal(68.21);
  });

})
describe('Validate the address for calculation', () => {
  /*
  Validate Address:
  - address is undefined
  - address is missing a country
  - address country typed as cAnada   .
  - address is canada but is missing region
  - address is canada but is missing province
  - address is NOT canada OR USA but is missing region and province
  - address is canada but the province is NWT
  - address is cananda but province is not replace
  - address is canada province works but postal code fails RegEx
  - address is USA/us/united states but is missing zip code
  - canadian address is valid
  - american address is valid
  */
  it('Throws error if address object is null', () => {
    try {
      let anyType: Address = {
        streetAddress: '',
        city: '',
        region: '',
        postalCode: '',
        country: ''
      }
      //@ts-ignore
      anyType = null;
      validateAddress(anyType);
    } catch (e) {
      expect(e.message).to.equal('Missing value or missing country property of the address')
    }
  });
  it.skip('Throws error if address didn\'t specify a country', () => {
    let anyType: Address = {
      streetAddress: '',
      city: '',
      region: '',
      postalCode: '',
      country: ''
    };
    let newAddress: Address = {
      streetAddress: '',
      city: '',
      region: '',
      postalCode: '',
      country: 'Canada'
    };
    let cleanAddress = validateAddress(anyType);
    expect(cleanAddress).to.equal(68.21);
  });
});
// clientStub.onCall(1).resolves(temp);