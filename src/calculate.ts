import { getRateCode, getRate, getProvince, getFuelSurcharge } from './db/sqlite3';
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


function calculateTax(sourceProvince, shippingCost): number {
    return 0;
}
export function calculateShippingCost(packageDimensions: ShippingDetails): Promise<any> {
    console.log('Calculate Shipping Cost');
    return new Promise<any>(async (resolve, reject) => {
        // for package dimensions make sure to convert it into a type
        try {
            // get rate code
            const rateCode = await getRateCode(packageDimensions.sellerPostalCode, packageDimensions.buyerPostalCode);

            // get weight on kg
            const weightInKg = packageDimensions.bookDimensions.weightInGrams / 1000;
            // get cost for regular/priority/express
            const shippingCost = await getRate(rateCode, weightInKg);
            // get fuel rate
            const fuelSurchargePercentage = await getFuelSurcharge();
            console.log('Fuel Surcharge Returned ' + fuelSurchargePercentage);
            // add fuel rate to final cost
            const pretaxCost = shippingCost * (1 + fuelSurchargePercentage);
            // get province of source for tax purposes
            const sourceProvince = await getProvince(packageDimensions.sellerPostalCode);
            console.log('Source Province ' + sourceProvince);
            const finalPrice = calculateTax(sourceProvince, pretaxCost);
            resolve(round(pretaxCost));
        } catch (e) {
            reject(e);
        }
    });
}
// math utility function
function round(num: number): number {
    return Math.round(num * 100 + Number.EPSILON) / 100
}