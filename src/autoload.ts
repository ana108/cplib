const axios = require('axios').default;
import { updateFuelSurcharge } from './db/sqlite3';
import { saveToDb } from './db/sqlite3';
const PDFParser = require("pdf2json");
export const REGULAR = 'regular';
export const SMALL_BUSINESS = 'small_business';
export interface FuelTable {
    'Domestic Services': number,
    'USA and International Parcel Services': number,
    'USA and International Packet Services': number,
    'Priority Worldwide': number,
    'Expiry_Date': Date
}
export const updateAllFuelSurcharges = async (): Promise<any> => {
    const newFuelTable = await getFuelSurchargeTable();
    if (!newFuelTable['Domestic Services'] || !newFuelTable['USA and International Parcel Services'] || !newFuelTable['USA and International Packet Services']
        || !newFuelTable['Priority Worldwide']) {
        return Promise.reject('Missing values returned from HTML. Please investigate ' + JSON.stringify(newFuelTable, null, 4));
    }
    if (!newFuelTable['Expiry_Date']) {
        const defaultExpiryDate = new Date();
        defaultExpiryDate.setDate(defaultExpiryDate.getDate() + 21);
        newFuelTable['Expiry_Date'] = defaultExpiryDate;
    }
    return updateFuelSurcharge(newFuelTable);
}
export const getFuelSurchargeTable = async (): Promise<FuelTable> => {
    return new Promise<any>((resolve, reject) => {
        axios.get('https://www.canadapost-postescanada.ca/cpc/en/support/kb/sending/rates-dimensions/fuel-surcharges-on-mail-and-parcels').
            then(data => {
                const fuelTable: FuelTable = extractFuelTable(data.data);
                resolve(fuelTable);
            }).catch(error => {
                reject(error);
            });
    });
}

export const extractFuelTable = (data: string): FuelTable => {
    const dt = JSON.stringify(data);
    const lines = dt.split('\\n');
    const r = 11;
    const st = 'The Fuel Surcharges are as follows:';
    const ed = 'How we calculate fuel surcharges';

    let start = 0;
    let end = 0;
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].indexOf(st) >= 0) {
            start = i;
        }
        if (lines[i].indexOf(ed) >= 0) {
            end = i;
        }
    }
    // first line: extract the end date
    const endDateRaw = lines[start + 1];
    const endDate = endDateRaw.replace(/&nbsp;/g, ' ').split('through')[1].replace('</h4>', '').replace(':', '');
    const validUntilDate = new Date(endDate);
    const serviceCharges: FuelTable = <FuelTable>{};
    for (let i = start + 2; i < end; i++) {
        lines[i] = lines[i].replace(/&nbsp;/g, '');
        if (lines[i].indexOf('<tr>') >= 0 && !serviceCharges['Priority Worldwide']) {
            const header = lines[i + 1].replace('</td>', '').replace('<td>', '').replace('<em>', '').replace('</em>', '').replace('<sup>TM</sup>', '');
            const value = parseFloat(lines[i + 2].replace(/&nbsp;/g, '').replace('</td>', '').replace('<td>', '').trimLeft().replace('%', ''));
            serviceCharges[header] = value;
        }
    }
    serviceCharges['Expiry_Date'] = validUntilDate;
    return serviceCharges;
}

export interface RatesPages {
    'PriorityCanada': number,
    'ExpressCanada': number,
    'ExpeditedCanada': number,
    'RegularCanada': number,
    'PriorityWorldwide': number,
    'ExpressUSA': number,
    'ExpeditedUSA': number,
    'TrackedPacketUSA': number,
    'SmallPacketUSA': number,
    'ExpressInternational': number,
    'AirInternational': number,
    'SurfaceInternational': number,
    'TrackedPacketInternational': number,
    'SmallPacketInternational': number
}
export interface RateTables {
    'PriorityCanada1': string[],
    'PriorityCanada2': string[],
    'ExpressCanada1': string[],
    'ExpressCanada2': string[],
    'ExpeditedCanada1': string[],
    'ExpeditedCanada2': string[],
    'RegularCanada1': string[],
    'RegularCanada2': string[],
    'PriorityWorldwide': string[],
    'ExpressUSA': string[],
    'ExpeditedUSA': string[],
    'TrackedPacketUSA': string[],
    'SmallPacketUSA': string[],
    'ExpressInternational': string[],
    'AirInternational': string[],
    'SurfaceInternational': string[],
    'TrackedPacketInternational': string[],
    'SmallPacketAirInternational': string[],
    'SmallPacketSurfaceInternational': string[],
}

