import * as dbConn from './dbConn.js';
import AppError from './appError.js';
import CrudOperations from './crud.js';
import {
  saveBase64File,
  saveBase64Image,
  deleteFile,
  deleteImage,
} from './fileUpload.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Enhanced data model utility for standard database operations and file handling
 */
export default class DataModelUtils {
  /**
   * Creates a new DataModelUtils instance
   * @param {Object} config - Configuration object
   * @param {string} config.tableName - Database table name
   * @param {string} config.entityName - Human-readable entity name (e.g., 'product packing')
   * @param {string} config.entityIdField - Primary entity ID field (e.g., 'product_id')
   * @param {Object} [config.validations] - Validation rules for fields
   * @param {Object} [config.defaults] - Default values for fields
   * @param {Array<string>} [config.requiredFields] - Required fields for creation
   * @param {Object|Array<Object>} [config.joinConfig] - Configuration for joined queries
   * @param {Object} [config.fileConfig] - Configuration for file handling
   * @param {string} [config.fileConfig.fileUrlField] - Name of the file URL field (e.g., 'image_url')
   * @param {string} [config.fileConfig.uploadDir] - Base upload directory pattern (e.g., 'public/uploads/customizations/{id}')
   * @param {string} [config.fileConfig.fileTypeField] - Optional name of the file type field (e.g., 'file_type')
   * @param {string} [config.fileConfig.descriptionField] - Optional name of the description field
   * @param {boolean} [config.fileConfig.imagesOnly=false] - Whether this handler is for images only
   * @param {string} [config.database='trade_business'] - Database to use ('trade_business' or 'auth')
   */
  constructor(config) {
    this.tableName = config.tableName;
    this.entityName = config.entityName;
    this.entityIdField = config.entityIdField;
    this.validations = config.validations || {};
    this.defaults = config.defaults || {};
    this.requiredFields = config.requiredFields || [];
    this.joinConfig = config.joinConfig;
    this.database = config.database || 'trade_business';
    this.childTableConfig = config.childTableConfig || [];
    this.tableFields = config.tableFields || {};

    // Create database connection
    this.db = dbConn.createDbConnection(this.database);

    // File handling configuration
    this.hasFileHandling = !!config.fileConfig;
    if (this.hasFileHandling) {
      this.fileUrlField = config.fileConfig.fileUrlField;
      this.uploadDirPattern = config.fileConfig.uploadDir;
      this.fileTypeField = config.fileConfig.fileTypeField;
      this.descriptionField = config.fileConfig.descriptionField;
      this.imagesOnly = config.fileConfig.imagesOnly || false;

      // File type name for messages (derived from fileUrlField)
      this.fileTypeName = this.fileUrlField.replace('_url', '');
    }
  }

  /**
   * Common helper function to validate and save Base64 file or image
   * @param {Object} data - Data containing Base64 file
   * @param {Object} options - Options such as entityId and fileType
   * @returns {Promise<string>} - Returns the file URL
   */
  async _validateAndSaveFile(data, options = {}) {
    const { entityId, fileType } = options;
    const base64FieldName = this.imagesOnly ? 'base64_image' : 'base64_file';

    if (!data[base64FieldName]) return null;

    if (this.fileTypeField && !this.imagesOnly && !fileType) {
      throw new AppError('File type is required', 400);
    }

    // Determine allowed file types if needed
    let allowedTypes = ['IMAGE'];
    if (!this.imagesOnly && fileType) {
      if (fileType === 'document') allowedTypes = ['DOCUMENT'];
      else if (fileType === 'pdf') allowedTypes = ['PDF'];
      else if (fileType === 'spreadsheet') allowedTypes = ['SPREADSHEET'];
      else if (fileType === 'presentation') allowedTypes = ['PRESENTATION'];
      else if (fileType === 'archive') allowedTypes = ['ARCHIVE'];
    }

    // Save the file to the filesystem
    const uploadDir = this.getUploadDir(entityId, fileType);
    let fileUrl;

    if (this.imagesOnly) {
      fileUrl = await saveBase64Image(data.base64_image, uploadDir);
    } else {
      fileUrl = await saveBase64File(data.base64_file, uploadDir, {
        allowedTypes,
      });
    }

    return fileUrl;
  }

