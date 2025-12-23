import mysql from 'mysql2';
import {} from 'dotenv/config';

// Create pools at module initialization (server startup)
const _tb_pool = mysql.createPool({
  connectionLimit: 20,
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: 'trade_business',
  connectTimeout: 10000,
  waitForConnections: true,
  queueLimit: 0,
});

const _auth_pool = mysql.createPool({
  connectionLimit: 20,
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: 'auth',
  connectTimeout: 10000,
  waitForConnections: true,
  queueLimit: 0,
});

// Function to verify database connections
export const verifyDatabaseConnections = async () => {
  try {
    console.log('Verifying database connections...');

    // Verify the trade business pool
    await new Promise((resolve, reject) => {
      _tb_pool.query('SELECT 1', (err) => {
        if (err) {
          console.error('Error verifying trade business pool connection:', err);
          return reject(err);
        }
        console.log('Trade business pool connection verified.');
        resolve();
      });
    });

    // Verify the auth pool
    await new Promise((resolve, reject) => {
      _auth_pool.query('SELECT 1', (err) => {
        if (err) {
          console.error('Error verifying auth pool connection:', err);
          return reject(err);
        }
        console.log('Auth pool connection verified.');
        resolve();
      });
    });
    return true;
  } catch (error) {
    console.error('Error verifying database connections:', error);
    throw error;
  }
};

// Function to close all connections
export const closeAllConnections = async () => {
  try {
    console.log('Closing all database connections...');

    // Close the trade business pool
    await new Promise((resolve, reject) => {
      _tb_pool.end((err) => {
        if (err) {
          console.error('Error closing trade business pool:', err);
          return reject(err);
        }
        console.log('Trade business pool closed.');
        resolve();
      });
    });

    // Close the auth pool
    await new Promise((resolve, reject) => {
      _auth_pool.end((err) => {
        if (err) {
          console.error('Error closing auth pool:', err);
          return reject(err);
        }
        console.log('Auth pool closed.');
        resolve();
      });
    });

    console.log('All database connections closed successfully.');
  } catch (error) {
    console.error('Error closing database connections:', error);
    throw error;
  }
};

// Add error listener to the pools
_tb_pool.on('error', (err) => {
  console.error('Trade business database pool error:', err);
});

_auth_pool.on('error', (err) => {
  console.error('Auth database pool error:', err);
});

// Export the raw pools for backward compatibility
export const tb_pool = _tb_pool;
export const auth_pool = _auth_pool;
