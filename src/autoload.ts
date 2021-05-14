const axios = require('axios').default;
import { updateFuelSurcharge } from './db/sqlite3';
import fs from 'fs';
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

// this will iterate over the two docs; one for small business and one for regular rates
export const e2eProcess = async (): Promise<void> => {
    let pdfData = await loadPDF();
    let pageTables: RatesPages = extractPages(pdfData);

    let canadianPriority1 = extractRateTables(pdfData, pageTables[Object.keys(pageTables)[0]], 20); // check
    let canadianPriority2 = extractRateTables(pdfData, pageTables[Object.keys(pageTables)[0]] + 1, 20); // check
    let canadianExpress1 = extractRateTables(pdfData, pageTables[Object.keys(pageTables)[1]], 20); // check
    let canadianExpress2 = extractRateTables(pdfData, pageTables[Object.keys(pageTables)[1]] + 1, 20); // check
    let canadianRegular1 = extractRateTables(pdfData, pageTables[Object.keys(pageTables)[2]], 20); // check
    let canadianRegular2 = extractRateTables(pdfData, pageTables[Object.keys(pageTables)[2]] + 1, 20); // check

    let worldwidePriority = extractRateTables(pdfData, pageTables[Object.keys(pageTables)[3]], 8, 9); // check - ish, trailing line
    let expressUSA = extractRateTables(pdfData, pageTables[Object.keys(pageTables)[4]], 7); // check - ish, trailing line
    let expeditedUSA = extractRateTables(pdfData, pageTables[Object.keys(pageTables)[5]], 7); // check - ish, trailing line

    let trackedPacketUSA = extractRateTables(pdfData, pageTables[Object.keys(pageTables)[6]], 2); // not working yet
    let smallPacketUSA = extractRateTables(pdfData, pageTables[Object.keys(pageTables)[7]], 2); // wrong page

    let worldwideExpress = extractRateTables(pdfData, pageTables[Object.keys(pageTables)[8]], 10); // check
    let worldwideAir = extractRateTables(pdfData, pageTables[Object.keys(pageTables)[9]], 10); // check
    let worldwideSurface = extractRateTables(pdfData, pageTables[Object.keys(pageTables)[10]], 10); // check
    let worldwideTrackedPacket = extractRateTables(pdfData, pageTables[Object.keys(pageTables)[11]], 10); // not working yet
    let worldwideSmallPacket = extractRateTables(pdfData, pageTables[Object.keys(pageTables)[11]], 2); // not working yet

    smallPacketUSA.forEach(line => {
        console.log(line);
    });

}
export const loadPDF = async (): Promise<any> => {
    let pdfParser = new PDFParser();
    return new Promise<any>((resolve, reject) => {
        pdfParser.on("pdfParser_dataError", errData => console.error(errData.parserError));
        pdfParser.on("pdfParser_dataReady", pdfData => {
            let pdfPages = pdfData['formImage']['Pages'];
            resolve(pdfPages); // an array of texts
        });
        pdfParser.loadPDF(__dirname + "/resources/regular/2021/Rates_2021.pdf");
    });
}

export const extractPages = (pdfData: any): RatesPages => {
    let pages: RatesPages = {
        'PriorityCanada': 0,
        'ExpressCanada': 0,
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
        // 'Priority Worldwide USA Prices': 'PriorityWorldwide',
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
                if (pageTitleMapping[massagedTitle].toUpperCase().indexOf('CANADA') < 0) {
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
export const extractRateTables = (pdfPages: any, page: number, numRateCodes: number, maxTokens?: number) => {
    let wholeText = pdfPages[page]['Texts'];
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