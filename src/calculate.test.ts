import {
  validateAddress, Address, calculateTax,
  calculateShippingCanada, calculateShipping, calculateShippingUSA, calculateShippingInternational,
  mapProvinceToCode
} from './calculate';
import * as calculate from './calculate';
import * as sinon from 'sinon';

import * as db from './db/sqlite3';
import * as chai from 'chai';
import { fail } from 'assert';
import { maxRates } from './db/sqlite3';

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
  let getMaxRateStb;
  let getFuelSurchargeStb;
  let getProvinceStb;
  beforeEach(() => {
    getRateCodeStb = sinon.stub(db, 'getRateCode').resolves('A5');
    getRateStb = sinon.stub(db, 'getRate');
    getMaxRateStb = sinon.stub(db, 'getMaxRate');
    getFuelSurchargeStb = sinon.stub(calculate, 'getLatestFuelSurcharge').resolves(0.09);
    getProvinceStb = sinon.stub(db, 'getProvince');
  });
  afterEach(() => {
    getRateCodeStb.restore();
    getRateStb.restore();
    getMaxRateStb.restore();
    getFuelSurchargeStb.restore();
    getProvinceStb.restore();
  });

  it('A5 - Regular - 0.7kg - 10.89', async () => {
    getRateStb.resolves(10.89);
    getProvinceStb.onCall(0).resolves('ON');
    getProvinceStb.onCall(1).resolves('QC');
    let cost = await calculateShippingCanada('K1V2R9', 'J9H5V8', 0.70);
    expect(cost).to.equal(12.46);
  });

  it('A5 - Regular - 1.0kg - 11.45', async () => {
    getRateStb.resolves(11.45);
    getProvinceStb.onCall(0).resolves('ON');
    getProvinceStb.onCall(1).resolves('QC');
    let cost = await calculateShippingCanada('K1V2R9', 'J9H5V8', 1.0);
    expect(cost).to.equal(13.1);
  });

  it('A5 - Regular - 1.3kg - 11.99', async () => {
    getRateStb.resolves(11.99);
    getProvinceStb.onCall(0).resolves('ON');
    getProvinceStb.onCall(1).resolves('QC');
    let cost = await calculateShippingCanada('K1V2R9', 'J9H5V8', 1.3);
    expect(cost).to.equal(13.72);
  });

  it('A5 - Regular - 30.0kg - 34.39', async () => {
    getRateStb.resolves(34.39);
    getProvinceStb.onCall(0).resolves('ON');
    getProvinceStb.onCall(1).resolves('QC');
    let cost = await calculateShippingCanada('K1V2R9', 'J9H5V8', 30);
    expect(cost).to.equal(39.36);
  });

  it('A5 - Regular - 30+kg - 34.39', async () => {
    getMaxRateStb.resolves({ incrementalRate: 0.34, maxRate: 10.0 });
    getProvinceStb.onCall(0).resolves('ON');
    getProvinceStb.onCall(1).resolves('QC');
    let cost = await calculateShippingCanada('K1V2R9', 'J9H5V8', 33);
    expect(cost).to.equal(13.78);

  });

  it('A5 - Express - 0.7kg - 11.51', async () => {
    getRateStb.resolves(11.51);
    getProvinceStb.onCall(0).resolves('ON');
    getProvinceStb.onCall(1).resolves('QC');
    let cost = await calculateShippingCanada('K1V2R9', 'J9H5V8', 0.7, 'express');
    expect(cost).to.equal(13.17);
  });

  it('A5 - Express - 1.0kg - 13.39', async () => {
    getRateStb.resolves(13.39);
    getProvinceStb.onCall(0).resolves('ON');
    getProvinceStb.onCall(1).resolves('QC');
    let cost = await calculateShippingCanada('K1V2R9', 'J9H5V8', 1.0, 'express');
    expect(cost).to.equal(15.32);
  });

  it('A5 - Express - 1.3kg - 15.68', async () => {
    getRateStb.resolves(15.68);
    getProvinceStb.onCall(0).resolves('ON');
    getProvinceStb.onCall(1).resolves('QC');
    let cost = await calculateShippingCanada('K1V2R9', 'J9H5V8', 1.3, 'express');
    expect(cost).to.equal(17.95);
  });

  it('A5 - Express - 30.0kg - 40.32', async () => {
    getRateStb.resolves(40.32);
    getProvinceStb.onCall(0).resolves('ON');
    getProvinceStb.onCall(1).resolves('QC');
    let cost = await calculateShippingCanada('K1V2R9', 'J9H5V8', 30.0, 'express');
    expect(cost).to.equal(46.15);
  });

  it('A5 - Priority - 0.7kg - 23.74', async () => {
    getRateStb.resolves(23.74);
    getProvinceStb.onCall(0).resolves('ON');
    getProvinceStb.onCall(1).resolves('QC');
    let cost = await calculateShippingCanada('K1V2R9', 'J9H5V8', 0.7, 'priority');
    expect(cost).to.equal(27.17);
  });

  it('A5 - Priority - 1.0kg - 24.47', async () => {
    getRateStb.resolves(24.47);
    getProvinceStb.onCall(0).resolves('ON');
    getProvinceStb.onCall(1).resolves('QC');
    let cost = await calculateShippingCanada('K1V2R9', 'J9H5V8', 1.0, 'priority');
    expect(cost).to.equal(28.01);
  });

  it('A5 - Priority - 1.3kg - 24.96', async () => {
    getRateStb.resolves(24.96);
    getProvinceStb.onCall(0).resolves('ON');
    getProvinceStb.onCall(1).resolves('QC');
    let cost = await calculateShippingCanada('K1V2R9', 'J9H5V8', 1.0, 'priority');
    expect(cost).to.equal(28.57);
  });

  it('A5 - Priority - 30,0kg - 59.60', async () => {
    getRateStb.resolves(59.60);
    getProvinceStb.onCall(0).resolves('ON');
    getProvinceStb.onCall(1).resolves('QC');
    let cost = await calculateShippingCanada('K1V2R9', 'J9H5V8', 30.0, 'priority');
    expect(cost).to.equal(68.21);
  });
  it('SB - Regular - 30.0kg - 59.60', async () => {
    getRateStb.resolves(59.60);
    getProvinceStb.onCall(0).resolves('ON');
    getProvinceStb.onCall(1).resolves('QC');
    let cost = await calculateShippingCanada('K1V2R9', 'J9H5V8', 30.0, 'regular', 'small_business');
    expect(cost).to.equal(68.21);
  });
  it('SB - Regular -  1.3kg - 24.96', async () => {
    getRateStb.resolves(24.96);
    getProvinceStb.onCall(0).resolves('ON');
    getProvinceStb.onCall(1).resolves('QC');
    let cost = await calculateShippingCanada('K1V2R9', 'J9H5V8', 1.0, 'regular', 'small_business');
    expect(cost).to.equal(28.57);
  });

  it('SB - Priority -  1.3kg - 24.96', async () => {
    getRateStb.resolves(24.96);
    getProvinceStb.onCall(0).resolves('ON');
    getProvinceStb.onCall(1).resolves('QC');
    let cost = await calculateShippingCanada('K1V2R9', 'J9H5V8', 1.0, 'priority', 'small_business');
    expect(cost).to.equal(28.57);
  });

  it('SB - Express -  1.3kg - 24.96', async () => {
    getRateStb.resolves(24.96);
    getProvinceStb.onCall(0).resolves('ON');
    getProvinceStb.onCall(1).resolves('QC');
    let cost = await calculateShippingCanada('K1V2R9', 'J9H5V8', 1.0, 'express', 'small_business');
    expect(cost).to.equal(28.57);
  });

  it('SB - Expedited -  1.3kg - 24.96', async () => {
    getRateStb.resolves(24.96);
    getProvinceStb.onCall(0).resolves('ON');
    getProvinceStb.onCall(1).resolves('QC');
    let cost = await calculateShippingCanada('K1V2R9', 'J9H5V8', 1.0, 'expedited', 'small_business');
    expect(cost).to.equal(27.21);
  });
});

