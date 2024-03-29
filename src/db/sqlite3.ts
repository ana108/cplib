import sqlite3 from 'sqlite3';
import path from 'path';
import { FuelTable } from '../autoload';
import { logger } from '../log';

const dbname = path.join(__dirname, '../resources/cplib.db');
let dbToOpen = dbname;
export let db = new sqlite3.Database(dbToOpen, sqlite3.OPEN_READONLY);
export let writedb = new sqlite3.Database(dbToOpen, sqlite3.OPEN_READWRITE);
export const setDB = async (dbLocation: string) => {
  return new Promise<void>((resolve, reject) => {
    db.close(err => {
      if (err) {
        logger.error(`Error closing DB ${dbname}: Error: ${err}`);
      }
      dbToOpen = dbLocation;
      db = new sqlite3.Database(dbToOpen, sqlite3.OPEN_READONLY);
      writedb.close(error => {
        if (error) {
          logger.error(`Error closing writing DB ${dbname}: Error: ${err}`);
        }
        writedb = new sqlite3.Database(dbToOpen, sqlite3.OPEN_READWRITE);
      });
      resolve();
    });
  });
}
export const setWriteDB = async (dbLocation: string) => {
  return new Promise<void>((resolve, reject) => {
    writedb.close(err => {
      logger.info("Closed previous write db");
      if (err) {
        logger.error(`Error closing written DB ${dbname}: Error: ${err}`);
      }
      dbToOpen = dbLocation;
      writedb = new sqlite3.Database(dbToOpen, sqlite3.OPEN_READWRITE);
      resolve();
    });
  });
}
export const resetDB = async () => {
  return new Promise((resolve, reject) => {
    dbToOpen = dbname;
    db.close(err => {
      if (err) {
        logger.error(`Error closing DB on reset ${dbname} error: ${err}`);
      }
      db = new sqlite3.Database(dbToOpen, sqlite3.OPEN_READONLY);
      resolve(true);
    });
    writedb.close(err => {
      if (err) {
        logger.error(`Error closing write DB on reset ${dbname} : ${err}`);
      }
      writedb = new sqlite3.Database(dbToOpen, sqlite3.OPEN_READWRITE);
    })
  });
}

export const openForWrite = async (): Promise<sqlite3.Database> => {
  return new Promise<sqlite3.Database>((resolve, reject) => {
    const readWriteDB: sqlite3.Database = new sqlite3.Database(dbToOpen, sqlite3.OPEN_READWRITE, err => {
      if (!err) {
        resolve(readWriteDB);
      } else {
        logger.error('Error opening db for write ', err);
        reject(err);
      }
    });
  });
}

export const getRateCode = (source: string, destination: string, delivery_type?: string): Promise<any> => {
  return new Promise(function (resolve, reject) {
    let getRateCodeMapping = `select rate_code from rate_code_mapping where source ='${source}' and (destination like '%${destination}%' OR upper(country) = '${destination}')`;
    if (delivery_type) {
      getRateCodeMapping = `${getRateCodeMapping} and delivery_type = '${delivery_type}'`;
    }
    db.get(getRateCodeMapping, [], (err, row) => {
      if (err) {
        reject(err);
      } else if (!row) {
        reject(new Error('Failed to find rate code for the given postal codes'));
      } else {
        resolve(row["rate_code"]);
      }
    })
  });

}

