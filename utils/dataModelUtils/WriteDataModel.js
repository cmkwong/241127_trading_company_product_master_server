import AppError from '../appError.js';

export default class WriteDataModel {
  constructor(host) {
    this.host = host;
  }

  async handleWriteOperation(jsonData, schemaConfig, actionType) {
    const host = this.host;

    return await host.withTransaction(async () => {
      const result = {
        createData: {},
        updateData: {},
      };

      const rootModel = host;

      for (const [tableName, tableRows] of Object.entries(jsonData)) {
        if (!schemaConfig[tableName]) {
          throw new AppError(`Table "${tableName}" not found in schema`, 400);
        }

        const targetModel = host._resolveTargetModel(tableName);
        const modelToUse = targetModel || host;

        await host._processWriteRecursive(
          rootModel,
          null,
          tableName,
          tableRows,
          null,
          null,
          modelToUse,
          result,
          schemaConfig,
          actionType,
          null,
        );
      }

      return result;
    });
  }
}
