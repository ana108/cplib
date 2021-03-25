import sqlite3 from 'sqlite3';

const dbname = __dirname + "/../../resources/cplib.db";
const db = new sqlite3.Database(dbname, sqlite3.OPEN_READWRITE);

export function getRateCode(sourcePostalCode: string, destinationPostalCode: string): Promise<any> {
  let source = sourcePostalCode.substr(0, 3);
  let destination = destinationPostalCode.substr(0, 3);

  return new Promise(function (resolve, reject) {
    let getRateCodeMapping = `select rate_code from rate_code_mapping where source ='${source}' and destination like '%${destination}%'`;
    db.get(getRateCodeMapping, [], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row["rate_code"]);
      }
    })
  });

}

export function saveToDb(sqlStmt): Promise<any> {
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

interface options {
  country?: string
  weight_type?: string
  type?: 'regular' | 'priority' | 'express'
  customerType?: 'regular' | 'small_business'
  year?: number
}
export function getRate(rateCode: string, weight: number,
  opts: options = { country: 'Canada', weight_type: 'kg', type: 'regular', customerType: 'regular', year: new Date().getFullYear() }): Promise<number> {
  const getPrice = 'select price from rates where country = $country and rate_code = $rateCode and max_weight >= $weight and year = $year ' +
    'and type = $deliverySpeed and customer_type = $customerType group by(rate_code) having min(price)';

  return new Promise<number>((resolve, reject) => {
    const stmt = db.prepare(getPrice)
    stmt.get({
      $country: opts.country,
      $rateCode: rateCode,
      $weight: weight,
      $year: opts.year,
      $deliverySpeed: opts.type,
      $customerType: opts.customerType
    }, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(parseFloat(row.price));
      }
    });
  });

}

export function getProvince(postalCode: string): Promise<string> {
  const getProvince = 'select province from postal_codes where postal_code = $postalCode';
  return new Promise<string>((resolve, reject) => {
    const stmt = db.prepare(getProvince);
    stmt.get({
      $postalCode: postalCode
    }, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row.province);
      }
    })
  });
}

export function updateFuelSurcharge(percentage: number): Promise<void> {
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

export function getFuelSurcharge(): Promise<number> {
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