// this will iterate over the two docs; one for small business and one for regular rates
export const e2eProcess = async (year: number, type: string): Promise<RateTables> => {
    const dataSources = {
        'regular': __dirname + `/resources/regular/${year}/Rates_${year}.pdf`,
        'small_business': __dirname + `/resources/small_business/${year}/Rates_${year}.pdf`
    };
    const pdfData = await loadPDF(dataSources[type]);
    const pageTables: RatesPages = pageHeaders(pdfData);
    const rateTables = <RateTables>{
        'PriorityCanada1': [],
        'PriorityCanada2': [],
        'ExpressCanada1': [],
        'ExpressCanada2': [],
        'ExpeditedCanada1': [],
        'ExpeditedCanada2': [],
        'RegularCanada1': [],
        'RegularCanada2': [],
        'PriorityWorldwide': [],
        'ExpressUSA': [],
        'ExpeditedUSA': [],
        'TrackedPacketUSA': [],
        'SmallPacketUSA': [],
        'ExpressInternational': [],
        'AirInternational': [],
        'SurfaceInternational': [],
        'TrackedPacketInternational': [],
        'SmallPacketAirInternational': [],
        'SmallPacketSurfaceInternational': [],
    }
    const canadianPriority = 'PriorityCanada';
    if (pageTables[canadianPriority] !== 0) {
        rateTables['PriorityCanada1'] = extractRateTables(pdfData, pageTables[canadianPriority] - 1, 20, 3);
        rateTables['PriorityCanada2'] = extractRateTables(pdfData, pageTables[canadianPriority], 20, 3);
    } else {
        console.error('Failed to populate Canadian Priority tables');
    }

    const canadianExpress = 'ExpressCanada';
    if (pageTables[canadianExpress] !== 0) {
        rateTables['ExpressCanada1'] = extractRateTables(pdfData, pageTables[canadianExpress] - 1, 20, 3);
        rateTables['ExpressCanada2'] = extractRateTables(pdfData, pageTables[canadianExpress], 20, 3);
    } else {
        console.error('Failed to populate Canadian Express tables');
    }

    const canadianRegularParcel = 'RegularCanada';
    if (pageTables[canadianRegularParcel] !== 0) {
        rateTables['RegularCanada1'] = extractRateTables(pdfData, pageTables[canadianRegularParcel] - 1, 20, 3);
        rateTables['RegularCanada2'] = extractRateTables(pdfData, pageTables[canadianRegularParcel], 20, 2);
    } else {
        console.error('Failed to populate Regular canadian parcel tables');
    }

    const internationalPriority = 'PriorityWorldwide';
    if (pageTables[internationalPriority] !== 0) {
        rateTables[internationalPriority] = extractPriorityWorldwide(pdfData, pageTables[internationalPriority]);
    } else {
        console.error('Failed to populate worldwide priority tables');
    }

    const expressUSALabel = 'ExpressUSA';
    if (pageTables[expressUSALabel] !== 0) {
        rateTables[expressUSALabel] = extractRateTables(pdfData, pageTables[expressUSALabel], 3, 7);
    } else {
        console.error('Failed to populate express USA tables');
    }
    const expeditedUSALabel = 'ExpeditedUSA';
    if (pageTables[expeditedUSALabel] !== 0) {
        rateTables[expeditedUSALabel] = cleanExtraLines(extractRateTables(pdfData, pageTables[expeditedUSALabel], 3, 7));
    } else {
        console.error('Failed to populate USA Expedited tables');
    }

    const usaRateCodes: string = (rateTables[expeditedUSALabel] && rateTables[expeditedUSALabel][0]) || '';
    const trackedPacketUSALabel = 'TrackedPacketUSA';
    if (pageTables[trackedPacketUSALabel] !== 0) {
        const trackedPacketUSA = extractRateTables(pdfData, pageTables[trackedPacketUSALabel], 2, 0);
        rateTables[trackedPacketUSALabel] = convertPacketToTable(trackedPacketUSA, usaRateCodes.split(' '));
    } else {
        console.error('Failed to populate Tracked Packet USA tables');
    }

    const smallPacketUSALabel = 'SmallPacketUSA';
    if (pageTables[smallPacketUSALabel] !== 0) {
        const smallPacketUSA = extractRateTables(pdfData, pageTables[smallPacketUSALabel], 2, 0);
        rateTables[smallPacketUSALabel] = convertPacketToTable(smallPacketUSA, usaRateCodes.split(' '));
    } else {
        console.error('Failed to populate Small Packet USA tables');
    }
    const worldwideExpressLabel = 'ExpressInternational';
    if (pageTables[worldwideExpressLabel] !== 0) {
        rateTables[worldwideExpressLabel] = extractRateTables(pdfData, pageTables[worldwideExpressLabel], 10, 3);
    } else {
        console.error('Failed to populate Express International tables');
    }

    const worldwideAirLabel = 'AirInternational';
    if (pageTables[worldwideAirLabel] !== 0) {
        rateTables[worldwideAirLabel] = extractRateTables(pdfData, pageTables[worldwideAirLabel], 10, 4);
    } else {
        console.error('Failed to populate Air International tables');
    }

    const worldwideSurfaceLabel = 'SurfaceInternational';
    if (pageTables[worldwideSurfaceLabel] !== 0) {
        rateTables[worldwideSurfaceLabel] = extractRateTables(pdfData, pageTables[worldwideSurfaceLabel], 10, 3);
    } else {
        console.error('Failed to populate Air Surface tables');
    }

    const worldwideTrackedPacketLabel = 'TrackedPacketInternational';
    if (pageTables[worldwideTrackedPacketLabel] !== 0) {
        const worldwideTrackedPacket = extractRateTables(pdfData, pageTables[worldwideTrackedPacketLabel], 10, 1);
        rateTables[worldwideTrackedPacketLabel] = convertPacketToTable(worldwideTrackedPacket, worldwideTrackedPacket[0].split(' '));
    } else {
        console.error('Failed to populate worldwide tracked packet tables');
    }
    const worldwideSmallPacketLabel = 'SmallPacketInternational';
    if (pageTables[worldwideSmallPacketLabel] !== 0) {
        const worldwideSmallPacket = extractRateTables(pdfData, pageTables[worldwideSmallPacketLabel], 10, 1); // working, beware that it can be split up into two air and surface, air comes first
        const knownRateCodes = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
        const worldwideSmallPacketAirLabel = 'SmallPacketAirInternational';
        const splitOfSmallPackets = splitMultiTablePage(worldwideSmallPacket, knownRateCodes.join(' '));
        const worldwideSmallAirPacket = splitOfSmallPackets[0];
        rateTables[worldwideSmallPacketAirLabel] = convertPacketToTable(worldwideSmallAirPacket, knownRateCodes);
        const worldwideSmallPacketSurfaceLabel = 'SmallPacketSurfaceInternational';
        const worldwideSmallSurfacePacket = splitOfSmallPackets[1];
        rateTables[worldwideSmallPacketSurfaceLabel] = convertPacketToTable(worldwideSmallSurfacePacket, knownRateCodes);
    } else {
        console.error('Failed to populate worldwide small packet (air/surface) tables');
    }
    if (type === SMALL_BUSINESS) {
        const canadianExpeditedParcel = 'ExpeditedCanada';
        if (pageTables[canadianExpeditedParcel] !== 0) {
            rateTables['ExpeditedCanada1'] = extractRateTables(pdfData, pageTables[canadianExpeditedParcel] - 1, 23, 3);
            rateTables['ExpeditedCanada2'] = extractRateTables(pdfData, pageTables[canadianExpeditedParcel], 22, 3);
        } else {
            console.error('Failed to populate canada expedited parcel tables');
        }
    }

    rateTables['ExpressUSA'] = cleanExtraLines(rateTables['ExpressUSA']);
    rateTables['ExpeditedUSA'] = cleanExtraLines(rateTables['ExpeditedUSA']);
    rateTables['PriorityWorldwide'] = cleanExtraLines(rateTables['PriorityWorldwide']);
    rateTables['ExpressInternational'] = cleanExtraLines(rateTables['ExpressInternational']);
    rateTables['AirInternational'] = cleanExtraLines(rateTables['AirInternational']);
    rateTables['SurfaceInternational'] = cleanExtraLines(rateTables['SurfaceInternational']);
    rateTables['SmallPacketUSA'] = cleanExtraLines(rateTables['SmallPacketUSA']);
    rateTables['TrackedPacketUSA'] = cleanExtraLines(rateTables['TrackedPacketUSA']);

    rateTables['RegularCanada1'] = cleanExtraLines(rateTables['RegularCanada1']);
    rateTables['RegularCanada2'] = cleanExtraLines(rateTables['RegularCanada2']);

    rateTables['PriorityCanada1'] = cleanExtraLines(rateTables['PriorityCanada1']);
    rateTables['PriorityCanada2'] = cleanExtraLines(rateTables['PriorityCanada2']);

    rateTables['ExpressCanada1'] = cleanExtraLines(rateTables['ExpressCanada1']);
    rateTables['ExpressCanada2'] = cleanExtraLines(rateTables['ExpressCanada2']);

    rateTables['ExpeditedCanada1'] = cleanExtraLines(rateTables['ExpeditedCanada1']);
    rateTables['ExpeditedCanada2'] = cleanExtraLines(rateTables['ExpeditedCanada2']);
    rateTables['TrackedPacketInternational'] = cleanExtraLines(rateTables['TrackedPacketInternational']);
    rateTables['SmallPacketAirInternational'] = cleanExtraLines(rateTables['SmallPacketAirInternational']);
    rateTables['SmallPacketSurfaceInternational'] = cleanExtraLines(rateTables['SmallPacketSurfaceInternational']);
    await loadByType(rateTables, year, type);
    return rateTables;
}
export const splitMultiTablePage = (page: string[], rateCodes?: string): string[][] => {
    /* conclusions: the "headers" ie ratecodes will always be either one or two characters
    so any token that is length 2 or less can be assumed to be part of the header row
    */
    const subpages: string[][] = [];
    let subpage: string[] = [];
    for (let i = 0; i < page.length; i++) {
        const line = page[i].split(' ');
        if (line[0] && (line[0].trim().length <= 2 || (rateCodes && page[i].indexOf(rateCodes) >= 0))) {
            // rate code line found
            if (subpage.length != 0) { // first page
                subpages.push(subpage);
                subpage = [];
            }
            subpage.push(page[i]);
        } else {
            subpage.push(page[i]);
        }
    }
    subpages.push(subpage);
    return subpages;
}
export const loadPDF = async (pdfFileLoc: string): Promise<any> => {
    const pdfParser = new PDFParser();
    return new Promise<any>((resolve, reject) => {
        pdfParser.on("pdfParser_dataError", errData => reject(errData.parserError));
        pdfParser.on("pdfParser_dataReady", pdfData => {
            let pdfPages = [];
            if (pdfData['formImage'] && pdfData['formImage']['Pages']) {
                pdfPages = pdfData['formImage']['Pages'];
            } else if (pdfData['Pages']) {
                pdfPages = pdfData['Pages'];
            } else {
                console.log('Faulty Data: ', pdfData);
                reject('Failed to find the correct format of data');
            }
            resolve(pdfPages); // an array of texts
        });
        pdfParser.loadPDF(pdfFileLoc);
    });
}
export const extractYear = (pdfData: string): any => {
    const titlePage = pdfData[0]['Texts'];
    const dataByLine = {};
    titlePage.forEach(entry => {
        if (dataByLine[entry.y]) {
            dataByLine[entry.y] = dataByLine[entry.y] + entry['R'][0]['T'].replace(/Over/g, ' ').replace(/TM/g, ' ').replace(/%24/g, '$').replace(/%E2%80%93/g, ' ').replace(/%E2%84%A2/g, ' ').replace(/&nbsp;/g, ' ').replace(/%20/g, ' ').replace(/%2C/g, ' ');
        } else {
            dataByLine[entry.y] = entry['R'][0]['T'].replace(/Over/g, ' ').replace(/%24/g, '$').replace(/TM/g, ' ').replace(/%E2%80%93/g, ' ').replace(/%E2%84%A2/g, ' ').replace(/&nbsp;/g, ' ').replace(/%20/g, ' ').replace(/%2C/g, ' ');
        }
        dataByLine[entry.y] = dataByLine[entry.y].replace(/  +/g, ' ');
    });
    const keys = Object.keys(dataByLine).sort(function (a, b) {
        return parseFloat(a) - parseFloat(b);
    });
    const textsArray: any[] = [];
    keys.forEach(key => {
        if (dataByLine[key].indexOf('Prices') >= 0 || dataByLine[key].indexOf('Effective') >= 0 || dataByLine[key].indexOf('Updated') >= 0) {
            textsArray.push(dataByLine[key]);
        }
    });
    let overlappingStr = '';
    for (let i = 1; i < textsArray.length; i++) {
        const tokens = textsArray[i].trim().split(' ');
        tokens.forEach(token => {
            if (token.trim().length == 4 && !isNaN(token.trim())) {
                overlappingStr = token.trim();
            }
        });
    }
    return overlappingStr;
}

