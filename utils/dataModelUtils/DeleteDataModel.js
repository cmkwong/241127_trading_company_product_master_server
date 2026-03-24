import AppError from '../appError.js';
import { deleteFile, deleteImage } from '../fileUpload.js';

export default class DeleteDataModel {
  constructor(host) {
    this.host = host;
  }

  async handleDeleteOperation(jsonData, schemaConfig) {
    const host = this.host;
    const resultData = {};

    for (const [tableName, rows] of Object.entries(jsonData)) {
      const targetModel = host._resolveTargetModel(tableName);

      if (!targetModel) {
        console.warn(`Cannot delete from '${tableName}'. Model not found.`);
        continue;
      }

      const deleteQueue = [];
      for (const row of rows) {
        await host._collectDeleteQueue(row, targetModel, deleteQueue);
      }

      for (const item of deleteQueue) {
        try {
          const { model, id } = item;
          const deleted = await host._deleteRowFirstThenFile(model, id, {
            ignoreNotFound: true,
          });

          if (!resultData[model.tableName]) {
            resultData[model.tableName] = [];
          }

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

  async delete(id) {
    const host = this.host;

    try {
      await host._deleteRowFirstThenFile(host, id);

      return {
        message: `${host._capitalize(host.entityName)} deleted successfully`,
        id,
      };
    } catch (error) {
      throw new AppError(
        `Failed to delete ${host.entityName}: ${error.message}`,
        error.statusCode || 500,
      );
    }
  }

  async deleteAllByParentId(parentId) {
    const host = this.host;

    try {
      const searchField = host._inferForeignKeyField();

      if (!searchField) {
        throw new AppError(
          `Cannot determine foreign key for ${host.tableName} to perform delete.`,
          500,
        );
      }

      const entities = await host.getAllByParentId(
        parentId,
        false,
        {},
        searchField,
      );

      if (entities.length === 0) {
        return {
          message: `No ${host.entityName}s found`,
          count: 0,
        };
      }

      await host.dbc.executeTransaction(async (connection) => {
        const deleteSql = `DELETE FROM ${host._escapeIdentifier(host.tableName)} WHERE ${host._escapeIdentifier(searchField)} = ?`;
        await host.dbc.executeQuery(deleteSql, [parentId], connection);

        if (host.hasFileHandling) {
          for (const entity of entities) {
            if (entity[host.fileUrlField]) {
              if (host.imagesOnly) {
                await deleteImage(entity[host.fileUrlField]);
              } else {
                await deleteFile(entity[host.fileUrlField]);
              }
            }
          }
        }
      });

      return {
        message: `${host._capitalize(host.entityName)}s deleted successfully`,
        count: entities.length,
      };
    } catch (error) {
      throw new AppError(
        `Failed to delete ${host.entityName}s: ${error.message}`,
        error.statusCode || 500,
      );
    }
  }
}
