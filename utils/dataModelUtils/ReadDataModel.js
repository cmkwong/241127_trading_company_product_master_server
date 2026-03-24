import AppError from '../appError.js';
import { normalizeIdList } from './common.js';

export default class ReadDataModel {
  constructor(host) {
    this.host = host;
  }

  async handleReadOperation(jsonData, schemaConfig, options) {
    const readOptions = {
      ...(options || {}),
      _readFieldsSelection: this.host._normalizeReadFieldsSelection(
        options?.fields,
      ),
    };

    const resultData = {};

    for (const [tableName, rows] of Object.entries(jsonData)) {
      if (!schemaConfig[tableName]) continue;

      const targetModel = this.host._resolveTargetModel(tableName);
      if (!targetModel) continue;

      let builtRows = [];
      try {
        builtRows = await this.host._recursiveReadBatch(
          rows,
          targetModel,
          readOptions,
        );
      } catch (error) {
        console.error(`Error processing table ${tableName}:`, error.message);
      }
      resultData[tableName] = builtRows;
    }

    return { data: resultData };
  }

  async getById(id, options = {}) {
    const host = this.host;

    try {
      const result = await host.crudO.performCrud({
        operation: 'read',
        tableName: host.tableName,
        id,
      });

      if (!result.record) {
        throw new AppError(
          `${host._capitalize(host.entityName)} not found`,
          404,
        );
      }

      const entity = result.record;
      if (host.hasFileHandling && options.includeBase64) {
        return host._processBase64Content(entity, options);
      }

      return entity;
    } catch (error) {
      console.error(
        `Error in getById for ${host.entityName} (${id}):`,
        error.message,
      );
      throw error;
    }
  }

  async getAllByParentId(
    parentId,
    includeBase64 = false,
    options = {},
    foreignKeyField = null,
  ) {
    const host = this.host;

    try {
      const searchField = host._inferForeignKeyField(foreignKeyField);

      if (!searchField) {
        throw new AppError(
          `Cannot determine foreign key for ${host.tableName}. Please provide it explicitly.`,
          500,
        );
      }

      const sql = `
      SELECT * FROM ${host.tableName}
      WHERE ${searchField} = ?
      ORDER BY ${host.entityIdField}
    `;

      const results = await host.dbc.executeQuery(sql, [parentId]);

      if (!includeBase64 || !host.hasFileHandling) return results;

      return Promise.all(
        results.map((file) => host._processBase64Content(file, options)),
      );
    } catch (error) {
      throw new AppError(
        `Failed to get ${host.entityName}s: ${error.message}`,
        error.statusCode || 500,
      );
    }
  }

  async getAllByParentIds(parentIds, foreignKeyField = null) {
    const host = this.host;

    try {
      const searchField = host._inferForeignKeyField(foreignKeyField);

      if (!searchField) {
        throw new AppError(
          `Cannot determine foreign key for ${host.tableName}. Please provide it explicitly.`,
          500,
        );
      }

      const normalizedParentIds = normalizeIdList(parentIds);
      if (normalizedParentIds.length === 0) {
        return [];
      }

      const placeholders = normalizedParentIds.map(() => '?').join(', ');
      const sql = `
      SELECT * FROM ${host.tableName}
      WHERE ${host._escapeIdentifier(searchField)} IN (${placeholders})
      ORDER BY ${host._escapeIdentifier(searchField)}, ${host._escapeIdentifier(
        host.entityIdField,
      )}
    `;

      return await host.dbc.executeQuery(sql, normalizedParentIds);
    } catch (error) {
      throw new AppError(
        `Failed to get ${host.entityName}s by parent IDs: ${error.message}`,
        error.statusCode || 500,
      );
    }
  }
}
