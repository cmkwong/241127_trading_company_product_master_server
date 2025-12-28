import AppError from './appError.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * 🛠️ CRUD OPERATIONS UTILITY
 *
 * This class acts as a dynamic bridge between the application and the database.
 * It automatically generates SQL queries based on the provided JSON data and the
 * actual database schema.
 *
 * Key Features:
 * 1. Dynamic SQL Generation: No need to write manual INSERT/UPDATE queries.
 * 2. Transaction Awareness: Can handle both standalone operations (using a Pool)
 *    and part of a larger transaction (using an Active Connection).
 * 3. Schema Validation: Checks against DB schema to prevent SQL injection or invalid column errors.
 */

class CrudOperations {
  constructor(config) {
    this.dbc = config.dbc; // DatabaseConnection instance (e.g., authDbc or tradeBusinessDbc)
    this.page = config.page || 1;
    this.limit = config.limit || 20;
    this.orderDirection = config.orderDirection || 'ASC';
  }

  async performCrud(options) {
    try {
      const {
        operation,
        tableName,
        data,
        id,
        conditions,
        fields,
        orderBy,
        returnSchema = false,
        softDelete = false,
      } = options;

      if (!this.dbc) {
        throw new AppError(
          'A valid DatabaseConnection instance (dbc) is required',
          500
        );
      }

      // =========================================================
      // 🔍 SCHEMA VALIDATION
      // =========================================================
      // Fetch table metadata to ensure we only try to write to columns that exist.
      const schema = await this.dbc.getTableSchema(tableName);

      if (schema.length === 0) {
        throw new AppError(
          `Table ${tableName} not found or has no columns`,
          400
        );
      }

      const primaryKeys = schema
        .filter((col) => col.COLUMN_KEY === 'PRI')
        .map((col) => col.COLUMN_NAME);
      if (primaryKeys.length === 0) {
        throw new AppError(`Table ${tableName} has no primary key`, 400);
      }

      // Detect special timestamp columns
      const hasCreatedAt = schema.some(
        (col) => col.COLUMN_NAME === 'created_at'
      );
      const hasUpdatedAt = schema.some(
        (col) => col.COLUMN_NAME === 'updated_at'
      );
      const hasDeletedAt = schema.some(
        (col) => col.COLUMN_NAME === 'deleted_at'
      );

      // =========================================================
      // 🎮 OPERATION DISPATCH
      // =========================================================
      let result;

      switch (operation.toLowerCase()) {
        case 'create':
          result = await this.createRecord(
            tableName,
            schema,
            data,
            hasCreatedAt,
            hasUpdatedAt
          );
          break;

        case 'read':
          result = await this.readRecords(
            tableName,
            schema,
            id,
            conditions,
            fields,
            orderBy,
            hasDeletedAt
          );
          break;

        case 'update':
          result = await this.updateRecord(
            tableName,
            schema,
            id,
            data,
            hasUpdatedAt
          );
          break;

        case 'delete':
          result = await this.deleteRecord(
            tableName,
            schema,
            id,
            softDelete,
            hasDeletedAt
          );
          break;

        default:
          throw new AppError(`Invalid operation: ${operation}`, 400);
      }

      if (returnSchema) {
        result.schema = schema;
      }

      return result;
    } catch (error) {
      throw new AppError(
        `CRUD operation failed: ${error.message}`,
        error.statusCode || 500
      );
    }
  }

  /**
   * 🟢 CREATE (Single)
   * Handles UUID generation for string IDs and auto-timestamps.
   */
  async createRecord(tableName, schema, data, hasCreatedAt, hasUpdatedAt) {
    if (!data) {
      throw new AppError('No data provided for create operation', 400);
    }

    const recordData = { ...data };

    // 1. Auto-generate UUID if the PK is a string (CHAR/VARCHAR) and missing
    const idColumn = schema.find(
      (col) =>
        col.COLUMN_KEY === 'PRI' && col.COLUMN_NAME.toLowerCase().includes('id')
    );
    if (
      idColumn &&
      !recordData[idColumn.COLUMN_NAME] &&
      idColumn.DATA_TYPE.includes('char')
    ) {
      recordData[idColumn.COLUMN_NAME] = uuidv4();
    }

    // 2. Add Timestamps
    const now = new Date();
    if (hasCreatedAt) recordData.created_at = now;
    if (hasUpdatedAt) recordData.updated_at = now;

    // 3. Build Query dynamically (only using fields that exist in data)
    const columns = [];
    const placeholders = [];
    const values = [];

    schema.forEach((column) => {
      const columnName = column.COLUMN_NAME;
      if (recordData[columnName] !== undefined) {
        columns.push(columnName);
        placeholders.push('?');
        values.push(recordData[columnName]);
      }
    });

    if (columns.length === 0) {
      throw new AppError('No valid columns found in the provided data', 400);
    }

    const sql = `
      INSERT INTO ${tableName} (${columns.join(', ')})
      VALUES (${placeholders.join(', ')})
    `;

    const result = await this.dbc.executeQuery(sql, values);

    // 4. Return the full created object
    const insertId = result.insertId || recordData[idColumn.COLUMN_NAME];
    const createdRecord = await this.readRecords(tableName, schema, insertId);

    return {
      message: `Record created successfully in ${tableName}`,
      id: insertId,
      record: createdRecord.records || createdRecord.record,
    };
  }

