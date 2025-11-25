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

/**
 * Execute a SQL query using promise-based API
 * @param {string} sql - SQL query to execute
 * @param {Array} [params=[]] - Query parameters
 * @param {Object} [options] - Query options
 * @param {string} [options.database='trade_business'] - Database to use ('trade_business' or 'auth')
 * @returns {Promise<Array>} Query results
 */
export const executeQuery = async (sql, params = [], options = {}) => {
  const database = options.database || 'trade_business';
  const pool = database === 'auth' ? auth_pool : tb_pool;

  try {
    // Use the promise() method to get a promise-based connection
    const promisePool = pool.promise();
    const [rows] = await promisePool.query(sql, params);
    return rows;
  } catch (error) {
    console.error('Query execution error:', error);
    throw new Error(`Query execution failed: ${error.message}`);
  }
};

/**
 * Execute a transaction with multiple queries
 * @param {Function} callback - Callback function that receives a connection and executes queries
 * @param {Object} [options] - Transaction options
 * @param {string} [options.database='trade_business'] - Database to use ('trade_business' or 'auth')
 * @returns {Promise<any>} Result from the callback function
 */
export const executeTransaction = async (callback, options = {}) => {
  const database = options.database || 'trade_business';
  const pool = database === 'auth' ? auth_pool : tb_pool;
  const connection = await pool.promise().getConnection();

  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    console.error('Transaction execution error:', error);
    throw new Error(`Transaction failed: ${error.message}`);
  } finally {
    connection.release();
  }
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
