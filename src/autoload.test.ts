import * as sinon from 'sinon';
import { e2eProcess } from './autoload';
import 'mocha';
import { RateTables } from './autoload';
import * as chai from 'chai';
const expect = chai.expect;
const YEAR = new Date().getFullYear();

describe('Extract rate tables', () => {
    beforeEach(() => {
    });
    afterEach(() => {
    });
    it('Execute autoload', async () => {
        let rateTables: RateTables = await e2eProcess();
        // also check the length of first and last row
        expect(rateTables['PriorityCanada1'][0].split(' ').length).to.equal(23);
        expect(rateTables['PriorityCanada1'].length).to.equal(62);
        expect(rateTables['PriorityCanada1'][rateTables['PriorityCanada1'].length - 1].split(' ').length).to.equal(23);

        // console.log(rateTables['PriorityCanada1'][rateTables['PriorityCanada1'].length - 1].split(' '));
        expect(rateTables['PriorityCanada2'][0].split(' ').length).to.equal(20);
        expect(rateTables['PriorityCanada2'].length).to.equal(62);
        expect(rateTables['PriorityCanada2'][rateTables['PriorityCanada2'].length - 1].split(' ').length).to.equal(20);

        expect(rateTables['ExpressCanada1'][0].split(' ').length).to.equal(23);
        expect(rateTables['ExpressCanada1'].length).to.equal(62);
        expect(rateTables['ExpressCanada1'][rateTables['ExpressCanada1'].length - 1].split(' ').length).to.equal(23);

        expect(rateTables['ExpressCanada2'][0].split(' ').length).to.equal(22);
        expect(rateTables['ExpressCanada2'].length).to.equal(62);
        expect(rateTables['ExpressCanada2'][rateTables['ExpressCanada2'].length - 1].split(' ').length).to.equal(22);

        expect(rateTables['RegularCanada1'][0].split(' ').length).to.equal(23);
        expect(rateTables['RegularCanada1'].length).to.equal(62);
        expect(rateTables['RegularCanada1'][rateTables['RegularCanada1'].length - 1].split(' ').length).to.equal(23);

        expect(rateTables['RegularCanada2'][0].split(' ').length).to.equal(22);
        expect(rateTables['RegularCanada2'].length).to.equal(62);
        expect(rateTables['RegularCanada2'][rateTables['RegularCanada2'].length - 1].split(' ').length).to.equal(22);

        expect(rateTables['PriorityWorldwide'][0].split(' ').length).to.equal(8);
        expect(rateTables['PriorityWorldwide'].length).to.equal(63);
        expect(rateTables['PriorityWorldwide'][rateTables['PriorityWorldwide'].length - 2].split(' ').length).to.equal(7);

        expect(rateTables['ExpressUSA'][0].split(' ').length).to.equal(7);
        expect(rateTables['ExpressUSA'].length).to.equal(63);
        expect(rateTables['ExpressUSA'][rateTables['ExpressUSA'].length - 2].split(' ').length).to.equal(7);

        expect(rateTables['ExpeditedUSA'][0].split(' ').length).to.equal(7);
        expect(rateTables['ExpeditedUSA'].length).to.equal(63);
        expect(rateTables['ExpeditedUSA'][rateTables['ExpeditedUSA'].length - 2].split(' ').length).to.equal(7);

        expect(rateTables['TrackedPacketUSA'][0].split(' ').length).to.equal(2);
        expect(rateTables['TrackedPacketUSA'].length).to.equal(8);
        expect(rateTables['TrackedPacketUSA'][rateTables['TrackedPacketUSA'].length - 1].split(' ').length).to.equal(2);

        expect(rateTables['SmallPacketUSA'][0].split(' ').length).to.equal(2);
        expect(rateTables['SmallPacketUSA'].length).to.equal(8);
        expect(rateTables['SmallPacketUSA'][rateTables['SmallPacketUSA'].length - 1].split(' ').length).to.equal(2);

        expect(rateTables['ExpressInternational'][0].split(' ').length).to.equal(10);
        expect(rateTables['ExpressInternational'].length).to.equal(62);
        expect(rateTables['ExpressInternational'][rateTables['ExpressInternational'].length - 1].split(' ').length).to.equal(10);

        expect(rateTables['AirInternational'][0].split(' ').length).to.equal(10);
        expect(rateTables['AirInternational'].length).to.equal(62);
        expect(rateTables['AirInternational'][rateTables['AirInternational'].length - 1].split(' ').length).to.equal(10);

        expect(rateTables['SurfaceInternational'][0].split(' ').length).to.equal(10);
        expect(rateTables['SurfaceInternational'].length).to.equal(62);
        expect(rateTables['SurfaceInternational'][rateTables['SurfaceInternational'].length - 1].split(' ').length).to.equal(10);

        expect(rateTables['TrackedPacketInternational'][0].split(' ').length).to.equal(10);
        expect(rateTables['TrackedPacketInternational'].length).to.equal(7);
        expect(rateTables['TrackedPacketInternational'][rateTables['TrackedPacketInternational'].length - 1].split(' ').length).to.equal(11);

        // since there are two tables on this page check them both
        expect(rateTables['SmallPacketInternational'].length).to.equal(13);
        expect(rateTables['SmallPacketInternational'][0].split(' ').length).to.equal(10);
        expect(rateTables['SmallPacketInternational'][7].split(' ').length).to.equal(10);
        expect(rateTables['SmallPacketInternational'][rateTables['SmallPacketInternational'].length - 1].split(' ').length).to.equal(11);
    });

});