import mysql from 'mysql2';
// const SocksConnection = require('socksjs');
import {} from 'dotenv/config';

// workflow dev mySQL
export const bpm = mysql.createPool({
  connectionLimit: 20,
  host: process.env.BPM_HOST,
  port: process.env.BPM_PORT,
  user: process.env.MYSQL_BPM_USER,
  password: process.env.MYSQL_BPM_PW,
  database: process.env.MYSQL_BPM_DATABASE,
});

// workflow prod mySQL
export const bpm0 = mysql.createPool({
  connectionLimit: 20,
  host: process.env.BPM_HOST0,
  port: process.env.BPM_PORT0,
  user: process.env.MYSQL_BPM_USER0,
  password: process.env.MYSQL_BPM_PW0,
  database: process.env.MYSQL_BPM_DATABASE0,
});

// apdc-dc01 mySQL SSME data
export const ssmeData = mysql.createPool({
  connectionLimit: 20,
  host: process.env.SSME_HOST,
  user: process.env.MYSQL_SSME_USER,
  password: process.env.MYSQL_SSME_PW,
  database: process.env.MYSQL_SSME_DATABASE,
  multipleStatements: true,
});

// exports.machinePool = mysql.createPool({
//   connectionLimit: 20,
//   host: process.env.SSME_HOST,
//   user: process.env.MYSQL_SSME_USER,
//   password: process.env.MYSQL_SSME_PW,
//   database: process.env.MYSQL_MACHINE_DATABASE,
// });

// apdc-dc01 mySQL SSME general
export const ssmeGeneral = mysql.createPool({
  connectionLimit: 20,
  host: process.env.SSME_HOST,
  port: process.env.SSME_PORT,
  user: process.env.MYSQL_SSME_USER,
  password: process.env.MYSQL_SSME_PW,
  database: process.env.MYSQL_GENERAL_DATABASE,
});

// getting connection from pool
export const getConnection_from_pool = (pool) => {
  return new Promise((resolve, reject) => {
    if (!pool) return reject('Getting Connection Error.');
    pool.getConnection((err, connection) => {
      if (err) {
        return reject(err);
      }
      resolve(connection);
    });
  });
};

// get pools connected
// getPool().then(({ bpm, bpm0, ssmeData, ssmeGeneral }) => {
//   module.exports.bpm = bpm;
//   module.exports.bpm0 = bpm0;
//   module.exports.ssmeData = ssmeData;
//   module.exports.ssmeGeneral = ssmeGeneral;
// });

// exports.getPool = getPool;
// exports.getConnection_from_pool = getConnection_from_pool;