describe('Calculate Shipping Cost to USA', () => {
  const fuelSurchargePercentage = 0.09;
  let getRateCodeStb;
  let getRateStb;
  let getMaxRateStb;
  let getFuelSurchargeStb;
  let getProvinceStb;
  let maxRates: maxRates = {
    maxRate: 10.89,
    incrementalRate: 1.06
  };
  beforeEach(() => {
    getRateCodeStb = sinon.stub(db, 'getRateCode').resolves('2');
    getRateStb = sinon.stub(db, 'getRate');
    getMaxRateStb = sinon.stub(db, 'getMaxRate').resolves(maxRates);
    getFuelSurchargeStb = sinon.stub(calculate, 'getLatestFuelSurcharge').resolves(0.09);
    getProvinceStb = sinon.stub(db, 'getProvince');
  });
  afterEach(() => {
    getRateCodeStb.restore();
    getRateStb.restore();
    getMaxRateStb.restore();
    getFuelSurchargeStb.restore();
    getProvinceStb.restore();
  });

  it('2 - Priority - 0.7kg - 10.89 - Regular', async () => {
    getRateStb.resolves(10.89);
    let cost = await calculateShippingUSA('ON', 'NY', 0.70, 'priority', 'regular');
    expect(cost).to.equal(11.87);
  });

  it('2 - Priority - 0.7kg - 10.89 - Small Business', async () => {
    getRateStb.resolves(10.89);
    let cost = await calculateShippingUSA('ON', 'NY', 0.70, 'priority', 'small_business');
    expect(cost).to.equal(11.87);
  });

  it('2 - Priority - 30.7kg - 10.89 - Regular', async () => {
    let cost = await calculateShippingUSA('ON', 'NY', 30.70, 'priority', 'regular');
    expect(cost).to.equal(13.49);
  });

  it('2 - Priority - 30.7kg - 10.89 - Small Business', async () => {
    let cost = await calculateShippingUSA('ON', 'NY', 30.70, 'priority', 'small_business');
    expect(cost).to.equal(13.49);
  });

  it('ALASKA - Priority - 0.7kg - 10.89 - Regular', async () => {
    getRateStb.resolves(10.89);
    let cost = await calculateShippingUSA('ON', 'AK', 0.70, 'priority', 'regular');
    expect(cost).to.equal(20.37);
  });

  it('ALASKA - Priority - 0.7kg - 10.89 - Small Business', async () => {
    getRateStb.resolves(10.89);
    let cost = await calculateShippingUSA('ON', 'AK', 0.70, 'priority', 'small_business');
    expect(cost).to.equal(20.37);
  });

  it('ALASKA - Priority - 30.7kg - 10.89 - Regular', async () => {
    let cost = await calculateShippingUSA('ON', 'AK', 30.70, 'priority', 'regular');
    expect(cost).to.equal(21.99);
  });

  it('ALASKA - Priority - 30.7kg - 10.89 - Small Business', async () => {
    let cost = await calculateShippingUSA('ON', 'AK', 30.70, 'priority', 'small_business');
    expect(cost).to.equal(21.99);
  });


  it('2 - Tracked Packet - 0.7kg - 10.89 - Small Business', async () => {
    getRateStb.resolves(10.89);
    let cost = await calculateShippingUSA('ON', 'NY', 0.70, 'tracked_packet', 'small_business');
    expect(cost).to.equal(11.87);
  });

  it('2 - Tracked Packet - 2.1kg - Error - Regular', async () => {
    return calculateShippingUSA('ON', 'NY', 2.10, 'tracked_packet', 'regular').should.be.rejectedWith('The maximum weight of a package for a packet is 2.0 kg');
  });

  it('2 - Small Packet - 0.7kg - 10.89 - Small Business', async () => {
    getRateStb.resolves(10.89);
    let cost = await calculateShippingUSA('ON', 'NY', 0.70, 'small_packet', 'small_business');
    expect(cost).to.equal(11.87);
  });

  it('2 - Small Packet - 2.1kg - Error - Regular', async () => {
    return calculateShippingUSA('ON', 'NY', 2.10, 'small_packet', 'regular').should.be.rejectedWith('The maximum weight of a package for a packet is 2.0 kg');
  });

  it('2 - Expedited - 30.7kg - 10.89 - Small Business', async () => {
    let cost = await calculateShippingUSA('ON', 'NY', 30.70, 'expedited', 'small_business');
    expect(cost).to.equal(13.49);
  });


  it('2 - Expedited - 0.7kg - 10.89 - Regular', async () => {
    getRateStb.resolves(10.89);
    let cost = await calculateShippingUSA('ON', 'NY', 0.70, 'expedited', 'regular');
    expect(cost).to.equal(11.87);
  });
});

