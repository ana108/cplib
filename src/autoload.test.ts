import * as sinon from 'sinon';
import * as db from './db/sqlite3';
import { e2eProcess, loadPDF, pageHeaders, extractRateTables, REGULAR, SMALL_BUSINESS, convertPacketToTable, isAllNum } from './autoload';
import 'mocha';
import { RateTables, RatesPages, extractPriorityWorldwide } from './autoload';
import * as chai from 'chai';
const expect = chai.expect;
const YEAR = new Date().getFullYear();

describe('Extract rate tables', () => {
    let regularRateTables: RateTables;
    let smallBusinessRateTables: RateTables;
    before(async () => {
        try {
            await db.setDB(__dirname + "/integration/cplib_int.db");
            await db.deleteRatesByYear(YEAR);
            regularRateTables = await e2eProcess(YEAR, REGULAR);
            smallBusinessRateTables = await e2eProcess(YEAR, SMALL_BUSINESS);
        } catch (e) {
            console.log('Error in execute ', e);
        }
    });
    after(async () => {
        await db.resetDB();
    });
    it('Execute autoload - regular - PriorityCanada1', async () => {
        expect(regularRateTables['PriorityCanada1'][0].split(' ').length).to.equal(23);
        expect(regularRateTables['PriorityCanada1'][0].split(' ')[0]).to.equal('A1');
        expect(regularRateTables['PriorityCanada1'][regularRateTables['PriorityCanada1'].length - 2].split(' ')[0]).to.equal('30.0');
        expect(regularRateTables['PriorityCanada1'][regularRateTables['PriorityCanada1'].length - 1].split(' ').length).to.equal(23);
    });

    it('Execute autoload - regular - ExpressCanada1', async () => {
        expect(regularRateTables['ExpressCanada1'][0].split(' ').length).to.equal(23);
        expect(regularRateTables['ExpressCanada1'].length).to.equal(63);
        expect(regularRateTables['ExpressCanada1'][regularRateTables['ExpressCanada1'].length - 1].split(' ').length).to.equal(23);
    });

    it('Execute autoload - regular - ExpressCanada2', async () => {
        expect(regularRateTables['ExpressCanada2'][0].split(' ').length).to.equal(22);
        expect(regularRateTables['ExpressCanada2'].length).to.equal(63);
        expect(regularRateTables['ExpressCanada2'][regularRateTables['ExpressCanada2'].length - 1].split(' ').length).to.equal(22);
    });

    it('Execute autoload - regular - RegularCanada1', async () => {
        expect(regularRateTables['RegularCanada1'][0].split(' ').length).to.equal(23);
        expect(regularRateTables['RegularCanada1'].length).to.equal(63);
        expect(regularRateTables['RegularCanada1'][regularRateTables['RegularCanada1'].length - 1].split(' ').length).to.equal(23);
    });

    it('Execute autoload - regular - RegularCanada2', async () => {
        expect(regularRateTables['RegularCanada2'][0].split(' ').length).to.equal(22);
        expect(regularRateTables['RegularCanada2'].length).to.equal(63);
        expect(regularRateTables['RegularCanada2'][regularRateTables['RegularCanada2'].length - 1].split(' ').length).to.equal(22);
    });

    it('Execute autoload - regular - PriorityCanada2', async () => {
        expect(regularRateTables['PriorityCanada2'][0].split(' ').length).to.equal(20);
        expect(regularRateTables['PriorityCanada2'].length).to.equal(63);
        expect(regularRateTables['PriorityCanada2'][regularRateTables['PriorityCanada2'].length - 1].split(' ').length).to.equal(20);
    });

    it('Execute autoload - regular - PriorityWorldwide', async () => {
        expect(regularRateTables['PriorityWorldwide'][0].split(' ').length).to.equal(7);
        expect(regularRateTables['PriorityWorldwide'].length).to.equal(60);
        expect(regularRateTables['PriorityWorldwide'][regularRateTables['PriorityWorldwide'].length - 2].split(' ').length).to.equal(9);
    });

    it('Execute autoload - regular - ExpressUSA', async () => {
        expect(regularRateTables['ExpressUSA'][0].split(' ').length).to.equal(7);
        expect(regularRateTables['ExpressUSA'].length).to.equal(62);
        expect(regularRateTables['ExpressUSA'][regularRateTables['ExpressUSA'].length - 2].split(' ').length).to.equal(9);
    });

    it('Execute autoload - regular - ExpressUSA', async () => {
        expect(regularRateTables['ExpeditedUSA'][0].split(' ').length).to.equal(7);
        expect(regularRateTables['ExpeditedUSA'].length).to.equal(62);
        expect(regularRateTables['ExpeditedUSA'][regularRateTables['ExpeditedUSA'].length - 2].split(' ').length).to.equal(9);
    });

    it('Execute autoload - regular - ExpeditedUSA', async () => {
        expect(regularRateTables['ExpeditedUSA'][0].split(' ').length).to.equal(7);
        expect(regularRateTables['ExpeditedUSA'].length).to.equal(62);
        expect(regularRateTables['ExpeditedUSA'][regularRateTables['ExpeditedUSA'].length - 2].split(' ').length).to.equal(9);
    });

    it('Execute autoload - regular - TrackedPacketUSA', async () => {
        expect(regularRateTables['TrackedPacketUSA'][0].split(' ').length).to.equal(7);
        expect(regularRateTables['TrackedPacketUSA'].length).to.equal(7);
        expect(regularRateTables['TrackedPacketUSA'][regularRateTables['TrackedPacketUSA'].length - 1].split(' ').length).to.equal(9);
    });

    it('Execute autoload - regular - SmallPacketUSA', async () => {
        expect(regularRateTables['SmallPacketUSA'][0].split(' ').length).to.equal(7);
        expect(regularRateTables['SmallPacketUSA'].length).to.equal(7);
        expect(regularRateTables['SmallPacketUSA'][regularRateTables['SmallPacketUSA'].length - 1].split(' ').length).to.equal(9);
    });

    it('Execute autoload - regular - ExpressInternational', async () => {
        expect(regularRateTables['ExpressInternational'][0].split(' ').length).to.equal(10);
        expect(regularRateTables['ExpressInternational'].length).to.equal(62);
        expect(regularRateTables['ExpressInternational'][regularRateTables['ExpressInternational'].length - 1].split(' ').length).to.equal(10);
    });

    it('Execute autoload - regular - AirInternational', async () => {
        expect(regularRateTables['AirInternational'][0].split(' ').length).to.equal(10);
        expect(regularRateTables['AirInternational'].length).to.equal(62);
        expect(regularRateTables['AirInternational'][regularRateTables['AirInternational'].length - 1].split(' ').length).to.equal(10);
    });

    it('Execute autoload - regular - SurfaceInternational', async () => {
        expect(regularRateTables['SurfaceInternational'][0].split(' ').length).to.equal(10);
        expect(regularRateTables['SurfaceInternational'].length).to.equal(62);
        expect(regularRateTables['SurfaceInternational'][regularRateTables['SurfaceInternational'].length - 1].split(' ').length).to.equal(10);
    });

    it('Execute autoload - regular - TrackedPacketInternational', async () => {
        expect(regularRateTables['TrackedPacketInternational'][0].split(' ').length).to.equal(10);
        expect(regularRateTables['TrackedPacketInternational'].length).to.equal(7);
        expect(regularRateTables['TrackedPacketInternational'][regularRateTables['TrackedPacketInternational'].length - 1].split(' ').length).to.equal(12);
    });

    it('Execute autoload - regular - SmallPacketSurfaceInternational', async () => {
        expect(regularRateTables['SmallPacketSurfaceInternational'].length).to.equal(6);
        expect(regularRateTables['SmallPacketSurfaceInternational'][0].split(' ').length).to.equal(10);
        expect(regularRateTables['SmallPacketSurfaceInternational'][regularRateTables['SmallPacketSurfaceInternational'].length - 1].split(' ').length).to.equal(12);
    });

    it('Execute autoload - regular - SmallPacketAirInternational', async () => {
        expect(regularRateTables['SmallPacketAirInternational'].length).to.equal(7);
        expect(regularRateTables['SmallPacketAirInternational'][0].split(' ').length).to.equal(10);
        expect(regularRateTables['SmallPacketAirInternational'][regularRateTables['SmallPacketAirInternational'].length - 1].split(' ').length).to.equal(12);

    });

    it('Execute autoload - small business - PriorityCanada1', async () => {
        const rateTables = smallBusinessRateTables;
        // also check the length of first and last row
        expect(rateTables['PriorityCanada1'][0].split(' ').length).to.equal(23);
        expect(rateTables['PriorityCanada1'].length).to.equal(62);
        expect(rateTables['PriorityCanada1'][rateTables['PriorityCanada1'].length - 1].split(' ').length).to.equal(23);
    });

    it('Execute autoload - small business - PriorityCanada2', async () => {
        expect(smallBusinessRateTables['PriorityCanada2'][0].split(' ').length).to.equal(20);
        expect(smallBusinessRateTables['PriorityCanada2'].length).to.equal(62);
        expect(smallBusinessRateTables['PriorityCanada2'][smallBusinessRateTables['PriorityCanada2'].length - 1].split(' ').length).to.equal(21);
    });

    it('Execute autoload - small business - ExpressCanada1', async () => {
        expect(smallBusinessRateTables['ExpressCanada1'][0].split(' ').length).to.equal(23);
        expect(smallBusinessRateTables['ExpressCanada1'].length).to.equal(62);
        expect(smallBusinessRateTables['ExpressCanada1'][smallBusinessRateTables['ExpressCanada1'].length - 1].split(' ').length).to.equal(23);
    });

    it('Execute autoload - small business - ExpressCanada2', async () => {
        expect(smallBusinessRateTables['ExpressCanada2'][0].split(' ').length).to.equal(22);
        expect(smallBusinessRateTables['ExpressCanada2'].length).to.equal(62);
        expect(smallBusinessRateTables['ExpressCanada2'][smallBusinessRateTables['ExpressCanada2'].length - 1].split(' ').length).to.equal(22);
    });

    it('Execute autoload - small business - ExpeditedCanada1', async () => {
        expect(smallBusinessRateTables['ExpeditedCanada1'][0].split(' ').length).to.equal(23);
        expect(smallBusinessRateTables['ExpeditedCanada1'].length).to.equal(62);
        expect(smallBusinessRateTables['ExpeditedCanada1'][smallBusinessRateTables['ExpressCanada2'].length - 1].split(' ').length).to.equal(24);
    });

    it('Execute autoload - small business - ExpeditedCanada2', async () => {
        expect(smallBusinessRateTables['ExpeditedCanada2'][0].split(' ').length).to.equal(22);
        expect(smallBusinessRateTables['ExpeditedCanada2'].length).to.equal(62);
        expect(smallBusinessRateTables['ExpeditedCanada2'][smallBusinessRateTables['ExpressCanada2'].length - 1].split(' ').length).to.equal(23);
    });

    it('Execute autoload - small business - RegularCanada1', async () => {
        expect(smallBusinessRateTables['RegularCanada1'][0].split(' ').length).to.equal(23);
        expect(smallBusinessRateTables['RegularCanada1'].length).to.equal(62);
        expect(smallBusinessRateTables['RegularCanada1'][smallBusinessRateTables['RegularCanada1'].length - 1].split(' ').length).to.equal(23);
    });

    it('Execute autoload - small business - RegularCanada2', async () => {
        expect(smallBusinessRateTables['RegularCanada2'][0].split(' ').length).to.equal(22);
        expect(smallBusinessRateTables['RegularCanada2'].length).to.equal(62);
        expect(smallBusinessRateTables['RegularCanada2'][smallBusinessRateTables['RegularCanada2'].length - 1].split(' ').length).to.equal(22);
    });

    it('Execute autoload - small business - PriorityWorldwide', async () => {
        expect(smallBusinessRateTables['PriorityWorldwide'][0].split(' ').length).to.equal(7);
        expect(smallBusinessRateTables['PriorityWorldwide'].length).to.equal(60);
        expect(smallBusinessRateTables['PriorityWorldwide'][smallBusinessRateTables['PriorityWorldwide'].length - 2].split(' ').length).to.equal(9);
    });
    it('Execute autoload - small business - worldwide small packet surface', async () => {
        expect(smallBusinessRateTables['SmallPacketSurfaceInternational'].length).to.equal(6);
        expect(smallBusinessRateTables['SmallPacketSurfaceInternational'][0].split(' ').length).to.equal(10);
        expect(smallBusinessRateTables['SmallPacketSurfaceInternational'][smallBusinessRateTables['SmallPacketSurfaceInternational'].length - 1].split(' ').length).to.equal(12);
    });

    it('Execute autoload - small business - worldwide small packet air', async () => {
        expect(smallBusinessRateTables['SmallPacketAirInternational'].length).to.equal(7);
        expect(smallBusinessRateTables['SmallPacketAirInternational'][0].split(' ').length).to.equal(10);
        expect(smallBusinessRateTables['SmallPacketAirInternational'][smallBusinessRateTables['SmallPacketAirInternational'].length - 1].split(' ').length).to.equal(12);
    });

    it('Execute autoload - small business - worldwide small packet air - check that all are numerical', async () => {
        expect(isAllNum(smallBusinessRateTables['SmallPacketAirInternational'][1].split(' '))).equal(true);
        expect(smallBusinessRateTables['SmallPacketAirInternational'].length).to.equal(7);
        expect(smallBusinessRateTables['SmallPacketAirInternational'][0].split(' ').length).to.equal(10);
        expect(smallBusinessRateTables['SmallPacketAirInternational'][smallBusinessRateTables['SmallPacketAirInternational'].length - 1].split(' ').length).to.equal(12);
    });

    it('Execute autoload - small business - USA tracked packet - check that all are numerical', async () => {
        expect(isAllNum(smallBusinessRateTables['TrackedPacketUSA'][1].split(' '))).equal(true);
        expect(smallBusinessRateTables['TrackedPacketUSA'].length).to.equal(5);
        expect(smallBusinessRateTables['TrackedPacketUSA'][0].split(' ').length).to.equal(7);
        expect(smallBusinessRateTables['TrackedPacketUSA'][smallBusinessRateTables['TrackedPacketUSA'].length - 1].split(' ').length).to.equal(9);
    });

    it('Execute autoload - small business - worldwide tracked packet - check that all are numerical', async () => {
        expect(isAllNum(smallBusinessRateTables['TrackedPacketInternational'][1].split(' '))).equal(true);
        expect(smallBusinessRateTables['TrackedPacketInternational'].length).to.equal(7);
        expect(smallBusinessRateTables['TrackedPacketInternational'][0].split(' ').length).to.equal(10);
        expect(smallBusinessRateTables['TrackedPacketInternational'][smallBusinessRateTables['TrackedPacketInternational'].length - 1].split(' ').length).to.equal(12);
    });

    it('Execute autoload - small business - USA small packet - check that all are numerical', async () => {
        expect(isAllNum(smallBusinessRateTables['SmallPacketUSA'][1].split(' '))).equal(true);
        expect(smallBusinessRateTables['SmallPacketUSA'].length).to.equal(5);
        expect(smallBusinessRateTables['SmallPacketUSA'][0].split(' ').length).to.equal(7);
        expect(smallBusinessRateTables['SmallPacketUSA'][smallBusinessRateTables['SmallPacketUSA'].length - 1].split(' ').length).to.equal(9);
    });
});

