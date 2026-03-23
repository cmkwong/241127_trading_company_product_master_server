import AppError from './appError.js';
import CrudOperations from './crud.js';
import {
  saveBase64File,
  saveBase64Image,
  deleteFile,
  deleteImage,
  resolveStoredFilePathForRead,
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
   * Static helper to remove a file tied to a model record.
   * Safe to call in delete flows; failures are logged and ignored.
   */
  static async cleanupModelFile(model, id) {
    if (!model?.hasFileHandling) return;
    if (!id) return;

    try {
      const exists = await model.checkExists(id, model.entityIdField);
      if (!exists) return;

      const record = await model.getById(id);
      if (record && record[model.fileUrlField]) {
        if (model.imagesOnly) {
          await deleteImage(record[model.fileUrlField]);
        } else {
          await deleteFile(record[model.fileUrlField]);
        }
      }
    } catch (fileErr) {
      console.log(`tablename: ${model?.tableName}, id: ${id}`);
      console.warn(`File cleanup warning: ${fileErr.message}`);
    }
  }

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
        this.tableFields.fields,
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

  // Helper to escape identifiers (table and field names) for SQL queries
  _escapeIdentifier(name) {
    return `\`${String(name).replace(/`/g, '``')}\``;
  }

  // Helper to capitalize entity names for error messages
  async _deleteRowFirstThenFile(model, id, options = {}) {
    const { ignoreNotFound = false } = options;
    const pkField = model.entityIdField || 'id';
    const fileUrlField = model.fileUrlField;

    return await model.dbc.executeTransaction(async (connection) => {
      let fileUrl = null;

      if (model.hasFileHandling && fileUrlField) {
        const selectSql = `SELECT ${model._escapeIdentifier(fileUrlField)} AS file_url FROM ${model._escapeIdentifier(model.tableName)} WHERE ${model._escapeIdentifier(pkField)} = ? LIMIT 1`;
        const rows = await model.dbc.executeQuery(selectSql, [id], connection);

        if (!Array.isArray(rows) || rows.length === 0) {
          if (ignoreNotFound) {
            return false;
          }

          throw new AppError(
            `${model._capitalize(model.entityName)} not found`,
            404,
          );
        }

        fileUrl = rows[0]?.file_url || null;
      }

      const deleteSql = `DELETE FROM ${model._escapeIdentifier(model.tableName)} WHERE ${model._escapeIdentifier(pkField)} = ?`;
      const deleteResult = await model.dbc.executeQuery(
        deleteSql,
        [id],
        connection,
      );

      if (!deleteResult?.affectedRows) {
        if (ignoreNotFound) {
          return false;
        }

        throw new AppError(
          `${model._capitalize(model.entityName)} not found`,
          404,
        );
      }

      if (model.hasFileHandling && fileUrl) {
        if (model.imagesOnly) {
          await deleteImage(fileUrl);
        } else {
          await deleteFile(fileUrl);
        }
      }

      return true;
    });
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
        ([_, def]) => def.references,
      );

      if (fkFields.length === 1) {
        return fkFields[0][0]; // Return the field name
      }
    }

    // 2. Fallback: Look for a required field ending in '_id' that isn't the PK
    const heuristicMatch = this.requiredFields.find(
      (f) => f.endsWith('_id') && f !== this.entityIdField,
    );

    if (heuristicMatch) return heuristicMatch;

    return null;
  }

  // check if data has base64 data content
  _hasBase64Content = (validEntry) => {
    for (const [_field, _value] of Object.entries(validEntry)) {
      if (_field === 'base64_image' || _field === 'base64_file') {
        return true;
      }
    }
    return false;
  };

  // ============================================================
  // 📂 FILE HANDLING
  // ============================================================
  async _validateAndSaveFile(data, options = {}) {
    let { entityId, fileType } = options;
    const base64FieldName = this.imagesOnly ? 'base64_image' : 'base64_file';

    if (!data[base64FieldName]) {
      throw new AppError(`${base64FieldName} is required for file upload`, 400);
    }

    if (!data[base64FieldName]) return null;

    // Auto-detect file type from base64 if not provided (ALWAYS, not just when fileTypeField is set)
    if (!fileType && !this.imagesOnly) {
      const base64Content = data[base64FieldName];
      if (typeof base64Content === 'string') {
        const match = base64Content.match(/^data:(.+);base64,/);
        if (match) {
          const mimeType = match[1];

          if (mimeType.includes('pdf')) fileType = 'pdf';
          else if (mimeType.includes('sheet') || mimeType.includes('excel'))
            fileType = 'spreadsheet';
          else if (mimeType.includes('image')) fileType = 'image';
          else if (
            mimeType.includes('word') ||
            mimeType.includes('text') ||
            mimeType.includes('document')
          )
            fileType = 'document';
          else if (mimeType.includes('zip') || mimeType.includes('tar'))
            fileType = 'archive';
        }
      }
    }

    if (!this.imagesOnly && !fileType) {
      throw new AppError('File type could not be determined', 400);
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

  // read and process base64 content and save to json
  async _processBase64Content(file, options = {}) {
    let {
      compress = false,
      maxWidth = 800,
      maxHeight = 800,
      quality = 0.7,
      base64OnlyTable,
    } = options;

    if (
      base64OnlyTable &&
      Array.isArray(base64OnlyTable) &&
      !base64OnlyTable.includes(this.tableName)
    ) {
      return file;
    }

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
      const rawFileUrl = file?.[this.fileUrlField];

      // Skip processing when DB has no file URL value.
      // This avoids noisy errors like EISDIR when url is null/false/empty.
      if (
        rawFileUrl === undefined ||
        rawFileUrl === null ||
        rawFileUrl === false ||
        (typeof rawFileUrl === 'string' && rawFileUrl.trim() === '')
      ) {
        return file;
      }

      const filePath = resolveStoredFilePathForRead(rawFileUrl);
      if (!filePath) {
        return file;
      }

      const stat = await fs.stat(filePath);
      if (!stat.isFile()) {
        return file;
      }

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
        file[this.imagesOnly ? 'base64_image' : 'base64_file'] =
          `data:image/jpeg;base64,${base64Content}`;
        file.is_compressed = true;
      } else {
        const fileBuffer = await fs.readFile(filePath);
        const base64Content = fileBuffer.toString('base64');
        file[this.imagesOnly ? 'base64_image' : 'base64_file'] =
          `data:${mimeType};base64,${base64Content}`;
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
    parentAction,
  ) {
    if (parentAction === 'create') return 'create';
    if (globalActionType === 'create') return 'create';

    const pkField = currentModel.entityIdField; // Use the auto-detected PK
    const pkValue = row[pkField];

    if (!pkValue) return 'create';

    const exists = await currentModel.checkExists(pkValue, pkField);
    return exists ? 'update' : 'create'; // TODO: if update, return a root key
  }

  // ============================================================
  // 🔄 RECURSIVE PROCESSOR (With Real DB Writes)
  // ============================================================
  async _processWriteRecursive(
    rootModel, // Accept root model
    rootModelKeyValue,
    tableName,
    rows,
    parentData,
    parentTableName,
    currentModel,
    result,
    schemaConfig,
    globalActionType,
    parentAction = null,
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
        parentAction,
      );

      // 2. Prepare Data (Validation, Defaults, Link Parent)
      const validEntry = await this._prepareDbRow(
        rawRow,
        tableSchema,
        parentData,
        parentTableName,
        currentModel,
        rowAction,
      );
      // assign the key value of root model
      if (rootModel.tableName === tableName) {
        rootModelKeyValue = validEntry[pkField];
      }

      // 3. EXECUTE DATABASE WRITE (Real-time)
      let dbRecord = null;
      const hasFilePayload =
        currentModel.hasFileHandling &&
        currentModel._hasBase64Content(validEntry);
      let previousFileUrl = null;

      try {
        // --- A. Prepare data for CRUD and clean-up original file if needed (set file URL to PENDING if file handling needed) ---
        let crudData = { ...validEntry };
        if (hasFilePayload) {
          // Keep previous URL for rollback and post-success cleanup
          if (rowAction === 'update') {
            const existingRow = await currentModel.getById(validEntry[pkField]);
            previousFileUrl = existingRow?.[currentModel.fileUrlField] || null;
          }

          crudData[currentModel.fileUrlField] = 'PENDING';
        }

        // --- B. Perform CRUD first ---
        console.log('Performing CRUD with data:', crudData);
        const crudResult = await this.crudO.performCrud({
          operation: rowAction, // 'create' or 'update'
          tableName: currentModel.tableName,
          id: rowAction === 'update' ? validEntry[pkField] : undefined,
          data: crudData,
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

        // --- D. Handle File Uploads (Post-Write after CRUD succeeds) ---
        if (hasFilePayload) {
          // Auto-detect file type from base64 in _validateAndSaveFile
          const fileUrl = await currentModel._validateAndSaveFile(rawRow, {
            entityId: rootModelKeyValue,
          });

          if (fileUrl) {
            // Update the record with the file URL
            validEntry[currentModel.fileUrlField] = fileUrl;
            await this.crudO.performCrud({
              operation: 'update',
              tableName: currentModel.tableName,
              id: validEntry[pkField],
              data: { [currentModel.fileUrlField]: fileUrl },
            });

            // Delete old file only after new file is saved and DB URL is updated
            if (
              rowAction === 'update' &&
              previousFileUrl &&
              previousFileUrl !== fileUrl
            ) {
              if (currentModel.imagesOnly) {
                await deleteImage(previousFileUrl);
              } else {
                await deleteFile(previousFileUrl);
              }
            }
          }
        }
      } catch (err) {
        // Rollback stale PENDING state if file upload failed mid-flow
        if (hasFilePayload && validEntry[pkField]) {
          try {
            if (rowAction === 'create') {
              // Created row with PENDING URL should be removed
              await this.crudO.performCrud({
                operation: 'delete',
                tableName: currentModel.tableName,
                id: validEntry[pkField],
              });
            } else if (rowAction === 'update' && previousFileUrl) {
              // Restore previous URL for updates
              await this.crudO.performCrud({
                operation: 'update',
                tableName: currentModel.tableName,
                id: validEntry[pkField],
                data: { [currentModel.fileUrlField]: previousFileUrl },
              });
            }
          } catch (rollbackErr) {
            console.warn(
              `PENDING rollback warning for ${currentModel.tableName} (${validEntry[pkField]}): ${rollbackErr.message}`,
            );
          }
        }

        throw new AppError(
          `Failed to ${rowAction} ${tableName}: ${err.message}`,
          500,
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
        rootModel, // Pass the root model
        rootModelKeyValue,
        rawRow,
        validEntry,
        tableName,
        currentModel,
        result,
        schemaConfig,
        globalActionType,
        rowAction,
      );
    }
  }

  /**
   * Determines the parent table name and model from the schemaConfig by passing the table name.
   * Supports fetching the parent at any dynamic level (e.g., level=1, 2, 3, ...).
   * Only considers fields where the referenced field in the parent table is a primary key.
   *
   * @param {Object} schemaConfig - The schema configuration object
   * @param {string} tableName - The name of the child table
   * @param {number} level - Level of parent to retrieve (1 for immediate parent, 2 for grandparent, etc.)
   * @returns {Array} - An array with the parent table name and its schema, or [null, null] if no parent is found
   */
  _getParentTableConfig(schemaConfig, tableName, level = 1) {
    const tableSchema = schemaConfig[tableName];
    if (!tableSchema) {
      throw new AppError(`Table "${tableName}" not found in schemaConfig`, 400);
    }

    let parentTableName = null;
    let parentSchema = null;

    // Search for a field with a "references" property in the table schema
    for (const [fieldName, fieldDef] of Object.entries(tableSchema)) {
      if (
        fieldDef.references && // Field has a "references" property
        fieldDef.references.table && // References a table
        schemaConfig[fieldDef.references.table] && // Referenced table exists in schemaConfig
        schemaConfig[fieldDef.references.table][fieldDef.references.field]
          ?.primaryKey // Referenced field is a primary key
      ) {
        parentTableName = fieldDef.references.table;
        parentSchema = schemaConfig[parentTableName];
        break; // Found the immediate parent
      }
    }

    // If no parent is found, return [null, null]
    if (!parentTableName || !parentSchema) {
      return [null, null];
    }

    // If level = 1, return the immediate parent
    if (level === 1) {
      return [parentTableName, parentSchema];
    }

    // If level > 1, recursively find the parent at the specified level
    return this._getParentTableConfig(schemaConfig, parentTableName, level - 1);
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
          this._getBaseTableName(def.references?.table) === parentBaseName,
      );
      if (foundEntry) return foundEntry[0];
    }

    // 3. FALLBACK: Naming convention (e.g., "product_customization" -> "product_customization_id")
    const fallbackForeignKey = `${parentModel.entityName.replace(
      /\s+/g,
      '_',
    )}_id`;

    return fallbackForeignKey;
  }

  // Helper to recursively check if model has any descendant with selected fields
  _normalizeReadFieldsSelection(fieldsOption) {
    if (!fieldsOption) return null;

    let parsed = fieldsOption;
    if (typeof fieldsOption === 'string') {
      try {
        parsed = JSON.parse(fieldsOption);
      } catch (_err) {
        return null;
      }
    }

    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return null;
    }

    const fieldsByTable = new Map();

    for (const [tableName, fields] of Object.entries(parsed)) {
      if (!Array.isArray(fields) || fields.length === 0) continue;

      const normalizedTableName = this._getBaseTableName(tableName);
      const normalizedFields = [
        ...new Set(fields.map((f) => String(f).trim())),
      ].filter(Boolean);

      if (normalizedFields.length === 0) continue;
      fieldsByTable.set(normalizedTableName, new Set(normalizedFields));
    }

    if (fieldsByTable.size === 0) return null;

    return {
      fieldsByTable,
      descendantMemo: new Map(),
    };
  }

  // Recursive helper to check if any descendant of the model has selected fields
  _modelHasSelectedDescendant(model, selection) {
    const baseTable = this._getBaseTableName(model.tableName);

    if (selection.descendantMemo.has(baseTable)) {
      return selection.descendantMemo.get(baseTable);
    }

    let hasSelectedDescendant = false;
    for (const childConfig of model.childTableConfig || []) {
      const childModel = childConfig?.model;
      if (!childModel) continue;

      const childBaseTable = this._getBaseTableName(childModel.tableName);
      if (selection.fieldsByTable.has(childBaseTable)) {
        hasSelectedDescendant = true;
        break;
      }

      if (this._modelHasSelectedDescendant(childModel, selection)) {
        hasSelectedDescendant = true;
        break;
      }
    }

    selection.descendantMemo.set(baseTable, hasSelectedDescendant);
    return hasSelectedDescendant;
  }

  // Helper to apply read field selection to a single row based on the current model and selection config
  _applyReadFieldsToRow(row, currentModel, options) {
    const selection = options?._readFieldsSelection;
    if (!selection) return row;

    const baseTable = this._getBaseTableName(currentModel.tableName);
    const selectedFields = selection.fieldsByTable.get(baseTable);
    const hasSelectedDescendant = this._modelHasSelectedDescendant(
      currentModel,
      selection,
    );

    if (!selectedFields && !hasSelectedDescendant) {
      return null;
    }

    const result = {};

    const shouldAttachComputedBase64 =
      !!selectedFields &&
      !!options?.includeBase64 &&
      currentModel.hasFileHandling;
    const computedBase64Field = currentModel.imagesOnly
      ? 'base64_image'
      : 'base64_file';

    if (selectedFields) {
      for (const fieldName of selectedFields) {
        if (Object.prototype.hasOwnProperty.call(row, fieldName)) {
          result[fieldName] = row[fieldName];
        }
      }

      // base64 fields are computed at server side (not DB columns).
      // Include them automatically for selected file tables when includeBase64=true.
      if (
        shouldAttachComputedBase64 &&
        Object.prototype.hasOwnProperty.call(row, computedBase64Field)
      ) {
        result[computedBase64Field] = row[computedBase64Field];
      }

      if (
        shouldAttachComputedBase64 &&
        Object.prototype.hasOwnProperty.call(row, 'is_compressed')
      ) {
        result.is_compressed = row.is_compressed;
      }

      if (
        shouldAttachComputedBase64 &&
        Object.prototype.hasOwnProperty.call(row, 'error')
      ) {
        result.error = row.error;
      }
    } else {
      const pkField = currentModel.entityIdField || 'id';
      if (Object.prototype.hasOwnProperty.call(row, pkField)) {
        result[pkField] = row[pkField];
      }
    }

    for (const childConfig of currentModel.childTableConfig || []) {
      const childModel = childConfig?.model;
      if (!childModel) continue;

      const childTableName = childModel.tableName;
      if (!Object.prototype.hasOwnProperty.call(row, childTableName)) continue;

      const childBaseTable = this._getBaseTableName(childTableName);
      const childSelected = selection.fieldsByTable.has(childBaseTable);
      const childHasSelectedDescendant = this._modelHasSelectedDescendant(
        childModel,
        selection,
      );

      if (!childSelected && !childHasSelectedDescendant) continue;

      const childValue = row[childTableName];
      if (Array.isArray(childValue)) {
        const cleaned = childValue.filter(Boolean);
        if (cleaned.length > 0) {
          result[childTableName] = cleaned;
        }
      } else if (childValue) {
        result[childTableName] = childValue;
      }
    }

    return result;
  }

  _canSkipHydration(inputRow, currentModel, options) {
    if (options?.includeBase64) {
      return false;
    }

    const selection = options?._readFieldsSelection;
    if (!selection) {
      return false;
    }

    const baseTable = this._getBaseTableName(currentModel.tableName);
    const selectedFields = selection.fieldsByTable.get(baseTable);

    // No direct fields selected for this table -> keep parent as container only.
    if (!selectedFields) {
      return true;
    }

    // Safe skip only when every selected field already exists in input row.
    for (const fieldName of selectedFields) {
      if (!Object.prototype.hasOwnProperty.call(inputRow, fieldName)) {
        return false;
      }
    }

    return true;
  }

  _shouldTraverseChildren(currentModel, options) {
    const selection = options?._readFieldsSelection;
    if (!selection) {
      return true;
    }

    return this._modelHasSelectedDescendant(currentModel, selection);
  }

  _shouldReadChildBranch(childModel, options) {
    const selection = options?._readFieldsSelection;
    if (!selection) {
      return true;
    }

    const childBaseTable = this._getBaseTableName(childModel.tableName);
    const childSelected = selection.fieldsByTable.has(childBaseTable);
    if (childSelected) {
      return true;
    }

    return this._modelHasSelectedDescendant(childModel, selection);
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
    const skipHydration = this._canSkipHydration(
      inputRow,
      currentModel,
      options,
    );

    // 1. Hydrate if needed
    if (!isHydrated && !skipHydration) {
      try {
        dbRow = await currentModel.getById(id, {
          includeBase64: false,
        });
      } catch (error) {
        console.error(
          `Error fetching ${currentModel.tableName} by ID (${id}):`,
          error.message,
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
          error.message,
        );
      }
    }

    // 3. Process Children
    if (
      currentModel.childTableConfig &&
      currentModel.childTableConfig.length > 0 &&
      this._shouldTraverseChildren(currentModel, options)
    ) {
      for (const childConfig of currentModel.childTableConfig) {
        const childModel = childConfig.model;
        if (!this._shouldReadChildBranch(childModel, options)) {
          continue;
        }

        const childTableName = childModel.tableName;

        // --- Auto-Detect Foreign Key ---
        const foreignKeyField = this._resolveForeignKey(
          currentModel,
          childConfig,
        );

        // A. Fetch children
        try {
          const childRows = await childModel.getAllByParentId(
            id,
            false,
            {},
            foreignKeyField,
          );

          // B. Recursively process each child
          const processedChildren = [];
          for (const childRow of childRows) {
            const processedChild = await this._recursiveRead(
              childRow,
              childModel,
              options,
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
            err.message,
          );
        }
      }
    }

    return this._applyReadFieldsToRow(dbRow, currentModel, options);
  }

  /**
   * Recursive Helper:
   * - If a row has children present in the JSON -> It is a PATH (Do not delete).
   * - If a row has NO children in the JSON -> It is a LEAF (Delete it).
   */
  async _collectDeleteQueue(dataRow, currentModel, queue) {
    const pk = currentModel.entityIdField;

    // FIX: Try configured PK first, then fallback to 'id'
    const id = dataRow[pk] || dataRow['id'];

    if (!id) return; // Still no ID? Then we can't delete.

    let isPathToChild = false;

    const providedChildren = [];

    // Check if this model has children configured AND if those children exist in the JSON
    if (
      currentModel.childTableConfig &&
      currentModel.childTableConfig.length > 0
    ) {
      for (const childConfig of currentModel.childTableConfig) {
        // fallback to tableName
        const jsonKey = childConfig.jsonKey || childConfig.model.tableName;
        const childRows = dataRow[jsonKey];

        // CRITICAL: Only recurse if the JSON actually contains data for this child
        if (childRows && Array.isArray(childRows) && childRows.length > 0) {
          isPathToChild = true; // This row is just a container/path
          providedChildren.push({ childConfig, childRows });
        }
      }
    }

    // If it IS a path (meaning explicit children were provided),
    // do NOT delete current row; only recurse into provided children.
    if (isPathToChild) {
      for (const { childConfig, childRows } of providedChildren) {
        for (const childRow of childRows) {
          await this._collectDeleteQueue(childRow, childConfig.model, queue);
        }
      }
      return;
    }

    // If it is NOT a path (meaning it's the last node provided in this JSON branch),
    // then it is the target to delete, and we also delete all descendants.
    if (currentModel.childTableConfig && currentModel.childTableConfig.length) {
      for (const childConfig of currentModel.childTableConfig) {
        const foreignKeyField = this._resolveForeignKey(
          currentModel,
          childConfig,
        );
        try {
          const childRows = await childConfig.model.getAllByParentId(
            id,
            false,
            {},
            foreignKeyField,
          );

          for (const childRow of childRows) {
            await this._collectDeleteQueue(childRow, childConfig.model, queue);
          }
        } catch (err) {
          console.error(
            `Error fetching children for ${childConfig.model.tableName} during delete:`,
            err.message,
          );
        }
      }
    }

    // Avoid duplicates
    const alreadyInQueue = queue.some(
      (item) => item.tableName === currentModel.tableName && item.id === id,
    );

    if (!alreadyInQueue) {
      queue.push({
        tableName: currentModel.tableName,
        id: id,
        model: currentModel,
      });
    }
  }

  // ============================================================
  // 👶 CHILD PROCESSOR
  // ============================================================
  async _processWriteChildren(
    rootModel, // Accept root model
    rootModelKeyValue,
    rawRow,
    validEntry,
    currentTableName,
    currentModel,
    result,
    schemaConfig,
    globalActionType,
    parentAction,
  ) {
    for (const [tableName, tableRows] of Object.entries(rawRow)) {
      if (!Array.isArray(tableRows)) continue;

      const childConfig = currentModel.childTableConfig.find(
        (config) => config.model.tableName === tableName,
      );

      if (childConfig && childConfig.model) {
        await this._processWriteRecursive(
          rootModel, // Pass the root model
          rootModelKeyValue,
          tableName,
          tableRows,
          validEntry,
          currentTableName,
          childConfig.model,
          result,
          schemaConfig,
          globalActionType,
          parentAction,
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
    rowAction,
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
    console.log('rawRow:', rawRow);
    console.log('Parent Data:', parentData);
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
      // Always generate UUID for VARCHAR PKs on create
      validEntry[pkField] = validEntry[pkField] || uuidv4();
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

      // Set the root model to 'this' unconditionally
      const rootModel = this;

      for (const [tableName, tableRows] of Object.entries(jsonData)) {
        if (!schemaConfig[tableName]) {
          throw new AppError(`Table "${tableName}" not found in schema`, 400);
        }

        const targetModel = this._resolveTargetModel(tableName);
        const modelToUse = targetModel || this;

        // Start the recursive chain
        await this._processWriteRecursive(
          rootModel, // Pass the root model
          null,
          tableName,
          tableRows,
          null, // parentData
          null, // parentTableName
          modelToUse,
          result,
          schemaConfig,
          actionType,
          null, // parentAction
        );
      }

      return result;
    });
  }

  async _handleReadOperation(jsonData, schemaConfig, options) {
    const readOptions = {
      ...(options || {}),
      _readFieldsSelection: this._normalizeReadFieldsSelection(options?.fields),
    };

    const resultData = {};

    for (const [tableName, rows] of Object.entries(jsonData)) {
      if (!schemaConfig[tableName]) continue;

      const targetModel = this._resolveTargetModel(tableName);
      if (!targetModel) continue;

      const builtRows = [];
      for (const row of rows) {
        try {
          const builtRow = await this._recursiveRead(
            row,
            targetModel,
            readOptions,
          );
          if (builtRow) {
            builtRows.push(builtRow);
          }
        } catch (error) {
          console.error(
            `Error processing row in table ${tableName}:`,
            error.message,
          );
        }
      }
      resultData[tableName] = builtRows;
    }

    return { data: resultData };
  }

  // ============================================================
  // 🗑️ DELETE OPERATIONS (Recursive Leaf-Node Targeting)
  // ============================================================

  async _handleDeleteOperation(jsonData, schemaConfig) {
    const resultData = {};

    for (const [tableName, rows] of Object.entries(jsonData)) {
      // 1. Resolve Root Model
      const targetModel = this._resolveTargetModel(tableName);

      if (!targetModel) {
        console.warn(`Cannot delete from '${tableName}'. Model not found.`);
        continue;
      }

      // 2. Build Delete Queue (Identify Leafs)
      const deleteQueue = [];
      for (const row of rows) {
        await this._collectDeleteQueue(row, targetModel, deleteQueue);
      }

      // 3. Execute Deletes
      for (const item of deleteQueue) {
        try {
          const { model, id } = item;

          // A. Database delete first, then file delete in the same DB transaction.
          //    If file deletion fails, DB delete is rolled back.
          const deleted = await this._deleteRowFirstThenFile(model, id, {
            ignoreNotFound: true,
          });

          // C. Output Result
          if (!resultData[model.tableName]) {
            resultData[model.tableName] = [];
          }
          // Avoid duplicates in response
          if (!resultData[model.tableName].some((r) => r.id === id)) {
            resultData[model.tableName].push({
              id: id,
              status: deleted ? 'deleted' : 'not_found',
            });
          }
        } catch (err) {
          console.error(
            `Delete failed for ${item.tableName} ID ${item.id}`,
            err,
          );
          if (!resultData[item.tableName]) resultData[item.tableName] = [];
          resultData[item.tableName].push({ id: item.id, error: err.message });
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

    // 2. Is it a configured child? (Direct Match)
    const childConfig = this.childTableConfig.find(
      (c) => c.model.tableName === tableName || c.jsonKey === tableName,
    );

    if (childConfig) {
      return childConfig.model;
    }

    // 3. Deep Search (Recursive) - Find Grandchildren
    // If not found in direct children, ask the children to look in THEIR children
    for (const child of this.childTableConfig) {
      const deepMatch = child.model._resolveTargetModel(tableName);
      if (deepMatch) {
        return deepMatch;
      }
    }

    return null;
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
        400,
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
            400,
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
          400,
        );
      }

      if (validations.max !== undefined && data[field] > validations.max) {
        throw new AppError(
          `${this._formatFieldName(field)} cannot exceed ${validations.max}`,
          400,
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
          400,
        );
      }

      if (validations.validate && typeof validations.validate === 'function') {
        const validationResult = validations.validate(data[field], data);
        if (validationResult !== true) {
          throw new AppError(
            validationResult || `Invalid ${this._formatFieldName(field)}`,
            400,
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
        error.statusCode || 500,
      );
    }
  }

  async create(data) {
    try {
      this.validateData(data);

      const result = await this.crudO.performCrud({
        operation: 'create',
        tableName: this.tableName,
        data,
      });

      // Handle file upload if applicable
      if (this.hasFileHandling) {
        const fileType = data[this.fileTypeField];
        data[this.fileUrlField] = await this._validateAndSaveFile(data, {
          entityId: data[this.entityIdField],
          fileType,
        });
      }

      return {
        message: `${this._capitalize(this.entityName)} created successfully`,
        [this._camelCase(this.entityName)]: result.record,
      };
    } catch (error) {
      throw new AppError(
        `Failed to create ${this.entityName}: ${error.message}`,
        error.statusCode || 500,
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
          404,
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
        error.message,
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
    foreignKeyField = null,
  ) {
    try {
      const searchField = this._inferForeignKeyField(foreignKeyField);

      if (!searchField) {
        throw new AppError(
          `Cannot determine foreign key for ${this.tableName}. Please provide it explicitly.`,
          500,
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
        results.map((file) => this._processBase64Content(file, options)),
      );
    } catch (error) {
      throw new AppError(
        `Failed to get ${this.entityName}s: ${error.message}`,
        error.statusCode || 500,
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
        error.statusCode || 500,
      );
    }
  }

  async delete(id) {
    try {
      await this._deleteRowFirstThenFile(this, id);

      return {
        message: `${this._capitalize(this.entityName)} deleted successfully`,
        id,
      };
    } catch (error) {
      throw new AppError(
        `Failed to delete ${this.entityName}: ${error.message}`,
        error.statusCode || 500,
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
          500,
        );
      }

      // Get all entities for this parent
      const entities = await this.getAllByParentId(
        parentId,
        false,
        {},
        searchField,
      );

      if (entities.length === 0) {
        return {
          message: `No ${this.entityName}s found`,
          count: 0,
        };
      }

      await this.dbc.executeTransaction(async (connection) => {
        // Delete rows first
        const deleteSql = `DELETE FROM ${this._escapeIdentifier(this.tableName)} WHERE ${this._escapeIdentifier(searchField)} = ?`;
        await this.dbc.executeQuery(deleteSql, [parentId], connection);

        // Then delete files. Any failure throws and triggers transaction rollback.
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
      });

      return {
        message: `${this._capitalize(this.entityName)}s deleted successfully`,
        count: entities.length,
      };
    } catch (error) {
      throw new AppError(
        `Failed to delete ${this.entityName}s: ${error.message}`,
        error.statusCode || 500,
      );
    }
  }

  async withTransaction(fn) {
    try {
      return await this.dbc.executeTransaction(fn);
    } catch (error) {
      throw new AppError(
        `Transaction failed: ${error.message}`,
        error.statusCode || 500,
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
            this.entityName,
          )}s reordered successfully`,
          [this.entityIdField]: entityId,
          [this._pluralize(this._camelCase(this.entityName))]: files,
        };
      });
    } catch (error) {
      throw new AppError(
        `Failed to reorder ${this.entityName}s: ${error.message}`,
        error.statusCode || 500,
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
            this.entityName,
          )}s table has been truncated successfully`,
        };
      });
    } catch (error) {
      throw new AppError(
        `Failed to truncate ${this.entityName}s: ${error.message}`,
        500,
      );
    }
  }

  async executeQuery(stmt, args) {
    const result = await this.dbc.executeQuery(stmt, args);
    return result;
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

  _getTableFieldDefinitions() {
    if (
      this.tableFields?.fields &&
      typeof this.tableFields.fields === 'object'
    ) {
      return this.tableFields.fields;
    }

    if (this.tableFields && typeof this.tableFields === 'object') {
      return this.tableFields;
    }

    return {};
  }

  /**
   * Get first-level output keys for the current model.
   * - Root table columns are included as direct keys.
   * - Direct child tables are included as table keys.
   *
   * Useful for front-end comparison/whitelist checks.
   */
  getFirstLevelFieldNames(options = {}) {
    const { excludedFields = [] } = options;
    const rootTableName = this._getBaseTableName(this.tableName);
    const fieldDefs = this._getTableFieldDefinitions();
    const rootFields = Object.keys(fieldDefs).filter(
      (field) => !excludedFields.includes(field),
    );

    const childTableKeys = (this.childTableConfig || [])
      .map((childConfig) =>
        this._getBaseTableName(
          childConfig?.jsonKey || childConfig?.model?.tableName,
        ),
      )
      .filter(Boolean);

    const firstLevelKeys = [...new Set([...rootFields, ...childTableKeys])];

    const keyDetails = firstLevelKeys.map((key) => ({
      key,
      tableName: rootFields.includes(key) ? rootTableName : key,
      sourceType: rootFields.includes(key) ? 'field' : 'table',
    }));

    return {
      tableName: rootTableName,
      firstLevelKeys,
      keyDetails,
    };
  }
}
