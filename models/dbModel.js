import { tb_pool, auth_pool } from '../utils/dbConn.js';

/**
 * Database connection manager class
 */
class DatabaseConnection {
  constructor(pool) {
    this.pool = pool;
    this.promisePool = this.pool.promise();
  }

  /**
   * Get a list of table names in the current database
   * @returns {Promise<Array<string>>} Array of table names
   */
  async getTableNames() {
    try {
      const sql = `
        SELECT TABLE_NAME 
        FROM INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_SCHEMA = DATABASE() 
        ORDER BY TABLE_NAME;
      `;
      const results = await this.executeQuery(sql);
      return results.map((row) => row.TABLE_NAME);
    } catch (error) {
      console.error('Error fetching table names:', error);
      throw new Error(`Failed to fetch table names: ${error.message}`);
    }
  }

  /**
   * Helper: Gets table metadata (columns, types, keys)
   */
  async getTableSchema(tableName) {
    const schemaSQL = `
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_KEY, COLUMN_DEFAULT, EXTRA
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?
      ORDER BY ORDINAL_POSITION
    `;
    return await this.executeQuery(schemaSQL, [tableName]);
  }

  /**
   * Execute a SQL query
   * @param {string} sql - SQL query to execute
   * @param {Array} [params=[]] - Query parameters
   * @param {Object} [connection=null] - Database connection
   * @returns {Promise<Array>} Query results
   */
  async executeQuery(sql, params = [], connection = null) {
    try {
      if (connection) {
        const [rows] = await connection.query(sql, params);
        return rows;
      } else {
        const [rows] = await this.promisePool.query(sql, params);
        return rows;
      }
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
    const connection = await this.getConnection();
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
   * Get a connection from the pool
   * @returns {Promise<Object>} Database connection
   */
  async getConnection() {
    try {
      return await this.promisePool.getConnection();
    } catch (error) {
      console.error('Error getting connection:', error);
      throw new Error(`Getting connection error: ${error.message}`);
    }
  }

  /**
   * Begin a transaction
   * @returns {Promise<Object>} Connection with active transaction
   */
  async beginTransaction() {
    const connection = await this.getConnection();
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

// Create singleton instances for trade_business and auth databases
export const tradeBusinessDbc = new DatabaseConnection(tb_pool);
export const authDbc = new DatabaseConnection(auth_pool);

export default DatabaseConnection;