export const extractPages = (pdfData: any): RatesPages => {
    const pages: RatesPages = {
        'PriorityCanada': 0,
        'ExpressCanada': 0,
        'ExpeditedCanada': 0,
        'RegularCanada': 0,
        'PriorityWorldwide': 0,
        'ExpressUSA': 0,
        'ExpeditedUSA': 0,
        'TrackedPacketUSA': 0,
        'SmallPacketUSA': 0,
        'ExpressInternational': 0,
        'AirInternational': 0,
        'SurfaceInternational': 0,
        'TrackedPacketInternational': 0,
        'SmallPacketInternational': 0
    };
    const pageTitleMapping = {
        'Priority Prices': 'PriorityCanada',
        'Xpresspost Prices': 'ExpressCanada',
        'Regular Parcel Prices': 'RegularCanada',
        'ExpeditedParcelPrices': 'ExpeditedCanada',
        'Xpresspost USA Prices': 'ExpressUSA',
        'Expedited Parcel USA Prices': 'ExpeditedUSA',
        'Tracked Packet USA Prices': 'TrackedPacketUSA',
        'Small Packet USA Prices': 'SmallPacketUSA',
        'Priority Worldwide International Prices': 'PriorityWorldwide',
        'Xpresspost International Prices': 'ExpressInternational',
        'International Parcel Air Prices': 'AirInternational',
        'International Parcel Surface Prices': 'SurfaceInternational',
        'Tracked Packet International Prices': 'TrackedPacketInternational',
        'Small Packet International Prices': 'SmallPacketInternational'
    }
    const pageTextLength = pdfData[1]['Texts'].length;
    let title = '';
    // Reading the table of contents page:
    // Explanation: the ... gets broken up into random number of units, however, those units are always between the name of the page and the page number
    // Since we dont know how many units of .. there are, the first time we see ... we assume the previous token was the page name
    // and if its not the first time we've seen it (which we deduce based on title not being empty) then we ignore it
    // once we see a token that is not ... and the title is not empty, then we know its the page number, so we grab the page number
    // and set the title back to blank for the next line
    for (let j = 1; j < pageTextLength; j++) {
        const searchText = pdfData[1]['Texts'][j]['R'][0]['T'];
        if (searchText.indexOf('..') >= 0 && title.length == 0) {
            title = pdfData[1]['Texts'][j - 1]['R'][0]['T'];
        } else if (searchText.indexOf('..') >= 0 && title.length > 0) {
            // do nothing
        } else if (title.length > 0) {
            let massagedTitle = title.replace(/%20/g, ' ').replace(/%E2%84%A2/g, ' ').replace(/%E2%80%93/g, ' ').replace(/%2C/g, ' ').replace(/ {2}/g, ' ').trim();
            massagedTitle = massagedTitle.replace(/  +/g, ' ');
            const pageNumber = pdfData[1]['Texts'][j]['R'][0]['T'];
            if (pageTitleMapping[massagedTitle] && pages[pageTitleMapping[massagedTitle]] === 0) {
                pages[pageTitleMapping[massagedTitle]] = parseInt(pageNumber) + 3 - 1; // introduction pages, ie i,ii, etc Indexing - 1 for all pages
                // for everything that isn't canada, add one to exclude the rate code mapping
                if (pageTitleMapping[massagedTitle].toUpperCase().indexOf('CANADA') < 0 && pageTitleMapping[massagedTitle].toUpperCase().indexOf('SMALLPACKETUSA') < 0) {
                    pages[pageTitleMapping[massagedTitle]] = pages[pageTitleMapping[massagedTitle]] + 1;
                }
            }
            title = '';
        } else {
            title = '';
        }
    }
    return pages;
}
export const pageHeaders = (pdfData: any): RatesPages => {
    const pages: RatesPages = {
        'PriorityCanada': 0,
        'ExpressCanada': 0,
        'ExpeditedCanada': 0,
        'RegularCanada': 0,
        'PriorityWorldwide': 0,
        'ExpressUSA': 0,
        'ExpeditedUSA': 0,
        'TrackedPacketUSA': 0,
        'SmallPacketUSA': 0,
        'ExpressInternational': 0,
        'AirInternational': 0,
        'SurfaceInternational': 0,
        'TrackedPacketInternational': 0,
        'SmallPacketInternational': 0
    };
    let pageNum = 0;
    pdfData.forEach(page => {
        const dataByLine = {};
        page['Texts'].forEach(entry => {
            if (dataByLine[entry.y]) {
                dataByLine[entry.y] = dataByLine[entry.y] + entry['R'][0]['T'].replace(/Over/g, '').replace(/TM/g, '').replace(/ {2}/g, ' ').replace(/%24/g, '$').replace(/%E2%80%93/g, '').replace(/%E2%84%A2/g, '').replace(/&nbsp;/g, '').replace(/%20/g, '').replace(/%2C/g, '').trim();
            } else {
                dataByLine[entry.y] = entry['R'][0]['T'].replace(/Over/g, '').replace(/ {2}/g, ' ').replace(/%24/g, '$').replace(/TM/g, '').replace(/%E2%80%93/g, '').replace(/%E2%84%A2/g, '').replace(/&nbsp;/g, '').replace(/%20/g, '').replace(/%2C/g, '').trim();
            }
            dataByLine[entry.y] = dataByLine[entry.y].replace(/  +/g, ' ');
        });
        const keys = Object.keys(dataByLine).sort(function (a, b) {
            return parseFloat(a) - parseFloat(b);
        });
        if (keys.length >= 3) {
            handlePageTitleEntry(dataByLine[keys[0]] + '' + dataByLine[keys[1]] + dataByLine[keys[2]] + dataByLine[keys[3]], pages, ++pageNum);
        } else if (keys.length >= 2) {
            handlePageTitleEntry(dataByLine[keys[0]] + '' + dataByLine[keys[1]], pages, ++pageNum);
        } else {
            handlePageTitleEntry(dataByLine[keys[0]], pages, ++pageNum);
        }
    });
    return pages;
}
export const handlePageTitleEntry = (rawText: string, ptrRateTable: RatesPages, pageNum: number): void => {
    const pageTitleMapping = {
        'PriorityPrices': 'PriorityCanada',
        'XpresspostPrices': 'ExpressCanada',
        'ExpeditedParcelPrices': 'ExpeditedCanada',
        'RegularParcelPrices': 'RegularCanada',
        'XpresspostUSAPrices': 'ExpressUSA',
        'ExpeditedParcelUSAPrices': 'ExpeditedUSA',
        'TrackedPacketUSAPrices': 'TrackedPacketUSA',
        'USApricesTrackedPacket': 'TrackedPacketUSA',
        'SmallPacketU.S.A.Prices': 'SmallPacketUSA',
        'usapricessmallpacket': 'SmallPacketUSA',
        'PriorityWorldwideInternationalPrices': 'PriorityWorldwide',
        'PriorityWorldwidePrices': 'PriorityWorldwide',
        'XpresspostInternationalPrices': 'ExpressInternational',
        'InternationalParcelAirPrices': 'AirInternational',
        'InternationalParcelSurfacePrices': 'SurfaceInternational',
        'TrackedPacketInternationalPrices': 'TrackedPacketInternational',
        'SmallPacketInternationalPrices': 'SmallPacketInternational'
    };
    const overwriteEligible = ['ExpressUSA', 'ExpeditedUSA', 'PriorityWorldwide', 'ExpressInternational',
        'AirInternational', 'SurfaceInternational', 'SmallPacketInternational'];
    let pageFound = -1;
    let matchingTitle = '';
    Object.keys(pageTitleMapping).forEach(expectedHeader => {
        if (rawText.trim().replace(/-/g, '').toLowerCase().indexOf(expectedHeader.toLowerCase()) >= 0) {
            pageFound = pageNum;
            matchingTitle = pageTitleMapping[expectedHeader];
        }
    });
    let previouslySet = false;
    if (pageFound !== -1) {
        if (ptrRateTable[matchingTitle] != 0) {
            previouslySet = true;
        }
        ptrRateTable[matchingTitle] = pageFound;
    }
    // previouslySet is for tables that are led by rate code mapping, which has the same title as the table we want.
    // so we want to skip those
    // canada post however, sometimes forgets to include a header for the table we want, so if we know a rate table has a rate code mapping page
    // and we've seen only one occurance of the title, then it means we want to skip to the next page
    if (!previouslySet && overwriteEligible.includes(matchingTitle)) {
        ptrRateTable[matchingTitle] = pageFound + 1;
    }
}
export const isAllNum = (values: any[]): boolean => {
    let allNumbers = true;
    values.forEach(value => {
        if (isNaN(value.trim())) {
            allNumbers = false;
        }
    })
    return allNumbers;
}
// expectation of return: rate code header
// each row of weight/cost
// final row of overweight
export const extractRateTables = (pdfPages: any, page: number, numRateCodes: number, decimalPoint: number): string[] => {
    let wholeText = pdfPages[page - 1]['Texts'];
    const wholeTextLength = wholeText.length;
    let line = '';
    /* suggestion: if a new "y" is found append it to an existing y in a map, then list over all the ys*/
    const allText = {};
    wholeText = wholeText.sort(function (a, b) {
        return parseFloat(a.y) - parseFloat(b.y);
    });

    for (let i = 0; i < wholeTextLength; i++) {
        line = wholeText[i]['R'][0]['T'].replace(/Over/g, '').replace(/ {2}/g, ' ').replace(/%24/g, '$').replace(/%E2%80%93/g, '').replace(/%E2%84%A2/g, '').replace(/&nbsp;/g, '').replace(/%20/g, '').replace(/%2C/g, '').trim();
        if (allText[parseFloat(wholeText[i].y).toFixed(decimalPoint)]) {
            if (allText[parseFloat(wholeText[i].y).toFixed(decimalPoint)].indexOf('$') >= 0) { // canada post apparently doesn't know how to draw straight lines. this is a bandaid
                allText[parseFloat(wholeText[i].y).toFixed(decimalPoint)] = line + ' ' + allText[parseFloat(wholeText[i].y).toFixed(decimalPoint)].trim();
            } else {
                allText[parseFloat(wholeText[i].y).toFixed(decimalPoint)] = allText[parseFloat(wholeText[i].y).toFixed(decimalPoint)].trim() + ' ' + line;
            }
        } else {
            allText[parseFloat(wholeText[i].y).toFixed(decimalPoint)] = line;
        }
    }
    // sort all values by row
    let keys = Object.keys(allText).sort(function (a, b) {
        return parseFloat(a) - parseFloat(b);
    });
    let prevKey = '';
    keys.forEach(key => {
        const tokens = allText[key].split(' ');
        // if allText[key] tokens is 2 and both those tokens are number; attach the previous key's values to this one and delete previous key
        if (prevKey != '' && isAllNum(allText[prevKey].split(' ')) && allText[prevKey].split(' ').length === (numRateCodes + 2)) {
            // dont do anything leave well enough alone
        } else if (isAllNum(tokens) && (tokens.length === 2 || tokens.length === 3) && isAllNum(allText[prevKey].split(' '))) {
            allText[key] = allText[key] + ' ' + allText[prevKey];
            delete allText[prevKey];
        } else if (allText[key].trim().toLowerCase().indexOf('upto') >= 0 && tokens.length === 1) {
            allText[key] = allText[key] + ' ' + allText[prevKey];

            delete allText[prevKey];
        } else if (isAllNum(tokens) && (tokens.length < (numRateCodes + 2)) && isAllNum(allText[prevKey].split(' ')) && allText[prevKey].split(' ').length < (numRateCodes + 2)) {
            allText[key] = allText[prevKey] + ' ' + allText[key];
            delete allText[prevKey];
        }

        prevKey = key;
    });
    // sort again to clean up deleted keys
    keys = Object.keys(allText).sort(function (a, b) {
        return parseFloat(a) - parseFloat(b);
    });
    keys = Object.keys(allText);
    const cleanArray: string[] = [];
    for (let i = 0; i < keys.length; i++) {
        if (allText[keys[i]]) {
            const totalTokens = allText[keys[i]].trim().split(' ').length;
            if (totalTokens >= numRateCodes) {
                let lineOfRates = allText[keys[i]].trim();
                // this is for cases where upTo token is last in line
                const idxOfUpTo = allText[keys[i]].toLowerCase().indexOf('upto');
                if (idxOfUpTo > 6) { // we know now that the index is last
                    const tokens = allText[keys[i]].split(' ');
                    const uptoStmt = tokens.pop();
                    tokens.unshift(uptoStmt);
                    lineOfRates = tokens.join(' ');
                }
                cleanArray.push(lineOfRates);
            }
        }
    }
    return cleanArray;
}

