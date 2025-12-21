import * as dbModel from '../models/dbModel.js';
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
  /**
   * 🚀 MAIN DISPATCHER
   *
   * This is the entry point for all operations. It handles the critical logic
   * of determining whether to open a new connection or use an existing one.
   */
  static async performCrud(options) {
    let dbConn;
    let releaseConnection = false;
    let manageTransaction = false; // Determines if internal methods should START/COMMIT

    try {
      const {
        operation,
        tableName,
        data,
        id,
        conditions,
        fields,
        connection,
        page = 1,
        limit = 20,
        orderBy,
        orderDirection = 'ASC',
        returnSchema = false,
        softDelete = false,
      } = options;

      // =========================================================
      // 🔌 CONNECTION RESOLUTION LOGIC (CRITICAL FIX)
      // =========================================================
      // We need to know if 'connection' is a Connection Pool (standard)
      // or an Active Connection (inside a transaction).

      if (connection && typeof connection.getConnection === 'function') {
        // CASE A: It is a POOL.
        // We must request a specific connection from the pool.
        // We are responsible for releasing it back to the pool later.
        dbConn = await connection.getConnection();
        releaseConnection = true;
        manageTransaction = true; // We own this scope, so we can start transactions if needed.
      } else if (connection && typeof connection.query === 'function') {
        // CASE B: It is an ACTIVE CONNECTION (Transaction).
        // The parent function (DataModelUtils) passed us a connection that is
        // already inside a transaction. We use it directly.
        // We MUST NOT release it (the parent will do that).
        // We MUST NOT start a new transaction (MySQL doesn't support nested transactions).
        dbConn = connection;
        releaseConnection = false;
        manageTransaction = false;
      } else {
        throw new AppError('Invalid or missing database connection', 500);
      }

      // =========================================================
      // 🔍 SCHEMA VALIDATION
      // =========================================================
      // Fetch table metadata to ensure we only try to write to columns that exist.
      const schema = await this.getTableSchema(dbConn, tableName);

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
            dbConn,
            tableName,
            schema,
            data,
            hasCreatedAt,
            hasUpdatedAt
          );
          break;

        case 'bulkcreate':
          result = await this.bulkCreateRecords(
            dbConn,
            tableName,
            schema,
            data,
            hasCreatedAt,
            hasUpdatedAt
          );
          break;

        case 'read':
          result = await this.readRecords(
            dbConn,
            tableName,
            schema,
            id,
            conditions,
            fields,
            page,
            limit,
            orderBy,
            orderDirection,
            hasDeletedAt
          );
          break;

        case 'update':
          result = await this.updateRecord(
            dbConn,
            tableName,
            schema,
            id,
            data,
            hasUpdatedAt
          );
          break;

        case 'bulkupdate':
          // Note: We pass 'manageTransaction' here.
          // If we are already in a transaction, bulkUpdate won't try to START another one.
          result = await this.bulkUpdateRecords(
            dbConn,
            tableName,
            schema,
            data,
            primaryKeys[0],
            hasUpdatedAt,
            manageTransaction
          );
          break;

        case 'delete':
          result = await this.deleteRecord(
            dbConn,
            tableName,
            schema,
            id,
            softDelete,
            hasDeletedAt
          );
          break;

        case 'bulkdelete':
          result = await this.bulkDeleteRecords(
            dbConn,
            tableName,
            schema,
            id,
            softDelete,
            hasDeletedAt,
            manageTransaction
          );
          break;

        case 'upsert':
          result = await this.upsertRecord(
            dbConn,
            tableName,
            schema,
            data,
            conditions,
            hasCreatedAt,
            hasUpdatedAt,
            manageTransaction
          );
          break;

        case 'bulkupsert':
          result = await this.bulkUpsertRecords(
            dbConn,
            tableName,
            schema,
            data,
            conditions,
            hasCreatedAt,
            hasUpdatedAt,
            manageTransaction
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
    } finally {
      // =========================================================
      // 🧹 RESOURCE CLEANUP
      // =========================================================
      // Only release the connection if WE opened it (Pool scenario).
      // If it was passed in (Transaction scenario), we leave it open for the parent.
      if (releaseConnection && dbConn) {
        dbConn.release();
      }
    }
  }

  /**
   * Helper: Gets table metadata (columns, types, keys)
   */
  static async getTableSchema(connection, tableName) {
    const schemaSQL = `
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_KEY, COLUMN_DEFAULT, EXTRA
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?
      ORDER BY ORDINAL_POSITION
    `;
    return await dbModel.executeQuery(connection, schemaSQL, [tableName]);
  }

  /**
   * 🟢 CREATE (Single)
   * Handles UUID generation for string IDs and auto-timestamps.
   */
  static async createRecord(
    connection,
    tableName,
    schema,
    data,
    hasCreatedAt,
    hasUpdatedAt
  ) {
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

    const result = await dbModel.executeQuery(connection, sql, values);

    // 4. Return the full created object
    const insertId = result.insertId || recordData[idColumn.COLUMN_NAME];
    const createdRecord = await this.readRecords(
      connection,
      tableName,
      schema,
      insertId
    );

    return {
      message: `Record created successfully in ${tableName}`,
      id: insertId,
      record: createdRecord.records || createdRecord.record,
    };
  }

  /**
   * 🟢 BULK CREATE
   * Optimized to use a single INSERT statement for multiple rows.
   */
  static async bulkCreateRecords(
    connection,
    tableName,
    schema,
    dataArray,
    hasCreatedAt,
    hasUpdatedAt
  ) {
    if (!Array.isArray(dataArray) || dataArray.length === 0) {
      throw new AppError('No data provided for bulk create operation', 400);
    }

    const idColumn = schema.find((col) => col.COLUMN_KEY === 'PRI');
    const idColumnName = idColumn.COLUMN_NAME;
    const now = new Date();
    const columns = new Set();
    const allValues = [];
    const createdIds = [];

    // 1. Scan all objects to find ALL possible columns used across the batch
    dataArray.forEach((data) => {
      Object.keys(data).forEach((key) => {
        if (schema.some((col) => col.COLUMN_NAME === key)) {
          columns.add(key);
        }
      });
    });

    if (hasCreatedAt) columns.add('created_at');
    if (hasUpdatedAt) columns.add('updated_at');

    const columnArray = Array.from(columns);

    // 2. Prepare values for each row
    dataArray.forEach((data) => {
      const recordValues = [];
      const recordData = { ...data };

      // Generate UUIDs if needed
      if (
        idColumn &&
        !recordData[idColumnName] &&
        idColumn.DATA_TYPE.includes('char')
      ) {
        recordData[idColumnName] = uuidv4();
      }

      if (hasCreatedAt) recordData.created_at = now;
      if (hasUpdatedAt) recordData.updated_at = now;

      if (recordData[idColumnName]) {
        createdIds.push(recordData[idColumnName]);
      }

      // Map values to the fixed column order (insert NULL if field missing in this specific row)
      columnArray.forEach((column) => {
        recordValues.push(
          recordData[column] !== undefined ? recordData[column] : null
        );
      });

      allValues.push(recordValues);
    });

    // 3. Construct Bulk Insert SQL: INSERT INTO ... VALUES (...), (...)
    const placeholderGroups = allValues.map(
      () => `(${columnArray.map(() => '?').join(', ')})`
    );

    const sql = `
      INSERT INTO ${tableName} (${columnArray.join(', ')})
      VALUES ${placeholderGroups.join(', ')}
    `;

    const flatValues = allValues.flat();
    const result = await dbModel.executeQuery(connection, sql, flatValues);

    // 4. Fetch created records to return them
    let createdRecords;
    if (createdIds.length > 0) {
      createdRecords = await this.readRecords(
        connection,
        tableName,
        schema,
        createdIds
      );
    } else if (result.insertId) {
      // If auto-increment, calculate the range of IDs generated
      const ids = Array.from(
        { length: dataArray.length },
        (_, i) => result.insertId + i
      );
      createdRecords = await this.readRecords(
        connection,
        tableName,
        schema,
        ids
      );
    }

    return {
      message: `${dataArray.length} records created successfully in ${tableName}`,
      count: dataArray.length,
      ids: createdIds.length > 0 ? createdIds : undefined,
      firstInsertId: result.insertId || undefined,
      records: createdRecords?.records || [],
    };
  }

  /**
   * 🔵 READ (Select)
   * Supports ID lookup, Pagination, Sorting, and complex Filters ($gt, $like, etc.)
   */
  static async readRecords(
    connection,
    tableName,
    schema,
    id,
    conditions,
    fields,
    page = 1,
    limit = 20,
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
        orderDirection.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
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
      const countResult = await dbModel.executeQuery(
        connection,
        countSQL,
        whereParams
      );
      total = countResult[0].total;
    }

    // Pagination: Limit & Offset
    let limitClause = '';
    if (!id || Array.isArray(id)) {
      const offset = (page - 1) * limit;
      limitClause = `LIMIT ${limit} OFFSET ${offset}`;
    }

    const sql = `
      SELECT ${selectFields} FROM ${tableName}
      ${whereClause ? `WHERE ${whereClause}` : ''}
      ${orderClause}
      ${limitClause}
    `;

    const results = await dbModel.executeQuery(connection, sql, whereParams);

    // Return format depends on whether we asked for a single ID or a list
    if (id && !Array.isArray(id)) {
      return { record: results.length > 0 ? results[0] : null };
    } else {
      return {
        records: results,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      };
    }
  }

  /**
   * 🟠 UPDATE (Single)
   */
  static async updateRecord(
    connection,
    tableName,
    schema,
    id,
    data,
    hasUpdatedAt
  ) {
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

    await dbModel.executeQuery(connection, sql, values);

    const updatedRecord = await this.readRecords(
      connection,
      tableName,
      schema,
      id
    );

    return {
      message: `Record updated successfully in ${tableName}`,
      id,
      record: updatedRecord.record,
    };
  }

  /**
   * 🟠 BULK UPDATE
   * Iterates through an array and updates rows one by one inside a transaction.
   */
  static async bulkUpdateRecords(
    connection,
    tableName,
    schema,
    dataArray,
    idField,
    hasUpdatedAt,
    manageTransaction = true
  ) {
    if (!Array.isArray(dataArray) || dataArray.length === 0) {
      throw new AppError('No data provided for bulk update operation', 400);
    }

    const missingIds = dataArray.filter((item) => !item[idField]);
    if (missingIds.length > 0) {
      throw new AppError(
        `${missingIds.length} records are missing the ID field (${idField})`,
        400
      );
    }

    const updatedIds = [];
    const now = new Date();

    // Only START TRANSACTION if we are not already inside one
    if (manageTransaction) {
      await dbModel.executeQuery(connection, 'START TRANSACTION');
    }

    try {
      for (const data of dataArray) {
        const updateData = { ...data };
        if (hasUpdatedAt) updateData.updated_at = now;

        const id = updateData[idField];
        updatedIds.push(id);
        delete updateData[idField];

        const updateParts = [];
        const values = [];

        schema.forEach((column) => {
          const columnName = column.COLUMN_NAME;
          if (columnName !== idField && updateData[columnName] !== undefined) {
            updateParts.push(`${columnName} = ?`);
            values.push(updateData[columnName]);
          }
        });

        if (updateParts.length === 0) continue;

        values.push(id);

        const sql = `
          UPDATE ${tableName}
          SET ${updateParts.join(', ')}
          WHERE ${idField} = ?
        `;

        await dbModel.executeQuery(connection, sql, values);
      }

      // Only COMMIT if we started it
      if (manageTransaction) {
        await dbModel.executeQuery(connection, 'COMMIT');
      }

      const updatedRecords = await this.readRecords(
        connection,
        tableName,
        schema,
        updatedIds
      );

      return {
        message: `${updatedIds.length} records updated successfully in ${tableName}`,
        count: updatedIds.length,
        ids: updatedIds,
        records: updatedRecords.records,
      };
    } catch (error) {
      // Only ROLLBACK if we started it
      if (manageTransaction) {
        await dbModel.executeQuery(connection, 'ROLLBACK');
      }
      throw error;
    }
  }

  /**
   * 🔴 DELETE (Single)
   * Supports both Soft Delete (flagging) and Hard Delete (removal).
   */
  static async deleteRecord(
    connection,
    tableName,
    schema,
    id,
    softDelete,
    hasDeletedAt
  ) {
    if (!id) throw new AppError('No ID provided for delete operation', 400);

    const primaryKeyColumns = schema
      .filter((col) => col.COLUMN_KEY === 'PRI')
      .map((col) => col.COLUMN_NAME);

    if (primaryKeyColumns.length === 0) {
      throw new AppError(`Table ${tableName} has no primary key`, 400);
    }

    // Verify existence before delete
    const recordToDelete = await this.readRecords(
      connection,
      tableName,
      schema,
      id
    );

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
      await dbModel.executeQuery(connection, sql, [new Date(), ...whereParams]);
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
      await dbModel.executeQuery(connection, sql, whereParams);
      return {
        message: `Record deleted successfully from ${tableName}`,
        id,
        deletedRecord: recordToDelete.record,
      };
    }
  }

  /**
   * 🔴 BULK DELETE
   */
  static async bulkDeleteRecords(
    connection,
    tableName,
    schema,
    ids,
    softDelete,
    hasDeletedAt,
    manageTransaction = true
  ) {
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new AppError('No IDs provided for bulk delete operation', 400);
    }

    const primaryKeyColumns = schema
      .filter((col) => col.COLUMN_KEY === 'PRI')
      .map((col) => col.COLUMN_NAME);

    if (primaryKeyColumns.length === 0) {
      throw new AppError(`Table ${tableName} has no primary key`, 400);
    }

    const recordsToDelete = await this.readRecords(
      connection,
      tableName,
      schema,
      ids
    );

    if (recordsToDelete.records.length === 0) {
      throw new AppError(
        `No records found with the provided IDs in ${tableName}`,
        404
      );
    }

    if (manageTransaction) {
      await dbModel.executeQuery(connection, 'START TRANSACTION');
    }

    try {
      if (primaryKeyColumns.length > 1) {
        // Composite keys must be deleted one by one
        for (const id of ids) {
          await this.deleteRecord(
            connection,
            tableName,
            schema,
            id,
            softDelete,
            hasDeletedAt
          );
        }
      } else {
        // Single PK can be done in one query: WHERE id IN (...)
        const primaryKeyColumn = primaryKeyColumns[0];
        const simpleIds = ids.map((id) =>
          typeof id === 'object' ? id[primaryKeyColumn] : id
        );
        const placeholders = simpleIds.map(() => '?').join(', ');

        if (softDelete && hasDeletedAt) {
          const sql = `
          UPDATE ${tableName}
          SET deleted_at = ?
          WHERE ${primaryKeyColumn} IN (${placeholders})
        `;
          await dbModel.executeQuery(connection, sql, [
            new Date(),
            ...simpleIds,
          ]);
        } else {
          const sql = `
          DELETE FROM ${tableName}
          WHERE ${primaryKeyColumn} IN (${placeholders})
        `;
          await dbModel.executeQuery(connection, sql, simpleIds);
        }
      }

      if (manageTransaction) {
        await dbModel.executeQuery(connection, 'COMMIT');
      }

      return {
        message: `${ids.length} records ${
          softDelete && hasDeletedAt ? 'soft ' : ''
        }deleted successfully from ${tableName}`,
        count: ids.length,
        ids,
        deletedRecords: recordsToDelete.records,
      };
    } catch (error) {
      if (manageTransaction) {
        await dbModel.executeQuery(connection, 'ROLLBACK');
      }
      throw error;
    }
  }

  /**
   * 🔄 UPSERT (Update or Insert)
   * Strategy: Delete existing records matching conditions, then Insert new ones.
   */
  static async upsertRecord(
    connection,
    tableName,
    schema,
    data,
    conditions,
    hasCreatedAt,
    hasUpdatedAt,
    manageTransaction = true
  ) {
    if (!data) throw new AppError('No data provided for upsert operation', 400);
    if (!conditions || Object.keys(conditions).length === 0) {
      throw new AppError('No conditions provided for upsert operation', 400);
    }

    if (manageTransaction) {
      await dbModel.executeQuery(connection, 'START TRANSACTION');
    }

    try {
      // 1. Delete existing
      const whereConditions = [];
      const whereParams = [];

      Object.entries(conditions).forEach(([column, value]) => {
        if (schema.some((col) => col.COLUMN_NAME === column)) {
          whereConditions.push(`${column} = ?`);
          whereParams.push(value);
        }
      });

      if (whereConditions.length === 0) {
        throw new AppError(
          'No valid conditions found for upsert operation',
          400
        );
      }

      const deleteSQL = `DELETE FROM ${tableName} WHERE ${whereConditions.join(
        ' AND '
      )}`;
      await dbModel.executeQuery(connection, deleteSQL, whereParams);

      // 2. Insert New
      const recordData = { ...data };
      const idColumn = schema.find(
        (col) =>
          col.COLUMN_KEY === 'PRI' &&
          col.COLUMN_NAME.toLowerCase().includes('id')
      );
      if (
        idColumn &&
        !recordData[idColumn.COLUMN_NAME] &&
        idColumn.DATA_TYPE.includes('char')
      ) {
        recordData[idColumn.COLUMN_NAME] = uuidv4();
      }

      const now = new Date();
      if (hasCreatedAt) recordData.created_at = now;
      if (hasUpdatedAt) recordData.updated_at = now;

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

      const insertSQL = `
      INSERT INTO ${tableName} (${columns.join(', ')})
      VALUES (${placeholders.join(', ')})
    `;

      const result = await dbModel.executeQuery(connection, insertSQL, values);

      if (manageTransaction) {
        await dbModel.executeQuery(connection, 'COMMIT');
      }

      const insertId = result.insertId || recordData[idColumn.COLUMN_NAME];
      const upsertedRecord = await this.readRecords(
        connection,
        tableName,
        schema,
        insertId
      );

      return {
        message: `Record upserted successfully in ${tableName}`,
        id: insertId,
        record: upsertedRecord.records || upsertedRecord.record,
      };
    } catch (error) {
      if (manageTransaction) {
        await dbModel.executeQuery(connection, 'ROLLBACK');
      }
      throw error;
    }
  }

  /**
   * 🔄 BULK UPSERT
   */
  static async bulkUpsertRecords(
    connection,
    tableName,
    schema,
    dataArray,
    conditions,
    hasCreatedAt,
    hasUpdatedAt,
    manageTransaction = true
  ) {
    if (!Array.isArray(dataArray) || dataArray.length === 0) {
      throw new AppError('No data provided for bulk upsert operation', 400);
    }
    if (!conditions || Object.keys(conditions).length === 0) {
      throw new AppError(
        'No conditions provided for bulk upsert operation',
        400
      );
    }

    if (manageTransaction) {
      await dbModel.executeQuery(connection, 'START TRANSACTION');
    }

    try {
      // 1. Delete Existing
      const whereConditions = [];
      const whereParams = [];

      Object.entries(conditions).forEach(([column, value]) => {
        if (schema.some((col) => col.COLUMN_NAME === column)) {
          whereConditions.push(`${column} = ?`);
          whereParams.push(value);
        }
      });

      if (whereConditions.length === 0) {
        throw new AppError(
          'No valid conditions found for bulk upsert operation',
          400
        );
      }

      const deleteSQL = `DELETE FROM ${tableName} WHERE ${whereConditions.join(
        ' AND '
      )}`;
      await dbModel.executeQuery(connection, deleteSQL, whereParams);

      // 2. Bulk Insert New
      const idColumn = schema.find((col) => col.COLUMN_KEY === 'PRI');
      const idColumnName = idColumn.COLUMN_NAME;
      const now = new Date();
      const columns = new Set();
      const allValues = [];
      const createdIds = [];

      dataArray.forEach((data) => {
        Object.keys(data).forEach((key) => {
          if (schema.some((col) => col.COLUMN_NAME === key)) {
            columns.add(key);
          }
        });
      });

      if (hasCreatedAt) columns.add('created_at');
      if (hasUpdatedAt) columns.add('updated_at');

      const columnArray = Array.from(columns);

      dataArray.forEach((data) => {
        const recordValues = [];
        const recordData = { ...data };

        if (
          idColumn &&
          !recordData[idColumnName] &&
          idColumn.DATA_TYPE.includes('char')
        ) {
          recordData[idColumnName] = uuidv4();
        }

        if (hasCreatedAt) recordData.created_at = now;
        if (hasUpdatedAt) recordData.updated_at = now;

        if (recordData[idColumnName]) {
          createdIds.push(recordData[idColumnName]);
        }

        columnArray.forEach((column) => {
          recordValues.push(
            recordData[column] !== undefined ? recordData[column] : null
          );
        });

        allValues.push(recordValues);
      });

      const placeholderGroups = allValues.map(
        () => `(${columnArray.map(() => '?').join(', ')})`
      );

      const sql = `
      INSERT INTO ${tableName} (${columnArray.join(', ')})
      VALUES ${placeholderGroups.join(', ')}
    `;

      const flatValues = allValues.flat();
      const result = await dbModel.executeQuery(connection, sql, flatValues);

      if (manageTransaction) {
        await dbModel.executeQuery(connection, 'COMMIT');
      }

      let upsertedRecords;
      if (createdIds.length > 0) {
        upsertedRecords = await this.readRecords(
          connection,
          tableName,
          schema,
          createdIds
        );
      } else if (result.insertId) {
        const ids = Array.from(
          { length: dataArray.length },
          (_, i) => result.insertId + i
        );
        upsertedRecords = await this.readRecords(
          connection,
          tableName,
          schema,
          ids
        );
      }

      return {
        message: `${dataArray.length} records upserted successfully in ${tableName}`,
        count: dataArray.length,
        ids: createdIds.length > 0 ? createdIds : undefined,
        firstInsertId: result.insertId || undefined,
        records: upsertedRecords?.records || [],
      };
    } catch (error) {
      if (manageTransaction) {
        await dbModel.executeQuery(connection, 'ROLLBACK');
      }
      throw error;
    }
  }

  /**
   * 📦 TRANSACTION WRAPPER
   * Allows executing multiple CRUD operations as a single atomic unit.
   */
  static async performTransaction(connection, operations) {
    if (!Array.isArray(operations) || operations.length === 0) {
      throw new AppError('No operations provided for transaction', 400);
    }

    // This method assumes it is starting a NEW transaction
    await dbModel.executeQuery(connection, 'START TRANSACTION');

    try {
      const results = [];
      for (const operation of operations) {
        const result = await this.performCrud({
          ...operation,
          connection,
        });
        results.push(result);
      }
      await dbModel.executeQuery(connection, 'COMMIT');
      return {
        message: 'Transaction completed successfully',
        results,
      };
    } catch (error) {
      await dbModel.executeQuery(connection, 'ROLLBACK');
      throw error;
    }
  }
}

export default CrudOperations;
