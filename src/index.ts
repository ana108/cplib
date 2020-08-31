import { calculateShippingCost } from './calculate';
exports.calculateShippingCost = function(sourceAddress: any, destinationAddress: any, packageDetails: any): any {
    return calculateShippingCost(sourceAddress, destinationAddress, packageDetails);
}