describe('Extract rate tables - 2020 - int', () => {
    let pageData: any;
    let pageDataSmallBusiness: any;
    before(async () => {
        await db.deleteRatesByYear(YEAR);
        pageData = await loadPDF(__dirname + "/resources/regular/2020/Rates_2020.pdf");
        pageDataSmallBusiness = await loadPDF(__dirname + "/resources/small_business/2020/Rates_2020.pdf");
    });
    it('Test Page number extraction - 2020 - Canada', async () => {
        const ratesPages: RatesPages = pageHeaders(pageData);
        expect(ratesPages['PriorityCanada']).to.equal(10);
        expect(ratesPages['ExpressCanada']).to.equal(12);
        expect(ratesPages['RegularCanada']).to.equal(14);
    });

    it('Test Page number extraction - 2020 -Small Business -  Canada', async () => {
        const ratesPages: RatesPages = pageHeaders(pageDataSmallBusiness);
        expect(ratesPages['PriorityCanada']).to.equal(12);
        expect(ratesPages['ExpressCanada']).to.equal(14);
        expect(ratesPages['RegularCanada']).to.equal(18);
        expect(ratesPages['ExpeditedCanada']).to.equal(16);
    });

    it('Test Page number extraction - 2020 - USA', () => {
        const ratesPages: RatesPages = pageHeaders(pageData);
        expect(ratesPages['ExpressUSA']).to.equal(20);
        expect(ratesPages['ExpeditedUSA']).to.equal(22);
        expect(ratesPages['TrackedPacketUSA']).to.equal(24);
        expect(ratesPages['SmallPacketUSA']).to.equal(25);
    });

    it('Test Page number extraction - 2020 - International', async () => {
        const ratesPages: RatesPages = pageHeaders(pageData);
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
        const canadaRegularRegular = `select count(*) as count from rates where year = ${YEAR} and country = 'Canada' and customer_type = 'regular' and type = 'regular'`;
        result = await db.executeCustomSQL(canadaRegularRegular);
        expect(result[0].count).to.equal(2790);

        const canadaRegularExpress = `select count(*) as count from rates where year = ${YEAR} and country = 'Canada' and customer_type = 'regular' and type = 'express'`;
        result = await db.executeCustomSQL(canadaRegularExpress);
        expect(result[0].count).to.equal(2790);

        const canadaRegularPriority = `select count(*) as count from rates where year = ${YEAR} and country = 'Canada' and customer_type = 'regular' and type = 'priority'`;
        result = await db.executeCustomSQL(canadaRegularPriority);
        expect(result[0].count).to.equal(2666);
    });
    it('Verify that the right number of rows was loaded for canada (small business) ', async () => {
        let result: any;
        const canadaSmallBusinessRegular = `select count(*) as count from rates where year = ${YEAR} and country = 'Canada' and customer_type = 'small_business' and type = 'regular'`;
        result = await db.executeCustomSQL(canadaSmallBusinessRegular);
        expect(result[0].count).to.equal(2745);

        const canadaSmallBusinessExpress = `select count(*) as count from rates where year = ${YEAR} and country = 'Canada' and customer_type = 'small_business' and type = 'express'`;
        result = await db.executeCustomSQL(canadaSmallBusinessExpress);
        expect(result[0].count).to.equal(2745);

        const canadaSmallBusinessPriority = `select count(*) as count from rates where year = ${YEAR} and country = 'Canada' and customer_type = 'small_business' and type = 'priority'`;
        result = await db.executeCustomSQL(canadaSmallBusinessPriority);
        expect(result[0].count).to.equal(2623);

        const canadaSmallBusinessExpedited = `select count(*) as count from rates where year = ${YEAR} and country = 'Canada' and customer_type = 'small_business' and type = 'expedited'`;
        result = await db.executeCustomSQL(canadaSmallBusinessExpedited);
        expect(result[0].count).to.equal(2745);
    });
    it('Verify that the right number of rows was loaded for USA (regular)', async () => {
        let result: any;
        const regularExpress = `select count(*) as count from rates where year = ${YEAR} and country = 'USA' and customer_type = 'regular' and type = 'express'`;
        result = await db.executeCustomSQL(regularExpress);
        expect(result[0].count).to.equal(427);

        const regularExpedited = `select count(*) as count from rates where year = ${YEAR} and country = 'USA' and customer_type = 'regular' and type = 'expedited'`;
        result = await db.executeCustomSQL(regularExpedited);
        expect(result[0].count).to.equal(427);
    });

    it('Verify that the right number of rows was loaded for USA (small business)', async () => {
        let result: any;
        const smallBusinessExpress = `select count(*) as count from rates where year = ${YEAR} and country = 'USA' and customer_type = 'small_business' and type = 'express'`;
        result = await db.executeCustomSQL(smallBusinessExpress);
        expect(result[0].count).to.equal(427);

        const smallBusinessExpedited = `select count(*) as count from rates where year = ${YEAR} and country = 'USA' and customer_type = 'small_business' and type = 'expedited'`;
        result = await db.executeCustomSQL(smallBusinessExpedited);
        expect(result[0].count).to.equal(427);
    });

    it('Verify that the right number of rows was loaded for International', async () => {
        let result: any;

        const regularPriority = `select count(*) as count from rates where year = 2021 and country = 'INTERNATIONAL' and customer_type = 'regular' and type = 'priority'`;
        result = await db.executeCustomSQL(regularPriority);
        expect(result[0].count).to.equal(413);

        const regularExpress = `select count(*) as count from rates where year = 2021 and country = 'INTERNATIONAL' and customer_type = 'regular' and type = 'express'`;
        result = await db.executeCustomSQL(regularExpress);
        expect(result[0].count).to.equal(610);

        const regularSurface = `select count(*) as count from rates where year = 2021 and country = 'INTERNATIONAL' and customer_type = 'regular' and type = 'surface'`;
        result = await db.executeCustomSQL(regularSurface);
        expect(result[0].count).to.equal(610);

        const regularAir = `select count(*) as count from rates where year = 2021 and country = 'INTERNATIONAL' and customer_type = 'regular' and type = 'air'`;
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
        const pageNumbers: RatesPages = pageHeaders(pageData);
        priorityWorldwideNumber = pageNumbers['PriorityWorldwide'];

        pageDataSmallBusiness = await loadPDF(__dirname + "/resources/small_business/2020/Rates_2020.pdf");
        const pageNumbersSB: RatesPages = pageHeaders(pageDataSmallBusiness);
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
        const priorityWorldwideTableOldMethod = extractRateTables(pageData, priorityWorldwideNumber, 7, 9);
        const priorityWorldwideTable = extractPriorityWorldwide(pageData, priorityWorldwideNumber);
        expect(priorityWorldwideTable.length).to.be.above(53);
        expect(priorityWorldwideTable.length).to.be.below(priorityWorldwideTableOldMethod.length);
    });
    it('Extract envelope and pak tables at the bottom of the page (small business)', async () => {
        const priorityWorldwideTableOldMethod = extractRateTables(pageDataSmallBusiness, priorityWorldwideNumberSB, 7, 9);
        const priorityWorldwideTable = extractPriorityWorldwide(pageDataSmallBusiness, priorityWorldwideNumberSB);
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
        expect(regularRateTables['TrackedPacketInternational'][0]).to.equal('1 2 3 4 5 6 7 8 9 10');
        const lastElement: number = regularRateTables['TrackedPacketInternational'].length - 1;
        const numElements: number = regularRateTables['TrackedPacketInternational'][0].split(' ').length + 1;
        expect(regularRateTables['TrackedPacketInternational'][lastElement].split(' ').length).to.equal(numElements + 1);
    });
    it('Verify International Small Packet (air) tables get converted in the standard format', async () => {
        expect(regularRateTables['SmallPacketAirInternational'][0]).to.equal('1 2 3 4 5 6 7 8 9 10');

        expect(regularRateTables['SmallPacketAirInternational'][1].split(' ')[0]).to.equal('0.1');
        const lastIndex = regularRateTables['SmallPacketAirInternational'].length - 1;
        expect(parseInt(regularRateTables['SmallPacketAirInternational'][lastIndex].split(' ')[0])).to.equal(2);
    });
    it('Verify International Small Packet (surface) tables get converted in the standard format', async () => {
        // let regularRateTables = await e2eProcess(YEAR, REGULAR);
        expect(regularRateTables['SmallPacketSurfaceInternational'][0]).to.equal('1 2 3 4 5 6 7 8 9 10');
        expect(regularRateTables['SmallPacketSurfaceInternational'][1].split(' ')[0]).to.equal('0.25');
        const lastIndex = regularRateTables['SmallPacketSurfaceInternational'].length - 1;
        expect(parseInt(regularRateTables['SmallPacketSurfaceInternational'][lastIndex].split(' ')[0])).to.equal(2);
    });
});

describe.skip('Temp Test', () => {
    it('Debugging - convert packet to test', async () => {
        const pageArray = [
            'TrackedPacket USA',
            '(UPTOANDINCLUDING) WEIGHT',
            'INKG INLB',
            '0.1 0.2',
            '0.25 0.5',
            '0.5 1.1',
            '1.0 2.2',
            '1.5 3.3',
            '2.0 4.4'
        ];
        const rateCodes = [
            '1', '2', '3',
            '4', '5', '6',
            '7'
        ];
        const results = convertPacketToTable(pageArray, rateCodes);
        console.log('Results: ', results);
        expect(true).to.equal(true);
    });
});