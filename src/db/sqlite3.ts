import sqlite3 from 'sqlite3';

const dbname = __dirname + "/../../resources/cplib.db";
export const db = new sqlite3.Database(dbname, sqlite3.OPEN_READWRITE);

export const getRateCode = (sourcePostalCode: string, destinationPostalCode: string): Promise<any> => {
  let source = sourcePostalCode.substr(0, 3);
  let destination = destinationPostalCode.substr(0, 3);

  return new Promise(function (resolve, reject) {
    let getRateCodeMapping = `select rate_code from rate_code_mapping where source ='${source}' and destination like '%${destination}%'`;
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
    const stmt = db.prepare(sqlStmt);
    stmt.run([], (err: Error) => {
      if (err) {
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
  opts: options = { country: 'Canada', weight_type: 'kg', type: 'regular', customerType: 'regular', year: new Date().getFullYear() }): Promise<number> => {
  let defaults = { country: 'Canada', weight_type: 'kg', type: 'regular', customerType: 'regular', year: new Date().getFullYear() };
  let options = { ...defaults, ...opts };
  const getPrice = 'select price from rates where country = $country and rate_code = $rateCode and max_weight >= $weight and year = $year ' +
    'and type = $deliverySpeed and customer_type = $customerType group by(rate_code) having min(price)';
  return new Promise<number>((resolve, reject) => {
    const stmt = db.prepare(getPrice)
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
  opts: options = { country: 'Canada', weight_type: 'kg', type: 'regular', customerType: 'regular', year: new Date().getFullYear() }): Promise<maxRates> => {
  let defaults = { country: 'Canada', weight_type: 'kg', type: 'regular', customerType: 'regular', year: new Date().getFullYear() };
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

export const updateFuelSurcharge = (percentage: number): Promise<void> => {
  const addFuelSurcharge = 'insert into fuel_surcharge values($percentage, strftime(\'%s\', \'now\'));';
  return new Promise<void>((resolve, reject) => {
    if (percentage < 0.0 || percentage > 100.0) {
      reject('Percentage must be specified between 0.00 and 99.99');
    }
    const stmt = db.prepare(addFuelSurcharge);
    stmt.run({
      $percentage: percentage
    }, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    })
  });
}

export const getFuelSurcharge = (): Promise<number> => {
  const getLatestFuelSurcharge = 'select percentage from fuel_surcharge order by date desc limit 1';
  return new Promise<number>((resolve, reject) => {
    const stmt = db.prepare(getLatestFuelSurcharge);
    stmt.get([], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(parseFloat(row.percentage));
      }
    });
  })
}