  /**
   * Common helper function to process Base64 content for a file
   * @param {Object} file - File entity containing file URL
   * @param {Object} options - Options for compression and Base64 generation
   * @returns {Promise<Object>} - Returns the file entity with Base64 content
   */
  async _processBase64Content(file, options = {}) {
    const {
      compress = false,
      maxWidth = 800,
      maxHeight = 800,
      quality = 0.7,
    } = options;

    const fs = await import('fs/promises');
    const path = await import('path');
    let sharp;

    if (compress) {
      try {
        sharp = (await import('sharp')).default;
      } catch (error) {
        console.warn('Sharp module not available. Compression disabled.');
      }
    }

    try {
      const filePath = file[this.fileUrlField]?.replace(/^\//, ''); // Remove leading slash if present
      if (!filePath) throw new AppError('File URL is not available', 400);

      await fs.access(filePath);

      const ext = path.extname(filePath).toLowerCase();
      let mimeType = 'application/octet-stream';

      // Determine MIME type
      if (['.jpg', '.jpeg'].includes(ext)) mimeType = 'image/jpeg';
      else if (ext === '.png') mimeType = 'image/png';
      else if (ext === '.gif') mimeType = 'image/gif';
      else if (ext === '.pdf') mimeType = 'application/pdf';

      const isImage = ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext);

      if (isImage && compress && sharp) {
        const imageBuffer = await fs.readFile(filePath);
        const compressedBuffer = await sharp(imageBuffer)
          .resize({
            width: maxWidth,
            height: maxHeight,
            fit: 'inside',
            withoutEnlargement: true,
          })
          .jpeg({ quality: quality * 100 })
          .toBuffer();

        const base64Content = compressedBuffer.toString('base64');
        file[
          this.imagesOnly ? 'base64_image' : 'base64_file'
        ] = `data:image/jpeg;base64,${base64Content}`;
        file.is_compressed = true;
      } else {
        const fileBuffer = await fs.readFile(filePath);
        const base64Content = fileBuffer.toString('base64');
        file[
          this.imagesOnly ? 'base64_image' : 'base64_file'
        ] = `data:${mimeType};base64,${base64Content}`;
        file.is_compressed = false;
      }
    } catch (error) {
      console.error(`Error processing file: ${error.message}`);
      file[this.imagesOnly ? 'base64_image' : 'base64_file'] = null;
      file.error = error.message;
    }

    return file;
  }

  /**
   * Retrieves all field names from `this.tableFields`.
   * @returns {Array<string>} Array of field names.
   */
  _fieldNames() {
    if (!this.tableFields || typeof this.tableFields !== 'object') {
      throw new Error('Invalid or undefined tableFields.');
    }

    // Extract and return the field names from this.tableFields
    return Object.keys(this.tableFields.fields);
  }

  _gettingSchemaConfig(dataTemplate = {}) {
    // Add current table fields
    dataTemplate[this.tableName] = this.tableFields;

    // Recursively add child table fields
    for (const childConfig of this.childTableConfig) {
      childConfig.model._gettingSchemaConfig(dataTemplate);
    }
    return dataTemplate;
  }

  /**
   * Finds the field name marked as primaryKey: true in the schema
   */
  _getPrimaryKey(tableSchema) {
    for (const [fieldName, fieldConfig] of Object.entries(tableSchema)) {
      if (fieldConfig.primaryKey) {
        return fieldName;
      }
    }
    return 'id'; // Fallback default if not explicitly defined
  }

  async _determineRowAction(row, globalActionType, currentModel, tableSchema) {
    // 1. Force create if global action dictates it
    if (globalActionType === 'create') {
      return 'create';
    }

    // 2. Identify the Primary Key field
    const pkField = this._getPrimaryKey(tableSchema);
    const pkValue = row[pkField];

    // 3. If no PK value in JSON, it MUST be a create
    if (!pkValue) {
      return 'create';
    }

    // 4. Check the Database
    // We use currentModel because that instance knows its own tableName and has the DB pool
    const exists = await currentModel.checkExists(pkValue, pkField);

    if (exists) {
      return 'update';
    } else {
      // If ID is provided but not found in DB, we treat it as a 'create'
      // (inserting a record with a specific pre-defined ID)
      return 'create';
    }
  }

