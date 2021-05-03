const axios = require('axios').default;
import { updateFuelSurcharge } from './db/sqlite3';

export interface FuelTable {
    'Domestic Express and Non-Express Services': number,
    'U.S. and International Express Services': number,
    'U.S. and International Non-Express Services': number,
    'Priority Worldwide': number
}
export const updateAllFuelSurcharges = async (fuelSurcharge: FuelTable): Promise<any> => {
    // TODO automate this by GET calling this api:
    // https://www.canadapost-postescanada.ca/cpc/en/support/kb/sending/rates-dimensions/fuel-surcharges-on-mail-and-parcels
    fuelSurcharge['Domestic Express and Non-Express Services'] = parseFloat(fuelSurcharge['Domestic Express and Non-Express Services'].toString().replace(/[^\d.-]/g, ''));
    fuelSurcharge['U.S. and International Express Services'] = parseFloat(fuelSurcharge['U.S. and International Express Services'].toString().replace(/[^\d.-]/g, ''));
    fuelSurcharge['U.S. and International Non-Express Services'] = parseFloat(fuelSurcharge['U.S. and International Non-Express Services'].toString().replace(/[^\d.-]/g, ''));
    fuelSurcharge['Priority Worldwide'] = parseFloat(fuelSurcharge['Priority Worldwide'].toString().replace(/[^\d.-]/g, ''));
    return updateFuelSurcharge(fuelSurcharge);
}
export const getFuelSurchargeTable = async (): Promise<any> => {
    return new Promise<any>((resolve, reject) => {
        axios.get('https://www.canadapost-postescanada.ca/cpc/en/support/kb/sending/rates-dimensions/fuel-surcharges-on-mail-and-parcels').
            then(data => {
                resolve(data.data);
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
    let myDate = new Date(endDate);
    // console.log('End Date:' + myDate.toDateString());
    let serviceCharges: FuelTable = <FuelTable>{};
    for (let i = start + 2; i < end; i++) {
        lines[i] = lines[i].replace(/&nbsp;/g, '');
        if (lines[i].indexOf('<tr>') >= 0) {
            let header = lines[i + 1].replace('</td>', '').replace('<td>', '').replace('<em>', '').replace('</em>', '').replace('<sup>TM</sup>', '');
            let value = parseFloat(lines[i + 2].replace(/&nbsp;/g, '').replace('</td>', '').replace('<td>', '').trimLeft().replace('%', ''));
            serviceCharges[header] = value;
        }
    }
    return serviceCharges;
}