export const extractPriorityWorldwide = (pdfPages: any, pageNumber: number): string[] => {
    const fullPage = extractRateTables(pdfPages, pageNumber, 7, 3);
    // convert text of the page to be in a line by line format
    const wholeText = pdfPages[pageNumber - 1]['Texts'];
    const wholeTextLength = wholeText.length;
    let line = '';
    const allText: any = {};
    // hard code this because it is unlikely to change
    const header = '1 2 3 4 5 6 7';
    fullPage[0] = header;
    for (let i = 0; i < wholeTextLength; i++) {
        line = wholeText[i]['R'][0]['T'].replace(/Over/g, '').replace(/ {2}/g, ' ').replace(/%24/g, '$').replace(/%E2%80%93/g, '')
            .replace(/%E2%84%A2/g, '').replace(/&nbsp;/g, '').replace(/%20/g, '').replace(/%2C/g, '').replace('%C3', '')
            .replace('%89', '').replace('%E2', '').replace('%80', '').replace('%A0', '').replace('%E2', '').replace('%80', '').replace('%A0', '').trim(); // %E2%80%A0%E2%80%A0
        if (line.trim().length == 0) {
            continue;
        }

        if (allText[wholeText[i].y]) {
            allText[wholeText[i].y] = allText[wholeText[i].y].trim() + ' ' + line;
        } else {
            allText[wholeText[i].y] = line;
        }
    }
    // sort all values by row
    const keys = Object.keys(allText).sort(function (a, b) {
        return parseFloat(a) - parseFloat(b);
    });
    let rates = '';

    let indexWhereSearchStarts = 0;
    for (let i = 0; i < keys.length; i++) {
        const value = allText[keys[i]].replace(/\s/g, '');
        // to find the row with all the weights, we find the row that has 2x tokens, where x is the number of rate codes
        if (value.indexOf('ENVELOPE(MAXIMUM500G)PAK(MAXIMUM1.5KG)') >= 0) {
            indexWhereSearchStarts = i;
        }
        if (indexWhereSearchStarts > 0) {
            const ratesTokens = allText[keys[i]].split(' ');
            if (ratesTokens.length === 14) {
                const ratesHalfPoint = ratesTokens.length / 2;
                const kiloAndAHalfPakRates = ratesTokens.splice(ratesHalfPoint).join(' ');
                rates = '1.5 3.3 ' + kiloAndAHalfPakRates;
            }
        }
    }

    for (let i = fullPage.length - 1; i >= 1; i--) {
        const maxWeightInKG: any = fullPage[i].split(' ')[0].trim();
        if (!isNaN(maxWeightInKG) && fullPage[i].split(' ').length >= header.split(' ').length) {
            if (parseFloat(maxWeightInKG) <= 1.5) {
                fullPage.splice(i, 1);
            }
        }
    }

    // just in case there's garbage leading lines, lets search for header line instead of assuming its the first in array
    let indexOfFirstLineAfterHeader = 0;
    for (let i = 1; i < fullPage.length; i++) {
        indexOfFirstLineAfterHeader = i;
        if (fullPage[i].split(' ')[0].trim() === '2.0') {
            break;
        }
    }
    fullPage.splice(indexOfFirstLineAfterHeader, 0, rates);
    // remove the updated lines (ie the 1.5kg and less that were moved to the beginning)
    let lastLine = -1;
    for (let i = 1; i < fullPage.length; i++) {
        if (fullPage[i].split(' ').length === 14) {
            lastLine = i;
            break;
        }
    }
    const lastIdx = lastLine - 1;
    if (fullPage[lastIdx].split(' ').length != header.split(' ').length && fullPage[lastIdx].split(' ').length != header.split(' ').length + 2) {
        lastLine--;
    }
    fullPage.length = lastLine;
    return fullPage;
}

