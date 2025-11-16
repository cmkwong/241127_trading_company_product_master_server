import * as dbConn from '../utils/dbConn.js';
import logger from '../utils/logger.js';

// execute array of query
export const executeQueries = (pool, stmts) => {
  // stmts = array[]
  return new Promise((resolve, reject) => {
    if (stmts.length === 0) resolve(true);
    // getting connection
    pool.getConnection((err, connection) => {
      if (err) reject(err);
      // create transcation, run query one-by-one
      connection.beginTransaction((err) => {
        let queryResults = [];
        if (err) reject(err);
        for (const stmt of stmts) {
          connection.query(stmt, (err, result, field) => {
            if (err) {
              logger.error(stmt);
              logger.error(err.errno);
              logger.error(err.code);
              logger.error(err.sqlMessage);
              reject(err);
            }
            queryResults.push(result);
          });
        }
        connection.commit((err) => {
          if (err) {
            connection.rollback();
            reject(err);
          }
          connection.release();
          resolve(queryResults);
        });
      });
    });
  });
};

// execute just one query
export const executeQuery = (pool, stmt, params = []) => {
  return new Promise((resolve, reject) => {
    if (!stmt) resolve(true);
    // getting connection
    pool.getConnection((err, connection) => {
      if (err) reject(err);
      // execute the stmt with parameters if provided
      connection.query(stmt, params, (err, result, field) => {
        if (err) {
          logger.error(stmt);
          logger.error(err.errno);
          logger.error(err.code);
          logger.error(err.sqlMessage);
          reject(err);
        }
        connection.release();
        resolve(result);
      });
    });
  });
};

// forming the INSERT/REPLACE statments by data (json data) [Faster]
export const getInsertStmts = (tableName, data, command = 'i') => {
  let insertCommand = command === 'i' ? 'INSERT IGNORE' : 'REPLACE';
  if (!data || data.length === 0) return '';
  let stmts = [];
  // build the column names
  let colsStr = Object.keys(data[0]).join(', ');
  // build the values
  let row_values_list = [];
  for (let i in data) {
    // loop for each row
    let row_values = [];
    for (let [key, value] of Object.entries(data[i])) {
      if (typeof value === 'string') {
        // if (!value) continue;
        value = value.replace(/'/g, "\\'");
      }
      row_values.push(value); // [v1, v2, v3, ...]
    }
    row_values_list.push(`('${row_values.join("', '")}')`); // ["('v1', 'v2', 'v3', ...)", "('v1', 'v2', 'v3', ...)", ... ]
    // group into group stmt
    if (i > 0 && i % 10000 === 0) {
      stmts.push(
        `${insertCommand} ${tableName} (${colsStr}) VALUES ${row_values_list.join(
          ', '
        )};`
      );
      row_values_list = [];
    }
  }
  // tailed data
  if (row_values_list.length > 0) {
    stmts.push(
      `${insertCommand} ${tableName} (${colsStr}) VALUES ${row_values_list.join(
        ', '
      )};`
    );
  }
  return stmts;
};

// clear the table
export const clearTable = (pool, tableName) => {
  return new Promise((resolve, reject) => {
    let stmt = `TRUNCATE TABLE ${tableName};`;
    // clear table
    executeQueries(pool, [stmt])
      .then((result) => {
        resolve(result);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

// create table if not exist
export const createTable = (pool, tableName, schemaObj) => {
  return new Promise((resolve, reject) => {
    let schemaArr = [];
    for (const fieldName in schemaObj) {
      schemaArr.push(`${fieldName} ${schemaObj[fieldName]}`);
    }
    let schemaStr = schemaArr.join(', ');
    // stmt create
    let stmt = `CREATE TABLE IF NOT EXISTS ${tableName} (${schemaStr});`;
    executeQuery(pool, stmt)
      .then((result) => {
        resolve(result);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

// upload data from JSON format
export const uploadData = (pool, tableName, data, command = 'i') => {
  // data is object(JSON) format
  // command = i: INSERT; command = r: REPLACE
  return new Promise((resolve, reject) => {
    let stmts = getInsertStmts(tableName, data, command);
    // insert the data
    executeQueries(pool, stmts)
      .then((result) => {
        resolve(result);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

// getting the table row count
export const rowTotal = (pool, tableName) => {
  return new Promise((resolve, reject) => {
    let stmt = `SELECT COUNT(1) as count FROM ${tableName};`; // COUNT(1) for first column (saving time)
    executeQuery(pool, stmt)
      .then((result) => {
        resolve(result);
      })
      .catch((err) => {
        reject(err);
      });
  });
};
