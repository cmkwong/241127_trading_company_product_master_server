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
    this.childTableConfig = config.childTableConfig || [];
    this.dbc = config.dbc;
    this.page = config.page || 1;
    this.limit = config.limit || 20;
    this.orderDirection = config.orderDirection || 'ASC';

    // Create database connection
    this.crudO = new CrudOperations({
      dbc: this.dbc,
      page: this.page,
      limit: this.limit,
      orderDirection: this.orderDirection,
    });
    // this.db = dbConn.createDbConnection(this.database);

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

    if (!data[base64FieldName]) {
      throw new AppError(`${base64FieldName} is required for file upload`, 400);
    }

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

  // ============================================================
  // 🔄 RECURSIVE PROCESSOR (With Real DB Writes)
  // ============================================================
  async _processWriteRecursive(
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
    const pkField = currentModel.entityIdField;

    for (const rawRow of rows) {
      // 1. Determine Action (Create vs Update)
      const rowAction = await this._determineRowAction(
        rawRow,
        globalActionType,
        currentModel,
        tableSchema,
        parentAction
      );

      // 2. Prepare Data (Validation, Defaults, Link Parent)
      const validEntry = await this._prepareDbRow(
        rawRow,
        tableSchema,
        parentData,
        parentTableName,
        currentModel,
        rowAction
      );

      // 3. 💾 EXECUTE DATABASE WRITE (Real-time)
      let dbRecord = null;

      try {
        // --- A. Handle File Uploads (Pre-Write if ID exists) ---
        let pendingFileUpload = false;

        // If we have an ID (Update or UUID Create), we can upload files now
        if (currentModel.hasFileHandling) {
          const fileType =
            rawRow[currentModel.fileTypeField] ||
            validEntry[currentModel.fileTypeField];
          validEntry[currentModel.fileUrlField] =
            await currentModel._validateAndSaveFile(rawRow, {
              entityId: validEntry[pkField] || uuidv4(),
              fileType: fileType,
            });
        }
        // If Create + Auto-Increment, we don't have ID yet. Mark for post-write upload.
        else if (currentModel.hasFileHandling && !validEntry[pkField]) {
          pendingFileUpload = true;
        }

        // --- B. Perform CRUD ---
        const crudResult = await this.crudO.performCrud({
          operation: rowAction, // 'create' or 'update'
          tableName: currentModel.tableName,
          id: rowAction === 'update' ? validEntry[pkField] : undefined,
          data: validEntry,
        });

        // --- C. Capture Result & ID ---
        dbRecord = crudResult.record || validEntry;

        // IMPORTANT: If Auto-Increment Create, capture the new ID back into validEntry
        if (
          rowAction === 'create' &&
          !validEntry[pkField] &&
          dbRecord[pkField]
        ) {
          validEntry[pkField] = dbRecord[pkField];
        }

        // --- D. Handle Pending File Upload (Post-Write for Auto-Increment) ---
        if (pendingFileUpload && validEntry[pkField]) {
          const fileType = rawRow[currentModel.fileTypeField];
          const fileUrl = await currentModel._validateAndSaveFile(rawRow, {
            entityId: validEntry[pkField],
            fileType: fileType,
          });

          if (fileUrl) {
            // Update the record we just inserted with the file URL
            await this.crudO.performCrud({
              operation: 'update',
              tableName: currentModel.tableName,
              id: validEntry[pkField],
              data: { [currentModel.fileUrlField]: fileUrl },
            });
            validEntry[currentModel.fileUrlField] = fileUrl; // Update local object
          }
        }
      } catch (err) {
        throw new AppError(
          `Failed to ${rowAction} ${tableName}: ${err.message}`,
          500
        );
      }

      // 4. Log to Result Object
      if (rowAction === 'create') {
        result.createData[tableName] = result.createData[tableName] || [];
        result.createData[tableName].push(validEntry);
      } else {
        result.updateData[tableName] = result.updateData[tableName] || [];
        result.updateData[tableName].push(validEntry);
      }

      // 5. Process Children (Recursion)
      // We pass 'validEntry' which now definitely contains the Parent ID
      await this._processWriteChildren(
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
   * Determines the parent model from the schemaConfig by passing the table name.
   * It searches for a field in the child table that references the parent table.
   * @param {Object} schemaConfig - The schema configuration object
   * @param {string} tableName - The name of the child table
   * @returns {Object|null} - The parent model or null if no parent is found
   */
  _getParentTableName(schemaConfig, tableName) {
    const tableSchema = schemaConfig[tableName];
    if (!tableSchema) {
      throw new AppError(`Table "${tableName}" not found in schemaConfig`, 400);
    }

    // Search for a field with a "references" property in the table schema
    for (const [fieldName, fieldDef] of Object.entries(tableSchema)) {
      if (fieldDef.references && fieldDef.references.table) {
        const parentTableName = fieldDef.references.table;
        if (schemaConfig[parentTableName]) {
          // Return the parent model (assumes schemaConfig contains models)
          return parentTableName;
        }
      }
    }

    // If no parent is found, return null
    return null;
  }
  /**
   * Determines the foreign key in the child table that points to the parent.
   */
  _resolveForeignKey(parentModel, childConfig) {
    // 1. FASTEST: Check if explicitly passed in childTableConfig
    if (childConfig.foreignKey) {
      return childConfig.foreignKey;
    }

    const childModel = childConfig.model;
    const parentBaseName = this._getBaseTableName(parentModel.tableName);

    // 2. CLEANER SCHEMA LOOKUP: Find field referencing parent table
    if (childModel.tableFields) {
      const foundEntry = Object.entries(childModel.tableFields).find(
        ([_, def]) =>
          this._getBaseTableName(def.references?.table) === parentBaseName
      );
      if (foundEntry) return foundEntry[0];
    }

    // 3. FALLBACK: Naming convention (e.g., "product_customization" -> "product_customization_id")
    const fallbackForeignKey = `${parentModel.entityName.replace(
      /\s+/g,
      '_'
    )}_id`;

    return fallbackForeignKey;
  }

  async _recursiveRead(inputRow, currentModel, options) {
    const pkField = currentModel.entityIdField;
    const id = inputRow[pkField];

    if (!id) {
      console.error(`Missing primary key (${pkField}) in inputRow:`, inputRow);
      return null;
    }

    let dbRow = inputRow;
    const isHydrated = Object.keys(inputRow).length > 1;

    // 1. Hydrate if needed
    if (!isHydrated) {
      try {
        dbRow = await currentModel.getById(id, {
          includeBase64: false,
        });
      } catch (error) {
        console.error(
          `Error fetching ${currentModel.tableName} by ID (${id}):`,
          error.message
        );
        return null;
      }
    }

    // 2. Process Base64
    if (currentModel.hasFileHandling && options.includeBase64) {
      try {
        dbRow = await currentModel._processBase64Content(dbRow, options);
      } catch (error) {
        console.error(
          `Error processing Base64 for ${currentModel.tableName} ID (${id}):`,
          error.message
        );
      }
    }

    // 3. Process Children
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
          console.error(
            `Error fetching children for ${childTableName}:`,
            err.message
          );
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
    const pk = currentModel.entityIdField;
    if (dataRow[pk]) {
      const alreadyInQueue = queue.some(
        (item) =>
          item.tableName === currentModel.tableName && item.id === dataRow[pk]
      );
      if (!alreadyInQueue) {
        queue.push({
          tableName: currentModel.tableName,
          id: dataRow[pk],
          model: currentModel,
        });
      }
    }

    if (currentModel.childTableConfig) {
      for (const childConfig of currentModel.childTableConfig) {
        const childTableName = childConfig.model.tableName;
        const childRows = dataRow[childTableName];
        if (childRows && Array.isArray(childRows)) {
          for (const childRow of childRows) {
            this._collectDeleteQueue(childRow, childConfig.model, queue);
          }
        }
      }
    }
  }

  // ============================================================
  // 👶 CHILD PROCESSOR
  // ============================================================
  async _processWriteChildren(
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
        await this._processWriteRecursive(
          key,
          value,
          validEntry, // Pass the parent (now with ID)
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
        validEntry[pkField] = validEntry[pkField] || uuidv4();
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

  // ============================================================
  // 🟠 WRITE OPERATION (Create/Update) - HANDLER
  // ============================================================
  async _handleWriteOperation(jsonData, schemaConfig, actionType) {
    // We use a transaction to ensure that if a child fails, the parent is rolled back.
    return await this.withTransaction(async (connection) => {
      const result = {
        createData: {},
        updateData: {},
      };

      for (const [tableName, tableRows] of Object.entries(jsonData)) {
        if (!schemaConfig[tableName]) {
          throw new AppError(`Table "${tableName}" not found in schema`, 400);
        }

        const targetModel = this._resolveTargetModel(tableName);
        const modelToUse = targetModel || this;

        // Start the recursive chain
        await this._processWriteRecursive(
          tableName,
          tableRows,
          null, // parentData
          null, // parentTableName
          modelToUse,
          result,
          schemaConfig,
          actionType,
          null // parentAction
        );
      }

      return result;
    });
  }

  async _handleReadOperation(jsonData, schemaConfig, options) {
    const resultData = {};

    for (const [tableName, rows] of Object.entries(jsonData)) {
      if (!schemaConfig[tableName]) continue;

      const targetModel = this._resolveTargetModel(tableName);
      if (!targetModel) continue;

      const builtRows = [];
      for (const row of rows) {
        try {
          const builtRow = await this._recursiveRead(row, targetModel, options);
          if (builtRow) {
            builtRows.push(builtRow);
          }
        } catch (error) {
          console.error(
            `Error processing row in table ${tableName}:`,
            error.message
          );
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
            // Check if the parent table has `onDelete: 'CASCADE'` set for the child table
            const currentTableSchema = schemaConfig[item.tableName];
            const parentTableName = this._getParentTableName(
              schemaConfig,
              item.tableName
            );
            const foreignKeyField = Object.entries(currentTableSchema).find(
              ([_, fieldDef]) =>
                fieldDef.references &&
                fieldDef.references.table === parentTableName &&
                fieldDef.references.onDelete === 'CASCADE'
            );

            // Skip deletion if `onDelete: 'CASCADE'` is set
            if (foreignKeyField) {
              console.log(
                `Skipping delete for ${item.tableName} ID ${item.id} due to ON DELETE CASCADE`
              );
              continue;
            }
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
  async processStructureDataOperation(jsonData, actionType, options = {}) {
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
      const rows = await this.dbc.executeQuery(sql, [value]);
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

  async creates(datas) {
    try {
      for (const data of datas) {
        await this.create(data);
      }
      return {
        message: `${this._capitalize(this.entityName)} created successfully`,
      };
    } catch (error) {
      throw new AppError(
        `Failed to create ${this.entityName}: ${error.message}`,
        error.statusCode || 500
      );
    }
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

      const result = await this.crudO.performCrud({
        operation: 'create',
        tableName: this.tableName,
        data,
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
      const result = await this.crudO.performCrud({
        operation: 'read',
        tableName: this.tableName,
        id,
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
      console.error(
        `Error in getById for ${this.entityName} (${id}):`,
        error.message
      );
      throw error;
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

      const results = await this.dbc.executeQuery(sql, [parentId]);

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

      const result = await this.crudO.performCrud({
        operation: 'update',
        tableName: this.tableName,
        id,
        data,
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
      await this.crudO.performCrud({
        operation: 'delete',
        tableName: this.tableName,
        id: id,
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
      await this.crudO.performCrud({
        operation: 'delete',
        tableName: this.tableName,
        conditions: { [searchField]: parentId }, // ✅ Corrected: Use FK, not PK
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

  async withTransaction(fn) {
    try {
      return await this.dbc.executeTransaction(fn);
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
      return await this.dbc.executeTransaction(async (connection) => {
        for (const item of orderData) {
          await this.crudO.performCrud({
            operation: 'update',
            tableName: this.tableName,
            id: item.id,
            data: { display_order: item.display_order },
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
        await this.dbc.executeQuery('SET FOREIGN_KEY_CHECKS = 0');
        await this.dbc.executeQuery(`TRUNCATE TABLE ${this.tableName}`);
        await this.dbc.executeQuery('SET FOREIGN_KEY_CHECKS = 1');

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
