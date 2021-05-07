import { getRateCode, getRate, getProvince, getFuelSurcharge, maxRates, getMaxRate, FuelSurcharge } from './db/sqlite3';
import { updateAllFuelSurcharges } from './autoload';
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
        country: address.country.toUpperCase().trim()
    }
    if (cleanAddress.country === 'CA' || cleanAddress.country === 'CANADA' || cleanAddress.country === 'US' || cleanAddress.country === 'USA' || cleanAddress.country === 'UNITED STATES') {
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
    } else if (cleanAddress.country === 'US' || cleanAddress.country === 'USA' || cleanAddress.country === 'UNITED STATES') {
        cleanAddress.country = 'USA';
        cleanAddress.region = mapProvinceToCode(cleanAddress.region);
    } else {
        cleanAddress.country = cleanAddress.country.trim().toUpperCase();
    }
    return cleanAddress;
}
export const calculateShipping = async (sourceAddress: Address, destinationAddress: Address, weightInKg: number, deliveryType: string = 'regular', customerType: string = 'regular'): Promise<number> => {
    const deliverySpeed = deliveryType.trim().toLowerCase();
    return new Promise<number>(async (resolve, reject) => {
        try {
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
            let source = validateAddress(sourceAddress);
            let destination = validateAddress(destinationAddress);
            if (destination.country === 'Canada' && canadaDeliverySpeeds.includes(deliverySpeed)) {
                calculateShippingCanada(source.postalCode, destination.postalCode, weightInKg, deliverySpeed, customerType).then(data => {
                    resolve(data);
                }).catch(e => {
                    reject(e);
                });
            } else if (destination.country === 'Canada' && !canadaDeliverySpeeds.includes(deliverySpeed)) {
                throw new Error('Delivery type must be one of the following: regular, priority, express or expedited');
            } else if (destination.country === 'USA' && americanDeliverySpeeds.includes(deliverySpeed)) {
                calculateShippingUSA(source.region, destination.region, weightInKg, deliverySpeed, customerType).then(data => {
                    resolve(data);
                }).catch(e => {
                    reject(e);
                });
            } else if (destination.country === 'USA' && !americanDeliverySpeeds.includes(deliverySpeed)) {
                throw new Error('Delivery type to USA must be one of the following: regular, priority, express, expedited, small_packet or tracked_packet');
            } else if (!internationalDeliverySpeeds.includes(deliverySpeed)) {
                throw new Error('Delivery type must be one of the following: priority,express,air,surface,tracked_packet,small_packet_air,small_packet_surface');
            } else {
                calculateShippingInternational(destination.country, weightInKg, deliverySpeed, customerType).then(data => {
                    resolve(data);
                }).catch(e => {
                    reject(e);
                });
            }

        } catch (e) {
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
    deliverySpeed: string = 'regular', customerType: string = 'regular'): Promise<number> => {
    return new Promise<number>(async (resolve, reject) => {
        try {
            // for package dimensions make sure to convert it into a type

            // get rate code
            let source = sourcePostalCode.substr(0, 3);
            let destination = destinationPostalCode.substr(0, 3);
            const rateCode = await getRateCode(source, destination);

            // get cost for regular/priority/express
            let shippingCost;
            if (weightInKg <= 30.0) {
                shippingCost = await getRate(rateCode, weightInKg, { type: deliverySpeed, customerType });
            } else {
                let rates: maxRates = await getMaxRate(rateCode, { type: deliverySpeed, customerType });

                let difference = weightInKg - 30.0;
                shippingCost = rates.maxRate + (difference / 0.5) * rates.incrementalRate;
            }

            // get fuel rate

            const fuelSurchargePercentage = await getLatestFuelSurcharge('Canada', deliverySpeed);
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
export const calculateShippingUSA = (sourceProvince: string, destState: string, weightInKg: number,
    deliverySpeed: string = 'expedited', customerType: string = 'regular'): Promise<number> => {
    return new Promise<number>(async (resolve, reject) => {
        try {
            let rateCode;
            let shippingCost;
            // for package dimensions make sure to convert it into a type
            if (deliverySpeed === 'priority') {
                rateCode = await getRateCode('Canada', 'USA', deliverySpeed);
            } else if (deliverySpeed === 'express' || deliverySpeed === 'expedited') {
                rateCode = await getRateCode(sourceProvince, destState, deliverySpeed);
            } else if (deliverySpeed === 'tracked_packet' || deliverySpeed === 'small_packet') {
                if (weightInKg > 2.0) {
                    reject('The maximum weight of a package for a packet is 2.0 kg');
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
                shippingCost = await getRate(rateCode, weightInKg, { country: countryDeliveringTo, type: deliverySpeed, customerType });
            } else {
                let rates: maxRates = await getMaxRate(rateCode, { country: countryDeliveringTo, type: deliverySpeed, customerType });

                let difference = weightInKg - 30.0;
                shippingCost = rates.maxRate + (difference / 0.5) * rates.incrementalRate;
            }

            // get fuel rate
            const fuelSurchargePercentage = await getLatestFuelSurcharge('USA', deliverySpeed);
            // add fuel rate to final cost
            let pretaxCost = shippingCost * (1 + fuelSurchargePercentage);
            if (deliverySpeed === 'priority' && (destState === 'HI' || destState === 'AK')) {
                pretaxCost += 8.50;
            }

            resolve(round(pretaxCost));
        } catch (e) {
            reject(e);
        }

    });
}
export const calculateShippingInternational = (destinationCountry: string, weightInKg: number,
    deliverySpeed: string = 'surface', customerType: string = 'regular'): Promise<number> => {
    return new Promise<number>(async (resolve, reject) => {
        try {

            if (deliverySpeed === 'tracked_packet' || deliverySpeed === 'small_packet_air' || deliverySpeed === 'small_packet_surface') {
                if (weightInKg > 2.0) {
                    reject('The maximum weight of a package for a packet is 2.0 kg');
                }
            }
            let deliveryTypeRateCode = deliverySpeed;
            if (deliverySpeed === 'small_packet_air' || deliverySpeed === 'small_packet_surface') {
                deliveryTypeRateCode = 'small_packet';
            }
            // get rate code
            const rateCode = await getRateCode('Canada', destinationCountry, deliveryTypeRateCode);
            // handle no rate code returned
            if (!rateCode) {
                throw new Error(`No shipping is available to ${destinationCountry} using ${deliverySpeed}  Try using a different shipping type`);
            }
            // get cost for regular/priority/express
            let shippingCost;
            if (weightInKg <= 30.0) {
                shippingCost = await getRate(rateCode, weightInKg, { type: deliverySpeed, country: 'INTERNATIONAL', customerType });
            } else {
                let rates: maxRates = await getMaxRate(rateCode, { type: deliverySpeed, country: 'INTERNATIONAL', customerType });

                let difference = weightInKg - 30.0;
                shippingCost = rates.maxRate + (difference / 0.5) * rates.incrementalRate;
            }

            // get fuel rate
            const fuelSurchargePercentage = await getLatestFuelSurcharge('INTERNATIONAL', deliveryTypeRateCode);
            // add fuel rate to final cost
            const pretaxCost = shippingCost * (1 + fuelSurchargePercentage);

            resolve(round(pretaxCost));
        } catch (e) {
            reject(e);
        }

    });
}
export const getLatestFuelSurcharge = (country: string, deliverySpeed): Promise<number> => {
    return new Promise((resolve, reject) => {
        getFuelSurcharge(country, deliverySpeed).then((data: FuelSurcharge) => {
            // calculate if the expiry date is less than 24 hours from now
            // if so, call autoload
            let tomorrowsTimestamp = new Date().valueOf() + 24 * 60 * 60 * 1000;
            if (data.expiryUnixTimestamp <= tomorrowsTimestamp) {
                updateAllFuelSurcharges().then(() => {
                    getFuelSurcharge(country, deliverySpeed).then((updatedData: FuelSurcharge) => {
                        resolve(updatedData.percentage);
                    })
                }).catch(err => {
                    console.log('Error on updating table, returning old values', err);
                    resolve(data.percentage);
                })
            } else {
                resolve(data.percentage);
            }
        }).catch(err => {
            reject(err);
        });
    });
}
// math utility function
function round(num: number): number {
    return Math.round(num * 100 + Number.EPSILON) / 100
}