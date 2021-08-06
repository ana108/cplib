import * as sinon from 'sinon';
import * as db from './db/sqlite3';
import { e2eProcess, loadPDF, pageHeaders, extractRateTables, cleanExtraLines } from './autoload';
import 'mocha';
import { RateTables, RatesPages, saveTableEntries, extractPriorityWorldwide, convertPacketToTable } from './autoload';
import * as chai from 'chai';
const expect = chai.expect;
const YEAR = new Date().getFullYear();

describe('Extract rate tables', () => {
    let allRateTables: RateTables[];
    let rateTables: RateTables;
    before(async () => {
        allRateTables = await e2eProcess(2021);
        rateTables = allRateTables[0];
    });
    afterEach(() => {
    });
    it('Execute autoload - regular', async () => {
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
        expect(rateTables['PriorityWorldwide'].length).to.equal(61);
        expect(rateTables['PriorityWorldwide'][rateTables['PriorityWorldwide'].length - 2].split(' ').length).to.equal(7);
    });

    it('Execute autoload - regular - non-canada', async () => {
        expect(rateTables['PriorityWorldwide'][0].split(' ').length).to.equal(8);
        expect(rateTables['PriorityWorldwide'].length).to.equal(61);
        expect(rateTables['PriorityWorldwide'][rateTables['PriorityWorldwide'].length - 2].split(' ').length).to.equal(7);

        expect(rateTables['ExpressUSA'][0].split(' ').length).to.equal(7);
        expect(rateTables['ExpressUSA'].length).to.equal(63);
        expect(rateTables['ExpressUSA'][rateTables['ExpressUSA'].length - 2].split(' ').length).to.equal(7);

        expect(rateTables['ExpeditedUSA'][0].split(' ').length).to.equal(7);
        expect(rateTables['ExpeditedUSA'].length).to.equal(63);
        expect(rateTables['ExpeditedUSA'][rateTables['ExpeditedUSA'].length - 2].split(' ').length).to.equal(7);

        expect(rateTables['TrackedPacketUSA'][0].split(' ').length).to.equal(7);
        expect(rateTables['TrackedPacketUSA'].length).to.equal(7);
        expect(rateTables['TrackedPacketUSA'][rateTables['TrackedPacketUSA'].length - 1].split(' ').length).to.equal(8);

        expect(rateTables['SmallPacketUSA'][0].split(' ').length).to.equal(7);
        expect(rateTables['SmallPacketUSA'].length).to.equal(7);
        expect(rateTables['SmallPacketUSA'][rateTables['SmallPacketUSA'].length - 1].split(' ').length).to.equal(8);

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

        expect(rateTables['SmallPacketSurfaceInternational'].length).to.equal(6);
        expect(rateTables['SmallPacketSurfaceInternational'][0].split(' ').length).to.equal(10);
        expect(rateTables['SmallPacketSurfaceInternational'][rateTables['SmallPacketSurfaceInternational'].length - 1].split(' ').length).to.equal(11);

        expect(rateTables['SmallPacketAirInternational'].length).to.equal(7);
        expect(rateTables['SmallPacketAirInternational'][0].split(' ').length).to.equal(10);
        expect(rateTables['SmallPacketAirInternational'][rateTables['SmallPacketAirInternational'].length - 1].split(' ').length).to.equal(11);

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
        expect(rateTables['PriorityWorldwide'].length).to.equal(61);
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

describe('Load data into rates table for the year', async () => {
    let allRateTables: RateTables[];
    before(async () => {
        db.setDB(__dirname + "/resources/cplib_autoload.db");
        allRateTables = await e2eProcess(YEAR);
    });
    after(async () => {
        let numDeleted = await db.deleteRatesByYear(2021);
        console.log('Deleted ', numDeleted);
        db.resetDB();
    });

    it('Verify that the right number of rows was loaded for canada (regular) ', async () => {
        let result: any;
        let canadaRegularRegular = `select count(*) as count from rates where year = 2021 and country = 'Canada' and customer_type = 'regular' and type = 'regular'`;
        result = await db.executeCustomSQL(canadaRegularRegular);
        expect(result[0].count).to.equal(2745);

        let canadaRegularExpress = `select count(*) as count from rates where year = 2021 and country = 'Canada' and customer_type = 'regular' and type = 'express'`;
        result = await db.executeCustomSQL(canadaRegularExpress);
        expect(result[0].count).to.equal(2745);

        let canadaRegularPriority = `select count(*) as count from rates where year = 2021 and country = 'Canada' and customer_type = 'regular' and type = 'priority'`;
        result = await db.executeCustomSQL(canadaRegularPriority);
        expect(result[0].count).to.equal(2623);
    });
    it('Verify that the right number of rows was loaded for canada (small business) ', async () => {
        let result: any;
        let canadaSmallBusinessRegular = `select count(*) as count from rates where year = 2021 and country = 'Canada' and customer_type = 'small_business' and type = 'regular'`;
        result = await db.executeCustomSQL(canadaSmallBusinessRegular);
        expect(result[0].count).to.equal(2745);

        let canadaSmallBusinessExpress = `select count(*) as count from rates where year = 2021 and country = 'Canada' and customer_type = 'small_business' and type = 'express'`;
        result = await db.executeCustomSQL(canadaSmallBusinessExpress);
        expect(result[0].count).to.equal(2745);

        let canadaSmallBusinessPriority = `select count(*) as count from rates where year = 2021 and country = 'Canada' and customer_type = 'small_business' and type = 'priority'`;
        result = await db.executeCustomSQL(canadaSmallBusinessPriority);
        expect(result[0].count).to.equal(2623);

        let canadaSmallBusinessExpedited = `select count(*) as count from rates where year = 2021 and country = 'Canada' and customer_type = 'small_business' and type = 'expedited'`;
        result = await db.executeCustomSQL(canadaSmallBusinessExpedited);
        expect(result[0].count).to.equal(2745);
    });
    it('Verify that the right number of rows was loaded for USA (regular)', async () => {
        let result: any;
        let regularExpress = `select count(*) as count from rates where year = 2021 and country = 'USA' and customer_type = 'regular' and type = 'express'`;
        result = await db.executeCustomSQL(regularExpress);
        expect(result[0].count).to.equal(427);

        let regularExpedited = `select count(*) as count from rates where year = 2021 and country = 'USA' and customer_type = 'regular' and type = 'expedited'`;
        result = await db.executeCustomSQL(regularExpedited);
        expect(result[0].count).to.equal(427);
    });

    it('Verify that the right number of rows was loaded for USA (small business)', async () => {
        let result: any;
        let smallBusinessExpress = `select count(*) as count from rates where year = 2021 and country = 'USA' and customer_type = 'small_business' and type = 'express'`;
        result = await db.executeCustomSQL(smallBusinessExpress);
        expect(result[0].count).to.equal(427);

        let smallBusinessExpedited = `select count(*) as count from rates where year = 2021 and country = 'USA' and customer_type = 'small_business' and type = 'expedited'`;
        result = await db.executeCustomSQL(smallBusinessExpedited);
        expect(result[0].count).to.equal(427);
    });

    it('Verify that the right number of rows was loaded for International', async () => {
        let result: any;

        let regularPriority = `select count(*) as count from rates where year = 2021 and country = 'INTERNATIONAL' and customer_type = 'regular' and type = 'priority'`;
        result = await db.executeCustomSQL(regularPriority);
        expect(result[0].count).to.equal(413);

        let regularExpress = `select count(*) as count from rates where year = 2021 and country = 'INTERNATIONAL' and customer_type = 'regular' and type = 'express'`;
        result = await db.executeCustomSQL(regularExpress);
        expect(result[0].count).to.equal(610);

        let regularSurface = `select count(*) as count from rates where year = 2021 and country = 'INTERNATIONAL' and customer_type = 'regular' and type = 'surface'`;
        result = await db.executeCustomSQL(regularSurface);
        expect(result[0].count).to.equal(610);

        let regularAir = `select count(*) as count from rates where year = 2021 and country = 'INTERNATIONAL' and customer_type = 'regular' and type = 'air'`;
        result = await db.executeCustomSQL(regularAir);
        expect(result[0].count).to.equal(610);

        // TODO small business
    });

});

describe('Extract worldwide priority table', () => {
    let pageData: any;
    let pageDataSmallBusiness: any;
    let priorityWorldwideNumber: any;
    let priorityWorldwideNumberSB: any;
    before(async () => {
        pageData = await loadPDF(__dirname + "/resources/regular/2020/Rates_2020.pdf");
        let pageNumbers: RatesPages = pageHeaders(pageData);
        priorityWorldwideNumber = pageNumbers['PriorityWorldwide'];

        pageDataSmallBusiness = await loadPDF(__dirname + "/resources/small_business/2020/SBprices-e-2020.pdf");
        let pageNumbersSB: RatesPages = pageHeaders(pageDataSmallBusiness);
        priorityWorldwideNumberSB = pageNumbersSB['PriorityWorldwide'];
    });
    afterEach(() => {
    });
    it('Extract envelope and pak tables at the bottom of the page', async () => {
        let priorityWorldwideTableOldMethod = extractRateTables(pageData, priorityWorldwideNumber, 7, 9);
        let priorityWorldwideTable = extractPriorityWorldwide(pageData, priorityWorldwideNumber);
        expect(priorityWorldwideTable.length).to.be.above(53);
        expect(priorityWorldwideTable.length).to.be.below(priorityWorldwideTableOldMethod.length);
    });
    it('Extract envelope and pak tables at the bottom of the page (small business)', async () => {
        let priorityWorldwideTableOldMethod = extractRateTables(pageDataSmallBusiness, priorityWorldwideNumberSB, 7, 9);
        let priorityWorldwideTable = extractPriorityWorldwide(pageDataSmallBusiness, priorityWorldwideNumberSB);
        expect(priorityWorldwideTable.length).to.be.above(53);
        expect(priorityWorldwideTable.length).to.be.below(priorityWorldwideTableOldMethod.length);
    });
    it('Verify USA Packet tables get converted in the standard format', async () => {
        let allRateTables = await e2eProcess(YEAR);
        // they are all the same because the rate code gets retrieved from non packet usa page
        // reason for this is packet rates are the same for all codes.
        // by duplicating the price across all rate codes, it standardizes it so that
        // packets can be treated the same as regular packages
        expect(allRateTables[0]['TrackedPacketUSA'][0]).to.equal('1 2 3 4 5 6 7');
        let lastElement: number = allRateTables[0]['TrackedPacketUSA'].length - 1;
        let numElements: number = allRateTables[0]['TrackedPacketUSA'][0].split(' ').length + 1;
        expect(allRateTables[0]['TrackedPacketUSA'][lastElement].split(' ').length).to.equal(numElements);

        expect(allRateTables[0]['SmallPacketUSA'][0]).to.equal('1 2 3 4 5 6 7');
        // verify that last line has correct number of elements
        lastElement = allRateTables[0]['SmallPacketUSA'].length - 1;
        numElements = allRateTables[0]['SmallPacketUSA'][0].split(' ').length + 1;
        expect(allRateTables[0]['SmallPacketUSA'][lastElement].split(' ').length).to.equal(numElements);
    });
    it('Verify International Tracked Packet tables get converted in the standard format', async () => {
        let allRateTables = await e2eProcess(YEAR);
        expect(allRateTables[0]['TrackedPacketInternational'][0]).to.equal('401 402 403 404 405 406 407 408 409 410');
        let lastElement: number = allRateTables[0]['TrackedPacketInternational'].length - 1;
        let numElements: number = allRateTables[0]['TrackedPacketInternational'][0].split(' ').length + 1;
        expect(allRateTables[0]['TrackedPacketInternational'][lastElement].split(' ').length).to.equal(numElements);
    });
    it('Verify International Small Packet (air) tables get converted in the standard format', async () => {
        let allRateTables = await e2eProcess(YEAR);
        expect(allRateTables[0]['SmallPacketAirInternational'][0]).to.equal('1 2 3 4 5 6 7 8 9 10');

        expect(allRateTables[0]['SmallPacketAirInternational'][1].split(' ')[0]).to.equal('0.1');
        let lastIndex = allRateTables[0]['SmallPacketAirInternational'].length - 1;
        expect(allRateTables[0]['SmallPacketAirInternational'][lastIndex].split(' ')[0]).to.equal('2');
    });
    it('Verify International Small Packet (surface) tables get converted in the standard format', async () => {
        let allRateTables = await e2eProcess(YEAR);
        expect(allRateTables[0]['SmallPacketSurfaceInternational'][0]).to.equal('1 2 3 4 5 6 7 8 9 10');
        expect(allRateTables[0]['SmallPacketSurfaceInternational'][1].split(' ')[0]).to.equal('0.25');
        let lastIndex = allRateTables[0]['SmallPacketSurfaceInternational'].length - 1;
        expect(allRateTables[0]['SmallPacketSurfaceInternational'][lastIndex].split(' ')[0]).to.equal('2');
    });
});