describe('Calculate Shipping Cost Internationally', () => {
  const fuelSurchargePercentage = 0.09;
  let getRateCodeStb;
  let getRateStb;
  let getMaxRateStb;
  let getFuelSurchargeStb;
  let getProvinceStb;
  let maxRates: maxRates = {
    maxRate: 10.89,
    incrementalRate: 1.06
  };
  beforeEach(() => {
    getRateCodeStb = sinon.stub(db, 'getRateCode').resolves('2');
    getRateStb = sinon.stub(db, 'getRate');
    getMaxRateStb = sinon.stub(db, 'getMaxRate').resolves(maxRates);
    getFuelSurchargeStb = sinon.stub(calculate, 'getLatestFuelSurcharge').resolves(0.09);
    getProvinceStb = sinon.stub(db, 'getProvince');
  });
  afterEach(() => {
    getRateCodeStb.restore();
    getRateStb.restore();
    getMaxRateStb.restore();
    getFuelSurchargeStb.restore();
    getProvinceStb.restore();
  });

  it('Ukraine - Priority - 0.7kg - 10.89 - Regular', async () => {
    getRateStb.resolves(10.89);
    let cost = await calculateShippingInternational('Ukraine', 0.70, 'priority', 'regular');
    expect(cost).to.equal(11.87);
  });

  it('Ukraine - Priority - 0.7kg - 10.89 - Small Business', async () => {
    getRateStb.resolves(10.89);
    let cost = await calculateShippingInternational('Ukraine', 0.70, 'priority', 'small_business');
    expect(cost).to.equal(11.87);
  });

  it('Ukraine - Priority - 30.7kg - 10.89 - Regular', async () => {
    let cost = await calculateShippingInternational('Ukraine', 30.70, 'priority', 'regular');
    expect(cost).to.equal(13.49);
  });

  it('Ukraine - Priority - 30.7kg - 10.89 - Small Business', async () => {
    let cost = await calculateShippingInternational('Ukraine', 30.70, 'priority', 'small_business');
    expect(cost).to.equal(13.49);
  });

  it('Ukraine - Express - 0.7kg - 10.89 - Regular', async () => {
    getRateStb.resolves(10.89);
    let cost = await calculateShippingInternational('Ukraine', 0.70, 'express', 'regular');
    expect(cost).to.equal(11.87);
  });

  it('Ukraine - Express - 0.7kg - 10.89 - Small Business', async () => {
    getRateStb.resolves(10.89);
    let cost = await calculateShippingInternational('Ukraine', 0.70, 'express', 'small_business');
    expect(cost).to.equal(11.87);
  });

  it('Ukraine - air - 0.7kg - 10.89 - Small Business', async () => {
    getRateStb.resolves(10.89);
    let cost = await calculateShippingInternational('Ukraine', 0.70, 'air', 'small_business');
    expect(cost).to.equal(11.87);
  });

  it('Ukraine - air - 30.7kg - 10.89 - Regular', async () => {
    let cost = await calculateShippingInternational('Ukraine', 30.70, 'air', 'regular');
    expect(cost).to.equal(13.49);
  });

  it('Ukraine - surface - 0.7kg - 10.89 - Small Business', async () => {
    getRateStb.resolves(10.89);
    let cost = await calculateShippingInternational('Ukraine', 0.70, 'surface', 'small_business');
    expect(cost).to.equal(11.87);
  });

  it('Ukraine - surface - 30.7kg - 10.89 - Regular', async () => {
    let cost = await calculateShippingInternational('Ukraine', 30.70, 'surface', 'regular');
    expect(cost).to.equal(13.49);
  });

  it('Ukraine - Tracked Packet - 0.7kg - 10.89 - Small Business', async () => {
    getRateStb.resolves(10.89);
    let cost = await calculateShippingInternational('Ukraine', 0.70, 'tracked_packet', 'small_business');
    expect(cost).to.equal(11.87);
  });

  it('Ukraine - Tracked Packet- 2.1kg - Error - Regular', async () => {
    return calculateShippingInternational('Ukraine', 2.10, 'tracked_packet', 'regular').should.be.rejectedWith('The maximum weight of a package for a packet is 2.0 kg');
  });

  it('Ukraine - Small Packet Air - 0.7kg - 10.89 - Small Business', async () => {
    getRateStb.resolves(10.89);
    let cost = await calculateShippingInternational('Ukraine', 0.70, 'small_packet_air', 'small_business');
    expect(cost).to.equal(11.87);
  });

  it('Ukraine - Small Packet Air - 2.1kg - Error - Regular', async () => {
    return calculateShippingInternational('Ukraine', 2.10, 'small_packet_air', 'regular').should.be.rejectedWith('The maximum weight of a package for a packet is 2.0 kg');
  });

  it('Ukraine - Small Packet Surface - 0.7kg - 10.89 - Small Business', async () => {
    getRateStb.resolves(10.89);
    let cost = await calculateShippingInternational('Ukraine', 0.70, 'small_packet_surface', 'small_business');
    expect(cost).to.equal(11.87);
  });

  it('Ukraine - Small Packet Surface - 2.1kg - Error - Regular', async () => {
    return calculateShippingInternational('Ukraine', 2.10, 'small_packet_surface', 'regular').should.be.rejectedWith('The maximum weight of a package for a packet is 2.0 kg');
  });
});

