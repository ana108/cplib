import sqlite3 from 'sqlite3';

const dbname = __dirname+"/../../resources/cplib.db";
const db = new sqlite3.Database(dbname, sqlite3.OPEN_READWRITE);
export function getRateCode(sourcePostalCode: string, destinationPostalCode: string): Promise<any> {
  let source = sourcePostalCode.substr(0, 3);
  let destination = destinationPostalCode.substr(0, 3);

  return new Promise(function(resolve, reject){
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
            console.log('Error! ' + err.message);
            reject(err.message);
        } else {
            resolve('Success');
        }
    });
  });
}

interface options {
  country?: string,
  weight_type?: string,
  type?: string,
  year?: number
}
export function getRate(rateCode: string, weight: number, opts: options = { country: 'Canada', weight_type: 'kg', type: 'regular', year: new Date().getFullYear()}) {
    let getPrice = 'select price from rates where country = ? and rate_code = ? and max_weight > ? ';
}

