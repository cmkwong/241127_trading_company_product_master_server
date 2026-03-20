import { getDataDefaultMappings } from '../../mappings/defaultDataMappings.js';

const getBaseTableName = (tableName = '') => {
  const parts = String(tableName).split('.');
  return parts[parts.length - 1];
};

const buildFileMappingFromModel = (model, mapping, visitedTables) => {
  if (!model || !model.tableName) {
    return;
  }

  const tableName = getBaseTableName(model.tableName);
  if (visitedTables.has(tableName)) {
    return;
  }

  visitedTables.add(tableName);

  if (model.hasFileHandling && model.fileUrlField) {
    mapping[tableName] = {
      url: model.fileUrlField,
      base64: model.imagesOnly ? 'base64_image' : 'base64_file',
    };
  }

  for (const childConfig of model.childTableConfig || []) {
    if (childConfig?.model) {
      buildFileMappingFromModel(childConfig.model, mapping, visitedTables);
    }
  }
};

export const getTradeBusinessDataFileMappingsModel = () => {
  const dataMappings = getDataDefaultMappings();
  const fileBase64Mappings = {};
  const visitedTables = new Set();

  for (const { model } of dataMappings) {
    buildFileMappingFromModel(model, fileBase64Mappings, visitedTables);
  }

  return fileBase64Mappings;
};