describe('Calculate shipping cost for american addresses', () => {
  const sourceAddress = {
    streetAddress: '111 Random St',
    city: 'Ottawa',
    region: 'Ontario',
    postalCode: 'K1V1R9',
    country: 'Ca'
  };
  const destinationAddress = {
    streetAddress: '2224 - B Random Ave',
    city: 'Gatineau',
    region: 'NY',
    postalCode: '111001',
    country: 'United States'
  }

  let calculateShippingUSAStb;

  beforeEach(() => {

    calculateShippingUSAStb = sinon.stub(calculate, 'calculateShippingUSA');
  });
  afterEach(() => {
    calculateShippingUSAStb.restore();
  });
  it('Throws an error for invalid type: 0.7 - regular', () => {
    calculateShippingUSAStb.resolves(12.46);
    return calculateShipping(sourceAddress, destinationAddress, 0.7, 'regular', 'small_business').should.be.rejectedWith('Delivery type to USA must be one of the following: regular, priority, express, expedited, small_packet or tracked_packet');
  })

  it('Returns a valid shipping cost : 0.7 - priority', async () => {
    calculateShippingUSAStb.resolves(12.46);
    calculateShipping(sourceAddress, destinationAddress, 0.7, 'priority').then(result => {
      expect(result).to.equal(12.46);
    });
  })
});
describe('Calculate shipping cost for international addresses', () => {
  const sourceAddress = {
    streetAddress: '111 Random St',
    city: 'Ottawa',
    region: 'Ontario',
    postalCode: 'K1V1R9',
    country: 'Ca'
  };
  const destinationAddress = {
    streetAddress: '2224 - B Random Ave',
    city: 'Gatineau',
    region: 'NY',
    postalCode: '111001',
    country: 'Ukraine'
  }

  let calculateShippingIntlStb;

  beforeEach(() => {
    calculateShippingIntlStb = sinon.stub(calculate, 'calculateShippingInternational');
  });
  afterEach(() => {
    calculateShippingIntlStb.restore();
  });
  it('Throws an error for invalid type: 0.7 - regular', () => {
    calculateShippingIntlStb.resolves(12.46);
    return calculateShipping(sourceAddress, destinationAddress, 0.7, 'regular', 'small_business').should.be.rejectedWith('Delivery type must be one of the following: priority,express,air,surface,tracked_packet,small_packet_air,small_packet_surface');
  })

  it('Returns a valid shipping cost : 0.7 - surface', async () => {
    calculateShippingIntlStb.resolves(12.46);
    calculateShipping(sourceAddress, destinationAddress, 0.7, 'surface').then(result => {
      expect(result).to.equal(12.46);
    });
  })
});
describe('Validate the address for calculation', () => {
  it('Throws error if address object is null', () => {
    try {
      //@ts-ignore
      validateAddress(null);
    } catch (e) {
      expect(e.message).to.equal('Missing value or missing country property of the address')
    }
  });
  it('Throws error if address didn\'t specify a country', () => {
    let address: Address = {
      streetAddress: '',
      city: '',
      region: '',
      postalCode: '',
      country: ''
    };
    try {
      validateAddress(address);
    } catch (e) {
      expect(e.message).to.equal('Missing value or missing country property of the address');
    }
  });

  it('Updates address country typed as cAnada', () => {
    let anyType: Address = {
      streetAddress: '',
      city: 'City',
      region: 'BC',
      postalCode: 'A1A1A1',
      country: 'cAnada'
    };
    let expectedAddress: Address = {
      streetAddress: '',
      city: 'City',
      region: 'BC',
      postalCode: 'A1A1A1',
      country: 'Canada'
    };
    let cleanAddress = validateAddress(anyType);
    expect(cleanAddress).to.deep.equal(expectedAddress);
  });

  it('Country is canada but is missing province', () => {
    let anyType: Address = {
      streetAddress: '',
      city: 'City',
      region: '',
      postalCode: 'A1A1A1',
      country: 'cAnada'
    };
    try {
      validateAddress(anyType);
    } catch (e) {
      expect(e.message).to.deep.equal('For north american shipments, region and zip code must be provided.');
    }
  });

  it('Country is united states but is missing region', () => {
    let anyType: Address = {
      streetAddress: '',
      city: 'City',
      region: '',
      postalCode: 'A1A1A1',
      country: 'United States'
    };
    try {
      validateAddress(anyType);
    } catch (e) {
      expect(e.message).to.deep.equal('For north american shipments, region and zip code must be provided.');
    }
  });

  it('Country is NOT canada OR USA but is missing region and province', () => {
    let address: Address = {
      streetAddress: '',
      city: 'City',
      region: '',
      postalCode: '',
      country: 'Ukraine'
    };

    let expectedAddress: Address = {
      streetAddress: '',
      city: 'City',
      region: '',
      postalCode: '',
      country: 'UKRAINE'
    };
    let cleanAddress = validateAddress(address);
    expect(cleanAddress).to.deep.equal(expectedAddress);
  });

  it('Country is canada but the province is NWT', () => {
    let address: Address = {
      streetAddress: '',
      city: 'City',
      region: 'Northwest Territories',
      postalCode: 'y1y1y1',
      country: 'CA'
    };

    let expectedAddress: Address = {
      streetAddress: '',
      city: 'City',
      region: 'NWT',
      postalCode: 'Y1Y1Y1',
      country: 'Canada'
    };
    let cleanAddress = validateAddress(address);
    expect(cleanAddress).to.deep.equal(expectedAddress);
  });

  it('Country is canada but the province is NWT', () => {
    let address: Address = {
      streetAddress: '',
      city: 'City',
      region: 'Northwest Territories',
      postalCode: 'y1y1y1',
      country: 'CA'
    };

    let expectedAddress: Address = {
      streetAddress: '',
      city: 'City',
      region: 'NWT',
      postalCode: 'Y1Y1Y1',
      country: 'Canada'
    };
    let cleanAddress = validateAddress(address);
    expect(cleanAddress).to.deep.equal(expectedAddress);
  });

  it('Country is cananda but province is not', () => {
    let address: Address = {
      streetAddress: '',
      city: 'City',
      region: 'North Territories',
      postalCode: 'y1y1y1',
      country: 'CA'
    };

    try {
      validateAddress(address);
    } catch (e) {
      expect(e.message).to.deep.equal('The region provided is not a valid region');
    }
  });

  it('Country is canada province works but postal code fails RegEx', () => {
    let address: Address = {
      streetAddress: '',
      city: 'City',
      region: 'British Columbia',
      postalCode: 'yy11y1',
      country: 'CA'
    };

    try {
      validateAddress(address);
    } catch (e) {
      expect(e.message).to.deep.equal('Invalid postal code. Please make sure its in format of A1A1A1');
    }
  });

  it('Country is united states but is missing zip code', () => {
    let anyType: Address = {
      streetAddress: '',
      city: 'City',
      region: 'Washington',
      postalCode: '',
      country: 'United States'
    };
    try {
      validateAddress(anyType);
    } catch (e) {
      expect(e.message).to.deep.equal('For north american shipments, region and zip code must be provided.');
    }
  });

  it('Validates a canadian address', () => {
    let address: Address = {
      streetAddress: '111 Random St.',
      city: 'Ottawa',
      region: 'Ontario',
      postalCode: ' K1V-1r1 ',
      country: 'CA'
    };

    let expectedAddress: Address = {
      streetAddress: '111 Random St.',
      city: 'Ottawa',
      region: 'ON',
      postalCode: 'K1V1R1',
      country: 'Canada'
    };
    let cleanAddress = validateAddress(address);
    expect(cleanAddress).to.deep.equal(expectedAddress);
  });

  it('Validates an american address', () => {
    let address: Address = {
      streetAddress: '111 Random St.',
      city: 'New York',
      region: 'New York',
      postalCode: '10002 ',
      country: 'United States'
    };

    let expectedAddress: Address = {
      streetAddress: '111 Random St.',
      city: 'New York',
      region: 'NY',
      postalCode: '10002',
      country: 'USA'
    };
    let cleanAddress = validateAddress(address);
    expect(cleanAddress).to.deep.equal(expectedAddress);
  });
});

