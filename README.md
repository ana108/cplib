# cplib - Canada Post Library
This library calculates the shipping cost using canada post. The fuel surcharge and tax is included in the cost.
It does not require any canada post credentials or API calls.
It auto updates itself by querying the canada post public website and populates itself using the pdf files found here:
Regular Customer: https://www.canadapost-postescanada.ca/tools/pg/prices/CPprices-e.pdf
Small Business: https://www.canadapost-postescanada.ca/tools/pg/prices/SBPrices-e.pdf


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
npm run load
`
This deletes the rates from the tables and re-loads them again from PDF. This is called separately from the next 
command because it takes too long to run both the data load and the tests for the data load functionality.

`bash
npm run auto
`
This is int/unit tests that specifically test the functionality that extracts data from the pdf files and loads it into the database.