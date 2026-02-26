import * as master_packingTypesModel from '../../../models/trade_business/master/master_packingTypesModel.js';
import * as master_productImagesModel from '../../../models/trade_business/master/master_productImagesTypeModel.js';
import * as master_productNameTypesModel from '../../../models/trade_business/master/master_productNameTypesModel.js';
import * as master_certificateTypesModel from '../../../models/trade_business/master/master_certificateTypesModel.js';
import * as master_categoriesModel from '../../../models/trade_business/master/master_categoriesModel.js';
import * as master_productKeywordsModel from '../../../models/trade_business/master/master_productKeywordsModel.js';
import * as master_supplierTypesModel from '../../../models/trade_business/master/master_supplierTypesModel.js';
import * as master_supplierLinkTypesModel from '../../../models/trade_business/master/master_supplierLinkTypesModel.js';
import * as master_addressTypesModel from '../../../models/trade_business/master/master_addressTypesModel.js';
import * as master_contactTypesModel from '../../../models/trade_business/master/master_contactTypesModel.js';
import * as master_serviceTypesModel from '../../../models/trade_business/master/master_serviceTypesModel.js';
import catchAsync from '../../../utils/catchAsync.js';
import AppError from '../../../utils/appError.js';
import { default_master_data } from '../../../datas/master.js';

/**
 * Get table mapping with models and data
 * @returns {Object} Map of table names to their models and data
 */
const getTableDataMapping = () => {
  return {
    master_product_image_types: {
      model: master_productImagesModel.productImagesTypeModel,
      data: default_master_data.master_product_image_types,
    },
    master_product_name_types: {
      model: master_productNameTypesModel.productNameTypeModel,
      data: default_master_data.master_product_name_types,
    },
    master_categories: {
      model: master_categoriesModel.categoryMasterModel,
      data: default_master_data.master_categories,
    },
    master_packing_types: {
      model: master_packingTypesModel.packingTypeModel,
      data: default_master_data.master_packing_types,
    },
    master_certificate_types: {
      model: master_certificateTypesModel.certificateTypeModel,
      data: default_master_data.master_certificate_types,
    },
    master_keywords: {
      model: master_productKeywordsModel.masterKeywordModel,
      data: default_master_data.master_keywords,
    },
    master_supplier_types: {
      model: master_supplierTypesModel.supplierTypeModel,
      data: default_master_data.master_supplier_types,
    },
    master_supplier_link_types: {
      model: master_supplierLinkTypesModel.supplierLinkTypeModel,
      data: default_master_data.master_supplier_link_types,
    },
    master_address_types: {
      model: master_addressTypesModel.addressTypeModel,
      data: default_master_data.master_address_types,
    },
    master_contact_types: {
      model: master_contactTypesModel.contactTypeModel,
      data: default_master_data.master_contact_types,
    },
    master_service_types: {
      model: master_serviceTypesModel.serviceTypeModel,
      data: default_master_data.master_service_types,
    },
  };
};

const _insertAllDefaults = async (tableName) => {
  const results = {};

  // Map of table names to their corresponding models and data
  const tableDataMap = getTableDataMapping();

  // If specific tableName is provided, insert only that table
  if (tableName) {
    if (!tableDataMap[tableName]) {
      throw new AppError(
        `Unknown table: ${tableName}. Valid tables: ${Object.keys(
          tableDataMap,
        ).join(', ')}`,
        400,
      );
    }

    try {
      const { model, data } = tableDataMap[tableName];
      results[tableName] = await model.creates(data);
    } catch (error) {
      results[tableName] = { error: error.message };
    }

    return results;
  }

  // If no tableName, insert all master data tables
  for (const [name, { model, data }] of Object.entries(tableDataMap)) {
    try {
      results[name] = await model.creates(data);
    } catch (error) {
      results[name] = { error: error.message };
    }
  }

  return results;
};

/**
 * Insert defaults for all master data types
 */
export const insertAllDefaults = catchAsync(async (req, res, next) => {
  const results = await _insertAllDefaults();

  res.prints = {
    status: 'success',
    message: 'Default data insertion completed',
    results,
  };
  next();
});

