import * as sinon from 'sinon';
import * as db from './db/sqlite3';
import { e2eProcess, loadPDF, pageHeaders, extractRateTables, REGULAR, SMALL_BUSINESS } from './autoload';
import 'mocha';
import { RateTables, RatesPages, extractPriorityWorldwide } from './autoload';
import * as chai from 'chai';
const expect = chai.expect;
const YEAR = new Date().getFullYear();

describe('Extract rate tables', () => {
    let regularRateTables: RateTables;
    let smallBusinessRateTables: RateTables;
    before(async () => {
        await db.setDB(__dirname + "/integration/cplib_int.db");
        await db.deleteRatesByYear(YEAR);
        regularRateTables = await e2eProcess(YEAR, REGULAR);
        smallBusinessRateTables = await e2eProcess(YEAR, SMALL_BUSINESS);
    });
    after(async () => {
        await db.resetDB();
    });
    it('Execute autoload - regular', async () => {
        // also check the length of first and last row
        expect(regularRateTables['PriorityCanada1'][0].split(' ').length).to.equal(23);
        expect(regularRateTables['PriorityCanada1'].length).to.equal(62);
        expect(regularRateTables['PriorityCanada1'][regularRateTables['PriorityCanada1'].length - 1].split(' ').length).to.equal(23);

        expect(regularRateTables['PriorityCanada2'][0].split(' ').length).to.equal(20);
        expect(regularRateTables['PriorityCanada2'].length).to.equal(62);
        expect(regularRateTables['PriorityCanada2'][regularRateTables['PriorityCanada2'].length - 1].split(' ').length).to.equal(20);

        expect(regularRateTables['ExpressCanada1'][0].split(' ').length).to.equal(23);
        expect(regularRateTables['ExpressCanada1'].length).to.equal(62);
        expect(regularRateTables['ExpressCanada1'][regularRateTables['ExpressCanada1'].length - 1].split(' ').length).to.equal(23);

        expect(regularRateTables['ExpressCanada2'][0].split(' ').length).to.equal(22);
        expect(regularRateTables['ExpressCanada2'].length).to.equal(62);
        expect(regularRateTables['ExpressCanada2'][regularRateTables['ExpressCanada2'].length - 1].split(' ').length).to.equal(22);

        expect(regularRateTables['RegularCanada1'][0].split(' ').length).to.equal(23);
        expect(regularRateTables['RegularCanada1'].length).to.equal(62);
        expect(regularRateTables['RegularCanada1'][regularRateTables['RegularCanada1'].length - 1].split(' ').length).to.equal(23);

        expect(regularRateTables['RegularCanada2'][0].split(' ').length).to.equal(22);
        expect(regularRateTables['RegularCanada2'].length).to.equal(62);
        expect(regularRateTables['RegularCanada2'][regularRateTables['RegularCanada2'].length - 1].split(' ').length).to.equal(22);

        expect(regularRateTables['PriorityWorldwide'][0].split(' ').length).to.equal(7);
        expect(regularRateTables['PriorityWorldwide'].length).to.equal(60);
        expect(regularRateTables['PriorityWorldwide'][regularRateTables['PriorityWorldwide'].length - 2].split(' ').length).to.equal(9);
    });

    it('Execute autoload - regular - non-canada', async () => {
        expect(regularRateTables['PriorityWorldwide'][0].split(' ').length).to.equal(7);
        expect(regularRateTables['PriorityWorldwide'].length).to.equal(60);
        expect(regularRateTables['PriorityWorldwide'][regularRateTables['PriorityWorldwide'].length - 2].split(' ').length).to.equal(9);

        expect(regularRateTables['ExpressUSA'][0].split(' ').length).to.equal(7);
        expect(regularRateTables['ExpressUSA'].length).to.equal(62);
        expect(regularRateTables['ExpressUSA'][regularRateTables['ExpressUSA'].length - 2].split(' ').length).to.equal(9);

        expect(regularRateTables['ExpeditedUSA'][0].split(' ').length).to.equal(7);
        expect(regularRateTables['ExpeditedUSA'].length).to.equal(62);
        expect(regularRateTables['ExpeditedUSA'][regularRateTables['ExpeditedUSA'].length - 2].split(' ').length).to.equal(9);

        expect(regularRateTables['TrackedPacketUSA'][0].split(' ').length).to.equal(7);
        expect(regularRateTables['TrackedPacketUSA'].length).to.equal(7);
        expect(regularRateTables['TrackedPacketUSA'][regularRateTables['TrackedPacketUSA'].length - 1].split(' ').length).to.equal(9);

        expect(regularRateTables['SmallPacketUSA'][0].split(' ').length).to.equal(7);
        expect(regularRateTables['SmallPacketUSA'].length).to.equal(7);
        expect(regularRateTables['SmallPacketUSA'][regularRateTables['SmallPacketUSA'].length - 1].split(' ').length).to.equal(9);

        expect(regularRateTables['ExpressInternational'][0].split(' ').length).to.equal(10);
        expect(regularRateTables['ExpressInternational'].length).to.equal(62);
        expect(regularRateTables['ExpressInternational'][regularRateTables['ExpressInternational'].length - 1].split(' ').length).to.equal(10);

        expect(regularRateTables['AirInternational'][0].split(' ').length).to.equal(10);
        expect(regularRateTables['AirInternational'].length).to.equal(62);
        expect(regularRateTables['AirInternational'][regularRateTables['AirInternational'].length - 1].split(' ').length).to.equal(10);

        expect(regularRateTables['SurfaceInternational'][0].split(' ').length).to.equal(10);
        expect(regularRateTables['SurfaceInternational'].length).to.equal(62);
        expect(regularRateTables['SurfaceInternational'][regularRateTables['SurfaceInternational'].length - 1].split(' ').length).to.equal(10);

        expect(regularRateTables['TrackedPacketInternational'][0].split(' ').length).to.equal(10);
        expect(regularRateTables['TrackedPacketInternational'].length).to.equal(7);
        expect(regularRateTables['TrackedPacketInternational'][regularRateTables['TrackedPacketInternational'].length - 1].split(' ').length).to.equal(12);

        expect(regularRateTables['SmallPacketSurfaceInternational'].length).to.equal(6);
        expect(regularRateTables['SmallPacketSurfaceInternational'][0].split(' ').length).to.equal(10);
        expect(regularRateTables['SmallPacketSurfaceInternational'][regularRateTables['SmallPacketSurfaceInternational'].length - 1].split(' ').length).to.equal(12);

        expect(regularRateTables['SmallPacketAirInternational'].length).to.equal(7);
        expect(regularRateTables['SmallPacketAirInternational'][0].split(' ').length).to.equal(10);
        expect(regularRateTables['SmallPacketAirInternational'][regularRateTables['SmallPacketAirInternational'].length - 1].split(' ').length).to.equal(12);

    });

    it('Execute autoload - small business - canada', async () => {
        const rateTables = smallBusinessRateTables;
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

        expect(rateTables['PriorityWorldwide'][0].split(' ').length).to.equal(7);
        expect(rateTables['PriorityWorldwide'].length).to.equal(60);
        expect(rateTables['PriorityWorldwide'][rateTables['PriorityWorldwide'].length - 2].split(' ').length).to.equal(9);
    });
});

