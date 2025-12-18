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

  _gettingSchemaConfig(dataTemplate) {
    dataTemplate = dataTemplate || {};
    dataTemplate[this.tableName] = this.tableFields;
    // check if there is models
    for (const childConfig of this.childTableConfig) {
      childConfig.model._gettingSchemaConfig(dataTemplate);
    }
    return dataTemplate;
  }

  // getting the parent id from parent table schema by child schema
  _gettingParentId = (parentTableName, parentData, currentTableSchema) => {
    for (const [k, v] of Object.entries(currentTableSchema)) {
      if (!v.references) {
        continue;
      }
      const { table, field } = v.references;
      if (table !== parentTableName) {
        continue;
      }
      for (const [pdk, pdv] of Object.entries(parentData)) {
        if (pdk === field) {
          return pdv;
        }
      }
    }
    return;
  };

  async refactoringData(jsonData, actionType) {
    try {
      // Validate input JSON data
      if (!jsonData || typeof jsonData !== 'object') {
        throw new AppError('Invalid JSON data provided', 400);
      }

      // Validate actionType
      if (!['create', 'update'].includes(actionType)) {
        throw new AppError(
          'Invalid actionType. Must be "create" or "update".',
          400
        );
      }

      // Generate schema configuration
      const schemaConfig = this._gettingSchemaConfig({});
      if (!schemaConfig || typeof schemaConfig !== 'object') {
        throw new AppError('Failed to generate schema configuration', 500);
      }

      // Separate JSON data for inspection
      const createData = {};
      const updateData = {};

      // Recursive function to process data based on schema and actionType
      const processTableData = async (
        tableName,
        tableData,
        parentId = null,
        parentTableName = null
      ) => {
        const tableSchema = schemaConfig[tableName];
        if (!tableSchema) {
          throw new AppError(`Schema for table "${tableName}" not found`, 400);
        }

        for (const entry of tableData) {
          // Validate the fields against the schema
          const validEntry = {};
          for (const field in entry) {
            if (tableSchema[field]) {
              validEntry[field] = entry[field];
            }
          }

          // Add parent reference if applicable
          if (parentId && parentTableName) {
            for (const [field, fieldConfig] of Object.entries(tableSchema)) {
              if (
                fieldConfig.references &&
                fieldConfig.references.table === parentTableName &&
                fieldConfig.references.field === 'id'
              ) {
                validEntry[field] = parentId;
              }
            }
          }

          // Separate data for create or update based on actionType
          if (actionType === 'create') {
            validEntry.id = uuidv4(); // Generate a new ID for create entries
            createData[tableName] = createData[tableName] || [];
            createData[tableName].push(validEntry);
          } else if (actionType === 'update') {
            if (!validEntry.id) {
              throw new AppError(
                `Missing "id" field for update in table "${tableName}"`,
                400
              );
            }
            updateData[tableName] = updateData[tableName] || [];
            updateData[tableName].push(validEntry);
          }

          // Process child tables if any
          const childTables = Object.keys(schemaConfig).filter((childTable) =>
            Object.values(schemaConfig[childTable]).some(
              (field) =>
                field.references &&
                field.references.table === tableName &&
                field.references.field === 'id'
            )
          );

          for (const childTable of childTables) {
            if (entry[childTable]) {
              await processTableData(
                childTable,
                entry[childTable],
                validEntry.id, // Pass the parent ID to the child table
                tableName // Pass the parent table name
              );
            }
          }
        }
      };

      // Process the top-level tables in the JSON data
      for (const [tableName, tableDatas] of Object.entries(jsonData)) {
        if (schemaConfig[tableName]) {
          await processTableData(tableName, tableDatas);
        } else {
          throw new AppError(`Table "${tableName}" not found in schema`, 400);
        }
      }

      // Return refactored data for inspection
      return { createData, updateData };
    } catch (error) {
      throw new AppError(
        `Failed to process data: ${error.message}`,
        error.statusCode || 500
      );
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
   * @returns {Object} Data with defaults applied
   */
  applyDefaults(data) {
    const result = { ...data };

    for (const [field, defaultValue] of Object.entries(this.defaults)) {
      if (result[field] === undefined) {
        result[field] =
          typeof defaultValue === 'function' ? defaultValue() : defaultValue;
      }
    }

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
