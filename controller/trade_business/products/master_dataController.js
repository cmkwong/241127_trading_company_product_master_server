import * as master_packingTypesModel from '../../../models/trade_business/products/master_packingTypesModel.js';
import * as master_productImagesModel from '../../../models/trade_business/products/master_productImagesTypeModel.js';
import * as master_productNameTypesModel from '../../../models/trade_business/products/master_productNameTypesModel.js';
import * as master_certificateTypesModel from '../../../models/trade_business/products/master_certificateTypesModel.js';
import * as master_categoriesModel from '../../../models/trade_business/products/master_categoriesModel.js';
import * as master_productKeywordsModel from '../../../models/trade_business/products/master_productKeywordsModel.js';
import catchAsync from '../../../utils/catchAsync.js';
import AppError from '../../../utils/appError.js';
import { product_master_data } from '../../../datas/products.js';

/**
 * Get table mapping with models and data
 * @returns {Object} Map of table names to their models and data
 */
const getTableDataMapping = () => {
  return {
    master_product_image_types: {
      model: master_productImagesModel.productImagesTypeModel,
      data: product_master_data.master_product_image_types,
    },
    master_product_name_types: {
      model: master_productNameTypesModel.productNameTypeModel,
      data: product_master_data.master_product_name_types,
    },
    master_categories: {
      model: master_categoriesModel.categoryMasterModel,
      data: product_master_data.master_categories,
    },
    master_packing_types: {
      model: master_packingTypesModel.packingTypeModel,
      data: product_master_data.master_packing_types,
    },
    master_certificate_types: {
      model: master_certificateTypesModel.certificateTypeModel,
      data: product_master_data.master_certificate_types,
    },
    master_keywords: {
      model: master_productKeywordsModel.masterKeywordModel,
      data: product_master_data.master_keywords,
    },
  };
};

// Add category-specific controller functions
export const categoryExtensions = {
  getChildCategories: catchAsync(async (req, res, next) => {
    const { id } = req.params;

    // If id is 'root', get root categories (parent_id is null)
    const parentId = id === 'root' ? null : id;

    const categories =
      await master_categoriesModel.getChildCategories(parentId);

    res.prints = {
      status: 'success',
      categories,
    };

    next();
  }),

  getCategoryPath: catchAsync(async (req, res, next) => {
    const { id } = req.params;

    if (!id) {
      return next(new AppError('Category ID is required', 400));
    }

    const path = await master_categoriesModel.getCategoryPath(id);

    res.prints = {
      status: 'success',
      path,
    };

    next();
  }),

  getCategoryTree: catchAsync(async (req, res, next) => {
    const categoryTree = await master_categoriesModel.getCategoryTree();

    res.prints = {
      status: 'success',
      categoryTree,
    };

    next();
  }),

  checkCategoryExists: catchAsync(async (req, res, next) => {
    const { name } = req.query;

    if (!name) {
      return next(new AppError('Category name is required', 400));
    }

    try {
      const options = {
        search: name,
        limit: 1,
      };

      const result = await master_categoriesModel.getAllCategories(options);
      const exists =
        result.categories.length > 0 &&
        result.categories[0].name.toLowerCase() === name.toLowerCase();

      res.prints = {
        status: 'success',
        exists,
        category: exists ? result.categories[0] : null,
      };

      next();
    } catch (error) {
      next(
        new AppError(
          `Failed to check category existence: ${error.message}`,
          500,
        ),
      );
    }
  }),
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

const _clearProductMasterData = async (tableName) => {
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
  const results = await _clearProductMasterData();
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
  await _clearProductMasterData();

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
  await _clearProductMasterData(tableName);

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

/**
 * Get statistics for all master data types
 */
export const getMasterDataStatistics = catchAsync(async (req, res, next) => {
  next();
});