  /**
   * Recursively processes a list of rows for a specific table
   */
  async _processRecursive(
    tableName,
    rows,
    parentData,
    parentTableName,
    currentModel,
    result,
    schemaConfig,
    globalActionType
  ) {
    const tableSchema = schemaConfig[tableName];

    for (const rawRow of rows) {
      // 1. Determine Action for THIS specific row
      const rowAction = await this._determineRowAction(
        rawRow,
        globalActionType,
        currentModel,
        tableSchema
      );

      // 2. Prepare the DB Row
      const validEntry = await this._prepareDbRow(
        rawRow,
        tableSchema,
        parentData,
        parentTableName,
        currentModel,
        rowAction
      );

      // 3. Add to result buckets using 'rowAction'
      if (rowAction === 'create') {
        result.createData[tableName] = result.createData[tableName] || [];
        result.createData[tableName].push(validEntry);
      } else {
        result.updateData[tableName] = result.updateData[tableName] || [];
        result.updateData[tableName].push(validEntry);
      }

      // 4. Process Children (Drill down)
      await this._processChildren(
        rawRow,
        validEntry,
        tableName,
        currentModel,
        result,
        schemaConfig,
        globalActionType // 🟢 Pass the global preference down
      );
    }
  }

  /**
   * Inspects the raw row for nested arrays and triggers recursion
   */
  async _processChildren(
    rawRow,
    validEntry,
    currentTableName,
    currentModel,
    result,
    schemaConfig,
    actionType
  ) {
    for (const [key, value] of Object.entries(rawRow)) {
      // Skip if not an array (children are always arrays)
      if (!Array.isArray(value)) continue;

      // 🔍 KEY FIX: Look for child config inside the CURRENT model, not 'this'
      const childConfig = currentModel.childTableConfig.find(
        (config) => config.model.tableName === key
      );

      // If this key corresponds to a known child model, recurse
      if (childConfig && childConfig.model) {
        await this._processRecursive(
          key, // Child table name
          value, // Child rows array
          validEntry, // Parent Data (the row we just created)
          currentTableName, // Parent Table Name
          childConfig.model, // 🟢 Pass the Child Model for the next iteration
          result,
          schemaConfig,
          actionType
        );
      }
    }
  }

  /**
   * Cleans a single row, applies defaults, and handles IDs/Foreign Keys
   */
  async _prepareDbRow(
    rawRow,
    tableSchema,
    parentData,
    parentTableName,
    currentModel,
    rowAction
  ) {
    let validEntry = {};
    const pkField = this._getPrimaryKey(tableSchema);

    // 1. Copy Fields (Clean data)
    for (const field in rawRow) {
      if (
        tableSchema[field] ||
        field === 'base64_image' ||
        field === 'base64_file'
      ) {
        validEntry[field] = rawRow[field];
      }
    }

    // 2. Link Foreign Key (Parent ID)
    if (parentData && parentTableName) {
      for (const [field, fieldConfig] of Object.entries(tableSchema)) {
        if (
          fieldConfig.references &&
          fieldConfig.references.table === parentTableName
        ) {
          // Find the Parent's Primary Key field name (usually 'id' but let's be safe)
          // Note: We need the parent's schema to do this perfectly,
          // but usually parentData already contains the resolved ID.
          // Assuming parentData has its PK set.

          // We look for the Parent's PK value in parentData.
          // Since parentData is a processed 'validEntry', it uses the DB field names.
          // We can try to guess the parent PK or assume standard 'id' for the parent reference
          // if we don't pass parentSchema.
          // For now, let's assume parentData has the key that this field references.

          const parentPkField = fieldConfig.references.field; // e.g. 'id'
          if (parentData[parentPkField]) {
            validEntry[field] = parentData[parentPkField];
          }
        }
      }
    }

    // 3. Apply Defaults
    validEntry = await currentModel.applyDefaults(validEntry);

    // 4. Handle Primary Key Logic
    if (rowAction === 'create') {
      // If create, and PK is missing, generate UUID
      if (!validEntry[pkField]) {
        // Only generate UUID if the schema type is VARCHAR(36) or similar
        // If it's AUTO_INCREMENT int, we should NOT generate it.
        const pkConfig = tableSchema[pkField];
        if (pkConfig.type && pkConfig.type.toUpperCase().includes('VARCHAR')) {
          validEntry[pkField] = uuidv4();
        }
      }
    } else {
      // If update, PK must exist
      if (!validEntry[pkField]) {
        throw new AppError(
          `Primary Key "${pkField}" missing for update in ${currentModel.tableName}`,
          400
        );
      }
    }

    return validEntry;
  }

