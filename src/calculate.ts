import { getRateCode, getRate, getProvince, getFuelSurcharge, maxRates, getMaxRate } from './db/sqlite3';

export interface Address {
    streetAddress: string, // full street address, number + apartment
    city: string,
    region: string, // province/state etc
    postalCode: string, // postal or zip
    country: string // country code or full country name
}
export const mapProvinceToCode = (region: string): string => {
    const canadianProvinceMap = {
        'ALBERTA': 'AB',
        'BRITISH COLUMBIA': 'BC',
        'MANITOBA': 'MB',
        'NEWFOUNDLAND': 'NL',
        'LABRADOR': 'NL',
        'NORTHWEST TERRITORIES': 'NWT', // think about this
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
    }
    if ((region.length == 2 || region.length === 3)
        && (Object.values(canadianProvinceMap).includes(region) || Object.values(americanProvinceMap).includes(region))) {
        return region;
    } else if (canadianProvinceMap[region] || americanProvinceMap[region]) {
        return canadianProvinceMap[region] || americanProvinceMap[region];
    } else {
        throw new Error('The region provided is not a valid region');
    }
}
export const validateAddress = (address: Address): Address => {
    if (!address || !address.country) {
        throw new Error('Missing value or missing country property of the address');
    }
    const cleanAddress: Address = {
        streetAddress: address.streetAddress,
        city: address.city,
        region: address.region,
        postalCode: address.postalCode,
        country: address.country.toUpperCase().trim().replace(' ', '')
    }
    if (cleanAddress.country === 'CA' || cleanAddress.country === 'CANADA' || cleanAddress.country === 'US' || cleanAddress.country === 'USA' || cleanAddress.country === 'UNITEDSTATES') {
        if (!address.postalCode || !address.region) {
            throw new Error('For north american shipments, region and zip code must be provided.');
        } else {
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
        cleanAddress.region = mapProvinceToCode(cleanAddress.region);
    } else if (cleanAddress.country === 'US' || cleanAddress.country === 'USA' || cleanAddress.country === 'UNITEDSTATES') {
        cleanAddress.country = 'USA';
        cleanAddress.region = mapProvinceToCode(cleanAddress.region);
    }
    return cleanAddress;
}
export const calculateShipping = (sourceAddress: Address, destinationAddress: Address, weightInKg: number, deliverySpeed: string = 'regular'): Promise<number> => {
    return new Promise<number>((resolve, reject) => {
        try {
            if (!weightInKg || weightInKg <= 0) {
                throw new Error('Weight must be present and be a non-negative number');
            }

            if (isNaN(weightInKg)) {
                throw new Error('Weight must be a numeric value');
            }

            // TODO these dont apply to american or international
            const validDelivery = ['regular', 'priority', 'express'];
            if (!validDelivery.includes(deliverySpeed.toLocaleLowerCase())) {
                throw new Error('Delivery type must be one of the following: regular, priority or express');
            }

            let source = validateAddress(sourceAddress);
            let destination = validateAddress(destinationAddress);
            // TODO expedited
            let americanDeliverySpeeds: string[] = ['express', 'priority', 'tracked_packet', 'small_packet'];
            if (destination.country === 'Canada') {
                calculateShippingCanada(source.postalCode, destination.postalCode, weightInKg, deliverySpeed).then(data => {
                    resolve(data);
                }).catch(e => {
                    reject(e);
                });
            } else if (destination.country === 'USA' && americanDeliverySpeeds.includes(deliverySpeed)) {
                calculateShippingUSA(source.region, destination.region, weightInKg, deliverySpeed).then(data => {
                    resolve(data);
                }).catch(e => {
                    reject(e);
                });
            } else {
                // TODO international stuff
            }

        } catch (e) {
            console.log('Error! ' + e.message);
            reject(e);
        }
    });
}

export const calculateTax = (sourceProvince: string, destinationProvice: string, shippingCost: number, shippingType: string): number => {
    let taxCost = 0.00;
    const hstProvince13 = ['ON']
    const hstProvince15 = ['NB', 'NS', 'NL', 'PEI'];
    // where does NT/NU/YK fit into all this?
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
        const gstOnlyProvinces = ['ON', 'NB', 'PEI', 'NS', 'NL', 'QC', 'MB', 'SK', 'AB', 'BC', 'NWT', 'NWT,NU', 'YT'];
        if (gstOnlyProvinces.includes(sourceProvince)) {
            taxCost = shippingCost * 0.05;
        }
    }
    return taxCost;
}
export const calculateShippingCanada = (sourcePostalCode: string, destinationPostalCode: string, weightInKg: number,
    deliverySpeed: string = 'regular'): Promise<number> => {
    return new Promise<number>(async (resolve, reject) => {
        try {
            // for package dimensions make sure to convert it into a type

            // get rate code
            const rateCode = await getRateCode(sourcePostalCode, destinationPostalCode);

            // get cost for regular/priority/express
            let shippingCost;
            if (weightInKg <= 30.0) {
                shippingCost = await getRate(rateCode, weightInKg, { type: deliverySpeed });
            } else {
                let rates: maxRates = await getMaxRate(rateCode, { type: deliverySpeed });

                let difference = weightInKg - 30.0;
                shippingCost = rates.maxRate + (difference / 0.5) * rates.incrementalRate;
            }

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
export const calculateShippingUSA = (source: string, dest: string, weightInKg: number,
    deliverySpeed: string = 'regular'): Promise<number> => {
    return new Promise<number>(async (resolve, reject) => {
        try {
            let rateCode;
            let shippingCost;
            // for package dimensions make sure to convert it into a type
            if (deliverySpeed === 'priority') {
                rateCode = await getRateCode(source, dest);
                // TODO do international, but if province is alaksa or hawaii, add 8.50
            } else if (deliverySpeed === 'express') {
                rateCode = await getRateCode(source, dest);
            } else if (deliverySpeed === 'tracked_packet' || deliverySpeed === 'small_packet') {
                if (weightInKg > 2.0) {
                    reject('The maximum weight of a package for a packet is 2.0 kg');
                }
                rateCode = '1';
                // skip the rate code, and go straight to getting rate
                // pick any rate between 1 and 7; they all have the same values
            }

            if (weightInKg <= 30.0) {
                shippingCost = await getRate(rateCode, weightInKg, { country: 'USA', type: deliverySpeed });
            } else {
                let rates: maxRates = await getMaxRate(rateCode, { country: 'USA', type: deliverySpeed });

                let difference = weightInKg - 30.0;
                shippingCost = rates.maxRate + (difference / 0.5) * rates.incrementalRate;
            }

            // get fuel rate
            const fuelSurchargePercentage = await getFuelSurcharge();
            // add fuel rate to final cost
            const pretaxCost = shippingCost * (1 + fuelSurchargePercentage);

            resolve(round(pretaxCost));
        } catch (e) {
            reject(e);
        }

    });
}
/*export const calculateShippingInternational = (destinationCountry: string, weightInKg: number,
    deliverySpeed: string = 'regular'): Promise<number> => {
    return new Promise<number>(async (resolve, reject) => {
        try {
            
            // get rate code
            const rateCode = await getRateCode(sourcePostalCode, destinationPostalCode);

            // get cost for regular/priority/express
            let shippingCost;
            if (weightInKg <= 30.0) {
                shippingCost = await getRate(rateCode, weightInKg, { type: deliverySpeed });
            } else {
                let rates: maxRates = await getMaxRate(rateCode, { type: deliverySpeed });

                let difference = weightInKg - 30.0;
                shippingCost = rates.maxRate + (difference / 0.5) * rates.incrementalRate;
            }

            // get fuel rate
            const fuelSurchargePercentage = await getFuelSurcharge();
            // add fuel rate to final cost
            const pretaxCost = shippingCost * (1 + fuelSurchargePercentage);

            resolve(round(pretaxCost));
        } catch (e) {
            reject(e);
        }

    });
}*/
// math utility function
function round(num: number): number {
    return Math.round(num * 100 + Number.EPSILON) / 100
}