const axios = require('axios').default;
import { updateFuelSurcharge } from './db/sqlite3';
import { saveToDb } from './db/sqlite3';
const PDFParser = require("pdf2json");
export interface FuelTable {
    'Domestic Express and Non-Express Services': number,
    'U.S. and International Express Services': number,
    'U.S. and International Non-Express Services': number,
    'Priority Worldwide': number,
    'Expiry_Date': Date
}
export const updateAllFuelSurcharges = async (): Promise<any> => {
    const newFuelTable = await getFuelSurchargeTable();
    return updateFuelSurcharge(newFuelTable);
}
export const getFuelSurchargeTable = async (): Promise<FuelTable> => {
    return new Promise<any>((resolve, reject) => {
        axios.get('https://www.canadapost-postescanada.ca/cpc/en/support/kb/sending/rates-dimensions/fuel-surcharges-on-mail-and-parcels').
            then(data => {
                let fuelTable: FuelTable = extractFuelTable(data.data);
                resolve(fuelTable);
            }).catch(error => {
                reject(error);
            });
    });
}

export const extractFuelTable = (data: string): FuelTable => {
    let dt = JSON.stringify(data);
    let lines = dt.split('\\n');
    let r = 11;
    let st = 'The Fuel Surcharges are as follows:';
    let ed = 'How we calculate fuel surcharges';

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
    let endDateRaw = lines[start + 1];
    let endDate = endDateRaw.replace(/&nbsp;/g, ' ').split('through')[1].replace('</h4>', '').replace(':', '');
    const validUntilDate = new Date(endDate);
    let serviceCharges: FuelTable = <FuelTable>{};
    for (let i = start + 2; i < end; i++) {
        lines[i] = lines[i].replace(/&nbsp;/g, '');
        if (lines[i].indexOf('<tr>') >= 0 && !serviceCharges['Priority Worldwide']) {
            let header = lines[i + 1].replace('</td>', '').replace('<td>', '').replace('<em>', '').replace('</em>', '').replace('<sup>TM</sup>', '');
            let value = parseFloat(lines[i + 2].replace(/&nbsp;/g, '').replace('</td>', '').replace('<td>', '').trimLeft().replace('%', ''));
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
    'SmallPacketInternational': string[]
}
// this will iterate over the two docs; one for small business and one for regular rates
export const e2eProcess = async (year: number): Promise<RateTables[]> => {
    const dataSources = {
        'Regular': __dirname + `/resources/regular/${year}/Rates_${year}.pdf`,
        'SmallBusiness': __dirname + `/resources/small_business/${year}/SBprices-e-${year}.pdf`
    };
    let allRateTables: RateTables[] = [];
    await Promise.all(Object.keys(dataSources).map(async (key) => {
        let pdfData = await loadPDF(dataSources[key]);
        let pageTables: RatesPages = pageHeaders(pdfData);
        let rateTables = <RateTables>{};
        const canadianPriority = 'PriorityCanada';
        let canadianPriority1 = extractRateTables(pdfData, pageTables[canadianPriority] - 1, 20);
        let canadianPriority2 = extractRateTables(pdfData, pageTables[canadianPriority], 20);
        rateTables['PriorityCanada1'] = canadianPriority1;
        rateTables['PriorityCanada2'] = canadianPriority2;

        const canadianExpress = 'ExpressCanada';
        let canadianExpress1 = extractRateTables(pdfData, pageTables[canadianExpress] - 1, 20);
        let canadianExpress2 = extractRateTables(pdfData, pageTables[canadianExpress], 20);
        rateTables['ExpressCanada1'] = canadianExpress1;
        rateTables['ExpressCanada2'] = canadianExpress2;

        const canadianRegularParcel = 'RegularCanada';
        let canadianRegular1 = extractRateTables(pdfData, pageTables[canadianRegularParcel] - 1, 20);
        let canadianRegular2 = extractRateTables(pdfData, pageTables[canadianRegularParcel], 20);
        rateTables['RegularCanada1'] = canadianRegular1;
        rateTables['RegularCanada2'] = canadianRegular2;

        const internationalPriority = 'PriorityWorldwide';
        let worldwidePriority = extractPriorityWorldwide(pdfData, pageTables[internationalPriority]);
        rateTables[internationalPriority] = worldwidePriority;

        const expressUSALabel = 'ExpressUSA';
        let expressUSA = extractRateTables(pdfData, pageTables[expressUSALabel], 7);
        rateTables[expressUSALabel] = expressUSA;

        const expeditedUSALabel = 'ExpeditedUSA';
        let expeditedUSA = extractRateTables(pdfData, pageTables[expeditedUSALabel], 7);
        rateTables[expeditedUSALabel] = expeditedUSA;

        const trackedPacketUSALabel = 'TrackedPacketUSA';
        let trackedPacketUSA = extractRateTables(pdfData, pageTables[trackedPacketUSALabel], 2, 2);
        rateTables[trackedPacketUSALabel] = trackedPacketUSA;

        const smallPacketUSALabel = 'SmallPacketUSA';
        let smallPacketUSA = extractRateTables(pdfData, pageTables[smallPacketUSALabel], 2, 2);
        rateTables[smallPacketUSALabel] = smallPacketUSA;

        const worldwideExpressLabel = 'ExpressInternational';
        let worldwideExpress = extractRateTables(pdfData, pageTables[worldwideExpressLabel], 10);
        rateTables[worldwideExpressLabel] = worldwideExpress;

        const worldwideAirLabel = 'AirInternational';
        let worldwideAir = extractRateTables(pdfData, pageTables[worldwideAirLabel], 10);
        rateTables[worldwideAirLabel] = worldwideAir;

        const worldwideSurfaceLabel = 'SurfaceInternational';
        let worldwideSurface = extractRateTables(pdfData, pageTables[worldwideSurfaceLabel], 10);
        rateTables[worldwideSurfaceLabel] = worldwideSurface;

        const worldwideTrackedPacketLabel = 'TrackedPacketInternational';
        let worldwideTrackedPacket = extractRateTables(pdfData, pageTables[worldwideTrackedPacketLabel], 10, 11);
        rateTables[worldwideTrackedPacketLabel] = worldwideTrackedPacket;

        const worldwideSmallPacketLabel = 'SmallPacketInternational';
        let worldwideSmallPacket = extractRateTables(pdfData, pageTables[worldwideSmallPacketLabel], 10); // working, beware that it can be split up into two air and surface, air comes first
        rateTables[worldwideSmallPacketLabel] = worldwideSmallPacket;
        if (key === 'SmallBusiness') {
            const canadianExpeditedParcel = 'ExpeditedCanada';
            let canadianExpedited1 = extractRateTables(pdfData, pageTables[canadianExpeditedParcel] - 1, 23);
            let canadianExpedited2 = extractRateTables(pdfData, pageTables[canadianExpeditedParcel], 22);
            rateTables['ExpeditedCanada1'] = canadianExpedited1;
            rateTables['ExpeditedCanada2'] = canadianExpedited2;
        }
        allRateTables.push(rateTables);
    }));
    return allRateTables;
}
export const loadPDF = async (pdfFileLoc: string): Promise<any> => {
    let pdfParser = new PDFParser();
    return new Promise<any>((resolve, reject) => {
        pdfParser.on("pdfParser_dataError", errData => reject(errData.parserError));
        pdfParser.on("pdfParser_dataReady", pdfData => {
            let pdfPages = pdfData['formImage']['Pages'];
            resolve(pdfPages); // an array of texts
        });
        pdfParser.loadPDF(pdfFileLoc);
    });
}

export const extractPages = (pdfData: any): RatesPages => {
    let pages: RatesPages = {
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
    let pageTitleMapping = {
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
    let pageTextLength = pdfData[1]['Texts'].length;
    let title = '';
    // Reading the table of contents page:
    // Explanation: the ... gets broken up into random number of units, however, those units are always between the name of the page and the page number
    // Since we dont know how many units of .. there are, the first time we see ... we assume the previous token was the page name
    // and if its not the first time we've seen it (which we deduce based on title not being empty) then we ignore it
    // once we see a token that is not ... and the title is not empty, then we know its the page number, so we grab the page number
    // and set the title back to blank for the next line
    for (let j = 1; j < pageTextLength; j++) {
        let searchText = pdfData[1]['Texts'][j]['R'][0]['T'];
        if (searchText.indexOf('..') >= 0 && title.length == 0) {
            title = pdfData[1]['Texts'][j - 1]['R'][0]['T'];
        } else if (searchText.indexOf('..') >= 0 && title.length > 0) {

        } else if (title.length > 0) {
            let massagedTitle = title.replace(/%20/g, ' ').replace(/%E2%84%A2/g, '').replace(/%E2%80%93/g, '').replace(/%2C/g, '').replace(/  /g, ' ').trim();
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
    let pages: RatesPages = {
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
        let dataByLine = {};
        page['Texts'].forEach(entry => {
            if (dataByLine[entry.y]) {
                dataByLine[entry.y] = dataByLine[entry.y] + entry['R'][0]['T'].replace(/Over/g, '').replace(/TM/g, '').replace(/  /g, ' ').replace(/%24/g, '$').replace(/%E2%80%93/g, '').replace(/%E2%84%A2/g, '').replace(/&nbsp;/g, '').replace(/%20/g, '').replace(/%2C/g, '').trim();
            } else {
                dataByLine[entry.y] = entry['R'][0]['T'].replace(/Over/g, '').replace(/  /g, ' ').replace(/%24/g, '$').replace(/TM/g, '').replace(/%E2%80%93/g, '').replace(/%E2%84%A2/g, '').replace(/&nbsp;/g, '').replace(/%20/g, '').replace(/%2C/g, '').trim();;
            }
        });
        let keys = Object.keys(dataByLine).sort(function (a, b) {
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
    let pageTitleMapping = {
        'PriorityPrices': 'PriorityCanada',
        'XpresspostPrices': 'ExpressCanada',
        'ExpeditedParcelPrices': 'ExpeditedCanada',
        'RegularParcelPrices': 'RegularCanada',
        'XpresspostUSAPrices': 'ExpressUSA',
        'ExpeditedParcelUSAPrices': 'ExpeditedUSA',
        'TrackedPacketUSAPrices': 'TrackedPacketUSA',
        'SmallPacketU.S.A.Prices': 'SmallPacketUSA',
        'PriorityWorldwideInternationalPrices': 'PriorityWorldwide',
        'XpresspostInternationalPrices': 'ExpressInternational',
        'InternationalParcelAirPrices': 'AirInternational',
        'InternationalParcelSurfacePrices': 'SurfaceInternational',
        'TrackedPacketInternationalPrices': 'TrackedPacketInternational',
        'SmallPacketInternationalPrices': 'SmallPacketInternational'
    };
    let overwriteEligible = ['ExpressUSA', 'ExpeditedUSA', 'PriorityWorldwide', 'ExpressInternational',
        'AirInternational', 'SurfaceInternational', 'SmallPacketInternational'];
    let pageFound = -1;
    let matchingTitle = '';
    Object.keys(pageTitleMapping).forEach(expectedHeader => {
        if (rawText.trim().replace(/-/g, '').indexOf(expectedHeader) >= 0) {
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
export const extractRateTables = (pdfPages: any, page: number, numRateCodes: number, maxTokens?: number): string[] => {
    let wholeText = pdfPages[page - 1]['Texts'];
    let wholeTextLength = wholeText.length;
    let line = '';
    /* suggestion: if a new "y" is found append it to an existing y in a map, then list over all the ys*/
    let allText = {};
    for (let i = 0; i < wholeTextLength; i++) {
        line = wholeText[i]['R'][0]['T'].replace(/Over/g, '').replace(/  /g, ' ').replace(/%24/g, '$').replace(/%E2%80%93/g, '').replace(/%E2%84%A2/g, '').replace(/&nbsp;/g, '').replace(/%20/g, '').replace(/%2C/g, '').trim();
        if (allText[wholeText[i].y]) {
            allText[wholeText[i].y] = allText[wholeText[i].y].trim() + ' ' + line;
        } else {
            allText[wholeText[i].y] = line;
        }
    }
    // sort all values by row
    let keys = Object.keys(allText).sort(function (a, b) {
        return parseFloat(a) - parseFloat(b);
    });
    let prevKey = '';
    keys.forEach(key => {
        let tokens = allText[key].split(' ');
        // if allText[key] tokens is 2 and both those tokens are number; attach the previous key's values to this one and delete previous key
        if (isAllNum(tokens) && tokens.length === 2 && isAllNum(allText[prevKey].split(' '))) {
            allText[key] = allText[key] + ' ' + allText[prevKey];
            delete allText[prevKey];
        } else if (allText[key].trim().toLowerCase().indexOf('upto') >= 0 && tokens.length === 1) {
            allText[key] = allText[key] + ' ' + allText[prevKey];
            delete allText[prevKey];
        }
        prevKey = key;
    });
    // sort again to clean up deleted keys
    keys = Object.keys(allText).sort(function (a, b) {
        return parseFloat(a) - parseFloat(b);
    });
    let cleanArray: string[] = [];
    for (let i = 0; i < keys.length; i++) {
        let totalTokens = allText[keys[i]].trim().split(' ').length;
        if (totalTokens >= numRateCodes) {
            if (maxTokens && totalTokens <= maxTokens) {
                cleanArray.push(allText[keys[i]].trim());
            } else if (!maxTokens) {
                cleanArray.push(allText[keys[i]].trim());
            }
        }
    }
    return cleanArray;
}

export const extractPriorityWorldwide = (pdfPages: any, pageNumber: number): string[] => {
    let fullPage = extractRateTables(pdfPages, pageNumber, 7, 9);
    // find the two tables at the bottom
    // convert text of the page to be in a line by line format
    let wholeText = pdfPages[pageNumber - 1]['Texts'];
    let wholeTextLength = wholeText.length;
    let line = '';
    let allText = {};
    for (let i = 0; i < wholeTextLength; i++) {
        line = wholeText[i]['R'][0]['T'].replace(/Over/g, '').replace(/  /g, ' ').replace(/%24/g, '$').replace(/%E2%80%93/g, '').replace(/%E2%84%A2/g, '').replace(/&nbsp;/g, '').replace(/%20/g, '').replace(/%2C/g, '').trim();
        if (allText[wholeText[i].y]) {
            allText[wholeText[i].y] = allText[wholeText[i].y].trim() + ' ' + line;
        } else {
            allText[wholeText[i].y] = line;
        }
    }
    // sort all values by row
    let keys = Object.keys(allText).sort(function (a, b) {
        return parseFloat(a) - parseFloat(b);
    });
    let prevKey = '';
    keys.forEach(key => {
        let tokens = allText[key].split(' ');
        // if allText[key] tokens is 2 and both those tokens are number; attach the previous key's values to this one and delete previous key
        if (isAllNum(tokens) && tokens.length === 2 && isAllNum(allText[prevKey].split(' '))) {
            allText[key] = allText[key] + ' ' + allText[prevKey];
            delete allText[prevKey];
        } else if (allText[key].trim().toLowerCase().indexOf('upto') >= 0 && tokens.length === 1) {
            allText[key] = allText[key] + ' ' + allText[prevKey];
            delete allText[prevKey];
        }
        prevKey = key;
    });
    // sort again to clean up deleted keys
    keys = Object.keys(allText).sort(function (a, b) {
        return parseFloat(a) - parseFloat(b);
    });
    let header = '';
    let rates = '';
    for (let i = 0; i < keys.length - 2; i++) {
        if (allText[keys[i]].indexOf('ENVELOPE(MAXIMUM500G) PAK(MAXIMUM1.5KG)') >= 0) {
            const headerTokens = allText[keys[i + 1]].replace(/\(USA\)/g, '').replace(/  /g, ' ').split(' ');
            const headerHalfPoint = headerTokens.length / 2;
            header = headerTokens.splice(headerHalfPoint, headerHalfPoint).join(' ');
            const ratesTokens = allText[keys[i + 2]].split(' ');
            const ratesHalfPoint = ratesTokens.length / 2;
            rates = '1.5 3.3 ' + ratesTokens.splice(0, ratesHalfPoint).join(' ');
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
    return fullPage;
}

export const cleanExtraLines = (pageArray: string[]): string[] => {
    // clean the end of the array
    for (let i = pageArray.length - 1; i > 0; i--) {
        let firstTokenNumeric: any = pageArray[i].split(' ')[0].trim();
        if (isNaN(firstTokenNumeric)) {
            pageArray.splice(i, 1);
        } else {
            break; // break out once we get into real numbers
        }
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
    pageArray[0] = pageArray[0].replace('(USA)', '').replace(/  /g, ' ');
    return pageArray;
}

export const loadBoth = (rates: RateTables[], year: number): Promise<any> => {
    return new Promise<any>((resolve, reject) => {
        saveTableEntries(rates[0], year, 'regular').then(data => {
            console.log('Data success');
            saveTableEntries(rates[1], year, 'small_business').then(data => {
                resolve(data);
            }).catch(err => {
                reject(err);
            });
        }).catch(error => reject(error));
    });
}
// remember, this gets called twice; once for regular and once for small business
export const saveTableEntries = (ratesPage: RateTables, year: number, customerType: string): Promise<any> => {
    console.log('customer type ', customerType);
    return new Promise<any>((resolve, reject) => {
        ratesPage['ExpressUSA'] = cleanExtraLines(ratesPage['ExpressUSA']);
        ratesPage['ExpeditedUSA'] = cleanExtraLines(ratesPage['ExpeditedUSA']);
        ratesPage['PriorityWorldwide'] = cleanExtraLines(ratesPage['PriorityWorldwide']);
        ratesPage['ExpressInternational'] = cleanExtraLines(ratesPage['ExpressInternational']);
        ratesPage['AirInternational'] = cleanExtraLines(ratesPage['AirInternational']);
        ratesPage['SurfaceInternational'] = cleanExtraLines(ratesPage['SurfaceInternational']);
        const inputsAll: string[] = [];
        let mapToDeliveryType = {
            'PriorityCanada1': {
                type: 'priority',
                country: 'Canada'
            },
            'PriorityCanada2': {
                type: 'priority',
                country: 'Canada'
            },
            'ExpressCanada1': {
                type: 'express',
                country: 'Canada'
            },
            'ExpressCanada2': {
                type: 'express',
                country: 'Canada'
            },
            'ExpeditedCanada1': {
                type: 'expedited',
                country: 'Canada'
            },
            'ExpeditedCanada2': {
                type: 'expedited',
                country: 'Canada'
            },
            'RegularCanada1': {
                type: 'regular',
                country: 'Canada'
            },
            'RegularCanada2': {
                type: 'regular',
                country: 'Canada'
            },
            'ExpressUSA': {
                type: 'express',
                country: 'USA'
            },
            'ExpeditedUSA': {
                type: 'expedited',
                country: 'USA'
            },
            'PriorityWorldwide': {
                type: 'priority',
                country: 'INTERNATIONAL'
            },
            'ExpressInternational': {
                type: 'express',
                country: 'INTERNATIONAL'
            },
            'AirInternational': {
                type: 'air',
                country: 'INTERNATIONAL'
            },
            'SurfaceInternational': {
                type: 'surface',
                country: 'INTERNATIONAL'
            }
        };
        Object.keys(mapToDeliveryType).forEach(deliveryType => {
            if (!ratesPage[deliveryType]) {
                return;
            }
            let labels: string[] = ratesPage[deliveryType][0].split(' ');
            const type = mapToDeliveryType[deliveryType].type;
            const country = mapToDeliveryType[deliveryType].country;
            for (let i = 1; i < ratesPage[deliveryType].length - 1; i++) {
                let input = ratesPage[deliveryType][i];
                const tokens = input.split(' ');
                const maxWeight = tokens[0];
                for (let i = 0; i < labels.length; i++) {
                    const price = tokens[i + 1];
                    const rate_code = labels[i];
                    const insertDataSQL = `insert into RATES(year, max_weight, weight_type, rate_code, price, type, country, customer_type) VALUES(${year}, ${maxWeight}, 'kg', '${rate_code}', ${price}, '${type}', '${country}', '${customerType}')`;
                    inputsAll.push(insertDataSQL);
                }
            }
            for (let i = 0; i < labels.length; i++) {
                const tokens = ratesPage[deliveryType][ratesPage[deliveryType].length - 1].split(' ');
                const price = tokens[i];
                const rate_code = labels[i];
                const insertDataSQL = `insert into RATES(year, max_weight, weight_type, rate_code, price, type, country, customer_type) VALUES(${year}, 30.1, 'kg', '${rate_code}', ${price}, '${type}', '${country}', '${customerType}')`;
                inputsAll.push(insertDataSQL);
            }
        });
        Promise.all(inputsAll.map(async entry => {
            return saveToDb(entry)
        })).then(data => {
            resolve(data);
        }).catch(e => {
            console.log('ERROR! ', e);
            reject(e);
        });
    });
}