  /**
   * Main entry point to refactor nested JSON into flat DB structures
   * @param {Object} jsonData - The nested input data
   * @param {string} actionType - 'create' or 'update'
   */
  async refactoringData(jsonData, actionType) {
    // 1. Validation
    if (!jsonData || typeof jsonData !== 'object') {
      throw new AppError('Invalid JSON data provided', 400);
    }
    if (!['create', 'update'].includes(actionType)) {
      throw new AppError(
        'Invalid actionType. Must be "create" or "update".',
        400
      );
    }

    // 2. Setup
    const schemaConfig = this._gettingSchemaConfig({});
    const result = {
      createData: {},
      updateData: {},
    };

    // 3. Process Top-Level Tables
    for (const [tableName, tableRows] of Object.entries(jsonData)) {
      if (!schemaConfig[tableName]) {
        throw new AppError(`Table "${tableName}" not found in schema`, 400);
      }

      // Start the recursive engine
      await this._processRecursive(
        tableName,
        tableRows,
        null, // No parent data yet
        null, // No parent table name yet
        this, // Start with current model
        result, // Accumulator
        schemaConfig, // Global schema map
        actionType
      );
    }

    return result;
  }

  /**
   * Checks if a record exists in the database.
   * @param {string|number} value - The value to search for (e.g., the UUID).
   * @param {string} fieldName - The column name (e.g., 'id' or 'code').
   * @returns {Promise<boolean>} - True if exists, False otherwise.
   */
  async checkExists(value, fieldName = 'id') {
    if (!value) return false;

    const sql = `SELECT 1 FROM ${this.tableName} WHERE ${fieldName} = ? LIMIT 1`;

    try {
      const rows = await this.executeQuery(sql, [value]);

      // Now 'rows' is the full array: [ { '1': 1 } ]
      // So rows.length will be 1
      return Array.isArray(rows) && rows.length > 0;
    } catch (error) {
      console.error(`Error checking existence in ${this.tableName}:`, error);
      return false; // Assume not found on error to be safe, or throw
    }
  }

  /**
   * Validates data against validation rules
   * @param {Object} data - Data to validate
   * @param {boolean} [isUpdate=false] - Whether this is an update operation
   * @throws {AppError} If validation fails
   */
  validateData(data, isUpdate = false) {
    // Check required fields (only for creation)
    if (!isUpdate) {
      for (const field of this.requiredFields) {
        if (
          data[field] === undefined ||
          data[field] === null ||
          data[field] === ''
        ) {
          throw new AppError(
            `${this._formatFieldName(field)} is required`,
            400
          );
        }
      }
    }

    // Apply field validations
    for (const [field, validations] of Object.entries(this.validations)) {
      // Skip validation if field is not provided (for updates)
      if (data[field] === undefined) continue;

      // Required validation
      if (
        validations.required &&
        (data[field] === undefined ||
          data[field] === null ||
          data[field] === '')
      ) {
        throw new AppError(`${this._formatFieldName(field)} is required`, 400);
      }

      // Minimum value validation
      if (validations.min !== undefined && data[field] < validations.min) {
        throw new AppError(
          `${this._formatFieldName(field)} must be at least ${validations.min}`,
          400
        );
      }

      // Maximum value validation
      if (validations.max !== undefined && data[field] > validations.max) {
        throw new AppError(
          `${this._formatFieldName(field)} cannot exceed ${validations.max}`,
          400
        );
      }

      // String length validation
      if (
        validations.minLength !== undefined &&
        typeof data[field] === 'string' &&
        data[field].length < validations.minLength
      ) {
        throw new AppError(
          `${this._formatFieldName(field)} must be at least ${
            validations.minLength
          } characters`,
          400
        );
      }

      // Custom validation function
      if (validations.validate && typeof validations.validate === 'function') {
        const validationResult = validations.validate(data[field], data);
        if (validationResult !== true) {
          throw new AppError(
            validationResult || `Invalid ${this._formatFieldName(field)}`,
            400
          );
        }
      }
    }
  }