  /**
   * 🔵 READ (Select)
   * Supports ID lookup, Pagination, Sorting, and complex Filters ($gt, $like, etc.)
   */
  async readRecords(
    tableName,
    schema,
    id,
    conditions,
    fields,
    orderBy,
    orderDirection = 'ASC',
    hasDeletedAt = false
  ) {
    const selectFields = fields && fields.length > 0 ? fields.join(', ') : '*';
    let whereClause = '';
    const whereParams = [];

    // Filter out soft-deleted items by default
    if (hasDeletedAt) {
      whereClause = 'deleted_at IS NULL';
    }

    // Handle ID (Single or Array)
    if (id) {
      const primaryKeyColumn = schema.find(
        (col) => col.COLUMN_KEY === 'PRI'
      ).COLUMN_NAME;

      if (Array.isArray(id)) {
        const idPlaceholders = id.map(() => '?').join(', ');
        const idCondition = `${primaryKeyColumn} IN (${idPlaceholders})`;
        whereClause = whereClause
          ? `${whereClause} AND ${idCondition}`
          : idCondition;
        whereParams.push(...id);
      } else {
        const idCondition = `${primaryKeyColumn} = ?`;
        whereClause = whereClause
          ? `${whereClause} AND ${idCondition}`
          : idCondition;
        whereParams.push(id);
      }
    }

    // Handle Advanced Conditions (e.g., { price: { $gt: 100 } })
    if (conditions) {
      const conditionClauses = [];
      Object.entries(conditions).forEach(([column, value]) => {
        if (schema.some((col) => col.COLUMN_NAME === column)) {
          if (value === null) {
            conditionClauses.push(`${column} IS NULL`);
          } else if (Array.isArray(value)) {
            const placeholders = value.map(() => '?').join(', ');
            conditionClauses.push(`${column} IN (${placeholders})`);
            whereParams.push(...value);
          } else if (typeof value === 'object') {
            Object.entries(value).forEach(([op, val]) => {
              switch (op) {
                case '$gt':
                  conditionClauses.push(`${column} > ?`);
                  whereParams.push(val);
                  break;
                case '$gte':
                  conditionClauses.push(`${column} >= ?`);
                  whereParams.push(val);
                  break;
                case '$lt':
                  conditionClauses.push(`${column} < ?`);
                  whereParams.push(val);
                  break;
                case '$lte':
                  conditionClauses.push(`${column} <= ?`);
                  whereParams.push(val);
                  break;
                case '$ne':
                  conditionClauses.push(`${column} != ?`);
                  whereParams.push(val);
                  break;
                case '$like':
                  conditionClauses.push(`${column} LIKE ?`);
                  whereParams.push(`%${val}%`);
                  break;
                case '$startsWith':
                  conditionClauses.push(`${column} LIKE ?`);
                  whereParams.push(`${val}%`);
                  break;
                case '$endsWith':
                  conditionClauses.push(`${column} LIKE ?`);
                  whereParams.push(`%${val}`);
                  break;
              }
            });
          } else {
            conditionClauses.push(`${column} = ?`);
            whereParams.push(value);
          }
        }
      });

      if (conditionClauses.length > 0) {
        const conditionsStr = conditionClauses.join(' AND ');
        whereClause = whereClause
          ? `${whereClause} AND (${conditionsStr})`
          : conditionsStr;
      }
    }

    // Sorting
    let orderClause = '';
    if (orderBy && schema.some((col) => col.COLUMN_NAME === orderBy)) {
      const direction =
        this.orderDirection.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
      orderClause = `ORDER BY ${orderBy} ${direction}`;
    }

    // Pagination: Calculate Total first
    let total = 0;
    if (!id || Array.isArray(id)) {
      const countSQL = `
        SELECT COUNT(*) as total
        FROM ${tableName}
        ${whereClause ? `WHERE ${whereClause}` : ''}
      `;
      const countResult = await this.dbc.executeQuery(countSQL, whereParams);
      total = countResult[0].total;
    }

    // Pagination: Limit & Offset
    let limitClause = '';
    if (!id || Array.isArray(id)) {
      const offset = (this.page - 1) * this.limit;
      limitClause = `LIMIT ${this.limit} OFFSET ${offset}`;
    }

    const sql = `
      SELECT ${selectFields} FROM ${tableName}
      ${whereClause ? `WHERE ${whereClause}` : ''}
      ${orderClause}
      ${limitClause}
    `;

    const results = await this.dbc.executeQuery(sql, whereParams);

    // Return format depends on whether we asked for a single ID or a list
    if (id && !Array.isArray(id)) {
      return { record: results.length > 0 ? results[0] : null };
    } else {
      return {
        records: results,
        pagination: {
          total,
          page: this.page,
          limit: this.limit,
          pages: Math.ceil(total / this.limit),
        },
      };
    }
  }

