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
   */
  constructor(config) {
    this.tableName = config.tableName;
    this.entityName = config.entityName;
    this.tableFields = config.tableFields || {};
    this.entityIdField = this._determinePrimaryKey(config);
    this.validations = config.validations || {};
    this.defaults = config.defaults || {};
    this.requiredFields = config.requiredFields || [];
    this.joinConfig = config.joinConfig;
    this.database = config.database || 'trade_business';
    this.childTableConfig = config.childTableConfig || [];

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
      this.fileTypeName = this.fileUrlField.replace('_url', '');
    }
  }

  // ============================================================
  // 🛠️ INTERNAL HELPERS
  // ============================================================

  /**
   * Determines the Primary Key field name based on config or schema.
   * Priority:
   * 1. Manual config override (config.entityIdField)
   * 2. Schema definition (primaryKey: true)
   * 3. Default 'id'
   * @param {Object} config - The constructor config object
   * @returns {string} The primary key field name
   */
  _determinePrimaryKey(config) {
    // 1. Manual Override (Highest Priority)
    if (config.entityIdField) {
      return config.entityIdField;
    }

    // 2. Auto-detect from Schema
    if (this.tableFields && this.tableFields.fields) {
      for (const [fieldName, fieldDef] of Object.entries(
        this.tableFields.fields
      )) {
        if (fieldDef.primaryKey) {
          return fieldName;
        }
      }
    }

    // 3. Default Fallback
    return 'id';
  }

  /**
   * Helper to strip database prefixes from table names
   * e.g., "trade_business.products" -> "products"
   */
  _getBaseTableName(name) {
    if (!name) return '';
    const parts = name.split('.');
    return parts[parts.length - 1];
  }

  /**
   * Tries to identify the Foreign Key column that links to a parent.
   * Used when no specific FK is provided.
   */
  _inferForeignKeyField(explicitField = null) {
    if (explicitField) return explicitField;

    // 1. Try to find the ONLY defined foreign key in the schema
    if (this.tableFields && this.tableFields.fields) {
      const fkFields = Object.entries(this.tableFields.fields).filter(
        ([_, def]) => def.references
      );

      if (fkFields.length === 1) {
        return fkFields[0][0]; // Return the field name
      }
    }

    // 2. Fallback: Look for a required field ending in '_id' that isn't the PK
    const heuristicMatch = this.requiredFields.find(
      (f) => f.endsWith('_id') && f !== this.entityIdField
    );

    if (heuristicMatch) return heuristicMatch;

    return null;
  }

  // ============================================================
  // 📂 FILE HANDLING
  // ============================================================

  async _validateAndSaveFile(data, options = {}) {
    const { entityId, fileType } = options;
    const base64FieldName = this.imagesOnly ? 'base64_image' : 'base64_file';

    if (!data[base64FieldName]) return null;

    if (this.fileTypeField && !this.imagesOnly && !fileType) {
      throw new AppError('File type is required', 400);
    }

    let allowedTypes = ['IMAGE'];
    if (!this.imagesOnly && fileType) {
      if (fileType === 'document') allowedTypes = ['DOCUMENT'];
      else if (fileType === 'pdf') allowedTypes = ['PDF'];
      else if (fileType === 'spreadsheet') allowedTypes = ['SPREADSHEET'];
      else if (fileType === 'presentation') allowedTypes = ['PRESENTATION'];
      else if (fileType === 'archive') allowedTypes = ['ARCHIVE'];
    }

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
      const filePath = file[this.fileUrlField]?.replace(/^\//, '');
      if (!filePath) throw new AppError('File URL is not available', 400);

      await fs.access(filePath);

      const ext = path.extname(filePath).toLowerCase();
      let mimeType = 'application/octet-stream';

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

  // ============================================================
  // 🔄 RECURSIVE DATA PROCESSING
  // ============================================================

  _gettingSchemaConfig(dataTemplate = {}) {
    dataTemplate[this.tableName] = this.tableFields;
    for (const childConfig of this.childTableConfig) {
      childConfig.model._gettingSchemaConfig(dataTemplate);
    }
    return dataTemplate;
  }

  async _determineRowAction(
    row,
    globalActionType,
    currentModel,
    tableSchema,
    parentAction
  ) {
    if (parentAction === 'create') return 'create';
    if (globalActionType === 'create') return 'create';

    const pkField = currentModel.entityIdField; // Use the auto-detected PK
    const pkValue = row[pkField];

    if (!pkValue) return 'create';

    const exists = await currentModel.checkExists(pkValue, pkField);
    return exists ? 'update' : 'create';
  }

  async _processRecursive(
    tableName,
    rows,
    parentData,
    parentTableName,
    currentModel,
    result,
    schemaConfig,
    globalActionType,
    parentAction = null
  ) {
    const tableSchema = schemaConfig[tableName];

    for (const rawRow of rows) {
      const rowAction = await this._determineRowAction(
        rawRow,
        globalActionType,
        currentModel,
        tableSchema,
        parentAction
      );

      const validEntry = await this._prepareDbRow(
        rawRow,
        tableSchema,
        parentData,
        parentTableName,
        currentModel,
        rowAction
      );

      if (rowAction === 'create') {
        result.createData[tableName] = result.createData[tableName] || [];
        result.createData[tableName].push(validEntry);
      } else {
        result.updateData[tableName] = result.updateData[tableName] || [];
        result.updateData[tableName].push(validEntry);
      }

      await this._processChildren(
        rawRow,
        validEntry,
        tableName,
        currentModel,
        result,
        schemaConfig,
        globalActionType,
        rowAction
      );
    }
  }

  /**
   * Determines the foreign key in the child table that points to the parent.
   */
  _resolveForeignKey(parentModel, childConfig) {
    // 1. FASTEST: Check if explicitly passed in childTableConfig
    if (childConfig.foreignKey) return childConfig.foreignKey;

    const childModel = childConfig.model;
    const parentBaseName = this._getBaseTableName(parentModel.tableName);

    // 2. CLEANER SCHEMA LOOKUP: Find field referencing parent table
    if (childModel.tableFields?.fields) {
      const foundEntry = Object.entries(childModel.tableFields.fields).find(
        ([_, def]) =>
          this._getBaseTableName(def.references?.table) === parentBaseName
      );
      if (foundEntry) return foundEntry[0];
    }

    // 3. FALLBACK: Naming convention (e.g., "product_customization" -> "product_customization_id")
    return `${parentModel.entityName.replace(/\s+/g, '_')}_id`;
  }

  async _recursiveRead(inputRow, currentModel, options) {
    // 1. Get Primary Key ID
    const pkField = currentModel.entityIdField;
    const id = inputRow[pkField];

    if (!id) {
      return null;
    }

    // 2. Hydrate if needed
    let dbRow = inputRow;
    const isHydrated = Object.keys(inputRow).length > 1;

    if (!isHydrated) {
      try {
        // We explicitly pass includeBase64: false here to keep it light initially
        dbRow = await currentModel.getById(id, { includeBase64: false });
      } catch (error) {
        return null;
      }
    }

    // 3. Process Base64
    if (currentModel.hasFileHandling && options.includeBase64) {
      dbRow = await currentModel._processBase64Content(dbRow, options);
    }

    // 4. Process Children
    if (
      currentModel.childTableConfig &&
      currentModel.childTableConfig.length > 0
    ) {
      for (const childConfig of currentModel.childTableConfig) {
        const childModel = childConfig.model;
        const childTableName = childModel.tableName;

        // --- Auto-Detect Foreign Key ---
        const foreignKeyField = this._resolveForeignKey(
          currentModel,
          childConfig
        );

        // A. Fetch children
        try {
          const childRows = await childModel.getAllByParentId(
            id,
            false,
            {},
            foreignKeyField
          );

          // B. Recursively process each child
          const processedChildren = [];
          for (const childRow of childRows) {
            const processedChild = await this._recursiveRead(
              childRow,
              childModel,
              options
            );
            if (processedChild) {
              processedChildren.push(processedChild);
            }
          }

          if (processedChildren.length > 0) {
            dbRow[childTableName] = processedChildren;
          }
        } catch (err) {
          console.error(`Error fetching children: ${err.message}`);
        }
      }
    }

    return dbRow;
  }

  /**
   * Recursively traverses a hydrated data object and builds a flat list
   * of items to delete, ensuring children are listed BEFORE parents.
   */
  _collectDeleteQueue(dataRow, currentModel, queue) {
    // 1. Process Children First (Recursive Step)
    if (currentModel.childTableConfig) {
      for (const childConfig of currentModel.childTableConfig) {
        const childTableName = childConfig.model.tableName;
        const childRows = dataRow[childTableName]; // _recursiveRead attaches children here

        if (childRows && Array.isArray(childRows)) {
          for (const childRow of childRows) {
            this._collectDeleteQueue(childRow, childConfig.model, queue);
          }
        }
      }
    }

    // 2. Add Self to Queue (After children are processed)
    const pk = currentModel.entityIdField;
    if (dataRow[pk]) {
      queue.push({
        tableName: currentModel.tableName,
        id: dataRow[pk],
        model: currentModel,
      });
    }
  }

  async _processChildren(
    rawRow,
    validEntry,
    currentTableName,
    currentModel,
    result,
    schemaConfig,
    globalActionType,
    parentAction
  ) {
    for (const [key, value] of Object.entries(rawRow)) {
      if (!Array.isArray(value)) continue;

      const childConfig = currentModel.childTableConfig.find(
        (config) => config.model.tableName === key
      );

      if (childConfig && childConfig.model) {
        await this._processRecursive(
          key,
          value,
          validEntry,
          currentTableName,
          childConfig.model,
          result,
          schemaConfig,
          globalActionType,
          parentAction
        );
      }
    }
  }

  async _prepareDbRow(
    rawRow,
    tableSchema,
    parentData,
    parentTableName,
    currentModel,
    rowAction
  ) {
    let validEntry = {};
    const pkField = currentModel.entityIdField;

    // 1. Copy Fields
    for (const field in rawRow) {
      if (
        tableSchema[field] ||
        field === 'base64_image' ||
        field === 'base64_file'
      ) {
        validEntry[field] = rawRow[field];
      }
    }

    // 2. Link Parent
    if (parentData && parentTableName) {
      for (const [field, fieldConfig] of Object.entries(tableSchema)) {
        if (
          fieldConfig.references &&
          fieldConfig.references.table === parentTableName
        ) {
          const parentPkField = fieldConfig.references.field || 'id';
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
      const pkConfig = tableSchema[pkField];
      // Always generate UUID for VARCHAR PKs on create
      if (pkConfig.type && pkConfig.type.toUpperCase().includes('VARCHAR')) {
        validEntry[pkField] = uuidv4();
      } else {
        delete validEntry[pkField]; // Let DB handle auto-increment
      }
    } else {
      // Update: Must have ID
      if (!validEntry[pkField]) {
        throw new AppError(`Primary Key "${pkField}" missing for update`, 400);
      }
    }

    return validEntry;
  }

  async _handleWriteOperation(jsonData, schemaConfig, actionType) {
    const result = {
      createData: {},
      updateData: {},
    };

    for (const [tableName, tableRows] of Object.entries(jsonData)) {
      if (!schemaConfig[tableName]) {
        throw new AppError(`Table "${tableName}" not found in schema`, 400);
      }

      const targetModel = this._resolveTargetModel(tableName);

      // Note: We pass targetModel (or 'this' if null/fallback) to _processRecursive
      // The original logic defaulted to 'this' if not found, though usually strict checking is better.
      const modelToUse = targetModel || this;

      await this._processRecursive(
        tableName,
        tableRows,
        null, // parentData
        null, // parentTableName
        modelToUse,
        result,
        schemaConfig,
        actionType
      );
    }

    return result;
  }

  async _handleReadOperation(jsonData, schemaConfig, options) {
    const resultData = {};

    for (const [tableName, rows] of Object.entries(jsonData)) {
      if (!schemaConfig[tableName]) continue;

      const targetModel = this._resolveTargetModel(tableName);
      if (!targetModel) continue;

      const builtRows = [];
      for (const row of rows) {
        const builtRow = await this._recursiveRead(row, targetModel, options);
        if (builtRow) {
          builtRows.push(builtRow);
        }
      }
      resultData[tableName] = builtRows;
    }

    return { data: resultData };
  }

  async _handleDeleteOperation(jsonData, schemaConfig) {
    const resultData = {};

    for (const [tableName, rows] of Object.entries(jsonData)) {
      if (!schemaConfig[tableName]) {
        throw new AppError(`Table "${tableName}" not found in schema`, 400);
      }

      const targetModel = this._resolveTargetModel(tableName);
      if (!targetModel) {
        console.warn(`Cannot delete from '${tableName}'. Model not found.`);
        continue;
      }

      // Process each root ID provided in the JSON
      for (const row of rows) {
        // 1. Fetch FULL tree (Parent + Children) to know what to delete
        const fullData = await this._recursiveRead(row, targetModel, {
          includeBase64: false,
        });

        if (!fullData) continue; // Record already gone

        // 2. Generate Delete Queue (Bottom-Up Order: Children -> Parent)
        const deleteQueue = [];
        this._collectDeleteQueue(fullData, targetModel, deleteQueue);

        // 3. Execute Deletes One-by-One
        for (const item of deleteQueue) {
          try {
            await item.model.delete(item.id);

            // 4. Format Output
            if (!resultData[item.tableName]) {
              resultData[item.tableName] = [];
            }

            // Prevent duplicates in output
            const alreadyAdded = resultData[item.tableName].some(
              (entry) => entry.id === item.id
            );
            if (!alreadyAdded) {
              resultData[item.tableName].push({ id: item.id });
            }
          } catch (err) {
            console.error(
              `Failed to delete ${item.tableName} ID ${item.id}:`,
              err
            );
          }
        }
      }
    }

    return { deleteData: resultData };
  }

  _resolveTargetModel(tableName) {
    // 1. Is it the current model?
    if (this.tableName === tableName) {
      return this;
    }

    // 2. Is it a configured child?
    const childConfig = this.childTableConfig.find(
      (c) => c.model.tableName === tableName
    );

    return childConfig ? childConfig.model : null;
  }

  // ============================================================
  // 🚀 PUBLIC METHODS (CRUD & UTILS)
  // ============================================================
  async processOperation(jsonData, actionType, options = {}) {
    // 1. Input Validation
    if (!jsonData || typeof jsonData !== 'object') {
      throw new AppError('Invalid JSON data provided', 400);
    }

    if (!['create', 'update', 'read', 'delete'].includes(actionType)) {
      throw new AppError(
        'Invalid actionType. Must be create, update, read, or delete.',
        400
      );
    }

    // 2. Prepare Schema
    const schemaConfig = this._gettingSchemaConfig({});

    // 3. Dispatch to Specific Handlers
    switch (actionType) {
      case 'delete':
        return this._handleDeleteOperation(jsonData, schemaConfig);

      case 'read':
        return this._handleReadOperation(jsonData, schemaConfig, options);

      case 'create':
      case 'update':
        return this._handleWriteOperation(jsonData, schemaConfig, actionType);

      default:
        throw new AppError(`Action ${actionType} not supported`, 400);
    }
  }

  async checkExists(value, fieldName) {
    if (!value) return false;
    const searchField = fieldName || this.entityIdField;
    const sql = `SELECT 1 FROM ${this.tableName} WHERE ${searchField} = ? LIMIT 1`;

    try {
      const rows = await this.executeQuery(sql, [value]);
      return Array.isArray(rows) && rows.length > 0;
    } catch (error) {
      console.error(`Error checking existence in ${this.tableName}:`, error);
      return false;
    }
  }

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
      if (data[field] === undefined) continue;

      if (
        validations.required &&
        (data[field] === undefined ||
          data[field] === null ||
          data[field] === '')
      ) {
        throw new AppError(`${this._formatFieldName(field)} is required`, 400);
      }

      if (validations.min !== undefined && data[field] < validations.min) {
        throw new AppError(
          `${this._formatFieldName(field)} must be at least ${validations.min}`,
          400
        );
      }

      if (validations.max !== undefined && data[field] > validations.max) {
        throw new AppError(
          `${this._formatFieldName(field)} cannot exceed ${validations.max}`,
          400
        );
      }

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

  _formatFieldName(field) {
    return field
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  async applyDefaults(data) {
    const result = { ...data };
    for (const [field, defaultValue] of Object.entries(this.defaults)) {
      if (result[field] === undefined) {
        if (typeof defaultValue === 'function') {
          if (defaultValue.constructor.name === 'AsyncFunction') {
            result[field] = await defaultValue();
          } else {
            result[field] = defaultValue();
          }
        } else {
          result[field] = defaultValue;
        }
      }
    }
    return result;
  }

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
   * @param {string} [foreignKeyField=null] - Optional specific foreign key column
   */
  async getAllByParentId(
    parentId,
    includeBase64 = false,
    options = {},
    foreignKeyField = null
  ) {
    try {
      // 1. Determine the Foreign Key column
      const searchField = this._inferForeignKeyField(foreignKeyField);

      if (!searchField) {
        throw new AppError(
          `Cannot determine foreign key for ${this.tableName}. Please provide it explicitly.`,
          500
        );
      }

      const sql = `
        SELECT * FROM ${this.tableName}
        WHERE ${searchField} = ?
        ORDER BY ${this.entityIdField}
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

  async delete(id) {
    try {
      const entity = await this.getById(id);

      if (this.hasFileHandling && entity[this.fileUrlField]) {
        if (this.imagesOnly) {
          await deleteImage(entity[this.fileUrlField]);
        } else {
          await deleteFile(entity[this.fileUrlField]);
        }
      }

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

  async deleteAllByParentId(parentId) {
    try {
      // 1. Determine the Foreign Key column
      const searchField = this._inferForeignKeyField();

      if (!searchField) {
        throw new AppError(
          `Cannot determine foreign key for ${this.tableName} to perform delete.`,
          500
        );
      }

      // Get all entities for this parent
      const entities = await this.getAllByParentId(
        parentId,
        false,
        {},
        searchField
      );

      if (entities.length === 0) {
        return {
          message: `No ${this.entityName}s found`,
          count: 0,
        };
      }

      // Delete associated files
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

      // Delete the entities using the Foreign Key
      await CrudOperations.performCrud({
        operation: 'delete',
        tableName: this.tableName,
        conditions: { [searchField]: parentId }, // ✅ Corrected: Use FK, not PK
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

  async reorderFiles(entityId, orderData) {
    if (!this.hasFileHandling) {
      throw new AppError('File handling is not configured for this model', 500);
    }

    try {
      return await this.db.executeTransaction(async (connection) => {
        for (const item of orderData) {
          await CrudOperations.performCrud({
            operation: 'update',
            tableName: this.tableName,
            id: item.id,
            data: { display_order: item.display_order },
            connection: this.db.pool,
          });
        }

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

  async truncateTable() {
    try {
      return await this.withTransaction(async (connection) => {
        await this.executeQuery('SET FOREIGN_KEY_CHECKS = 0');
        await this.executeQuery(`TRUNCATE TABLE ${this.tableName}`);
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

  _capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  _camelCase(str) {
    return str
      .replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, (match, index) => {
        if (+match === 0) return '';
        return index === 0 ? match.toLowerCase() : match.toUpperCase();
      })
      .replace(/\s+/g, '');
  }

  _pluralize(str) {
    return str + 's';
  }
}