  /**
   * Formats a field name for error messages
   * @param {string} field - The field name
   * @returns {string} Formatted field name
   * @private
   */
  _formatFieldName(field) {
    return field
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Applies default values to data
   * @param {Object} data - Data to apply defaults to
   * @returns {Promise<Object>} Data with defaults applied
   */
  async applyDefaults(data) {
    const result = { ...data };
    console.log('applyDefaults: ', this.tableName, this.defaults);
    console.log('applyDefaults - data: ', data);

    for (const [field, defaultValue] of Object.entries(this.defaults)) {
      if (result[field] === undefined) {
        if (typeof defaultValue === 'function') {
          // Check if the function is async
          if (defaultValue.constructor.name === 'AsyncFunction') {
            result[field] = await defaultValue(); // Await async function
          } else {
            result[field] = defaultValue(); // Call synchronous function
          }
        } else {
          result[field] = defaultValue; // Assign value directly
        }
      }
    }
    console.log('applyDefaults - result: ', result);
    return result;
  }
  /**
   * Creates a new entity
   * @param {Object} data - The entity data to create
   * @returns {Promise<Object>} Promise that resolves with the newly created entity
   */
  async create(data) {
    try {
      this.validateData(data);

      if (this.hasFileHandling) {
        const fileType = data[this.fileTypeField];
        data[this.fileUrlField] = await this._validateAndSaveFile(data, {
          entityId: data[this.entityIdField],
          fileType,
        });
      }

      const result = await CrudOperations.performCrud({
        operation: 'create',
        tableName: this.tableName,
        data,
        connection: this.db.pool,
      });

      return {
        message: `${this._capitalize(this.entityName)} created successfully`,
        [this._camelCase(this.entityName)]: result.record,
      };
    } catch (error) {
      throw new AppError(
        `Failed to create ${this.entityName}: ${error.message}`,
        error.statusCode || 500
      );
    }
  }

  /**
   * Gets an entity by ID
   * @param {number|string} id - The ID of the entity to retrieve
   * @param {Object} options - Options for Base64 content
   * @returns {Promise<Object>} Promise that resolves with the entity data
   */
  async getById(id, options = {}) {
    try {
      const result = await CrudOperations.performCrud({
        operation: 'read',
        tableName: this.tableName,
        id,
        connection: this.db.pool,
      });

      if (!result.record) {
        throw new AppError(
          `${this._capitalize(this.entityName)} not found`,
          404
        );
      }

      const entity = result.record;
      if (this.hasFileHandling && options.includeBase64) {
        return this._processBase64Content(entity, options);
      }

      return entity;
    } catch (error) {
      throw new AppError(
        `Failed to get ${this.entityName}: ${error.message}`,
        error.statusCode || 500
      );
    }
  }

  /**
   * Gets all entities for a parent entity
   * @param {string|number} parentId - The parent entity ID
   * @param {boolean} includeBase64 - Whether to include Base64 content
   * @param {Object} options - Options for compression and Base64
   * @returns {Promise<Array>} Promise that resolves with the entities
   */
  async getAllByParentId(parentId, includeBase64 = false, options = {}) {
    try {
      const sql = `
        SELECT * FROM ${this.tableName}
        WHERE ${this.entityIdField} = ?
        ORDER BY id
      `;

      const results = await this.db.executeQuery(sql, [parentId]);
      if (!includeBase64 || !this.hasFileHandling) return results;

      return Promise.all(
        results.map((file) => this._processBase64Content(file, options))
      );
    } catch (error) {
      throw new AppError(
        `Failed to get ${this.entityName}s: ${error.message}`,
        error.statusCode || 500
      );
    }
  }

  /**
   * Updates an entity
   * @param {number|string} id - The ID of the entity to update
   * @param {Object} data - The entity data to update
   * @returns {Promise<Object>} Promise that resolves with the updated entity
   */
  async update(id, data) {
    try {
      this.validateData(data, true);

      const existing = await this.getById(id);
      if (this.hasFileHandling) {
        const fileType =
          data[this.fileTypeField] || existing[this.fileTypeField];
        data[this.fileUrlField] = await this._validateAndSaveFile(data, {
          entityId: id,
          fileType,
        });

        if (data[this.fileUrlField] && existing[this.fileUrlField]) {
          this.imagesOnly
            ? await deleteImage(existing[this.fileUrlField])
            : await deleteFile(existing[this.fileUrlField]);
        }
      }

      const result = await CrudOperations.performCrud({
        operation: 'update',
        tableName: this.tableName,
        id,
        data,
        connection: this.db.pool,
      });

      return {
        message: `${this._capitalize(this.entityName)} updated successfully`,
        [this._camelCase(this.entityName)]: result.record,
      };
    } catch (error) {
      throw new AppError(
        `Failed to update ${this.entityName}: ${error.message}`,
        error.statusCode || 500
      );
    }
  }

  /**
   * Deletes an entity
   * @param {number|string} id - The ID of the entity to delete
   * @returns {Promise<Object>} Promise that resolves with deletion result
   */
  async delete(id) {
    try {
      // Check if entity exists
      const entity = await this.getById(id);

      // For file handling models, delete the associated file
      if (this.hasFileHandling && entity[this.fileUrlField]) {
        if (this.imagesOnly) {
          await deleteImage(entity[this.fileUrlField]);
        } else {
          await deleteFile(entity[this.fileUrlField]);
        }
      }

      // Delete the entity using CRUD utility
      await CrudOperations.performCrud({
        operation: 'delete',
        tableName: this.tableName,
        id: id,
        connection: this.db.pool,
      });

      return {
        message: `${this._capitalize(this.entityName)} deleted successfully`,
        id,
      };
    } catch (error) {
      throw new AppError(
        `Failed to delete ${this.entityName}: ${error.message}`,
        error.statusCode || 500
      );
    }
  }

  /**
   * Deletes all entities for a parent entity
   * @param {string|number} parentId - The parent entity ID
   * @returns {Promise<Object>} Promise that resolves with deletion result
   */
  async deleteAllByParentId(parentId) {
    try {
      // Get all entities for this parent
      const entities = await this.getAllByParentId(parentId);

      if (entities.length === 0) {
        return {
          message: `No ${
            this.entityName
          }s found for this ${this.entityIdField.replace('_id', '')}`,
          count: 0,
        };
      }

      // For file handling models, delete the associated files
      if (this.hasFileHandling) {
        for (const entity of entities) {
          if (entity[this.fileUrlField]) {
            if (this.imagesOnly) {
              await deleteImage(entity[this.fileUrlField]);
            } else {
              await deleteFile(entity[this.fileUrlField]);
            }
          }
        }
      }

      // Delete the entities
      await CrudOperations.performCrud({
        operation: 'delete',
        tableName: this.tableName,
        conditions: { [this.entityIdField]: parentId },
        connection: this.db.pool,
      });

      return {
        message: `${this._capitalize(this.entityName)}s deleted successfully`,
        count: entities.length,
      };
    } catch (error) {
      throw new AppError(
        `Failed to delete ${this.entityName}s: ${error.message}`,
        error.statusCode || 500
      );
    }
  }

  /**
   * Begins a database transaction
   * @returns {Promise<Object>} Connection with active transaction
   */
  async beginTransaction() {
    try {
      return await this.db.beginTransaction();
    } catch (error) {
      throw new AppError(
        `Failed to start transaction: ${error.message}`,
        error.statusCode || 500
      );
    }
  }

  /**
   * Commits a database transaction
   * @param {Object} connection - Connection with active transaction
   * @returns {Promise<void>}
   */
  async commitTransaction(connection) {
    try {
      await this.db.commitTransaction(connection);
    } catch (error) {
      throw new AppError(
        `Failed to commit transaction: ${error.message}`,
        error.statusCode || 500
      );
    }
  }

  /**
   * Rolls back a database transaction
   * @param {Object} connection - Connection with active transaction
   * @returns {Promise<void>}
   */
  async rollbackTransaction(connection) {
    try {
      await this.db.rollbackTransaction(connection);
    } catch (error) {
      throw new AppError(
        `Failed to rollback transaction: ${error.message}`,
        error.statusCode || 500
      );
    }
  }

  /**
   * Execute a custom SQL query
   * @param {string} sql - SQL query to execute
   * @param {Array} [params=[]] - Query parameters
   * @returns {Promise<Array>} Query results
   */
  async executeQuery(sql, params = []) {
    try {
      return await this.db.executeQuery(sql, params);
    } catch (error) {
      throw new AppError(
        `Query execution failed: ${error.message}`,
        error.statusCode || 500
      );
    }
  }

  /**
   * Executes a function within a transaction
   * @param {Function} fn - The function to execute within the transaction
   * @returns {Promise<any>} The result of the function execution
   */
  async withTransaction(fn) {
    try {
      return await this.db.executeTransaction(fn);
    } catch (error) {
      throw new AppError(
        `Transaction failed: ${error.message}`,
        error.statusCode || 500
      );
    }
  }

  /**
   * Capitalizes the first letter of a string
   * @param {string} str - The string to capitalize
   * @returns {string} Capitalized string
   * @private
   */
  _capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * Converts a string to camelCase
   * @param {string} str - The string to convert
   * @returns {string} camelCase string
   * @private
   */
  _camelCase(str) {
    return str
      .replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, (match, index) => {
        if (+match === 0) return '';
        return index === 0 ? match.toLowerCase() : match.toUpperCase();
      })
      .replace(/\s+/g, '');
  }

