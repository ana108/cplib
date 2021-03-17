import { getRateCode } from './db/sqlite3';
interface PackageDimensions {
    lengthInCM: number,
    widthInCM: number,
    heightInCM: number,
    weightInGrams: number,
    pageCount: number 
};
interface ShippingDetails {
    bookDimensions: PackageDimensions,
    sellerCountry: string,
    sellerPostalCode: string,
    buyerPostalCode: string
}
const shippingInformation = {
    bookDimensions: {
      lengthInCM: 22.3,
      widthInCM: 15.2,
      heightInCM: 1.2,
      weightInGrams: 966,
      pageCount: 216,
    },
    sellerCountry: 'CA',
    sellerPostalCode: 'J9H5V8',
    buyerPostalCode: 'K1G0E6',
  };
export function calculateShippingCost(packageDimensions: ShippingDetails): Promise<any> {
    console.log('Calculate Shipping Cost');
    return new Promise<any> (async (resolve, reject) => {
        // truncate source and destination to be the first 3 chars
        // for package dimensions make sure to convert it into a type
        try {
            // get rate code
            let rateCode = await getRateCode(packageDimensions.sellerPostalCode, packageDimensions.buyerPostalCode);

            // get weight on kg
            let weightInKg = packageDimensions.bookDimensions.weightInGrams/1000;
            // get cost for priority
            // get province of source
            // calculate final cost
            // get fuel rate
            // add fuel rate to final cost
        } catch(e) {
            console.log('Error! ' + JSON.stringify(e));
        }

    });
}