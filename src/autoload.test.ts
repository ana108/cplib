import * as sinon from 'sinon';
import { e2eProcess, loadPDF, pageHeaders } from './autoload';
import 'mocha';
import { RateTables, RatesPages, extractPages } from './autoload';
import * as chai from 'chai';
const expect = chai.expect;
const YEAR = new Date().getFullYear();

describe('Extract rate tables', () => {
    let allRateTables: RateTables[];
    let rateTables: RateTables;
    before(async () => {
        allRateTables = await e2eProcess('2021');
        rateTables = allRateTables[0];
    });
    afterEach(() => {
    });
    it('Execute autoload - regular - canada', async () => {
        // also check the length of first and last row
        expect(rateTables['PriorityCanada1'][0].split(' ').length).to.equal(23);
        expect(rateTables['PriorityCanada1'].length).to.equal(62);
        expect(rateTables['PriorityCanada1'][rateTables['PriorityCanada1'].length - 1].split(' ').length).to.equal(23);

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
    });

    it('Execute autoload - regular - non-canada', async () => {
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

    it('Execute autoload - small business - canada', async () => {
        const rateTables = allRateTables[1];
        // also check the length of first and last row
        expect(rateTables['PriorityCanada1'][0].split(' ').length).to.equal(23);
        expect(rateTables['PriorityCanada1'].length).to.equal(62);
        expect(rateTables['PriorityCanada1'][rateTables['PriorityCanada1'].length - 1].split(' ').length).to.equal(23);

        expect(rateTables['PriorityCanada2'][0].split(' ').length).to.equal(20);
        expect(rateTables['PriorityCanada2'].length).to.equal(62);
        expect(rateTables['PriorityCanada2'][rateTables['PriorityCanada2'].length - 1].split(' ').length).to.equal(20);

        expect(rateTables['ExpressCanada1'][0].split(' ').length).to.equal(23);
        expect(rateTables['ExpressCanada1'].length).to.equal(62);
        expect(rateTables['ExpressCanada1'][rateTables['ExpressCanada1'].length - 1].split(' ').length).to.equal(23);

        expect(rateTables['ExpressCanada2'][0].split(' ').length).to.equal(22);
        expect(rateTables['ExpressCanada2'].length).to.equal(62);
        expect(rateTables['ExpressCanada2'][rateTables['ExpressCanada2'].length - 1].split(' ').length).to.equal(22);

        expect(rateTables['ExpeditedCanada1'][0].split(' ').length).to.equal(23);
        expect(rateTables['ExpeditedCanada1'].length).to.equal(62);
        expect(rateTables['ExpeditedCanada1'][rateTables['ExpressCanada2'].length - 1].split(' ').length).to.equal(23);

        expect(rateTables['ExpeditedCanada2'][0].split(' ').length).to.equal(22);
        expect(rateTables['ExpeditedCanada2'].length).to.equal(62);
        expect(rateTables['ExpeditedCanada2'][rateTables['ExpressCanada2'].length - 1].split(' ').length).to.equal(22);

        expect(rateTables['RegularCanada1'][0].split(' ').length).to.equal(23);
        expect(rateTables['RegularCanada1'].length).to.equal(62);
        expect(rateTables['RegularCanada1'][rateTables['RegularCanada1'].length - 1].split(' ').length).to.equal(23);

        expect(rateTables['RegularCanada2'][0].split(' ').length).to.equal(22);
        expect(rateTables['RegularCanada2'].length).to.equal(62);
        expect(rateTables['RegularCanada2'][rateTables['RegularCanada2'].length - 1].split(' ').length).to.equal(22);

        expect(rateTables['PriorityWorldwide'][0].split(' ').length).to.equal(8);
        expect(rateTables['PriorityWorldwide'].length).to.equal(63);
        expect(rateTables['PriorityWorldwide'][rateTables['PriorityWorldwide'].length - 2].split(' ').length).to.equal(7);
    });
});

describe('Extract rate tables - 2020 - int', () => {
    let pageData: any;
    let pageDataSmallBusiness: any;
    before(async () => {
        pageData = await loadPDF(__dirname + "/resources/regular/2020/Rates_2020.pdf");
        pageDataSmallBusiness = await loadPDF(__dirname + "/resources/small_business/2020/SBprices-e-2020.pdf");
    });
    afterEach(() => {
    });
    it('Test Page number extraction - 2020 - Canada', async () => {
        let ratesPages: RatesPages = pageHeaders(pageData);
        expect(ratesPages['PriorityCanada']).to.equal(10);
        expect(ratesPages['ExpressCanada']).to.equal(12);
        expect(ratesPages['RegularCanada']).to.equal(14);
    });

    it('Test Page number extraction - 2020 -Small Business -  Canada', async () => {
        let ratesPages: RatesPages = pageHeaders(pageDataSmallBusiness);
        expect(ratesPages['PriorityCanada']).to.equal(12);
        expect(ratesPages['ExpressCanada']).to.equal(14);
        expect(ratesPages['RegularCanada']).to.equal(18);
        expect(ratesPages['ExpeditedCanada']).to.equal(16);
    });

    it('Test Page number extraction - 2020 - USA', () => {
        let ratesPages: RatesPages = pageHeaders(pageData);
        expect(ratesPages['ExpressUSA']).to.equal(20);
        expect(ratesPages['ExpeditedUSA']).to.equal(22);
        expect(ratesPages['TrackedPacketUSA']).to.equal(24);
        expect(ratesPages['SmallPacketUSA']).to.equal(25);
    });

    it('Test Page number extraction - 2020 - International', async () => {
        let ratesPages: RatesPages = pageHeaders(pageData);
        expect(ratesPages['ExpressInternational']).to.equal(31);
        expect(ratesPages['AirInternational']).to.equal(33);
        expect(ratesPages['SurfaceInternational']).to.equal(35);
        expect(ratesPages['TrackedPacketInternational']).to.equal(37);
        expect(ratesPages['SmallPacketInternational']).to.equal(39);
    });
})