  /**
   * Pluralizes a string (simple version)
   * @param {string} str - The string to pluralize
   * @returns {string} Pluralized string
   * @private
   */
  _pluralize(str) {
    return str + 's';
  }

  // FILE HANDLING METHODS

  /**
   * Gets the upload directory for a specific entity
   * @param {string} entityId - The entity ID
   * @param {string} [fileType] - Optional file type for subdirectory
   * @returns {string} The upload directory
   */
  getUploadDir(entityId, fileType = null) {
    if (!this.hasFileHandling) {
      throw new AppError('File handling is not configured for this model', 500);
    }

    let dir = this.uploadDirPattern.replace('{id}', entityId);
    if (fileType && !this.imagesOnly) {
      dir += `/${fileType}`;
    }
    return dir;
  }

  /**
   * Reorders files
   * @param {string|number} entityId - The entity ID
   * @param {Array<{id: number, display_order: number}>} orderData - Array of objects with file IDs and new display orders
   * @returns {Promise<Object>} Promise that resolves with reordering result
   */
  async reorderFiles(entityId, orderData) {
    if (!this.hasFileHandling) {
      throw new AppError('File handling is not configured for this model', 500);
    }

    try {
      // Use transaction for this operation
      return await this.db.executeTransaction(async (connection) => {
        // Update display order for each file
        for (const item of orderData) {
          await CrudOperations.performCrud({
            operation: 'update',
            tableName: this.tableName,
            id: item.id,
            data: { display_order: item.display_order },
            connection: this.db.pool,
          });
        }

        // Get the updated files
        const files = await this.getAllByParentId(entityId);

        return {
          message: `${this._capitalize(
            this.entityName
          )}s reordered successfully`,
          [this.entityIdField]: entityId,
          [this._pluralize(this._camelCase(this.entityName))]: files,
        };
      });
    } catch (error) {
      throw new AppError(
        `Failed to reorder ${this.entityName}s: ${error.message}`,
        error.statusCode || 500
      );
    }
  }

  /**
   * Truncates a database table
   * @returns {Promise<Object>} Promise that resolves with truncation result
   */
  async truncateTable() {
    try {
      // Use transaction for this operation
      return await this.withTransaction(async (connection) => {
        // First disable foreign key checks to allow truncate
        await this.executeQuery('SET FOREIGN_KEY_CHECKS = 0');

        // Truncate the table
        await this.executeQuery(`TRUNCATE TABLE ${this.tableName}`);

        // Re-enable foreign key checks
        await this.executeQuery('SET FOREIGN_KEY_CHECKS = 1');

        return {
          success: true,
          message: `${this._capitalize(
            this.entityName
          )}s table has been truncated successfully`,
        };
      });
    } catch (error) {
      throw new AppError(
        `Failed to truncate ${this.entityName}s: ${error.message}`,
        500
      );
    }
  }
}
