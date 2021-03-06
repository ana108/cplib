import { join } from 'path';
import sqlite3 from 'sqlite3';
import { FuelTable } from '../autoload';

let dbname = __dirname + "/../resources/cplib.db";
export let db = new sqlite3.Database(dbname, sqlite3.OPEN_READWRITE);

export const setDB = (dbLocation: string) => {
  db = new sqlite3.Database(dbLocation, sqlite3.OPEN_READWRITE);
}
export const resetDB = () => {
  db = new sqlite3.Database(dbname, sqlite3.OPEN_READWRITE);
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

export const saveToDb = (sqlStmt: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    const stmt = db.prepare(sqlStmt, err => {
      if (err) {
        console.log('ERROR SQL ' + sqlStmt);
        reject(err);
      }
    });
    stmt.run((err: Error) => {
      if (err) {
        console.log('ERROR SQL ' + sqlStmt);
        reject(err.message);
      } else {
        resolve('Success');
      }
    });
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
  opts: options = { country: 'CANADA', weight_type: 'kg', type: 'regular', customerType: 'regular', year: new Date().getFullYear() }): Promise<number> => {
  let defaults = { country: 'CANADA', weight_type: 'kg', type: 'regular', customerType: 'regular', year: new Date().getFullYear() };
  let options = { ...defaults, ...opts };
  const getPrice = 'select price from rates where upper(country) = upper($country) and rate_code = $rateCode and max_weight >= $weight and max_weight <= 30.0 and year = $year ' +
    'and type = $deliverySpeed and customer_type = $customerType group by(rate_code) having min(price)';
  return new Promise<number>((resolve, reject) => {
    const stmt = db.prepare(getPrice);
    stmt.get({
      $country: options.country,
      $rateCode: rateCode,
      $weight: weight,
      $year: options.year,
      $deliverySpeed: options.type,
      $customerType: options.customerType
    }, (err, row) => {
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
};
export const getMaxRate = (rateCode: string,
  opts: options = { country: 'CANADA', weight_type: 'kg', type: 'regular', customerType: 'regular', year: new Date().getFullYear() }): Promise<maxRates> => {
  let defaults = { country: 'CANADA', weight_type: 'kg', type: 'regular', customerType: 'regular', year: new Date().getFullYear() };
  let options = { ...defaults, ...opts };
  const getPrice = 'select price from rates where country = $country and rate_code = $rateCode and year = $year and type = $deliverySpeed ' +
    ' and customer_type = $customerType  order by max_weight desc limit 2';
  return new Promise<maxRates>((resolve, reject) => {
    const stmt = db.prepare(getPrice);
    stmt.all({
      $country: options.country,
      $rateCode: rateCode,
      $year: options.year,
      $deliverySpeed: options.type,
      $customerType: options.customerType
    }, (err, rows) => {
      if (err) {
        reject(err);
      } else if (!rows || rows.length < 2) {
        reject(new Error('Failed to find price for those parameters'));
      } else {
        let maxRates: maxRates = {
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
      if (err) {
        reject(err);
      } else if (!row) {
        reject(new Error(`No province found for the given postal code ${postalCode}`));
      } else {
        // careful: for NL/NT the province returned is NT,NU which may need to 
        // be handled carefully
        resolve(row.province);
      }
    })
  });
}

export const updateFuelSurcharge = (fuelSurchargeRates: FuelTable): Promise<void[]> => {
  let expiryDate = fuelSurchargeRates['Expiry_Date'].valueOf();
  const fuelSurcharge = `insert into fuel_surcharge(percentage, date, country, delivery_type) VALUES($percentage, ${expiryDate}, $country, $delivery_type)`;
  const DOMESTIC = fuelSurchargeRates['Domestic Express and Non-Express Services'] / 100;
  const USA_INTL_EXPRESS = fuelSurchargeRates['U.S. and International Express Services'] / 100;
  const USA_INTL_NON_EXPRESS = fuelSurchargeRates['U.S. and International Non-Express Services'] / 100;
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

  let values = [{
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
    $percentage: USA_INTL_NON_EXPRESS,
    $country: USA,
    $delivery_type: EXPEDITED,
  }, {
    $percentage: USA_INTL_EXPRESS,
    $country: USA,
    $delivery_type: EXPRESS,
  }, {
    $percentage: USA_INTL_PRIORITY,
    $country: USA,
    $delivery_type: PRIORITY,
  }, {
    $percentage: USA_INTL_NON_EXPRESS,
    $country: USA,
    $delivery_type: TRACKED_PACKET,
  }, {
    $percentage: USA_INTL_NON_EXPRESS,
    $country: USA,
    $delivery_type: SMALL_PACKET,
  }, {
    $percentage: USA_INTL_PRIORITY,
    $country: INTL,
    $delivery_type: PRIORITY,
  }, {
    $percentage: USA_INTL_EXPRESS,
    $country: INTL,
    $delivery_type: EXPRESS,
  }, {
    $percentage: USA_INTL_EXPRESS,
    $country: INTL,
    $delivery_type: AIR,
  }, {
    $percentage: USA_INTL_NON_EXPRESS,
    $country: INTL,
    $delivery_type: SURFACE,
  }, {
    $percentage: USA_INTL_NON_EXPRESS,
    $country: INTL,
    $delivery_type: SMALL_PACKET,
  }, {
    $percentage: USA_INTL_NON_EXPRESS,
    $country: INTL,
    $delivery_type: TRACKED_PACKET,
  }];
  const stmt = db.prepare(fuelSurcharge);
  return Promise.all(values.map(charge => {
    return new Promise<void>((resolve, reject) => {
      stmt.run(charge, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }));
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
      if (err) {
        reject(err);
      } else {
        resolve(<FuelSurcharge>{
          percentage: parseFloat(row.percentage),
          expiryUnixTimestamp: parseFloat(row.date)
        });
        // resolve(parseFloat(row.percentage));
      }
    });
  })
}
// For integration tests
export const deleteRatesByYear = (year: number): Promise<number> => {
  const deleteSql = `delete from rates where year = ${year}`;
  return new Promise<number>((resolve, reject) => {
    db.run(deleteSql, [], function (err) {
      if (err) {

        reject(err);
      } else {
        const self: any = this!;
        resolve(self.changes);
      }
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