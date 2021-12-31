# cplib - Canada Post Library
This library calculates the price of shipping a package using canada post. This is a computationally efficient alternative to calculating shipping cost using the canada post api. It is based on the rates provided in these two documents:
Regular Customer: https://www.canadapost-postescanada.ca/tools/pg/prices/CPprices-e.pdf
Small Business: https://www.canadapost-postescanada.ca/tools/pg/prices/SBPrices-e.pdf

Fuel surcharge and tax is included in the cost.

# Installing

# Using CPLib

`javascript
var shippingCalculation = require('../../cplib/build/calculate');
`
Create address objects; source address example:

`javascript
  let sourceAddr = {
    streetAddress: '10 Wellington', // optional for calculating cost
    city: 'Ottawa', // optional
    region: 'ON', // required; for Canadian addressees this is province; for USA its state. For international, its optional
    postalCode: 'K1V2R9', // required for canadian addresses
    country: 'CA' // country code or full country name: Canada, or CA USA or United States are all valid
  };
`
Destination example
`javascript
  let destinationAddr = {
    streetAddress: 'Douglas St', // optional
    city: 'Victoria', // optional
    region: 'BC', // required
    postalCode: 'V8R2E5', // required
    country: 'CA' // country code or full country name
  };
`
American example,
`javascript
  let destinationAddr = {
    streetAddress: '140 E 14th S', // optional
    city: 'New York', // optional
    region: 'NY', // required
    postalCode: '10003', // required
    country: 'USA' // country code or full country name
  };
`
International Example
`javascript
  let destinationAddr = {
    streetAddress: 'YALOVA YOLU ORMAN FİDANLİGİ KARŞISI', // optional
    city: 'Merkez', // optional
    region: 'Bursa', // optional for international
    postalCode: null, // optional for international
    country: 'Turkey' // country code or full country name
  };
`

Example
`javascript
  shippingCalculation.calculateShipping(sourceAddr, destinationAddr, 1.5, 'regular', 'small_business').then(data => {
    console.log('Result: ', data);
    // expected: 23.91
  }).catch(err => {
    console.log(err.message);
  });
`
## Parameters: 
source address object, destination address object, weight of package in kg, delivery speed (optional), customer type (optional) 

### Delivery Speed
Delivery speed is optiona; when left blank it defaults to regular, which is "regular parcel"
If destination is to Canada, the following options are available:
'regular', 'priority', 'express', 'expedited'
However,
Expedited is only an option for small business customers.

If destination is to United States, the following options are available for shipping speeds:
'express', 'priority', 'tracked_packet', 'small_packet', 'expedited'

International:
'priority', 'express', 'air', 'surface', 'tracked_packet', 'small_packet_air', 'small_packet_surface'

Please note that all packets must weigh 2kg or less.

### Customer Type
The default is regular, the other option is small_business, which comes with a 5% discount

# Developing on cplib
## Scripts explained

`bash
npm run test
`
Runs the unit tests

`bash
npm run int
`
Runs the integration tests

`bash
npm run recalibrate
`
Every month, fuel surcharge changes. This updates the integration tests to have the new values. 

`bash
npm run auto
`
This is int/unit tests that specifically test the functionality that extracts data from the pdf files and loads it into the database.