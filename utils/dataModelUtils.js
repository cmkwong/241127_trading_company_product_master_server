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

  /**
   * Generates and inserts dynamic data into the database based on the provided schema.
   * Handles parent-child and child-child relationships recursively.
   * @param {Object} jsonData - The JSON data to generate and insert.
   * @returns {Promise<Object>} Result of the insertion.
   */
  async refactoringData(jsonData) {
    try {
      // Validate input JSON data
      if (!jsonData || typeof jsonData !== 'object') {
        throw new AppError('Invalid JSON data provided', 400);
      }

      // Generate schema configuration
      const schemaConfig = this._gettingSchemaConfig({});
      if (!schemaConfig || typeof schemaConfig !== 'object') {
        throw new AppError('Failed to generate schema configuration', 500);
      }
      console.log('schemaConfig++: ', JSON.stringify(schemaConfig));
      const results = {};

      // Recursive function to process data based on schema
      const processTableData = async (
        tableName,
        tableData,
        parentTableName = null,
        parentData = null,
        parentId = null
      ) => {
        const tableSchema = schemaConfig[tableName];
        if (!tableSchema) {
          throw new AppError(`Schema for table "${tableName}" not found`, 400);
        }

        if (!tableData || typeof tableData !== 'object') {
          throw new AppError(`Invalid data for table "${tableName}"`, 400);
        }

        // Generate a new ID for the current table if not provided
        const entityId = tableData.id || uuidv4();

        // Prepare the data for insertion
        const entityData = { ...tableData, id: entityId };

        // Add parent reference if applicable
        if (parentId && tableSchema.foreignKey) {
          entityData[tableSchema.foreignKey] = parentId;
        }

        // Validate data before insertion
        this.validateData(entityData);

        // Apply default values
        const finalEntityData = this.applyDefaults(entityData);

        // Remove child table data from the current entity data
        const childTables = Object.keys(tableSchema.children || {});
        for (const childTable of childTables) {
          delete finalEntityData[childTable];
        }

        // Insert data into the current table
        const entityResult = await this.create(finalEntityData);
        results[tableName] = results[tableName] || [];
        results[tableName].push({
          id: entityId,
          message: `${tableName} inserted successfully`,
        });

        // Process child tables
        for (const childTable of childTables) {
          const childTableDataArray = tableData[childTable];
          if (!childTableDataArray) continue; // Skip if no child data exists

          if (Array.isArray(childTableDataArray)) {
            for (const childTableData of childTableDataArray) {
              await processTableData(childTable, childTableData, entityId);
            }
          } else if (typeof childTableDataArray === 'object') {
            await processTableData(childTable, childTableDataArray, entityId);
          }
        }

        // Handle file processing if applicable
        if (this.hasFileHandling && tableSchema.fileHandling) {
          const fileDataArray = tableData[tableSchema.fileHandling.fieldName];
          if (fileDataArray && Array.isArray(fileDataArray)) {
            for (const fileData of fileDataArray) {
              await this.addFileFromBase64({
                ...fileData,
                [this.entityIdField]: entityId,
              });
            }
          }
        }
      };

      // Start processing the top-level tables in the JSON data
      for (const [tableName, tableDatas] of Object.entries(jsonData)) {
        for (const tableData of tableDatas) {
          await processTableData(tableName, tableData);
        }
      }

      return results;
    } catch (error) {
      throw new AppError(
        `Failed to generate and insert data: ${error.message}`,
        500
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
      // Validate data for creation
      this.validateData(data);

      // Handle file creation if base64 data is provided
      if (this.hasFileHandling) {
        const base64FieldName = this.imagesOnly
          ? 'base64_image'
          : 'base64_file';

        if (data[base64FieldName]) {
          if (
            this.fileTypeField &&
            !this.imagesOnly &&
            !data[this.fileTypeField]
          ) {
            throw new AppError('File type is required', 400);
          }

          // Determine allowed file types if needed
          let allowedTypes = ['IMAGE'];
          let fileType = null;

          if (!this.imagesOnly && this.fileTypeField) {
            fileType = data[this.fileTypeField];
            if (fileType === 'document') {
              allowedTypes = ['DOCUMENT'];
            } else if (fileType === 'pdf') {
              allowedTypes = ['PDF'];
            } else if (fileType === 'spreadsheet') {
              allowedTypes = ['SPREADSHEET'];
            } else if (fileType === 'presentation') {
              allowedTypes = ['PRESENTATION'];
            } else if (fileType === 'archive') {
              allowedTypes = ['ARCHIVE'];
            }
          }

          // Save the file to the filesystem
          const uploadDir = this.getUploadDir(
            data[this.entityIdField],
            fileType
          );

          // Use appropriate save function based on file type
          let fileUrl;
          if (this.imagesOnly) {
            fileUrl = await saveBase64Image(data.base64_image, uploadDir);
          } else {
            fileUrl = await saveBase64File(data.base64_file, uploadDir, {
              allowedTypes,
            });
          }

          // Add the file URL to the data object
          data[this.fileUrlField] = fileUrl;
        }
      }

      // Create the entity using CRUD utility
      const result = await CrudOperations.performCrud({
        operation: 'create',
        tableName: this.tableName,
        data: data,
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
   * @param {Object} [options] - Optional options for base64 content
   * @param {boolean} [options.includeBase64=false] - Whether to include base64 content
   * @param {boolean} [options.compress=false] - Whether to compress images
   * @param {number} [options.maxWidth=800] - Maximum width for compressed images
   * @param {number} [options.maxHeight=800] - Maximum height for compressed images
   * @param {number} [options.quality=0.7] - JPEG quality (0-1) for compressed images
   * @returns {Promise<Object>} Promise that resolves with the entity data
   */
  async getById(id, options = {}) {
    const {
      includeBase64 = false,
      compress = false,
      maxWidth = 800,
      maxHeight = 800,
      quality = 0.7,
    } = options;

    try {
      // Get the entity using CRUD utility
      const result = await CrudOperations.performCrud({
        operation: 'read',
        tableName: this.tableName,
        id: id,
        connection: this.db.pool,
      });

      if (!result.record) {
        throw new AppError(
          `${this._capitalize(this.entityName)} not found`,
          404
        );
      }

      const entity = result.record;

      // If base64 content is not requested or file handling is not configured, return the entity as is
      if (!includeBase64 || !this.hasFileHandling) {
        return entity;
      }

      // Import necessary modules
      const fs = await import('fs/promises');
      const path = await import('path');

      // Import Sharp for image processing if compression is requested
      let sharp;
      if (compress) {
        try {
          sharp = (await import('sharp')).default;
        } catch (error) {
          console.warn('Sharp module not available. Compression disabled.');
        }
      }

      try {
        // Get file path from URL
        const filePath = entity[this.fileUrlField]?.replace(/^\//, ''); // Remove leading slash if present

        // Check if file exists
        if (!filePath) {
          throw new AppError('File URL is not available for this entity', 400);
        }

        try {
          await fs.access(filePath);
        } catch (error) {
          throw new AppError(`File not found: ${filePath}`, 404);
        }

        // Get file extension and MIME type
        const ext = path.extname(filePath).toLowerCase();
        let mimeType = 'application/octet-stream'; // Default MIME type

        // Determine MIME type based on extension
        if (['.jpg', '.jpeg'].includes(ext)) mimeType = 'image/jpeg';
        else if (ext === '.png') mimeType = 'image/png';
        else if (ext === '.gif') mimeType = 'image/gif';
        else if (ext === '.pdf') mimeType = 'application/pdf';
        else if (['.doc', '.docx'].includes(ext))
          mimeType = 'application/msword';
        else if (['.xls', '.xlsx'].includes(ext))
          mimeType = 'application/vnd.ms-excel';
        else if (ext === '.txt') mimeType = 'text/plain';

        // Check if this is an image and compression is requested
        const isImage = ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(
          ext
        );

        if (isImage && compress && sharp) {
          // Compress image using Sharp
          const imageBuffer = await fs.readFile(filePath);

          // Process the image with Sharp
          const compressedBuffer = await sharp(imageBuffer)
            .resize({
              width: maxWidth,
              height: maxHeight,
              fit: 'inside',
              withoutEnlargement: true,
            })
            .jpeg({ quality: quality * 100 }) // Convert quality to 0-100 scale
            .toBuffer();

          // Convert compressed buffer to base64
          const base64Content = compressedBuffer.toString('base64');

          // Add compressed base64 data to the entity
          entity[
            this.imagesOnly ? 'base64_image' : 'base64_file'
          ] = `data:image/jpeg;base64,${base64Content}`;
          entity.is_compressed = true;
        } else {
          // For non-images or when compression is not requested, use standard approach
          const fileBuffer = await fs.readFile(filePath);
          const base64Content = fileBuffer.toString('base64');

          // Add base64 data to the entity
          entity[
            this.imagesOnly ? 'base64_image' : 'base64_file'
          ] = `data:${mimeType};base64,${base64Content}`;
          entity.is_compressed = false;
        }
      } catch (error) {
        console.error(`Error processing file for entity ${id}:`, error);
        entity[this.imagesOnly ? 'base64_image' : 'base64_file'] = null;
        entity.error = error.message;
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
   * @returns {Promise<Array>} Promise that resolves with the entities
   */
  async getAllByParentId(parentId, includeBase64 = false, options = {}) {
    let sql;
    try {
      // If join configuration is provided, use it
      if (this.joinConfig) {
        // Build the SQL query with joins
        sql = `SELECT ${this.tableName}.*`;

        // Handle multiple joins
        if (Array.isArray(this.joinConfig)) {
          // Multiple joins case
          for (const joinCfg of this.joinConfig) {
            if (joinCfg.selectFields) {
              sql += `, ${joinCfg.selectFields}`;
            }
          }

          sql += ` FROM ${this.tableName}`;

          for (const joinCfg of this.joinConfig) {
            if (joinCfg.joinTable && joinCfg.joinField) {
              sql += ` LEFT JOIN ${joinCfg.joinTable} ON ${this.tableName}.${
                joinCfg.joinField
              } = ${joinCfg.joinTable}.${joinCfg.targetField || 'id'}`;
            }
          }

          sql += ` WHERE ${this.tableName}.${this.entityIdField} = ?`;

          // Handle ordering
          const orderByClauses = this.joinConfig
            .filter((joinCfg) => joinCfg.orderBy)
            .map((joinCfg) => joinCfg.orderBy);

          if (orderByClauses.length > 0) {
            sql += ` ORDER BY ${orderByClauses.join(', ')}`;
          } else {
            sql += ` ORDER BY ${this.tableName}.id`;
          }
        } else {
          // Single join case
          const { joinTable, joinField, selectFields, orderBy } =
            this.joinConfig;

          if (selectFields) {
            sql += `, ${selectFields}`;
          }

          sql += ` FROM ${this.tableName}`;

          if (joinTable && joinField) {
            sql += ` LEFT JOIN ${joinTable} ON ${this.tableName}.${joinField} = ${joinTable}.id`;
          }

          sql += ` WHERE ${this.tableName}.${this.entityIdField} = ?`;

          if (orderBy) {
            sql += ` ORDER BY ${orderBy}`;
          } else {
            sql += ` ORDER BY ${this.tableName}.id`;
          }
        }

        return await this.db.executeQuery(sql, [parentId]);
      } else {
        // Simple query without joins
        // First, check if display_order column exists when file handling is enabled
        if (this.hasFileHandling) {
          try {
            // Check if display_order column exists in the table schema
            const checkColumnSql = `
            SELECT COUNT(*) as column_exists 
            FROM information_schema.COLUMNS 
            WHERE TABLE_SCHEMA = ? 
            AND TABLE_NAME = ? 
            AND COLUMN_NAME = 'display_order'
          `;

            const columnCheckResult = await this.db.executeQuery(
              checkColumnSql,
              [this.database, this.tableName]
            );

            const hasDisplayOrderColumn =
              columnCheckResult[0].column_exists > 0;

            sql = `
            SELECT *
            FROM ${this.tableName}
            WHERE ${this.entityIdField} = ?
            ORDER BY ${hasDisplayOrderColumn ? 'display_order' : 'id'}
          `;
          } catch (error) {
            // If there's an error checking the schema, default to ordering by id
            console.warn(
              `Error checking for display_order column: ${error.message}. Defaulting to id for ordering.`
            );
            sql = `
            SELECT *
            FROM ${this.tableName}
            WHERE ${this.entityIdField} = ?
            ORDER BY id
          `;
          }
        } else {
          // If not file handling, just use id for ordering
          sql = `
          SELECT *
          FROM ${this.tableName}
          WHERE ${this.entityIdField} = ?
          ORDER BY id
        `;
        }

        const results = await this.db.executeQuery(sql, [parentId]);

        // If base64 content is not requested, return the results as is
        if (!includeBase64 || !this.hasFileHandling) {
          return results;
        }

        // Process base64 content
        const compressionOptions = {
          compress: options.compress || false,
          maxWidth: options.maxWidth || 800,
          maxHeight: options.maxHeight || 800,
          quality: options.quality || 0.7,
        };

        // Import necessary modules
        const fs = await import('fs/promises');
        const path = await import('path');

        // Import Sharp for image processing if compression is requested
        let sharp;
        if (compressionOptions.compress) {
          try {
            sharp = (await import('sharp')).default;
          } catch (error) {
            console.warn('Sharp module not available. Compression disabled.');
            compressionOptions.compress = false;
          }
        }

        const filesWithBase64 = await Promise.all(
          results.map(async (file) => {
            try {
              // Get file path from URL
              const filePath = file[this.fileUrlField].replace(/^\//, ''); // Remove leading slash if present

              // Check if file exists
              try {
                await fs.access(filePath);
              } catch (error) {
                // File doesn't exist, return record without base64
                console.warn(`File not found: ${filePath}`);
                return {
                  ...file,
                  base64_content: null,
                  error: 'File not found',
                };
              }

              // Get file extension and MIME type
              const ext = path.extname(filePath).toLowerCase();
              let mimeType = 'application/octet-stream'; // Default MIME type

              // Determine MIME type based on extension
              if (['.jpg', '.jpeg'].includes(ext)) mimeType = 'image/jpeg';
              else if (ext === '.png') mimeType = 'image/png';
              else if (ext === '.gif') mimeType = 'image/gif';
              else if (ext === '.pdf') mimeType = 'application/pdf';
              else if (['.doc', '.docx'].includes(ext))
                mimeType = 'application/msword';
              else if (['.xls', '.xlsx'].includes(ext))
                mimeType = 'application/vnd.ms-excel';
              else if (ext === '.txt') mimeType = 'text/plain';

              // Check if this is an image and compression is requested
              const isImage = [
                '.jpg',
                '.jpeg',
                '.png',
                '.gif',
                '.webp',
              ].includes(ext);

              if (isImage && compressionOptions.compress && sharp) {
                // Compress image using Sharp
                const imageBuffer = await fs.readFile(filePath);

                // Process the image with Sharp
                const compressedBuffer = await sharp(imageBuffer)
                  .resize({
                    width: compressionOptions.maxWidth,
                    height: compressionOptions.maxHeight,
                    fit: 'inside',
                    withoutEnlargement: true,
                  })
                  .jpeg({ quality: compressionOptions.quality * 100 }) // Convert quality to 0-100 scale
                  .toBuffer();

                // Convert compressed buffer to base64
                const base64Content = compressedBuffer.toString('base64');

                // Return file record with compressed base64 data
                return {
                  ...file,
                  [this.imagesOnly
                    ? 'base64_image'
                    : 'base64_file']: `data:image/jpeg;base64,${base64Content}`,
                  is_compressed: true,
                };
              } else {
                // For non-images or when compression is not requested, use standard approach
                const fileBuffer = await fs.readFile(filePath);
                const base64Content = fileBuffer.toString('base64');

                // Return file record with base64 data
                return {
                  ...file,
                  [this.imagesOnly
                    ? 'base64_image'
                    : 'base64_file']: `data:${mimeType};base64,${base64Content}`,
                  is_compressed: false,
                };
              }
            } catch (error) {
              console.error(`Error processing file ${file.id}:`, error);
              return {
                ...file,
                [this.imagesOnly ? 'base64_image' : 'base64_file']: null,
                error: error.message,
              };
            }
          })
        );

        return filesWithBase64;
      }
    } catch (error) {
      throw new AppError(
        `Failed to get ${this.entityName}s: ${error.message} \nsql: ${sql}`,
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
      // Validate data for update
      this.validateData(data, true);

      // Update the entity using CRUD utility
      const result = await CrudOperations.performCrud({
        operation: 'update',
        tableName: this.tableName,
        id: id,
        data: data,
        connection: this.db.pool,
      });

      if (!result.record) {
        throw new AppError(
          `${this._capitalize(this.entityName)} not found`,
          404
        );
      }

      // Handle file updates if base64 data is provided
      if (this.hasFileHandling) {
        const base64FieldName = this.imagesOnly
          ? 'base64_image'
          : 'base64_file';
        const existingFile = result.record;
        const entityId = existingFile[this.entityIdField];
        const oldFileUrl = existingFile[this.fileUrlField];

        // Get file type if applicable
        let fileType = null;
        if (this.fileTypeField) {
          fileType =
            data[this.fileTypeField] || existingFile[this.fileTypeField];
        }

        if (data[base64FieldName]) {
          // Determine allowed file types if needed
          let allowedTypes = ['IMAGE'];
          if (!this.imagesOnly && fileType) {
            if (fileType === 'document') {
              allowedTypes = ['DOCUMENT'];
            } else if (fileType === 'pdf') {
              allowedTypes = ['PDF'];
            } else if (fileType === 'spreadsheet') {
              allowedTypes = ['SPREADSHEET'];
            } else if (fileType === 'presentation') {
              allowedTypes = ['PRESENTATION'];
            } else if (fileType === 'archive') {
              allowedTypes = ['ARCHIVE'];
            }
          }

          // Save the new file
          const uploadDir = this.getUploadDir(entityId, fileType);
          let newFileUrl;

          if (this.imagesOnly) {
            newFileUrl = await saveBase64Image(data.base64_image, uploadDir);
          } else {
            newFileUrl = await saveBase64File(data.base64_file, uploadDir, {
              allowedTypes,
            });
          }

          // Update the file URL in the database
          await CrudOperations.performCrud({
            operation: 'update',
            tableName: this.tableName,
            id: id,
            data: { [this.fileUrlField]: newFileUrl },
            connection: this.db.pool,
          });

          // Delete old file if we uploaded a new one
          if (oldFileUrl) {
            if (this.imagesOnly) {
              await deleteImage(oldFileUrl);
            } else {
              await deleteFile(oldFileUrl);
            }
          }
        }
      }

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
