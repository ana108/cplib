"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLatestFuelSurcharge = exports.calculateShippingInternational = exports.calculateShippingUSA = exports.calculateShippingCanada = exports.calculateTax = exports.calculateShipping = exports.validateAddress = exports.mapProvinceToCode = exports.locationOfSource = void 0;
const sqlite3_1 = require("./db/sqlite3");
const autoload_1 = require("./autoload");
const path_1 = __importDefault(require("path"));
const log_1 = require("./log");
const lodash_1 = __importDefault(require("lodash"));
exports.locationOfSource = path_1.default.resolve(__dirname, 'source.js');
exports.mapProvinceToCode = (region) => {
    const canadianProvinceMap = {
        'ALBERTA': 'AB',
        'BRITISH COLUMBIA': 'BC',
        'MANITOBA': 'MB',
        'NEWFOUNDLAND': 'NL',
        'LABRADOR': 'NL',
        'NORTHWEST TERRITORIES': 'NWT',
        'NOVA SCOTIA': 'NS',
        'NUNAVUT': 'NU',
        'ONTARIO': 'ON',
        'PRINCE EDWARD ISLAND': 'PEI',
        'QUEBEC': 'QC',
        'SASKATCHEWAN': 'SK',
        'YUKON': 'YT',
        'NEW BRUNSWICK': 'NB'
    };
    const americanProvinceMap = {
        'ALABAMA': 'AL',
        'ALASKA': 'AK',
        'AMERICAN SAMOA': 'AS',
        'ARIZONA': 'AZ',
        'ARKANSAS': 'AR',
        'CALIFORNIA': 'CA',
        'COLORADO': 'CO',
        'CONNECTICUT': 'CT',
        'DELAWARE': 'DE',
        'DISTRICT OF COLUMBIA': 'DC',
        'FEDERATED STATES OF MICRONESIA': 'FM',
        'FLORIDA': 'FL',
        'GEORGIA': 'GA',
        'GUAM': 'GU',
        'HAWAII': 'HI',
        'IDAHO': 'ID',
        'ILLINOIS': 'IL',
        'INDIANA': 'IN',
        'IOWA': 'IA',
        'KANSAS': 'KS',
        'KENTUCKY': 'KY',
        'LOUISIANA': 'LA',
        'MAINE': 'ME',
        'MARSHALL ISLANDS': 'MH',
        'MARYLAND': 'MD',
        'MASSACHUSETTS': 'MA',
        'MICHIGAN': 'MI',
        'MINNESOTA': 'MN',
        'MISSISSIPPI': 'MS',
        'MISSOURI': 'MO',
        'MONTANA': 'MT',
        'NEBRASKA': 'NE',
        'NEVADA': 'NV',
        'NEW HAMPSHIRE': 'NH',
        'NEW JERSEY': 'NJ',
        'NEW MEXICO': 'NM',
        'NEW YORK': 'NY',
        'NORTH CAROLINA': 'NC',
        'NORTH DAKOTA': 'ND',
        'NORTHERN MARIANA ISLANDS': 'MP',
        'OHIO': 'OH',
        'OKLAHOMA': 'OK',
        'OREGON': 'OR',
        'PALAU': 'PW',
        'PENNSYLVANIA': 'PA',
        'PUERTO RICO': 'PR',
        'RHODE ISLAND': 'RI',
        'SOUTH CAROLINA': 'SC',
        'SOUTH DAKOTA': 'SD',
        'TENNESSEE': 'TN',
        'TEXAS': 'TX',
        'UTAH': 'UT',
        'VERMONT': 'VT',
        'VIRGIN ISLANDS': 'VI',
        'VIRGINIA': 'VA',
        'WASHINGTON': 'WA',
        'WEST VIRGINIA': 'WV',
        'WISCONSIN': 'WI',
        'WYOMING': 'WY'
    };
    if ((region.length == 2 || region.length === 3)
        && (Object.values(canadianProvinceMap).includes(region) || Object.values(americanProvinceMap).includes(region))) {
        return region;
    }
    else if (canadianProvinceMap[region] || americanProvinceMap[region]) {
        return canadianProvinceMap[region] || americanProvinceMap[region];
    }
    else {
        throw new Error('The region provided is not a valid region');
    }
};
exports.validateAddress = (address) => {
    if (!address || !address.country) {
        throw new Error('Missing value or missing country property of the address');
    }
    const cleanAddress = {
        streetAddress: address.streetAddress,
        city: address.city,
        region: address.region,
        postalCode: address.postalCode,
        country: address.country.toUpperCase().trim()
    };
    if (cleanAddress.country === 'CA' || cleanAddress.country === 'CANADA' || cleanAddress.country === 'US' || cleanAddress.country === 'USA' || cleanAddress.country === 'UNITED STATES') {
        if (!address.postalCode || !address.region) {
            throw new Error('For north american shipments, region and zip code must be provided.');
        }
        else {
            cleanAddress.region = address.region.toUpperCase().trim().replace('  ', ' ');
            cleanAddress.postalCode = address.postalCode.toUpperCase().trim().replace(' ', '');
        }
    }
    if (cleanAddress.country === 'CA' || cleanAddress.country === 'CANADA') {
        cleanAddress.country = 'Canada';
        cleanAddress.postalCode = cleanAddress.postalCode.replace('-', '');
        const postalCodeRegExp = new RegExp('^[A-Z]{1}[0-9]{1}[A-Z]{1}[0-9]{1}[A-Z]{1}[0-9]{1}$');
        if (!postalCodeRegExp.test(cleanAddress.postalCode)) {
            throw new Error('Invalid postal code. Please make sure its in format of A1A1A1');
        }
        cleanAddress.region = exports.mapProvinceToCode(cleanAddress.region);
    }
    else if (cleanAddress.country === 'US' || cleanAddress.country === 'USA' || cleanAddress.country === 'UNITED STATES' || cleanAddress.country === 'U.S.A.') {
        cleanAddress.country = 'USA';
        cleanAddress.region = exports.mapProvinceToCode(cleanAddress.region);
    }
    else {
        cleanAddress.country = cleanAddress.country.trim().toUpperCase();
    }
    return cleanAddress;
};
exports.calculateShipping = (sourceAddress, destinationAddress, weightInKg, deliveryType = 'regular', customerType = 'regular') => {
    log_1.logger.info(`Calculate shipping source: ${lodash_1.default.get(sourceAddress, 'postalCode', '')} dest: ${lodash_1.default.get(destinationAddress, 'postalCode', '') + " " + lodash_1.default.get(destinationAddress, 'region', '') + " " + lodash_1.default.get(destinationAddress, 'country', '')} weight: ${weightInKg} deliveryType: ${deliveryType} customerType: ${customerType}`);
    const deliverySpeed = deliveryType.trim().toLowerCase();
    return new Promise((resolve, reject) => {
        try {
            // disabled auto update
            /* const child = fork(locationOfSource, { silent: false })
            child.on('exit', (err) => {
                if (err) {
                    logger.error(`Update service exited with message: ${err}`);
                }
            }); */
            if (!weightInKg || weightInKg <= 0) {
                throw new Error('Weight must be present and be a non-negative number');
            }
            if (isNaN(weightInKg)) {
                throw new Error('Weight must be a numeric value');
            }
            const canadaDeliverySpeeds = ['regular', 'priority', 'express', 'expedited'];
            if (customerType === 'regular') {
                canadaDeliverySpeeds.pop();
            }
            const americanDeliverySpeeds = ['express', 'priority', 'tracked_packet', 'small_packet', 'expedited'];
            const internationalDeliverySpeeds = ['priority', 'express', 'air', 'surface', 'tracked_packet', 'small_packet_air', 'small_packet_surface'];
            const source = exports.validateAddress(sourceAddress);
            const destination = exports.validateAddress(destinationAddress);
            if (destination.country === 'Canada' && canadaDeliverySpeeds.includes(deliverySpeed)) {
                log_1.logger.debug(`Calculate shipping canada`);
                exports.calculateShippingCanada(source.postalCode, destination.postalCode, weightInKg, deliverySpeed, customerType).then(data => {
                    resolve(data);
                }).catch(e => {
                    reject(e);
                });
            }
            else if (destination.country === 'Canada' && !canadaDeliverySpeeds.includes(deliverySpeed)) {
                throw new Error('Delivery type must be one of the following: regular, priority, express or expedited');
            }
            else if (destination.country === 'USA' && americanDeliverySpeeds.includes(deliverySpeed)) {
                log_1.logger.debug(`Calculate shipping USA`);
                exports.calculateShippingUSA(source.region, destination.region, weightInKg, deliverySpeed, customerType).then(data => {
                    resolve(data);
                }).catch(e => {
                    reject(e);
                });
            }
            else if (destination.country === 'USA' && !americanDeliverySpeeds.includes(deliverySpeed)) {
                throw new Error('Delivery type to USA must be one of the following: regular, priority, express, expedited, small_packet or tracked_packet');
            }
            else if (!internationalDeliverySpeeds.includes(deliverySpeed)) {
                throw new Error('Delivery type must be one of the following: priority,express,air,surface,tracked_packet,small_packet_air,small_packet_surface');
            }
            else {
                log_1.logger.debug(`Calculate shipping international`);
                exports.calculateShippingInternational(destination.country, weightInKg, deliverySpeed, customerType).then(data => {
                    resolve(data);
                }).catch(e => {
                    reject(e);
                });
            }
        }
        catch (e) {
            reject(e);
        }
    });
};
exports.calculateTax = (sourceProvince, destinationProvice, shippingCost, shippingType) => {
    let taxCost = 0.00;
    const hstProvince13 = ['ON'];
    const hstProvince15 = ['NB', 'NS', 'NL', 'PEI'];
    // where does NT/NU/YK fit into all this?
    if (shippingCost < 5.00 && shippingType === 'regular') {
        if (hstProvince13.includes(sourceProvince)) {
            taxCost = shippingCost * 0.13;
        }
        else if (hstProvince15.includes(sourceProvince)) {
            taxCost = shippingCost * 0.15;
        }
        if (sourceProvince === 'QC') {
            taxCost = shippingCost * 0.14975;
        }
    }
    else if (shippingType === 'express' || shippingType === 'priority') {
        // HST if mailed to Ontario, New Brunswick, Prince Edward Island, Nova Scotia or Newfoundland and Labrador
        if (hstProvince13.includes(destinationProvice)) {
            taxCost = shippingCost * 0.13;
        }
        else {
            taxCost = shippingCost * 0.05;
        }
    }
    else if (shippingCost >= 5.00 && shippingType === 'regular') {
        const gstOnlyProvinces = ['ON', 'NB', 'PEI', 'NS', 'NL', 'QC', 'MB', 'SK', 'AB', 'BC', 'NWT', 'NU', 'NWT,NU', 'YT'];
        if (gstOnlyProvinces.includes(sourceProvince)) {
            taxCost = shippingCost * 0.05;
        }
    }
    log_1.logger.info(`Taxes calculated for shipping cost ${shippingCost} are ${taxCost}`);
    return taxCost;
};
exports.calculateShippingCanada = async (sourcePostalCode, destinationPostalCode, weightInKg, deliverySpeed = 'regular', customerType = 'regular') => {
    // for package dimensions make sure to convert it into a type
    // get rate code
    const source = sourcePostalCode.substr(0, 3);
    const destination = destinationPostalCode.substr(0, 3);
    const rateCode = await sqlite3_1.getRateCode(source, destination);
    // get cost for regular/priority/express
    let shippingCost;
    if (weightInKg <= 30.0) {
        shippingCost = await sqlite3_1.getRate(rateCode, weightInKg, { type: deliverySpeed, customerType });
    }
    else {
        const rates = await sqlite3_1.getMaxRate(rateCode, { type: deliverySpeed, customerType });
        const difference = weightInKg - 30.0;
        shippingCost = rates.maxRate + (difference / 0.5) * rates.incrementalRate;
    }
    // get fuel rate
    const fuelSurchargePercentage = await exports.getLatestFuelSurcharge('Canada', deliverySpeed);
    // add fuel rate to final cost
    const pretaxCost = shippingCost * (1 + fuelSurchargePercentage);
    const sourceProvince = extractProvince(sourcePostalCode);
    const destinationProvice = extractProvince(destinationPostalCode);
    // calculate tax
    const tax = exports.calculateTax(sourceProvince, destinationProvice, pretaxCost, deliverySpeed);
    const finalPrice = pretaxCost + tax;
    // resolve(round(finalPrice));
    return round(finalPrice);
};
exports.calculateShippingUSA = async (sourceProvince, destState, weightInKg, deliverySpeed = 'expedited', customerType = 'regular') => {
    let rateCode;
    let shippingCost;
    // for package dimensions make sure to convert it into a type
    if (deliverySpeed === 'priority') {
        rateCode = await sqlite3_1.getRateCode('Canada', 'USA', deliverySpeed);
    }
    else if (deliverySpeed === 'express' || deliverySpeed === 'expedited') {
        rateCode = await sqlite3_1.getRateCode(sourceProvince, destState, deliverySpeed);
    }
    else if (deliverySpeed === 'tracked_packet' || deliverySpeed === 'small_packet') {
        if (weightInKg > 2.0) {
            throw new Error('The maximum weight of a package for a packet is 2.0 kg');
        }
        rateCode = '1';
        // skip the rate code, and go straight to getting rate
        // pick any rate between 1 and 7; they all have the same values
    }
    // priority is the same as international
    // all other have USA specific rates
    let countryDeliveringTo = 'USA';
    if (deliverySpeed === 'priority') {
        countryDeliveringTo = 'INTERNATIONAL';
    }
    if (weightInKg <= 30.0) {
        shippingCost = await sqlite3_1.getRate(rateCode, weightInKg, { country: countryDeliveringTo, type: deliverySpeed, customerType });
    }
    else {
        const rates = await sqlite3_1.getMaxRate(rateCode, { country: countryDeliveringTo, type: deliverySpeed, customerType });
        const difference = weightInKg - 30.0;
        shippingCost = rates.maxRate + (difference / 0.5) * rates.incrementalRate;
    }
    // get fuel rate
    const fuelSurchargePercentage = await exports.getLatestFuelSurcharge('USA', deliverySpeed);
    // add fuel rate to final cost
    let pretaxCost = shippingCost * (1 + fuelSurchargePercentage);
    if (deliverySpeed === 'priority' && (destState === 'HI' || destState === 'AK')) {
        pretaxCost += 8.50;
    }
    return round(pretaxCost);
};
exports.calculateShippingInternational = async (destinationCountry, weightInKg, deliverySpeed = 'surface', customerType = 'regular') => {
    if (deliverySpeed === 'tracked_packet' || deliverySpeed === 'small_packet_air' || deliverySpeed === 'small_packet_surface') {
        if (weightInKg > 2.0) {
            throw new Error('The maximum weight of a package for a packet is 2.0 kg');
        }
    }
    let deliveryTypeRateCode = deliverySpeed;
    if (deliverySpeed === 'small_packet_air' || deliverySpeed === 'small_packet_surface') {
        deliveryTypeRateCode = 'small_packet';
    }
    // get rate code
    const rateCode = await sqlite3_1.getRateCode('Canada', destinationCountry, deliveryTypeRateCode);
    // handle no rate code returned
    if (!rateCode) {
        throw new Error(`No shipping is available to ${destinationCountry} using ${deliverySpeed}  Try using a different shipping type`);
    }
    // get cost for regular/priority/express
    let shippingCost;
    if (weightInKg <= 30.0) {
        shippingCost = await sqlite3_1.getRate(rateCode, weightInKg, { type: deliverySpeed, country: 'INTERNATIONAL', customerType });
    }
    else {
        const rates = await sqlite3_1.getMaxRate(rateCode, { type: deliverySpeed, country: 'INTERNATIONAL', customerType });
        const difference = weightInKg - 30.0;
        shippingCost = rates.maxRate + (difference / 0.5) * rates.incrementalRate;
    }
    // get fuel rate
    const fuelSurchargePercentage = await exports.getLatestFuelSurcharge('INTERNATIONAL', deliveryTypeRateCode);
    // add fuel rate to final cost
    const pretaxCost = shippingCost * (1 + fuelSurchargePercentage);
    return round(pretaxCost);
};
exports.getLatestFuelSurcharge = (country, deliverySpeed) => {
    return new Promise((resolve, reject) => {
        sqlite3_1.getFuelSurcharge(country, deliverySpeed).then((data) => {
            // calculate if the expiry date is less than 24 hours from now
            // if so, call autoload
            const tomorrowsTimestamp = new Date().valueOf() + 24 * 60 * 60 * 1000;
            if (data.expiryUnixTimestamp <= tomorrowsTimestamp) {
                autoload_1.updateAllFuelSurcharges().then(() => {
                    sqlite3_1.getFuelSurcharge(country, deliverySpeed).then((updatedData) => {
                        resolve(updatedData.percentage);
                    });
                }).catch(err => {
                    log_1.logger.error(`Failed to update fuel surcharges. Fuel surcharge may be out of date. Error: ${err}`);
                    resolve(data.percentage);
                });
            }
            else {
                resolve(data.percentage);
            }
        }).catch(err => {
            reject(err);
        });
    });
};
// math utility function
function round(num) {
    return Math.round(num * 100 + Number.EPSILON) / 100;
}
function extractProvince(postalCode) {
    const postalCodeToProvCodeMapping = {
        "T": "AB",
        "V": "BC",
        "R": "MB",
        "E": "NB",
        "A": "NL",
        "X": "NWT,NU",
        "B": "NS",
        "K": "ON",
        "L": "ON",
        "M": "ON",
        "N": "ON",
        "P": "ON",
        "C": "PE",
        "J": "QC",
        "H": "QC",
        "G": "QC",
        "S": "SK",
        "Y": "YT"
    };
    if (!postalCode || postalCode.trim().length == 0) {
        throw new Error("Postal Code must have at least one letter character");
    }
    const firstChar = postalCode.trim().charAt(0).toUpperCase();
    const province = postalCodeToProvCodeMapping[firstChar];
    if (!province) {
        throw new Error("Invalid first character of postal code");
    }
    return province;
}