const _clearMasterData = async (tableName) => {
  const results = {};

  // Get table mapping and extract just the models
  const tableDataMap = getTableDataMapping();
  const tableModels = Object.entries(tableDataMap).reduce(
    (acc, [name, { model }]) => {
      acc[name] = model;
      return acc;
    },
    {},
  );

  // If specific tableName is provided, truncate only that table
  if (tableName) {
    if (!tableModels[tableName]) {
      throw new AppError(
        `Unknown table: ${tableName}. Valid tables: ${Object.keys(
          tableModels,
        ).join(', ')}`,
        400,
      );
    }

    try {
      results[tableName] = await tableModels[tableName].truncateTable();
    } catch (error) {
      results[tableName] = { error: error.message };
    }

    return results;
  }

  // If no tableName, truncate all master data tables
  for (const [name, model] of Object.entries(tableModels)) {
    try {
      results[name] = await model.truncateTable();
    } catch (error) {
      results[name] = { error: error.message };
    }
  }

  return results;
};

/**
 * Truncate all master data tables
 */
export const truncateAllTables = catchAsync(async (req, res, next) => {
  const results = await _clearMasterData();
  res.prints = {
    status: 'success',
    message: 'All master data tables have been truncated',
    results,
  };
  next();
});

/**
 * Reset all master data - truncate and then insert defaults
 */
export const resetAllMasterData = catchAsync(async (req, res, next) => {
  // First truncate all tables
  await _clearMasterData();

  // Insert the default data
  const results = await _insertAllDefaults();

  res.prints = {
    status: 'success',
    message: 'All master data has been reset successfully',
    results,
  };

  next();
});

export const resetMasterDataByTable = catchAsync(async (req, res, next) => {
  const { tableName } = req.params;
  // First truncate the specified table
  await _clearMasterData(tableName);

  // Insert the default data for the specified table
  const tableDataMap = getTableDataMapping();

  if (!tableDataMap[tableName]) {
    return next(
      new AppError(`Unknown table: ${tableName}. Cannot reset data.`, 400),
    );
  }

  const { model, data } = tableDataMap[tableName];
  await model.creates(data);

  res.prints = {
    status: 'success',
    message: `Master data for table ${tableName} has been reset successfully`,
  };

  next();
});

export const updateMasterData = catchAsync(async (req, res, next) => {
  const { tableName, id: idFromParams } = req.params;
  const tableDataMap = getTableDataMapping();

  if (!tableDataMap[tableName]) {
    return next(
      new AppError(`Unknown table: ${tableName}. Cannot update data.`, 400),
    );
  }

  const { model } = tableDataMap[tableName];
  const requestData = req.body?.data;

  if (!requestData || typeof requestData !== 'object') {
    return next(new AppError('Invalid request body data', 400));
  }

  let structuredPayload;

  // Accept both shapes:
  // 1) { data: { id, ...fields } }
  // 2) { data: { [tableName]: [{ id, ...fields }] } }
  if (requestData[tableName] !== undefined) {
    const tableRows = requestData[tableName];
    structuredPayload = {
      [tableName]: Array.isArray(tableRows) ? tableRows : [tableRows],
    };
  } else {
    const row = { ...requestData };
    if (idFromParams && !row.id) {
      row.id = idFromParams;
    }

    if (!row.id) {
      return next(new AppError('Record id is required for update', 400));
    }

    structuredPayload = {
      [tableName]: [row],
    };
  }

  const result = await model.processStructureDataOperation(
    structuredPayload,
    'update',
  );

  res.prints = {
    status: 'success',
    message: `Master data for table ${tableName} has been updated successfully`,
    result,
  };

  next();
});

export const getMasterData = catchAsync(async (req, res, next) => {
  const tableName = req.params.tableName;
  const tableDataMap = getTableDataMapping();
  if (!tableDataMap[tableName]) {
    return next(
      new AppError(`Unknown table: ${tableName}. Cannot get data.`, 400),
    );
  }
  const { model } = tableDataMap[tableName];

  const sql = `SELECT * FROM ${tableName}`;

  const results = await model.executeQuery(sql);

  res.prints = {
    status: 'success',
    results,
  };
  next();
});

/**
 * Get statistics for all master data types
 */
export const getMasterDataStatistics = catchAsync(async (req, res, next) => {
  next();
});
