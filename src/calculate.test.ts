import { calculateShippingCost } from './calculate';

import * as mocha from 'mocha';
import * as chai from 'chai';

const expect = chai.expect;
describe('Calculate shipping cost', () => {

  it('should be able to return base case of shipping cost in canada' , () => {
    expect(calculateShippingCost(null, null, null)).to.equal(null);
  });

});