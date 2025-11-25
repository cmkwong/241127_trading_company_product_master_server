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

/**
 * Database connection manager class
 */
class DatabaseConnection {
  constructor(database = 'trade_business') {
    this.database = database;
    this.pool = database === 'auth' ? _auth_pool : _tb_pool;
    this.promisePool = this.pool.promise();
  }

  /**
   * Get a connection from the pool
   * @returns {Promise<Object>} Database connection
   */
  async getConnection() {
    try {
      if (!this.pool) throw new Error('Database pool not initialized');
      return await this.promisePool.getConnection();
    } catch (error) {
      console.error('Error getting connection:', error);
      throw new Error(`Getting connection error: ${error.message}`);
    }
  }

  /**
   * Execute a SQL query
   * @param {string} sql - SQL query to execute
   * @param {Array} [params=[]] - Query parameters
   * @returns {Promise<Array>} Query results
   */
  async executeQuery(sql, params = []) {
    try {
      const [rows] = await this.promisePool.query(sql, params);
      return rows;
    } catch (error) {
      console.error('Query execution error:', error);
      throw new Error(`Query execution failed: ${error.message}`);
    }
  }

  /**
   * Execute a transaction with multiple queries
   * @param {Function} callback - Callback function that receives a connection and executes queries
   * @returns {Promise<any>} Result from the callback function
   */
  async executeTransaction(callback) {
    const connection = await this.promisePool.getConnection();

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
  }

  /**
   * Begin a transaction
   * @returns {Promise<Object>} Connection with active transaction
   */
  async beginTransaction() {
    const connection = await this.promisePool.getConnection();
    try {
      await connection.beginTransaction();
      return connection;
    } catch (error) {
      connection.release();
      throw new Error(`Failed to begin transaction: ${error.message}`);
    }
  }

  /**
   * Commit a transaction
   * @param {Object} connection - Connection with active transaction
   * @returns {Promise<void>}
   */
  async commitTransaction(connection) {
    try {
      await connection.commit();
    } finally {
      connection.release();
    }
  }

  /**
   * Rollback a transaction
   * @param {Object} connection - Connection with active transaction
   * @returns {Promise<void>}
   */
  async rollbackTransaction(connection) {
    try {
      await connection.rollback();
    } finally {
      connection.release();
    }
  }
}

// Factory function to create database connection instances
export const createDbConnection = (database = 'trade_business') => {
  return new DatabaseConnection(database);
};

// For backward compatibility and direct usage
export const executeQuery = async (sql, params = [], options = {}) => {
  const db = new DatabaseConnection(options.database);
  return await db.executeQuery(sql, params);
};

export const executeTransaction = async (callback, options = {}) => {
  const db = new DatabaseConnection(options.database);
  return await db.executeTransaction(callback);
};

// getting connection from pool (for backward compatibility)
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

// verify connections at startup
export const verifyDatabaseConnections = async (database = null) => {
  try {
    // If a specific database is requested, check only that one
    if (database) {
      const db = new DatabaseConnection(database);
      const connection = await db.getConnection();
      connection.release();
      console.log(`${database} database connection successful`);
      return true;
    }

    // Otherwise check all databases
    const databases = ['trade_business', 'auth'];
    const results = [];

    for (const db of databases) {
      try {
        const dbConn = new DatabaseConnection(db);
        const connection = await dbConn.getConnection();
        connection.release();
        console.log(`${db} database connection successful`);
        results.push({ database: db, success: true });
      } catch (error) {
        console.error(`${db} database connection failed:`, error.message);
        results.push({ database: db, success: false, error: error.message });
      }
    }

    // Check if all connections were successful
    const allSuccessful = results.every((result) => result.success);

    if (allSuccessful) {
      console.log('All database connections verified successfully');
      return true;
    } else {
      const failedDbs = results
        .filter((r) => !r.success)
        .map((r) => r.database)
        .join(', ');
      console.error(`Failed to connect to databases: ${failedDbs}`);
      return false;
    }
  } catch (error) {
    console.error('Database connection verification failed:', error);
    return false;
  }
};

// Graceful shutdown handler
export const closeAllConnections = () => {
  return new Promise((resolve, reject) => {
    let closed = 0;
    const totalPools = 2;

    const checkAllClosed = () => {
      closed++;
      if (closed === totalPools) {
        console.log('All database connections closed successfully');
        resolve();
      }
    };

    _tb_pool.end((err) => {
      if (err) {
        console.error('Error closing trade_business pool:', err);
        reject(err);
      } else {
        checkAllClosed();
      }
    });

    _auth_pool.end((err) => {
      if (err) {
        console.error('Error closing auth pool:', err);
        reject(err);
      } else {
        checkAllClosed();
      }
    });
  });
};