export const cleanExtraLines = (pageArray: string[]): string[] => {
    if (pageArray.length === 0) {
        return pageArray;
    }
    // clean the beginning of the array, by identifying the first functioning row
    // if you have 3 rows in a row that all have identical number of tokens, then the one
    // before it is the header row, signifying the beginning of the table
    let realBeginning = 0;
    for (let i = 1; i < pageArray.length - 2; i++) {
        const threeRows = [pageArray[i].split(' ').length, pageArray[i + 1].split(' ').length, pageArray[i + 2].split(' ').length];
        const allEqual = threeRows.every(rowLength => rowLength === threeRows[0]);
        if (allEqual) {
            realBeginning = i - 1;
            break;
        }
    }
    if (realBeginning > 1) {
        pageArray.splice(0, realBeginning);
    }
    // first line shouldn't have anything other than rate codes
    pageArray[0] = pageArray[0].replace('(USA)', '').replace(/ {2}/g, ' ');

    // clean from the bottom up.... if line has anything non numeric, just delete it
    for (let i = pageArray.length - 1; i > 0; i--) {
        if (!isAllNum(pageArray[i].split(' '))) {
            pageArray.splice(i, 1);
        }
    }
    // check the first row matches the rate code format, if not, pop it
    const firstRowTokens = pageArray[0].split(' ');
    const invalidTokens = firstRowTokens.filter(token => {
        if (token.trim().length > 3) {
            return token;
        }
    });
    if (invalidTokens.length > 0) {
        pageArray.shift();
    }
    return pageArray;
}