describe('Extract rate tables - 2020 - int', () => {
    let pageData: any;
    let pageDataSmallBusiness: any;
    before(async () => {
        pageData = await loadPDF(__dirname + "/resources/regular/2020/Rates_2020.pdf");
        pageDataSmallBusiness = await loadPDF(__dirname + "/resources/small_business/2020/Rates_2020.pdf");
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
    before(async () => {
        await db.setDB(__dirname + "/integration/cplib_int.db");
    });
    after(async () => {
        await db.resetDB();
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
    let regularRateTables: RateTables;
    before(async () => {
        pageData = await loadPDF(__dirname + "/resources/regular/2020/Rates_2020.pdf");
        let pageNumbers: RatesPages = pageHeaders(pageData);
        priorityWorldwideNumber = pageNumbers['PriorityWorldwide'];

        pageDataSmallBusiness = await loadPDF(__dirname + "/resources/small_business/2020/Rates_2020.pdf");
        let pageNumbersSB: RatesPages = pageHeaders(pageDataSmallBusiness);
        priorityWorldwideNumberSB = pageNumbersSB['PriorityWorldwide'];
        await db.setDB(__dirname + "/integration/cplib_int.db");
        await db.deleteRatesByYear(2021);
        regularRateTables = await e2eProcess(YEAR, REGULAR);
        await e2eProcess(YEAR, SMALL_BUSINESS);
    });
    after(async () => {
        await db.resetDB();
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
        // they are all the same because the rate code gets retrieved from non packet usa page
        // reason for this is packet rates are the same for all codes.
        // by duplicating the price across all rate codes, it standardizes it so that
        // packets can be treated the same as regular packages
        expect(regularRateTables['TrackedPacketUSA'][0]).to.equal('1 2 3 4 5 6 7');
        let lastElement: number = regularRateTables['TrackedPacketUSA'].length - 1;
        let numElements: number = regularRateTables['TrackedPacketUSA'][0].split(' ').length + 1;
        expect(regularRateTables['TrackedPacketUSA'][lastElement].split(' ').length).to.equal(numElements + 1);

        expect(regularRateTables['SmallPacketUSA'][0]).to.equal('1 2 3 4 5 6 7');
        // verify that last line has correct number of elements
        lastElement = regularRateTables['SmallPacketUSA'].length - 1;
        numElements = regularRateTables['SmallPacketUSA'][0].split(' ').length + 1;
        expect(regularRateTables['SmallPacketUSA'][lastElement].split(' ').length).to.equal(numElements + 1);
    });
    it('Verify International Tracked Packet tables get converted in the standard format', async () => {
        // let regularRateTables = await e2eProcess(YEAR, REGULAR);
        expect(regularRateTables['TrackedPacketInternational'][0]).to.equal('401 402 403 404 405 406 407 408 409 410');
        let lastElement: number = regularRateTables['TrackedPacketInternational'].length - 1;
        let numElements: number = regularRateTables['TrackedPacketInternational'][0].split(' ').length + 1;
        expect(regularRateTables['TrackedPacketInternational'][lastElement].split(' ').length).to.equal(numElements + 1);
    });
    it('Verify International Small Packet (air) tables get converted in the standard format', async () => {
        // let regularRateTables = await e2eProcess(YEAR, REGULAR);
        expect(regularRateTables['SmallPacketAirInternational'][0]).to.equal('1 2 3 4 5 6 7 8 9 10');

        expect(regularRateTables['SmallPacketAirInternational'][1].split(' ')[0]).to.equal('0.1');
        let lastIndex = regularRateTables['SmallPacketAirInternational'].length - 1;
        expect(regularRateTables['SmallPacketAirInternational'][lastIndex].split(' ')[0]).to.equal('2');
    });
    it('Verify International Small Packet (surface) tables get converted in the standard format', async () => {
        // let regularRateTables = await e2eProcess(YEAR, REGULAR);
        expect(regularRateTables['SmallPacketSurfaceInternational'][0]).to.equal('1 2 3 4 5 6 7 8 9 10');
        expect(regularRateTables['SmallPacketSurfaceInternational'][1].split(' ')[0]).to.equal('0.25');
        let lastIndex = regularRateTables['SmallPacketSurfaceInternational'].length - 1;
        expect(regularRateTables['SmallPacketSurfaceInternational'][lastIndex].split(' ')[0]).to.equal('2');
    });
});