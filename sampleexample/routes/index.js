var express = require('express');
var router = express.Router();
var shippingCalculate = require('cplib');
/* GET home page. */
router.get('/', function (req, res, next) {
  let sourceAddr = {
    streetAddress: '812 Terravita Pvt', // full street address, number + apartment
    city: 'Ottawa',
    region: 'ON', // province/state etc
    postalCode: 'K1V2R9', // postal or zip
    country: 'CA' // country code or full country name
  };
  let destinationAddr = {
    streetAddress: '3303 Bowker Ave', // full street address, number + apartment
    city: 'Victoria',
    region: 'BC', // province/state etc
    postalCode: 'V8R2E5', // postal or zip
    country: 'Turkey' // country code or full country name
  };
  shippingCalculate.calculateShipping(sourceAddr, destinationAddr, 1.5, 'surface').then(data => {
    console.log('Result: ' + JSON.stringify(data));
    // expected: 23.91
  }).catch(err => {
    console.log(err.message);
  });
  res.render('index', { title: 'Express' });
});

router.get('/fuelsurcharge', function (req, res, next) {
  res.render('index', { title: 'Express', data: dt, serviceCharges });
});


module.exports = router;