  /**
   * 🟠 UPDATE (Single)
   */
  async updateRecord(tableName, schema, id, data, hasUpdatedAt) {
    if (!id) throw new AppError('No ID provided for update operation', 400);
    if (!data || Object.keys(data).length === 0) {
      throw new AppError('No data provided for update operation', 400);
    }

    const updateData = { ...data };
    const primaryKeyColumn = schema.find(
      (col) => col.COLUMN_KEY === 'PRI'
    ).COLUMN_NAME;

    if (hasUpdatedAt) updateData.updated_at = new Date();

    const updateParts = [];
    const values = [];

    // Dynamically build SET clause
    schema.forEach((column) => {
      const columnName = column.COLUMN_NAME;
      if (
        columnName !== primaryKeyColumn &&
        updateData[columnName] !== undefined
      ) {
        updateParts.push(`${columnName} = ?`);
        values.push(updateData[columnName]);
      }
    });

    if (updateParts.length === 0) {
      throw new AppError('No valid columns found in the provided data', 400);
    }

    values.push(id);

    const sql = `
      UPDATE ${tableName}
      SET ${updateParts.join(', ')}
      WHERE ${primaryKeyColumn} = ?
    `;

    await this.dbc.executeQuery(sql, values);

    const updatedRecord = await this.readRecords(tableName, schema, id);

    return {
      message: `Record updated successfully in ${tableName}`,
      id,
      record: updatedRecord.record,
    };
  }

  /**
   * 🔴 DELETE (Single)
   * Supports both Soft Delete (flagging) and Hard Delete (removal).
   */
  async deleteRecord(tableName, schema, id, softDelete, hasDeletedAt) {
    if (!id) throw new AppError('No ID provided for delete operation', 400);

    const primaryKeyColumns = schema
      .filter((col) => col.COLUMN_KEY === 'PRI')
      .map((col) => col.COLUMN_NAME);

    if (primaryKeyColumns.length === 0) {
      throw new AppError(`Table ${tableName} has no primary key`, 400);
    }

    // Verify existence before delete
    const recordToDelete = await this.readRecords(tableName, schema, id);

    if (!recordToDelete.record) {
      throw new AppError(
        `Record with the provided ID not found in ${tableName}`,
        404
      );
    }

    let whereClause = '';
    const whereParams = [];

    // Handle Composite Primary Keys (passed as object)
    if (typeof id === 'object' && !Array.isArray(id)) {
      const conditions = [];
      primaryKeyColumns.forEach((column) => {
        if (id[column] === undefined) {
          throw new AppError(
            `Missing value for primary key column ${column}`,
            400
          );
        }
        conditions.push(`${column} = ?`);
        whereParams.push(id[column]);
      });
      whereClause = conditions.join(' AND ');
    } else {
      whereClause = `${primaryKeyColumns[0]} = ?`;
      whereParams.push(id);
    }

    if (softDelete && hasDeletedAt) {
      // Soft Delete: Update timestamp
      const sql = `
      UPDATE ${tableName}
      SET deleted_at = ?
      WHERE ${whereClause}
    `;
      await this.dbc.executeQuery(sql, [new Date(), ...whereParams]);
      return {
        message: `Record soft deleted successfully from ${tableName}`,
        id,
        deletedRecord: recordToDelete.record,
      };
    } else {
      // Hard Delete: Remove row
      const sql = `
      DELETE FROM ${tableName}
      WHERE ${whereClause}
    `;
      await this.dbc.executeQuery(sql, whereParams);
      return {
        message: `Record deleted successfully from ${tableName}`,
        id,
        deletedRecord: recordToDelete.record,
      };
    }
  }
}

export default CrudOperations;
