import mysql from 'mysql2';
// const SocksConnection = require('socksjs');
import {} from 'dotenv/config';

// trade business pool mySQL
export const tb_pool = mysql.createPool({
  connectionLimit: 20,
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: 'trade_business',
  connectTimeout: 10000, // Connection timeout in milliseconds
  waitForConnections: true, // Wait for connections to become available
  queueLimit: 0, // Unlimited queue size
});

export const auth_pool = mysql.createPool({
  connectionLimit: 20,
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: 'auth',
  connectTimeout: 10000, // Connection timeout in milliseconds
  waitForConnections: true, // Wait for connections to become available
  queueLimit: 0, // Unlimited queue size
});

// Add error listener to the pool
tb_pool.on('error', (err) => {
  console.error('Database pool error:', err);
});

// verify connections at startup
export const verifyDatabaseConnections = async () => {
  try {
    // Test TB connection
    const tbConn = await getConnection_from_pool(tb_pool);
    tbConn.release();
    console.log('Database connection successful');

    // Add similar tests for other pools
    return true;
  } catch (error) {
    console.error('Database connection verification failed:', error);
    return false;
  }
};

export const executeQuery = async (pool, query, params = []) => {
  let connection;
  try {
    connection = await getConnection_from_pool(pool);
    return await new Promise((resolve, reject) => {
      connection.query(query, params, (error, results) => {
        if (error) reject(error);
        else resolve(results);
      });
    });
  } catch (error) {
    throw error;
  } finally {
    if (connection) connection.release();
  }
};

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

// Graceful shutdown handler
export const closeAllConnections = () => {
  return new Promise((resolve, reject) => {
    tb_pool.end((err) => {
      if (err) {
        console.error('Error closing database pool:', err);
        reject(err);
      } else {
        console.log('Database connections closed successfully');
        resolve();
      }
    });
  });
};