describe('Calculate Shipping Using Addresses (Canada)', () => {
  const sourceAddress = {
    streetAddress: '111 Random St',
    city: 'Ottawa',
    region: 'Ontario',
    postalCode: 'K1V1R9',
    country: 'Ca'
  };
  const destinationAddress = {
    streetAddress: '2224 - B Random Ave',
    city: 'Gatineau',
    region: 'Quebec',
    postalCode: 'j9h 5v8',
    country: 'Ca'
  }

  let calculateShippingCanadaStb;

  beforeEach(() => {

    calculateShippingCanadaStb = sinon.stub(calculate, 'calculateShippingCanada');
  });
  afterEach(() => {
    calculateShippingCanadaStb.restore();
  });

  it('Fails source address validation', () => {
    // @ts-ignore
    return calculateShipping(null, destinationAddress, 1.0, 'regular').should.be.rejectedWith('Missing value or missing country property of the address');
  })

  it('Fails destination address validation', () => {
    // @ts-ignore
    return calculateShipping(sourceAddress, null, 1.0, 'regular').should.be.rejectedWith('Missing value or missing country property of the address');
  })

  it('Throws an error if weight is not valid', () => {
    return calculateShipping(sourceAddress, destinationAddress, -1, 'regular').should.be.rejectedWith('Weight must be present and be a non-negative number');
  })

  it('Returns a valid shipping cost: 33.3 - regular', async () => {
    calculateShippingCanadaStb.resolves(40.46);
    calculateShipping(sourceAddress, destinationAddress, 33.3, 'regular').then(result => {
      expect(result).to.equal(40.46);
    });
  })

  it('Throws an error if the delivery type is invalid', () => {
    return calculateShipping(sourceAddress, destinationAddress, 29, 'somethingorother').should.be.rejectedWith('Delivery type must be one of the following: regular, priority, express or expedited');
  })

  it('Returns a valid shipping cost: 0.7 - regular', async () => {
    calculateShippingCanadaStb.resolves(12.46);
    calculateShipping(sourceAddress, destinationAddress, 0.7, 'regular').then(result => {
      expect(result).to.equal(12.46);
    });
  })

  it('Returns a valid shipping cost: 30.0 - blank (which should get converted to regular)', async () => {
    try {
      calculateShippingCanadaStb.resolves(68.21);
      const total = await calculateShipping(sourceAddress, destinationAddress, 30);
      expect(total).to.equal(68.21);
    } catch (e) {
      fail(e);
    }
  })

  it('Returns a valid shipping cost: 0.7 - priority', async () => {
    try {
      calculateShippingCanadaStb.resolves(27.17);
      const total = await calculateShipping(sourceAddress, destinationAddress, 0.7, 'priority');
      expect(total).to.equal(27.17);
    } catch (e) {
      fail(e);
    }
  })

  it('Returns a valid shipping cost: 1.0 - express', async () => {
    try {
      calculateShippingCanadaStb.resolves(15.32);
      const total = await calculateShipping(sourceAddress, destinationAddress, 1.0, 'express');
      expect(total).to.equal(15.32);
    } catch (e) {
      fail(e);
    }
  })

  it('Returns a valid shipping cost: 1.0 - expedited - small_business', async () => {
    try {
      calculateShippingCanadaStb.resolves(15.32);
      const total = await calculateShipping(sourceAddress, destinationAddress, 1.0, 'expedited', 'small_business');
      expect(total).to.equal(15.32);
    } catch (e) {
      fail(e);
    }
  })

  it('Expedited (Canada) - Error: Delivery Type not supported', async () => {
    return calculateShipping(sourceAddress, destinationAddress, 1.0, 'expedited').should.be.rejectedWith('Delivery type must be one of the following: regular, priority, express or expedited');
  });

  it('Small Packet (Canada) - Error: Delivery Type not supported', async () => {
    return calculateShipping(sourceAddress, destinationAddress, 1.0, 'small_packet').should.be.rejectedWith('Delivery type must be one of the following: regular, priority, express or expedited');
  });

  it('Small Packet (International) - Error: Delivery Type not supported', async () => {
    const destinationAddress = {
      streetAddress: '2224 - B Random Ave',
      city: 'Gatineau',
      region: 'Quebec',
      postalCode: 'j9h 5v8',
      country: 'Ukraine'
    }
    return calculateShipping(sourceAddress, destinationAddress, 1.0, 'small_packet').should.be.rejectedWith('Delivery type must be one of the following: priority,express,air,surface,tracked_packet,small_packet_air,small_packet_surface');
  });

  it('Small Packet (USA) - Error: Delivery Type not supported', async () => {
    const destinationAddress = {
      streetAddress: '2224 - B Random Ave',
      city: 'Gatineau',
      region: 'NY',
      postalCode: 'j9h 5v8',
      country: 'USA'
    }
    return calculateShipping(sourceAddress, destinationAddress, 1.0, 'small_packet_air').should.be.rejectedWith('Delivery type to USA must be one of the following: regular, priority, express, expedited, small_packet or tracked_packet');
  });

  it('Small Packet (USA) - Small Business - Error: Delivery Type not supported', async () => {
    const destinationAddress = {
      streetAddress: '2224 - B Random Ave',
      city: 'Gatineau',
      region: 'NY',
      postalCode: 'j9h 5v8',
      country: 'USA'
    }
    return calculateShipping(sourceAddress, destinationAddress, 1.0, 'small_packet_air', 'small_business').should.be.rejectedWith('Delivery type to USA must be one of the following: regular, priority, express, expedited, small_packet or tracked_packet');
  });

  it('Returns a valid shipping cost: 1.0 - expedited (small business)', async () => {
    try {
      calculateShippingCanadaStb.resolves(15.33);
      const total = await calculateShipping(sourceAddress, destinationAddress, 1.0, 'expedited', 'small_business');
      expect(total).to.equal(15.33);
    } catch (e) {
      fail(e);
    }
  })
});


describe('Map province to code and vice versa', () => {
  it('Expect 2 letter Canadian province to stay the same', () => {
    expect(mapProvinceToCode('BC')).to.equal('BC');
  });

  it('Expect 3 letter Canadian province to also stay the same', () => {
    expect(mapProvinceToCode('PEI')).to.equal('PEI');
  });

  it('Expect non existent codes to be rejected', () => {
    try {
      mapProvinceToCode('ABC');
      fail('Did not throw an expected error');
    } catch (e) {
      expect(e.message).to.equal('The region provided is not a valid region');
    }
  });

  it('Expect an american state to get converted accurately', () => {
    expect(mapProvinceToCode('OREGON')).to.equal('OR');
  });
});