export const convertPacketToTable = (pageArray: string[], rcs: string[]): string[] => {
    let firstValidLine = -1;
    for (let i = 0; i < pageArray.length; i++) {
        if ((pageArray[i].toUpperCase().indexOf('UPTO') >= 0 || pageArray[i].toUpperCase().indexOf('INKG') >= 0) && firstValidLine < 0) {
            firstValidLine = i;
            // pageArray[i] = pageArray[i].toLowerCase().replace('upto', ' ');
        } else if (pageArray[i].toUpperCase().indexOf('INKG') >= 0 && firstValidLine < 0) {
            firstValidLine = i + 1;
            pageArray[i] = pageArray[i].toUpperCase().replace('INKG', '').replace('INLB', '');
        } else {
            pageArray[i] = pageArray[i].toUpperCase().replace('INKG', '').replace('INLB', '');
        }
        if (pageArray[i].trim().length == 0) {
            delete pageArray[i];
        }
        pageArray[i] = pageArray[i].toLowerCase().replace('upto', ' ');
    }
    pageArray = pageArray.slice(firstValidLine);
    // convert all g/kg tokens to be kg and remove 
    const finalTableRow: any[] = [];
    const rateCodes = rcs.join(' ').toUpperCase().replace('INKG ', '').replace('INLB', '').trim().split(' ');
    // console.log('Rate Codes ', rateCodes);
    pageArray.forEach(row => {
        row = row.replace('$', '');
        const tokens: any = row.split(' ');
        let maxToken: any = tokens[1].toLowerCase();
        let maxTokenInKg: number = tokens[0];
        let maxTokenInLb: number = tokens[1];
        if (maxToken.indexOf('kg') >= 0) {
            maxToken = maxToken.replace('kg', '');
            maxTokenInKg = maxToken;
        } else if (maxToken.indexOf('g') >= 0) {
            maxToken = maxToken.replace('g', '');
            maxTokenInKg = maxToken / 1000;
        }

        tokens[1] = maxTokenInKg;
        maxTokenInLb = Number((maxTokenInKg * 2.2).toFixed(2));
        tokens.splice(2, 0, maxTokenInLb);
        tokens.shift();
        // console.log('Tokens ', tokens);
        if (tokens.length === 3 || tokens.length === 2) {
            for (let i = 0; i < rateCodes.length - 1; i++) {
                tokens.push(tokens[tokens.length - 1]);
            }
        }
        row = tokens.join(' ');
        finalTableRow.push(row);
    });
    // finalTableRow[0] = rateCodes.join(' ');
    let ratesCodeIndx = firstValidLine - 1;
    if (ratesCodeIndx < 0) {
        ratesCodeIndx = 0;
    }
    finalTableRow.splice(ratesCodeIndx, 0, rateCodes.join(' '));
    return finalTableRow;
}

