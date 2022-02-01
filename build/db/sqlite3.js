"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHighestYear = exports.executeCustomSQL = exports.deleteRatesByYear = exports.getFuelSurcharge = exports.getProvince = exports.getMaxRate = exports.getRate = exports.saveToDb = exports.updateFuelSurcharge = exports.getRateCode = exports.openForWrite = exports.resetDB = exports.setWriteDB = exports.setDB = exports.writedb = exports.db = void 0;
const sqlite3_1 = __importDefault(require("sqlite3"));
const log_1 = require("../log");
const dbname = __dirname + "/../resources/cplib.db";
let dbToOpen = dbname;
exports.db = new sqlite3_1.default.Database(dbToOpen, sqlite3_1.default.OPEN_READONLY);
exports.writedb = new sqlite3_1.default.Database(dbToOpen, sqlite3_1.default.OPEN_READWRITE);
exports.setDB = async (dbLocation) => {
    return new Promise((resolve, reject) => {
        exports.db.close(err => {
            if (err) {
                log_1.logger.error(`Error closing DB ${dbname}: Error: ${err}`);
            }
            dbToOpen = dbLocation;
            exports.db = new sqlite3_1.default.Database(dbToOpen, sqlite3_1.default.OPEN_READONLY);
            exports.writedb.close(error => {
                if (error) {
                    log_1.logger.error(`Error closing writing DB ${dbname}: Error: ${err}`);
                }
                exports.writedb = new sqlite3_1.default.Database(dbToOpen, sqlite3_1.default.OPEN_READWRITE);
            });
            resolve();
        });
    });
};
exports.setWriteDB = async (dbLocation) => {
    return new Promise((resolve, reject) => {
        exports.writedb.close(err => {
            if (err) {
                log_1.logger.error(`Error closing written DB ${dbname}: Error: ${err}`);
            }
            dbToOpen = dbLocation;
            exports.writedb = new sqlite3_1.default.Database(dbToOpen, sqlite3_1.default.OPEN_READWRITE);
            resolve();
        });
    });
};
exports.resetDB = async () => {
    return new Promise((resolve, reject) => {
        dbToOpen = dbname;
        exports.db.close(err => {
            if (err) {
                log_1.logger.error(`Error closing DB on reset ${dbname} error: ${err}`);
            }
            exports.db = new sqlite3_1.default.Database(dbToOpen, sqlite3_1.default.OPEN_READONLY);
            resolve(true);
        });
        exports.writedb.close(err => {
            if (err) {
                log_1.logger.error(`Error closing write DB on reset ${dbname} : ${err}`);
            }
            exports.writedb = new sqlite3_1.default.Database(dbToOpen, sqlite3_1.default.OPEN_READWRITE);
        });
    });
};
exports.openForWrite = async () => {
    return new Promise((resolve, reject) => {
        const readWriteDB = new sqlite3_1.default.Database(dbToOpen, sqlite3_1.default.OPEN_READWRITE, err => {
            if (!err) {
                resolve(readWriteDB);
            }
            else {
                log_1.logger.error('Error opening db for write ', err);
                reject(err);
            }
        });
    });
};
exports.getRateCode = (source, destination, delivery_type) => {
    return new Promise(function (resolve, reject) {
        let getRateCodeMapping = `select rate_code from rate_code_mapping where source ='${source}' and (destination like '%${destination}%' OR upper(country) = '${destination}')`;
        if (delivery_type) {
            getRateCodeMapping = `${getRateCodeMapping} and delivery_type = '${delivery_type}'`;
        }
        exports.db.get(getRateCodeMapping, [], (err, row) => {
            if (err) {
                reject(err);
            }
            else if (!row) {
                reject(new Error('Failed to find rate code for the given postal codes'));
            }
            else {
                resolve(row["rate_code"]);
            }
        });
    });
};
exports.updateFuelSurcharge = async (fuelSurchargeRates) => {
    const expiryDate = fuelSurchargeRates['Expiry_Date'].valueOf();
    const fuelSurcharge = `insert into fuel_surcharge(percentage, date, country, delivery_type) VALUES($percentage, ${expiryDate}, $country, $delivery_type)`;
    const DOMESTIC = fuelSurchargeRates['Domestic Services'] / 100;
    const USA_INTL_PARCEL = fuelSurchargeRates['USA and International Parcel Services'] / 100;
    const USA_INTL_PACKET = fuelSurchargeRates['USA and International Packet Services'] / 100;
    const USA_INTL_PRIORITY = fuelSurchargeRates['Priority Worldwide'] / 100;
    const CANADA = 'Canada';
    const USA = 'USA';
    const INTL = 'INTERNATIONAL';
    const PRIORITY = 'priority';
    const EXPRESS = 'express';
    const REG = 'regular';
    const EXPEDITED = 'expedited';
    const TRACKED_PACKET = 'tracked_packet';
    const SMALL_PACKET = 'small_packet';
    const AIR = 'air';
    const SURFACE = 'surface';
    const values = [{
            $percentage: DOMESTIC,
            $country: CANADA,
            $delivery_type: PRIORITY,
        }, {
            $percentage: DOMESTIC,
            $country: CANADA,
            $delivery_type: EXPRESS,
        }, {
            $percentage: DOMESTIC,
            $country: CANADA,
            $delivery_type: REG,
        }, {
            $percentage: USA_INTL_PARCEL,
            $country: USA,
            $delivery_type: EXPEDITED,
        }, {
            $percentage: USA_INTL_PARCEL,
            $country: USA,
            $delivery_type: EXPRESS,
        }, {
            $percentage: USA_INTL_PRIORITY,
            $country: USA,
            $delivery_type: PRIORITY,
        }, {
            $percentage: USA_INTL_PACKET,
            $country: USA,
            $delivery_type: TRACKED_PACKET,
        }, {
            $percentage: USA_INTL_PACKET,
            $country: USA,
            $delivery_type: SMALL_PACKET,
        }, {
            $percentage: USA_INTL_PRIORITY,
            $country: INTL,
            $delivery_type: PRIORITY,
        }, {
            $percentage: USA_INTL_PARCEL,
            $country: INTL,
            $delivery_type: EXPRESS,
        }, {
            $percentage: USA_INTL_PARCEL,
            $country: INTL,
            $delivery_type: AIR,
        }, {
            $percentage: USA_INTL_PARCEL,
            $country: INTL,
            $delivery_type: SURFACE,
        }, {
            $percentage: USA_INTL_PACKET,
            $country: INTL,
            $delivery_type: SMALL_PACKET,
        }, {
            $percentage: USA_INTL_PACKET,
            $country: INTL,
            $delivery_type: TRACKED_PACKET,
        }];
    const stmt = exports.writedb.prepare(fuelSurcharge);
    return new Promise((resolve, reject) => {
        Promise.all(values.map(charge => {
            return new Promise((res, rej) => {
                stmt.run(charge, (err) => {
                    if (err) {
                        rej(err);
                    }
                    else {
                        res();
                    }
                });
            });
        })).then(_ => {
            stmt.finalize();
            resolve();
        }).catch(err => {
            stmt.finalize();
            reject(err);
        });
    });
};
exports.saveToDb = async (sqlStmt) => {
    return new Promise((resolve, reject) => {
        const stmt = exports.writedb.prepare(sqlStmt, err => {
            if (err) {
                reject(err);
            }
        });
        stmt.run((error) => {
            if (error) {
                reject(error);
            }
            else {
                resolve('Success');
            }
        });
        stmt.finalize();
    });
};
exports.getRate = (rateCode, weight, opts = { country: 'CANADA', weight_type: 'kg', type: 'regular', customerType: 'regular' }) => {
    const defaults = { country: 'CANADA', weight_type: 'kg', type: 'regular', customerType: 'regular' };
    const options = { ...defaults, ...opts };
    let getPrice = 'select price from rates where upper(country) = upper($country) and rate_code = $rateCode and max_weight >= $weight and max_weight <= 30.0 and year = $year ' +
        'and type = $deliverySpeed and customer_type = $customerType group by(rate_code) having min(price)';
    const getPriceParams = {
        $country: options.country,
        $rateCode: rateCode,
        $weight: weight,
        $year: options.year,
        $deliverySpeed: options.type,
        $customerType: options.customerType
    };
    if (!options.year) {
        delete getPriceParams.$year;
        getPrice = 'select price from rates where upper(country) = upper($country) and rate_code = $rateCode and max_weight >= $weight and max_weight <= 30.0 and year = (select max(year) from rates) ' +
            'and type = $deliverySpeed and customer_type = $customerType group by(rate_code) having min(price)';
    }
    // console.log(getPrice.replace('$country', getPriceParams.$country).replace('$rateCode', getPriceParams.$rateCode).replace('$weight', getPriceParams.$weight.toString()).replace('$deliverySpeed', getPriceParams.$deliverySpeed).replace('$customerType', getPriceParams.$customerType));
    return new Promise((resolve, reject) => {
        const stmt = exports.db.prepare(getPrice);
        stmt.get(getPriceParams, (err, row) => {
            stmt.finalize();
            if (err) {
                reject(err);
            }
            else if (!row) {
                reject(new Error('Failed to find price for those parameters'));
            }
            else {
                resolve(parseFloat(row.price));
            }
        });
    });
};
exports.getMaxRate = (rateCode, opts = { country: 'CANADA', weight_type: 'kg', type: 'regular', customerType: 'regular' }) => {
    const defaults = { country: 'CANADA', weight_type: 'kg', type: 'regular', customerType: 'regular' };
    const options = { ...defaults, ...opts };
    let getPrice = 'select price from rates where country = $country and rate_code = $rateCode and year = $year and type = $deliverySpeed ' +
        ' and customer_type = $customerType  order by max_weight desc limit 2';
    const getMaxRateParams = {
        $country: options.country,
        $rateCode: rateCode,
        $year: options.year,
        $deliverySpeed: options.type,
        $customerType: options.customerType
    };
    if (!options.year) {
        delete getMaxRateParams.$year;
        getPrice = 'select price from rates where country = $country and rate_code = $rateCode and year = (select max(year) from rates) and type = $deliverySpeed ' +
            ' and customer_type = $customerType  order by max_weight desc limit 2';
    }
    return new Promise((resolve, reject) => {
        const stmt = exports.db.prepare(getPrice);
        stmt.all(getMaxRateParams, (err, rows) => {
            stmt.finalize();
            if (err) {
                reject(err);
            }
            else if (!rows || rows.length < 2) {
                reject(new Error('Failed to find price for those parameters'));
            }
            else {
                const maxRates = {
                    maxRate: parseFloat(rows[1].price),
                    incrementalRate: parseFloat(rows[0].price)
                };
                resolve(maxRates);
            }
        });
    });
};
exports.getProvince = (postalCode) => {
    const getProvince = `select province from postal_codes where postal_code like '${postalCode.substr(0, 3)}%' limit 1`;
    return new Promise((resolve, reject) => {
        const stmt = exports.db.prepare(getProvince);
        stmt.get([], (err, row) => {
            stmt.finalize();
            if (err) {
                reject(err);
            }
            else if (!row) {
                reject(new Error(`No province found for the given postal code ${postalCode}`));
            }
            else {
                // careful: for NL/NT the province returned is NT,NU which may need to 
                // be handled carefully
                resolve(row.province);
            }
        });
    });
};
exports.getFuelSurcharge = (country, deliveryType) => {
    const getLatestFuelSurcharge = 'select percentage, date from fuel_surcharge where country = $country and delivery_type = $deliveryType order by date desc limit 1';
    return new Promise((resolve, reject) => {
        const stmt = exports.db.prepare(getLatestFuelSurcharge);
        stmt.get({
            $country: country,
            $deliveryType: deliveryType
        }, (err, row) => {
            stmt.finalize();
            if (err) {
                reject(err);
            }
            else {
                resolve({
                    percentage: parseFloat(row.percentage),
                    expiryUnixTimestamp: parseFloat(row.date)
                });
            }
        });
    });
};
// For integration tests
exports.deleteRatesByYear = async (year, customerType) => {
    let deleteSql = `delete from rates where year = ${year}`;
    if (customerType) {
        deleteSql += ` and customer_type = '${customerType}'`;
    }
    const writeDB = await exports.openForWrite();
    return new Promise((resolve, reject) => {
        if (!writeDB) {
            log_1.logger.error('Could not open a connection to db');
        }
        writeDB.run(deleteSql, [], function (err) {
            if (err) {
                reject(err);
            }
            else {
                resolve(this.changes);
            }
            writeDB.close(err => {
                if (err) {
                    log_1.logger.warn('Error closing connection to db after deleting year data ', err);
                }
            });
        });
    });
};
exports.executeCustomSQL = (sqlStmt) => {
    return new Promise((resolve, reject) => {
        exports.db.all(sqlStmt, [], (err, rows) => {
            if (err) {
                reject(sqlStmt);
            }
            else {
                resolve(rows);
            }
        });
    });
};
exports.getHighestYear = () => {
    const sql = 'select max(year) as year from rates';
    return new Promise((resolve, reject) => {
        const stmt = exports.db.prepare(sql);
        stmt.get([], (err, row) => {
            if (err) {
                reject(err);
            }
            else if (!row) {
                reject(new Error('Failed to find any year in rates table'));
            }
            else {
                resolve(parseInt(row.year));
            }
        });
        stmt.finalize();
    });
};
