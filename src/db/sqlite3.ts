import sqlite3 from 'sqlite3';

const dbname = '/home/ana/GitHub/cplib/resources/cplib.db';
const db = new sqlite3.Database(dbname, sqlite3.OPEN_READWRITE);
export function getRateCode(sourcePostalCode: string, destinationPostalCode: string): Promise<any> {
  let source = sourcePostalCode.substr(0, 3);
  let destination = destinationPostalCode.substr(0, 3);

  return new Promise(function(resolve, reject){
    let getRateCodeMapping = `select rate_code from rate_code_mapping where source ='${source}' and destination like '%${destination}%'`;
        db.get(getRateCodeMapping, [], (err, row) => {
            if (err) {
              console.log('ERROR ' + JSON.stringify(err));
              reject(err);
            } else {
              console.log('FIRST ROW RECEIVED ' + row["rate_code"]);
              resolve(row["rate_code"]);
            }
        })
    });
  
}
/*
CREATE TABLE RATES (
year integer NOT NULL,
   max_weight decimal(10,3) NOT NULL,
weight_type text DEFAULT 'kg' NOT NULL,
rate_code text NOT NULL,
price decimal(10, 3) NOT NULL,
type text DEFAULT 'regular' NOT NULL,
country text,
FOREIGN KEY (rate_code)
       REFERENCES RATE_CODE_MAPPING (rate_code) 
);

*/
interface options {
  country?: string,
  weight_type?: string,
  type?: string,
  year?: number
}
export function getRate(rateCode: string, weight: number, opts: options = { country: 'Canada', weight_type: 'kg', type: 'regular', year: new Date().getFullYear()}) {
    let getPrice = 'select price from rates where country = ? and rate_code = ? and max_weight > ? ';
}
/*module.exports = {
  initDB(callback) {
    const sqliteDB = new sqlite3.Database(dbname, sqlite3.OPEN_READWRITE, (err) => {
      if (err) {
        logger.info(`error initializing database: ${err}`);
        const errorObj = {
          message: err,
          code: codes.dbInit,
        };
        callback(errorObj);
      } else {
        logger.info('Connecting to the sustext database from wrapper');
        callback(null, true);
      }
    });
    return sqliteDB;
  },
  insert(db, sqlStmt, parameters, callback) {
    const myStmt = db.prepare(sqlStmt, parameters, (err) => {
      if (err) {
        logger.error(errors.dev.failedPrepare, err);
        const errorObj = {
          message: err,
          code: codes.failedPrepareInsert,
        };
        callback(errorObj);
      }
    });
    myStmt.run([], (err) => {
      if (err) {
        logger.error(errors.dev.failedInsert, err);
        const errorObj = {
          message: err,
          code: codes.failedInsert,
        };
        callback(errorObj);
      } else callback(null, true);
    });
  },
  update(db, sqlStmt, parameters, callback) {
    db.run(sqlStmt, parameters, (err) => {
      if (err) {
        logger.error(errors.dev.dbQueryFailed, err);
        const errorObj = {
          message: err,
          code: codes.failedQuery,
        };
        callback(errorObj);
      } else {
        callback(null, true);
      }
    });
  },
  get(db, sqlStmt, parameters, callback) {
    const stmt = db.prepare(sqlStmt, parameters, (err) => {
      if (err) {
        logger.error(errors.dev.failedPrepare, err);
        const errorObj = {
          message: err,
          code: codes.failedPrepareGet,
        };
        callback(errorObj);
      }
    });
    stmt.get([], (err, row) => {
      if (err) {
        logger.error(errors.dev.dbQueryFailed, err);
        const errorObj = {
          message: err,
          code: codes.failedGet,
        };
        callback(errorObj);
      } else {
        callback(null, row);
      }
    });
  },
  find(db, sqlStmt, parameters, callback) {
    const stmt = db.prepare(sqlStmt, parameters, (err) => {
      if (err) {
        logger.error(errors.dev.failedPrepare, err);
        const errorObj = {
          message: err,
          code: codes.findPrepareError,
        };
        callback(errorObj);
      }
    });
    stmt.all([], (err, row) => {
      if (err) {
        logger.error(errors.dev.dbQueryFailed, err);
        const errorObj = {
          message: err,
          code: codes.failedQuery,
        };
        callback(errorObj);
      } else {
        callback(null, row);
      }
    });
  },
}; */