export const loadByType = (rates: RateTables, year: number, type: string): Promise<any> => { // type: regular or small_business
    return new Promise<any>((resolve, reject) => {
        saveTableEntries(rates, year, type).then(data => {
            resolve(data);
        }).catch(err => {
            reject(err);
        });
    });
}
// remember, this gets called twice; once for regular and once for small business
export const saveTableEntries = (ratesPage: RateTables, year: number, customerType: string): Promise<any> => {
    return new Promise<any>((resolve, reject) => {
        const inputsAll: string[] = [];
        const mapToDeliveryType = {
            'PriorityCanada1': {
                type: 'priority',
                country: 'Canada',
                overloadIncl: true,
            },
            'PriorityCanada2': {
                type: 'priority',
                country: 'Canada',
                overloadIncl: true,
            },
            'ExpressCanada1': {
                type: 'express',
                country: 'Canada',
                overloadIncl: true,
            },
            'ExpressCanada2': {
                type: 'express',
                country: 'Canada',
                overloadIncl: true,
            },
            'ExpeditedCanada1': {
                type: 'expedited',
                country: 'Canada',
                overloadIncl: true,
            },
            'ExpeditedCanada2': {
                type: 'expedited',
                country: 'Canada',
                overloadIncl: true,
            },
            'RegularCanada1': {
                type: 'regular',
                country: 'Canada',
                overloadIncl: true,
            },
            'RegularCanada2': {
                type: 'regular',
                country: 'Canada',
                overloadIncl: true,
            },
            'ExpressUSA': {
                type: 'express',
                country: 'USA',
                overloadIncl: true,
            },
            'ExpeditedUSA': {
                type: 'expedited',
                country: 'USA',
                overloadIncl: true,
            },
            'PriorityWorldwide': {
                type: 'priority',
                country: 'INTERNATIONAL',
                overloadIncl: true,
            },
            'ExpressInternational': {
                type: 'express',
                country: 'INTERNATIONAL',
                overloadIncl: true,
            },
            'AirInternational': {
                type: 'air',
                country: 'INTERNATIONAL',
                overloadIncl: true,
            },
            'SurfaceInternational': {
                type: 'surface',
                country: 'INTERNATIONAL',
                overloadIncl: true,
            },
            'TrackedPacketUSA': {
                type: 'tracked_packet',
                country: 'USA',
                overloadIncl: false,
            },
            'SmallPacketUSA': {
                type: 'small_packet',
                country: 'USA',
                overloadIncl: false,
            },
            'TrackedPacketInternational': {
                type: 'tracked_packet',
                country: 'INTERNATIONAL',
                overloadIncl: false,
            },
            'SmallPacketAirInternational': {
                type: 'small_packet_air',
                country: 'INTERNATIONAL',
                overloadIncl: false
            },
            'SmallPacketSurfaceInternational': {
                type: 'small_packet_surface',
                country: 'INTERNATIONAL',
                overloadIncl: false
            }
        };
        Object.keys(mapToDeliveryType).forEach(deliveryType => {
            if (!ratesPage[deliveryType] || ratesPage[deliveryType].length === 0) {
                return;
            }
            const labels: string[] = ratesPage[deliveryType][0].split(' ');
            const type = mapToDeliveryType[deliveryType].type;
            const country = mapToDeliveryType[deliveryType].country;

            let lineLength = ratesPage[deliveryType].length;
            if (mapToDeliveryType[deliveryType].overloadIncl) {
                lineLength = lineLength - 1;
            }
            for (let i = 1; i < lineLength; i++) {
                const input = ratesPage[deliveryType][i];
                const tokens = input.split(' ');
                const maxWeight = tokens[0];

                for (let i = 0; i < labels.length; i++) {
                    const price = tokens[i + 2];
                    const rate_code = labels[i];
                    const insertDataSQL = `insert into RATES(year, max_weight, weight_type, rate_code, price, type, country, customer_type) VALUES(${year}, ${maxWeight}, 'kg', '${rate_code}', ${price}, '${type}', '${country}', '${customerType}')`;
                    inputsAll.push(insertDataSQL);
                }
            }
            if (mapToDeliveryType[deliveryType].overloadIncl) {
                for (let i = 0; i < labels.length; i++) {
                    const tokens = ratesPage[deliveryType][ratesPage[deliveryType].length - 1].split(' ');
                    const price = tokens[i];
                    const rate_code = labels[i];
                    const insertDataSQL = `insert into RATES(year, max_weight, weight_type, rate_code, price, type, country, customer_type) VALUES(${year}, 30.1, 'kg', '${rate_code}', ${price}, '${type}', '${country}', '${customerType}')`;
                    inputsAll.push(insertDataSQL);
                }
            }
        });
        return Promise.all(inputsAll.map(entry => {
            return saveToDb(entry)
        })).then(data => {
            resolve(data);
        }).catch(e => {
            reject(e);
        });
    });
}