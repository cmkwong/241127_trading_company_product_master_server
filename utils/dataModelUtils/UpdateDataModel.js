import AppError from '../appError.js';
import { deleteFile, deleteImage } from '../fileUpload.js';
import { wrapEntityFailure } from './common.js';

export default class UpdateDataModel {
  constructor(host) {
    this.host = host;
  }

  async creates(datas) {
    const host = this.host;

    try {
      for (const data of datas) {
        await host.create(data);
      }
      return {
        message: `${host._capitalize(host.entityName)} created successfully`,
      };
    } catch (error) {
      wrapEntityFailure(AppError, host.entityName, 'create', error);
    }
  }

  async create(data) {
    const host = this.host;

    try {
      host.validateData(data);

      const result = await host.crudO.performCrud({
        operation: 'create',
        tableName: host.tableName,
        data,
      });

      if (host.hasFileHandling) {
        const fileType = data[host.fileTypeField];
        data[host.fileUrlField] = await host._validateAndSaveFile(data, {
          entityId: data[host.entityIdField],
          fileType,
        });
      }

      return {
        message: `${host._capitalize(host.entityName)} created successfully`,
        [host._camelCase(host.entityName)]: result.record,
      };
    } catch (error) {
      wrapEntityFailure(AppError, host.entityName, 'create', error);
    }
  }

  async update(id, data) {
    const host = this.host;

    try {
      host.validateData(data, true);

      const existing = await host.getById(id);
      if (host.hasFileHandling) {
        const fileType =
          data[host.fileTypeField] || existing[host.fileTypeField];
        data[host.fileUrlField] = await host._validateAndSaveFile(data, {
          entityId: id,
          fileType,
        });

        if (data[host.fileUrlField] && existing[host.fileUrlField]) {
          host.imagesOnly
            ? await deleteImage(existing[host.fileUrlField])
            : await deleteFile(existing[host.fileUrlField]);
        }
      }

      const result = await host.crudO.performCrud({
        operation: 'update',
        tableName: host.tableName,
        id,
        data,
      });

      return {
        message: `${host._capitalize(host.entityName)} updated successfully`,
        [host._camelCase(host.entityName)]: result.record,
      };
    } catch (error) {
      wrapEntityFailure(AppError, host.entityName, 'update', error);
    }
  }

  async reorderFiles(entityId, orderData) {
    const host = this.host;

    if (!host.hasFileHandling) {
      throw new AppError('File handling is not configured for this model', 500);
    }

    try {
      return await host.dbc.executeTransaction(async () => {
        for (const item of orderData) {
          await host.crudO.performCrud({
            operation: 'update',
            tableName: host.tableName,
            id: item.id,
            data: { display_order: item.display_order },
          });
        }

        const files = await host.getAllByParentId(entityId);

        return {
          message: `${host._capitalize(host.entityName)}s reordered successfully`,
          [host.entityIdField]: entityId,
          [host._pluralize(host._camelCase(host.entityName))]: files,
        };
      });
    } catch (error) {
      wrapEntityFailure(AppError, host.entityName, 'reorder', error);
    }
  }

  async truncateTable() {
    const host = this.host;

    try {
      return await host.withTransaction(async () => {
        await host.dbc.executeQuery('SET FOREIGN_KEY_CHECKS = 0');
        await host.dbc.executeQuery(`TRUNCATE TABLE ${host.tableName}`);
        await host.dbc.executeQuery('SET FOREIGN_KEY_CHECKS = 1');

        return {
          success: true,
          message: `${host._capitalize(
            host.entityName,
          )}s table has been truncated successfully`,
        };
      });
    } catch (error) {
      throw new AppError(
        `Failed to truncate ${host.entityName}s: ${error.message}`,
        500,
      );
    }
  }
}
