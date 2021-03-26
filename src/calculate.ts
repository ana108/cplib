import { getRateCode, getRate, getProvince, getFuelSurcharge } from './db/sqlite3';

interface Address {
    streetAddress: string, // full street address, number + apartment
    city: string,
    region: string, // province/state etc
    postalCode: string, // postal or zip
    country: string // country code or full country name
}
function mapProvinceToCode(region: string): string {
    const canadianProvinceMap = {
        'ALBERTA': 'AB',
        'BRITISH COLUMBIA': 'BC',
        'MANITOBA': 'MB',
        'NEWFOUNDLAND': 'NL',
        'LABRADOR': 'NL',
        'NORTHWEST TERRITORIES': 'NT',
        'NOVA SCOTIA': 'NS',
        'NUNAVUT': 'NU',
        'ONTARIO': 'ON',
        'PRINCE EDWARD ISLAND': 'PEI',
        'QUEBEC': 'QC',
        'SASKATCHEWAN': 'SK',
        'YUKON': 'YT'
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
    }
    if (region.length == 2) {
        return region;
    } else {
        return canadianProvinceMap[region] || americanProvinceMap[region];
    }
}
export function validateAddress(address: Address): Address {
    const cleanAddress: Address = {
        streetAddress: address.streetAddress,
        city: address.city,
        region: address.region.toUpperCase().trim().replace('  ', ' '),
        postalCode: address.postalCode.toUpperCase().trim().replace(' ', ''),
        country: address.country.toUpperCase().trim().replace(' ', '')
    }
    if (cleanAddress.country === 'CA' || cleanAddress.country === 'CANADA') {
        cleanAddress.country = 'Canada';
        cleanAddress.postalCode = cleanAddress.postalCode.replace('-', '');
        const postalCodeRegExp = new RegExp('^[A-Za-z]{1}[0-9]{1}[A-Za-z]{1}[0-9]{1}[A-Za-z]{1}[0-9]{1}$');
        if (postalCodeRegExp.test(cleanAddress.postalCode)) {
            throw new Error('Invalid postal code. Please make sure its in format of A1A1A1');
        }
        if (!cleanAddress.region) {
            throw new Error('Missing region. Must be specified');
        }
        cleanAddress.region = mapProvinceToCode(cleanAddress.region);
    } else if (cleanAddress.country === 'US' || cleanAddress.country === 'USA' || cleanAddress.country === 'UNITEDSTATES') {
        cleanAddress.country = 'USA';
        if (!cleanAddress.postalCode) {
            throw new Error('Missing zip code');
        }
        cleanAddress.region = mapProvinceToCode(cleanAddress.region);
    }
    return cleanAddress;
}
export function calculateShipping(sourceAddress: Address, destinationAddress: Address, weightInKg: number) {
    let source = validateAddress(sourceAddress);
    let destnation = validateAddress(destinationAddress);
}

export function calculateTax(sourceProvince: string, destinationProvice: string, shippingCost: number, shippingType: string): number {
    let taxCost = 0.00;
    const hstProvince13 = ['ON']
    const hstProvince15 = ['NB', 'NS', 'NL', 'PEI'];
    if (shippingCost < 5.00 && shippingType === 'regular') {
        if (hstProvince13.includes(sourceProvince)) {
            taxCost = shippingCost * 0.13;
        } else if (hstProvince15.includes(sourceProvince)) {
            taxCost = shippingCost * 0.15;
        }
        if (sourceProvince === 'QC') {
            taxCost = shippingCost * 0.14975;
        }
    } else if (shippingType === 'express' || shippingType === 'priority') {
        // HST if mailed to Ontario, New Brunswick, Prince Edward Island, Nova Scotia or Newfoundland and Labrador
        if (hstProvince13.includes(destinationProvice)) {
            taxCost = shippingCost * 0.13;
        } else {
            taxCost = shippingCost * 0.05;
        }
    } else if (shippingCost >= 5.00 && shippingType === 'regular') {
        const gstOnlyProvinces = ['ON', 'NB', 'PEI', 'NS', 'NL', 'QC', 'MB', 'SK', 'AB', 'BC', 'NWT'];
        if (gstOnlyProvinces.includes(sourceProvince)) {
            taxCost = shippingCost * 0.05;
        }
    }
    console.log('Tax Calculated ' + taxCost);
    return taxCost;
}

export function calculateShippingByPostalCode(sourcePostalCode: string, destinationPostalCode: string, weightInKg: number,
    deliverySpeed: string = 'regular'): Promise<any> {
    return new Promise<any>(async (resolve, reject) => {
        // for package dimensions make sure to convert it into a type
        try {
            // get rate code
            const rateCode = await getRateCode(sourcePostalCode, destinationPostalCode);

            // get cost for regular/priority/express
            const shippingCost = await getRate(rateCode, weightInKg, { type: deliverySpeed });
            // get fuel rate
            const fuelSurchargePercentage = await getFuelSurcharge();
            // add fuel rate to final cost
            const pretaxCost = shippingCost * (1 + fuelSurchargePercentage);
            // IF this api call gets too slow; these two calls can be replaced with postal code mappings
            const sourceProvince = await getProvince(sourcePostalCode);
            const destinationProvice = await getProvince(destinationPostalCode);

            // calculate tax
            const finalPrice = pretaxCost + calculateTax(sourceProvince, destinationProvice, pretaxCost, deliverySpeed);
            resolve(round(finalPrice));
        } catch (e) {
            reject(e);
        }
    });
}
// math utility function
function round(num: number): number {
    return Math.round(num * 100 + Number.EPSILON) / 100
}