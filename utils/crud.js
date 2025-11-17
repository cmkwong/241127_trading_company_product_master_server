import * as dbModel from '../models/dbModel.js';
import AppError from './appError.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Utility class for performing dynamic CRUD operations on database tables
 */
class CrudOperations {
  /**
   * Performs a CRUD operation based on table schema
   * @param {Object} options - Options for the operation
   * @param {string} options.operation - Type of operation ('create', 'read', 'update', 'delete', 'bulkCreate', 'bulkUpdate', 'upsert', 'bulkUpsert')
   * @param {string} options.tableName - Name of the table
   * @param {Object|Array} [options.data] - Data for create/update/upsert operations (object for single, array for bulk)
   * @param {string|Array} [options.id] - ID or array of IDs for read/update/delete operations
   * @param {Object} [options.conditions] - Additional conditions for read operations or identifying records for upsert
   * @param {Array} [options.fields] - Fields to return for read operations
   * @param {Object} [options.connection] - Database connection to use (for transactions)
   * @param {number} [options.page] - Page number for pagination
   * @param {number} [options.limit] - Number of records per page
   * @param {string} [options.orderBy] - Field to order by
   * @param {string} [options.orderDirection] - Order direction ('ASC' or 'DESC')
   * @param {boolean} [options.returnSchema] - Whether to return the schema in the response
   * @param {boolean} [options.softDelete] - Whether to perform a soft delete (update deleted_at field)
   * @returns {Promise<Object>} Promise that resolves with operation result
   */
  static async performCrud(options) {
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

      // Get table schema
      const schema = await this.getTableSchema(connection, tableName);

      if (schema.length === 0) {
        throw new AppError(
          `Table ${tableName} not found or has no columns`,
          400
        );
      }

      // Get primary key column(s)
      const primaryKeys = schema
        .filter((col) => col.COLUMN_KEY === 'PRI')
        .map((col) => col.COLUMN_NAME);

      if (primaryKeys.length === 0) {
        throw new AppError(`Table ${tableName} has no primary key`, 400);
      }

      // Check if the table has timestamp columns
      const hasCreatedAt = schema.some(
        (col) => col.COLUMN_NAME === 'created_at'
      );
      const hasUpdatedAt = schema.some(
        (col) => col.COLUMN_NAME === 'updated_at'
      );
      const hasDeletedAt = schema.some(
        (col) => col.COLUMN_NAME === 'deleted_at'
      );

      // Perform the requested operation
      let result;

      switch (operation.toLowerCase()) {
        case 'create':
          result = await this.createRecord(
            connection,
            tableName,
            schema,
            data,
            hasCreatedAt,
            hasUpdatedAt
          );
          break;

        case 'bulkcreate':
          result = await this.bulkCreateRecords(
            connection,
            tableName,
            schema,
            data,
            hasCreatedAt,
            hasUpdatedAt
          );
          break;

        case 'read':
          result = await this.readRecords(
            connection,
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
            connection,
            tableName,
            schema,
            id,
            data,
            hasUpdatedAt
          );
          break;

        case 'bulkupdate':
          result = await this.bulkUpdateRecords(
            connection,
            tableName,
            schema,
            data,
            primaryKeys[0],
            hasUpdatedAt
          );
          break;

        case 'delete':
          result = await this.deleteRecord(
            connection,
            tableName,
            schema,
            id,
            softDelete,
            hasDeletedAt
          );
          break;

        case 'bulkdelete':
          result = await this.bulkDeleteRecords(
            connection,
            tableName,
            schema,
            id,
            softDelete,
            hasDeletedAt
          );
          break;

        case 'upsert':
          result = await this.upsertRecord(
            connection,
            tableName,
            schema,
            data,
            conditions,
            hasCreatedAt,
            hasUpdatedAt
          );
          break;

        case 'bulkupsert':
          result = await this.bulkUpsertRecords(
            connection,
            tableName,
            schema,
            data,
            conditions,
            hasCreatedAt,
            hasUpdatedAt
          );
          break;

        default:
          throw new AppError(`Invalid operation: ${operation}`, 400);
      }

      // Include schema in response if requested
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
   * Gets the schema for a table
   * @param {Object} connection - Database connection
   * @param {string} tableName - Name of the table
   * @returns {Promise<Array>} Promise that resolves with the table schema
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
   * Creates a record in the specified table
   * @param {Object} connection - Database connection
   * @param {string} tableName - Name of the table
   * @param {Array} schema - Table schema
   * @param {Object} data - Data to insert
   * @param {boolean} hasCreatedAt - Whether the table has a created_at column
   * @param {boolean} hasUpdatedAt - Whether the table has an updated_at column
   * @returns {Promise<Object>} Promise that resolves with the created record
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

    // Create a copy of the data to avoid modifying the original
    const recordData = { ...data };

    // Generate UUID for ID field if needed
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

    // Add timestamps if the table has them
    const now = new Date();
    if (hasCreatedAt) {
      recordData.created_at = now;
    }
    if (hasUpdatedAt) {
      recordData.updated_at = now;
    }

    // Prepare columns and values for the query
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

    // Build and execute the query
    const sql = `
      INSERT INTO ${tableName} (${columns.join(', ')})
      VALUES (${placeholders.join(', ')})
    `;

    const result = await dbModel.executeQuery(connection, sql, values);

    // Get the ID of the created record
    const insertId = result.insertId || recordData[idColumn.COLUMN_NAME];

    // Read the created record
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
   * Bulk creates records in the specified table
   * @param {Object} connection - Database connection
   * @param {string} tableName - Name of the table
   * @param {Array} schema - Table schema
   * @param {Array} dataArray - Array of data objects to insert
   * @param {boolean} hasCreatedAt - Whether the table has a created_at column
   * @param {boolean} hasUpdatedAt - Whether the table has an updated_at column
   * @returns {Promise<Object>} Promise that resolves with the created records
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

    // Get the primary key column
    const idColumn = schema.find((col) => col.COLUMN_KEY === 'PRI');
    const idColumnName = idColumn.COLUMN_NAME;

    // Prepare for bulk insert
    const now = new Date();
    const columns = new Set();
    const allValues = [];
    const createdIds = [];

    // First pass: determine all columns that will be used
    dataArray.forEach((data) => {
      Object.keys(data).forEach((key) => {
        if (schema.some((col) => col.COLUMN_NAME === key)) {
          columns.add(key);
        }
      });
    });

    // Add timestamp columns if needed
    if (hasCreatedAt) columns.add('created_at');
    if (hasUpdatedAt) columns.add('updated_at');

    // Convert Set to Array for easier handling
    const columnArray = Array.from(columns);

    // Second pass: prepare values for each record
    dataArray.forEach((data) => {
      const recordValues = [];

      // Create a copy of the data to avoid modifying the original
      const recordData = { ...data };

      // Generate UUID for ID field if needed
      if (
        idColumn &&
        !recordData[idColumnName] &&
        idColumn.DATA_TYPE.includes('char')
      ) {
        recordData[idColumnName] = uuidv4();
      }

      // Add timestamps if the table has them
      if (hasCreatedAt) {
        recordData.created_at = now;
      }
      if (hasUpdatedAt) {
        recordData.updated_at = now;
      }

      // Store the ID for later use
      if (recordData[idColumnName]) {
        createdIds.push(recordData[idColumnName]);
      }

      // Prepare values in the same order as columns
      columnArray.forEach((column) => {
        recordValues.push(
          recordData[column] !== undefined ? recordData[column] : null
        );
      });

      allValues.push(recordValues);
    });

    // Build placeholders for the query
    const placeholderGroups = allValues.map(
      () => `(${columnArray.map(() => '?').join(', ')})`
    );

    // Build and execute the query
    const sql = `
      INSERT INTO ${tableName} (${columnArray.join(', ')})
      VALUES ${placeholderGroups.join(', ')}
    `;

    // Flatten the values array for the query
    const flatValues = allValues.flat();

    const result = await dbModel.executeQuery(connection, sql, flatValues);

    // Get the created records
    let createdRecords;
    if (createdIds.length > 0) {
      // If we have IDs, fetch by IDs
      createdRecords = await this.readRecords(
        connection,
        tableName,
        schema,
        createdIds
      );
    } else if (result.insertId) {
      // Otherwise, fetch a range based on insertId
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
   * Reads records from the specified table
   * @param {Object} connection - Database connection
   * @param {string} tableName - Name of the table
   * @param {Array} schema - Table schema
   * @param {string|Array} [id] - ID or array of IDs for single or multiple record retrieval
   * @param {Object} [conditions] - Additional conditions for filtering
   * @param {Array} [fields] - Fields to return
   * @param {number} [page] - Page number for pagination
   * @param {number} [limit] - Number of records per page
   * @param {string} [orderBy] - Field to order by
   * @param {string} [orderDirection] - Order direction ('ASC' or 'DESC')
   * @param {boolean} [hasDeletedAt] - Whether the table has a deleted_at column
   * @returns {Promise<Object>} Promise that resolves with the record(s)
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
    // Determine which fields to select
    const selectFields = fields && fields.length > 0 ? fields.join(', ') : '*';

    // Build WHERE clause
    let whereClause = '';
    const whereParams = [];

    // Start with soft delete condition if applicable
    if (hasDeletedAt) {
      whereClause = 'deleted_at IS NULL';
    }

    // Add ID condition
    if (id) {
      const primaryKeyColumn = schema.find(
        (col) => col.COLUMN_KEY === 'PRI'
      ).COLUMN_NAME;

      if (Array.isArray(id)) {
        // For multiple IDs
        const idPlaceholders = id.map(() => '?').join(', ');
        const idCondition = `${primaryKeyColumn} IN (${idPlaceholders})`;
        whereClause = whereClause
          ? `${whereClause} AND ${idCondition}`
          : idCondition;
        whereParams.push(...id);
      } else {
        // For single ID
        const idCondition = `${primaryKeyColumn} = ?`;
        whereClause = whereClause
          ? `${whereClause} AND ${idCondition}`
          : idCondition;
        whereParams.push(id);
      }
    }

    // Add additional conditions
    if (conditions) {
      const conditionClauses = [];

      Object.entries(conditions).forEach(([column, value]) => {
        // Check if column exists in schema
        if (schema.some((col) => col.COLUMN_NAME === column)) {
          if (value === null) {
            conditionClauses.push(`${column} IS NULL`);
          } else if (Array.isArray(value)) {
            const placeholders = value.map(() => '?').join(', ');
            conditionClauses.push(`${column} IN (${placeholders})`);
            whereParams.push(...value);
          } else if (typeof value === 'object') {
            // Handle special operators like $gt, $lt, etc.
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
                default:
                  // Ignore unknown operators
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

    // Add ORDER BY clause
    let orderClause = '';
    if (orderBy && schema.some((col) => col.COLUMN_NAME === orderBy)) {
      const direction =
        orderDirection.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
      orderClause = `ORDER BY ${orderBy} ${direction}`;
    }

    // Get total count for pagination
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

    // Add pagination
    let limitClause = '';
    if (!id || Array.isArray(id)) {
      const offset = (page - 1) * limit;
      limitClause = `LIMIT ${limit} OFFSET ${offset}`;
    }

    // Build and execute the query
    const sql = `
      SELECT ${selectFields} FROM ${tableName}
      ${whereClause ? `WHERE ${whereClause}` : ''}
      ${orderClause}
      ${limitClause}
    `;

    const results = await dbModel.executeQuery(connection, sql, whereParams);

    // Return appropriate response based on query type
    if (id && !Array.isArray(id)) {
      // Single record lookup
      return {
        record: results.length > 0 ? results[0] : null,
      };
    } else {
      // Multiple records or search
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
   * Updates a record in the specified table
   * @param {Object} connection - Database connection
   * @param {string} tableName - Name of the table
   * @param {Array} schema - Table schema
   * @param {string} id - ID of the record to update
   * @param {Object} data - Data to update
   * @param {boolean} hasUpdatedAt - Whether the table has an updated_at column
   * @returns {Promise<Object>} Promise that resolves with the updated record
   */
  static async updateRecord(
    connection,
    tableName,
    schema,
    id,
    data,
    hasUpdatedAt
  ) {
    if (!id) {
      throw new AppError('No ID provided for update operation', 400);
    }

    if (!data || Object.keys(data).length === 0) {
      throw new AppError('No data provided for update operation', 400);
    }

    // Create a copy of the data to avoid modifying the original
    const updateData = { ...data };

    // Get the primary key column
    const primaryKeyColumn = schema.find(
      (col) => col.COLUMN_KEY === 'PRI'
    ).COLUMN_NAME;

    // Add updated_at timestamp if the table has it
    if (hasUpdatedAt) {
      updateData.updated_at = new Date();
    }

    // Prepare columns and values for the query
    const updateParts = [];
    const values = [];

    schema.forEach((column) => {
      const columnName = column.COLUMN_NAME;
      // Skip the primary key column
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

    // Add the ID to the values array
    values.push(id);

    // Build and execute the query
    const sql = `
      UPDATE ${tableName}
      SET ${updateParts.join(', ')}
      WHERE ${primaryKeyColumn} = ?
    `;

    await dbModel.executeQuery(connection, sql, values);

    // Read the updated record
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
   * Bulk updates records in the specified table
   * @param {Object} connection - Database connection
   * @param {string} tableName - Name of the table
   * @param {Array} schema - Table schema
   * @param {Array} dataArray - Array of data objects to update
   * @param {string} idField - Name of the ID field
   * @param {boolean} hasUpdatedAt - Whether the table has an updated_at column
   * @returns {Promise<Object>} Promise that resolves with the updated records
   */
  static async bulkUpdateRecords(
    connection,
    tableName,
    schema,
    dataArray,
    idField,
    hasUpdatedAt
  ) {
    if (!Array.isArray(dataArray) || dataArray.length === 0) {
      throw new AppError('No data provided for bulk update operation', 400);
    }

    // Check that all records have an ID
    const missingIds = dataArray.filter((item) => !item[idField]);
    if (missingIds.length > 0) {
      throw new AppError(
        `${missingIds.length} records are missing the ID field (${idField})`,
        400
      );
    }

    const updatedIds = [];
    const now = new Date();

    // Start a transaction for bulk update
    await dbModel.executeQuery(connection, 'START TRANSACTION');

    try {
      // Update each record individually
      for (const data of dataArray) {
        const updateData = { ...data };

        // Add updated_at timestamp if the table has it
        if (hasUpdatedAt) {
          updateData.updated_at = now;
        }

        const id = updateData[idField];
        updatedIds.push(id);

        // Remove the ID field from the update data
        delete updateData[idField];

        // Prepare columns and values for the query
        const updateParts = [];
        const values = [];

        schema.forEach((column) => {
          const columnName = column.COLUMN_NAME;
          // Skip the primary key column
          if (columnName !== idField && updateData[columnName] !== undefined) {
            updateParts.push(`${columnName} = ?`);
            values.push(updateData[columnName]);
          }
        });

        if (updateParts.length === 0) {
          continue; // Skip if no valid columns to update
        }

        // Add the ID to the values array
        values.push(id);

        // Build and execute the query
        const sql = `
          UPDATE ${tableName}
          SET ${updateParts.join(', ')}
          WHERE ${idField} = ?
        `;

        await dbModel.executeQuery(connection, sql, values);
      }

      // Commit the transaction
      await dbModel.executeQuery(connection, 'COMMIT');

      // Read the updated records
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
      // Rollback the transaction on error
      await dbModel.executeQuery(connection, 'ROLLBACK');
      throw error;
    }
  }

  /**
   * Deletes a record from the specified table
   * @param {Object} connection - Database connection
   * @param {string} tableName - Name of the table
   * @param {Array} schema - Table schema
   * @param {string|Object} id - ID of the record to delete (string for single primary key, object for composite)
   * @param {boolean} softDelete - Whether to perform a soft delete
   * @param {boolean} hasDeletedAt - Whether the table has a deleted_at column
   * @returns {Promise<Object>} Promise that resolves with deletion result
   */
  static async deleteRecord(
    connection,
    tableName,
    schema,
    id,
    softDelete,
    hasDeletedAt
  ) {
    if (!id) {
      throw new AppError('No ID provided for delete operation', 400);
    }

    // Get all primary key columns
    const primaryKeyColumns = schema
      .filter((col) => col.COLUMN_KEY === 'PRI')
      .map((col) => col.COLUMN_NAME);

    if (primaryKeyColumns.length === 0) {
      throw new AppError(`Table ${tableName} has no primary key`, 400);
    }

    // Read the record before deletion
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

    // Build WHERE clause for primary key(s)
    let whereClause = '';
    const whereParams = [];

    if (typeof id === 'object' && !Array.isArray(id)) {
      // For composite primary key
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
      // For single primary key
      whereClause = `${primaryKeyColumns[0]} = ?`;
      whereParams.push(id);
    }

    // Determine whether to soft delete or hard delete
    if (softDelete && hasDeletedAt) {
      // Soft delete - update deleted_at field
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
      // Hard delete - remove the record
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
   * Bulk deletes records from the specified table
   * @param {Object} connection - Database connection
   * @param {string} tableName - Name of the table
   * @param {Array} schema - Table schema
   * @param {Array<string|Object>} ids - Array of IDs to delete (strings for single primary key, objects for composite)
   * @param {boolean} softDelete - Whether to perform a soft delete
   * @param {boolean} hasDeletedAt - Whether the table has a deleted_at column
   * @returns {Promise<Object>} Promise that resolves with deletion result
   */
  static async bulkDeleteRecords(
    connection,
    tableName,
    schema,
    ids,
    softDelete,
    hasDeletedAt
  ) {
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new AppError('No IDs provided for bulk delete operation', 400);
    }

    // Get all primary key columns
    const primaryKeyColumns = schema
      .filter((col) => col.COLUMN_KEY === 'PRI')
      .map((col) => col.COLUMN_NAME);

    if (primaryKeyColumns.length === 0) {
      throw new AppError(`Table ${tableName} has no primary key`, 400);
    }

    // Read the records before deletion
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

    // Start a transaction for bulk delete
    await dbModel.executeQuery(connection, 'START TRANSACTION');

    try {
      // For composite keys, we need to delete one by one
      if (primaryKeyColumns.length > 1) {
        for (const id of ids) {
          // Use the single delete method for each record
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
        // For single primary key, we can do a bulk delete
        const primaryKeyColumn = primaryKeyColumns[0];

        // Extract the IDs (which might be objects for composite keys)
        const simpleIds = ids.map((id) =>
          typeof id === 'object' ? id[primaryKeyColumn] : id
        );

        // Create placeholders for the query
        const placeholders = simpleIds.map(() => '?').join(', ');

        // Determine whether to soft delete or hard delete
        if (softDelete && hasDeletedAt) {
          // Soft delete - update deleted_at field
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
          // Hard delete - remove the records
          const sql = `
          DELETE FROM ${tableName}
          WHERE ${primaryKeyColumn} IN (${placeholders})
        `;

          await dbModel.executeQuery(connection, sql, simpleIds);
        }
      }

      // Commit the transaction
      await dbModel.executeQuery(connection, 'COMMIT');

      return {
        message: `${ids.length} records ${
          softDelete && hasDeletedAt ? 'soft ' : ''
        }deleted successfully from ${tableName}`,
        count: ids.length,
        ids,
        deletedRecords: recordsToDelete.records,
      };
    } catch (error) {
      // Rollback the transaction on error
      await dbModel.executeQuery(connection, 'ROLLBACK');
      throw error;
    }
  }

  /**
   * Performs an upsert operation (delete then insert)
   * @param {Object} connection - Database connection
   * @param {string} tableName - Name of the table
   * @param {Array} schema - Table schema
   * @param {Object} data - Data to upsert
   * @param {Object} conditions - Conditions to identify existing records to replace
   * @param {boolean} hasCreatedAt - Whether the table has a created_at column
   * @param {boolean} hasUpdatedAt - Whether the table has an updated_at column
   * @returns {Promise<Object>} Promise that resolves with the upserted record
   */
  static async upsertRecord(
    connection,
    tableName,
    schema,
    data,
    conditions,
    hasCreatedAt,
    hasUpdatedAt
  ) {
    if (!data) {
      throw new AppError('No data provided for upsert operation', 400);
    }

    if (!conditions || Object.keys(conditions).length === 0) {
      throw new AppError('No conditions provided for upsert operation', 400);
    }

    // Start transaction
    await dbModel.executeQuery(connection, 'START TRANSACTION');

    try {
      // Build WHERE clause for deletion
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

      // Delete existing records that match the conditions
      const deleteSQL = `DELETE FROM ${tableName} WHERE ${whereConditions.join(
        ' AND '
      )}`;
      await dbModel.executeQuery(connection, deleteSQL, whereParams);

      // Create a copy of the data to avoid modifying the original
      const recordData = { ...data };

      // Generate UUID for ID field if needed
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

      // Add timestamps if the table has them
      const now = new Date();
      if (hasCreatedAt) {
        recordData.created_at = now;
      }
      if (hasUpdatedAt) {
        recordData.updated_at = now;
      }

      // Prepare columns and values for the insert query
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

      // Build and execute the insert query
      const insertSQL = `
      INSERT INTO ${tableName} (${columns.join(', ')})
      VALUES (${placeholders.join(', ')})
    `;

      const result = await dbModel.executeQuery(connection, insertSQL, values);

      // Commit transaction
      await dbModel.executeQuery(connection, 'COMMIT');

      // Get the ID of the upserted record
      const insertId = result.insertId || recordData[idColumn.COLUMN_NAME];

      // Read the upserted record
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
      // Rollback transaction on error
      await dbModel.executeQuery(connection, 'ROLLBACK');
      throw error;
    }
  }

  /**
   * Performs a bulk upsert operation (delete then bulk insert)
   * @param {Object} connection - Database connection
   * @param {string} tableName - Name of the table
   * @param {Array} schema - Table schema
   * @param {Array} dataArray - Array of data objects to upsert
   * @param {Object} conditions - Conditions to identify existing records to replace
   * @param {boolean} hasCreatedAt - Whether the table has a created_at column
   * @param {boolean} hasUpdatedAt - Whether the table has an updated_at column
   * @returns {Promise<Object>} Promise that resolves with the upserted records
   */
  static async bulkUpsertRecords(
    connection,
    tableName,
    schema,
    dataArray,
    conditions,
    hasCreatedAt,
    hasUpdatedAt
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

    // Start transaction
    await dbModel.executeQuery(connection, 'START TRANSACTION');

    try {
      // Build WHERE clause for deletion
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

      // Delete existing records that match the conditions
      const deleteSQL = `DELETE FROM ${tableName} WHERE ${whereConditions.join(
        ' AND '
      )}`;
      await dbModel.executeQuery(connection, deleteSQL, whereParams);

      // Get the primary key column
      const idColumn = schema.find((col) => col.COLUMN_KEY === 'PRI');
      const idColumnName = idColumn.COLUMN_NAME;

      // Prepare for bulk insert
      const now = new Date();
      const columns = new Set();
      const allValues = [];
      const createdIds = [];

      // First pass: determine all columns that will be used
      dataArray.forEach((data) => {
        Object.keys(data).forEach((key) => {
          if (schema.some((col) => col.COLUMN_NAME === key)) {
            columns.add(key);
          }
        });
      });

      // Add timestamp columns if needed
      if (hasCreatedAt) columns.add('created_at');
      if (hasUpdatedAt) columns.add('updated_at');

      // Convert Set to Array for easier handling
      const columnArray = Array.from(columns);

      // Second pass: prepare values for each record
      dataArray.forEach((data) => {
        const recordValues = [];

        // Create a copy of the data to avoid modifying the original
        const recordData = { ...data };

        // Generate UUID for ID field if needed
        if (
          idColumn &&
          !recordData[idColumnName] &&
          idColumn.DATA_TYPE.includes('char')
        ) {
          recordData[idColumnName] = uuidv4();
        }

        // Add timestamps if the table has them
        if (hasCreatedAt) {
          recordData.created_at = now;
        }
        if (hasUpdatedAt) {
          recordData.updated_at = now;
        }

        // Store the ID for later use
        if (recordData[idColumnName]) {
          createdIds.push(recordData[idColumnName]);
        }

        // Prepare values in the same order as columns
        columnArray.forEach((column) => {
          recordValues.push(
            recordData[column] !== undefined ? recordData[column] : null
          );
        });

        allValues.push(recordValues);
      });

      // Build placeholders for the query
      const placeholderGroups = allValues.map(
        () => `(${columnArray.map(() => '?').join(', ')})`
      );

      // Build and execute the query
      const sql = `
      INSERT INTO ${tableName} (${columnArray.join(', ')})
      VALUES ${placeholderGroups.join(', ')}
    `;

      // Flatten the values array for the query
      const flatValues = allValues.flat();

      const result = await dbModel.executeQuery(connection, sql, flatValues);

      // Commit transaction
      await dbModel.executeQuery(connection, 'COMMIT');

      // Get the created records
      let upsertedRecords;
      if (createdIds.length > 0) {
        // If we have IDs, fetch by IDs
        upsertedRecords = await this.readRecords(
          connection,
          tableName,
          schema,
          createdIds
        );
      } else if (result.insertId) {
        // Otherwise, fetch a range based on insertId
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
      // Rollback transaction on error
      await dbModel.executeQuery(connection, 'ROLLBACK');
      throw error;
    }
  }

  /**
   * Performs a transaction with multiple CRUD operations
   * @param {Object} connection - Database connection
   * @param {Array} operations - Array of CRUD operations to perform
   * @returns {Promise<Object>} Promise that resolves with the results of all operations
   */
  static async performTransaction(connection, operations) {
    if (!Array.isArray(operations) || operations.length === 0) {
      throw new AppError('No operations provided for transaction', 400);
    }

    // Start a transaction
    await dbModel.executeQuery(connection, 'START TRANSACTION');

    try {
      const results = [];

      // Execute each operation in sequence
      for (const operation of operations) {
        const result = await this.performCrud({
          ...operation,
          connection,
        });

        results.push(result);
      }

      // Commit the transaction
      await dbModel.executeQuery(connection, 'COMMIT');

      return {
        message: 'Transaction completed successfully',
        results,
      };
    } catch (error) {
      // Rollback the transaction on error
      await dbModel.executeQuery(connection, 'ROLLBACK');
      throw error;
    }
  }
}

export default CrudOperations;