export const updateFuelSurcharge = async (fuelSurchargeRates: FuelTable): Promise<void> => {
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
  const stmt = writedb.prepare(fuelSurcharge);
  return new Promise<void>((resolve, reject) => {
    Promise.all(values.map(charge => {
      return new Promise<void>((res, rej) => {
        stmt.run(charge, (err) => {
          if (err) {
            rej(err);
          } else {
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
}

export const saveToDb = async (sqlStmt: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    const stmt = writedb.prepare(sqlStmt, err => {
      if (err) {
        logger.debug("Error occurred when preparing statement! " + JSON.stringify(err) + " for statement " + sqlStmt);
        logger.debug(err);
        reject(err);
      }
    });
    stmt.run((error: Error) => {
      if (error) {
        logger.debug("Error occurred! " + JSON.stringify(error) + " for statement " + sqlStmt);
        logger.debug(error);
        reject(error);
      } else {
        resolve('Success');
      }
    });
    stmt.finalize();
  });
}

export interface options {
  country?: string
  weight_type?: string
  type?: string // 'regular' | 'priority' | 'express'
  customerType?: string // 'regular' | 'small_business'
  year?: number
}
export const getRate = (rateCode: string, weight: number,
  opts: options = { country: 'CANADA', weight_type: 'kg', type: 'regular', customerType: 'regular' }): Promise<number> => {
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
    getPrice = 'select price from rates where upper(country) = upper($country) and rate_code = $rateCode and max_weight >= $weight and max_weight <= 30.0 ' + // and year = (select max(year) from rates) 
      'and type = $deliverySpeed and customer_type = $customerType group by(rate_code) having min(price) and max(year)';
  }
  //console.log(getPrice.replace('$country', getPriceParams.$country).replace('$rateCode', getPriceParams.$rateCode).replace('$weight', getPriceParams.$weight.toString()).replace('$deliverySpeed', getPriceParams.$deliverySpeed).replace('$customerType', getPriceParams.$customerType));
  return new Promise<number>((resolve, reject) => {
    const stmt = db.prepare(getPrice);
    stmt.get(getPriceParams, (err, row) => {
      stmt.finalize();
      if (err) {
        reject(err);
      } else if (!row) {
        reject(new Error('Failed to find price for those parameters'));
      } else {
        resolve(parseFloat(row.price));
      }
    });
  });

}

export interface maxRates {
  maxRate: number,
  incrementalRate: number
}
export const getMaxRate = (rateCode: string,
  opts: options = { country: 'CANADA', weight_type: 'kg', type: 'regular', customerType: 'regular' }): Promise<maxRates> => {
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
  return new Promise<maxRates>((resolve, reject) => {
    const stmt = db.prepare(getPrice);
    stmt.all(getMaxRateParams, (err, rows) => {
      stmt.finalize();
      if (err) {
        reject(err);
      } else if (!rows || rows.length < 2) {
        reject(new Error('Failed to find price for those parameters'));
      } else {
        const maxRates: maxRates = {
          maxRate: parseFloat(rows[1].price),
          incrementalRate: parseFloat(rows[0].price)
        };
        resolve(maxRates);
      }
    });
  });

}

export const getProvince = (postalCode: string): Promise<string> => {
  const getProvince = `select province from postal_codes where postal_code like '${postalCode.substr(0, 3)}%' limit 1`;
  return new Promise<string>((resolve, reject) => {
    const stmt = db.prepare(getProvince);
    stmt.get([], (err, row) => {
      stmt.finalize();
      if (err) {
        reject(err);
      } else if (!row) {
        reject(new Error(`No province found for the given postal code ${postalCode}`));
      } else {
        // careful: for NL/NT the province returned is NT,NU which may need to 
        // be handled carefully
        resolve(row.province);
      }
    });
  });
}

export interface FuelSurcharge {
  percentage: number,
  expiryUnixTimestamp: number
}
export const getFuelSurcharge = (country: string, deliveryType: string): Promise<FuelSurcharge> => {
  const getLatestFuelSurcharge = 'select percentage, date from fuel_surcharge where country = $country and delivery_type = $deliveryType order by date desc limit 1';
  return new Promise<FuelSurcharge>((resolve, reject) => {
    const stmt = db.prepare(getLatestFuelSurcharge);
    stmt.get({
      $country: country,
      $deliveryType: deliveryType
    }, (err, row) => {
      stmt.finalize();
      if (err) {
        reject(err);
      } else {
        resolve(<FuelSurcharge>{
          percentage: parseFloat(row.percentage),
          expiryUnixTimestamp: parseFloat(row.date)
        });
      }
    });
  })
}
// For integration tests
export const deleteRatesByYear = async (year: number, customerType?: string): Promise<number> => {
  let deleteSql = `delete from rates where year = ${year}`;
  if (customerType) {
    deleteSql += ` and customer_type = '${customerType}'`;
  }
  const writeDB = await openForWrite();
  return new Promise<number>((resolve, reject) => {

    if (!writeDB) {
      logger.error('Could not open a connection to db');
    }
    writeDB.run(deleteSql, [], function (this: any, err) {
      if (err) {
        reject(err);
      } else {
        resolve(this.changes);
      }
      writeDB.close(err => {
        if (err) {
          logger.warn('Error closing connection to db after deleting year data ', err);
        }
      })
    });
  });
}

export const executeCustomSQL = (sqlStmt: string): Promise<any> => {
  return new Promise<any>((resolve, reject) => {
    db.all(sqlStmt, [], (err, rows) => {
      if (err) {
        reject(sqlStmt);
      } else {
        resolve(rows);
      }
    })
  });
}
export const getHighestYear = (): Promise<number> => {
  const sql = 'select max(year) as year from rates';

  return new Promise<number>((resolve, reject) => {
    const stmt = db.prepare(sql);
    stmt.get([], (err, row) => {
      if (err) {
        reject(err);
      } else if (!row) {
        reject(new Error('Failed to find any year in rates table'));
      } else {
        resolve(parseInt(row.year));
      }
    });
    stmt.finalize();
  });
}