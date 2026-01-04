import * as master_packingTypesModel from '../../../models/trade_business/products/master_packingTypesModel.js';
import * as master_productImagesModel from '../../../models/trade_business/products/master_productImagesTypeModel.js';
import * as master_productNameTypesModel from '../../../models/trade_business/products/master_productNameTypesModel.js';
import * as master_certificateTypesModel from '../../../models/trade_business/products/master_certificateTypesModel.js';
import * as master_categoriesModel from '../../../models/trade_business/products/master_categoriesModel.js';
import catchAsync from '../../../utils/catchAsync.js';
import AppError from '../../../utils/appError.js';
import { product_master_data } from '../../../datas/products.js';

// Add category-specific controller functions
export const categoryExtensions = {
  getChildCategories: catchAsync(async (req, res, next) => {
    const { id } = req.params;

    // If id is 'root', get root categories (parent_id is null)
    const parentId = id === 'root' ? null : id;

    const categories = await master_categoriesModel.getChildCategories(
      parentId
    );

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
          500
        )
      );
    }
  }),
};

const _insertAllDefaults = async () => {
  await master_productImagesModel.productImagesTypeModel.creates(
    product_master_data.master_product_images_type
  );

  await master_productNameTypesModel.productNameTypeModel.creates(
    product_master_data.master_product_name_types
  );

  await master_categoriesModel.categoryMasterModel.creates(
    product_master_data.master_categories
  );

  await master_packingTypesModel.packingTypeModel.creates(
    product_master_data.master_packing_types
  );

  await master_certificateTypesModel.certificateTypeModel.creates(
    product_master_data.master_certificate_types
  );
};

/**
 * Insert defaults for all master data types
 */
export const insertAllDefaults = catchAsync(async (req, res, next) => {
  const results = {};

  await _insertAllDefaults();

  res.prints = {
    status: 'success',
    message: 'Default data insertion completed',
    results,
  };
  next();
});

const _clearProductMasterData = async () => {
  const results = {};

  try {
    results.categories =
      await master_categoriesModel.categoryMasterModel.truncateTable();
  } catch (error) {
    results.categories = { error: error.message };
  }

  try {
    results.productImageType =
      await master_productImagesModel.productImagesTypeModel.truncateTable();
  } catch (error) {
    results.productImageType = { error: error.message };
  }

  try {
    results.packingTypes =
      await master_packingTypesModel.packingTypeModel.truncateTable();
  } catch (error) {
    results.packingTypes = { error: error.message };
  }

  try {
    results.productNameTypes =
      await master_productNameTypesModel.productNameTypeModel.truncateTable();
  } catch (error) {
    results.productNameTypes = { error: error.message };
  }

  try {
    results.certificateTypes =
      await master_certificateTypesModel.certificateTypeModel.truncateTable();
  } catch (error) {
    results.certificateTypes = { error: error.message };
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
  await _insertAllDefaults();

  res.prints = {
    status: 'success',
    message: 'All master data has been reset successfully',
  };

  next();
});

/**
 * Get statistics for all master data types
 */
export const getMasterDataStatistics = catchAsync(async (req, res, next) => {
  const stats = {};

  try {
    // Get packing types count
    const packingTypesResult =
      await master_packingTypesModel.getAllPackingTypes({
        limit: 1,
      });
    stats.packingTypes = {
      total: packingTypesResult.pagination.total,
    };
  } catch (error) {
    stats.packingTypes = { error: error.message };
  }

  try {
    // Get product name types count
    const nameTypesResult =
      await master_productNameTypesModel.getAllProductNameTypes({
        limit: 1,
      });
    stats.productNameTypes = {
      total: nameTypesResult.pagination.total,
    };
  } catch (error) {
    stats.productNameTypes = { error: error.message };
  }

  try {
    // Get certificate types count
    const certTypesResult =
      await master_certificateTypesModel.getAllCertificateTypes({
        limit: 1,
      });
    stats.certificateTypes = {
      total: certTypesResult.pagination.total,
    };
  } catch (error) {
    stats.certificateTypes = { error: error.message };
  }

  try {
    // Get categories count
    const categoriesResult = await master_categoriesModel.getAllCategories({
      limit: 1,
    });
    stats.categories = {
      total: categoriesResult.pagination.total,
    };

    // Get additional category stats
    const rootCategories = await master_categoriesModel.getChildCategories(
      null
    );
    stats.categories.rootCount = rootCategories.length;
  } catch (error) {
    stats.categories = { error: error.message };
  }

  res.prints = {
    status: 'success',
    statistics: stats,
  };

  next();
});

/**
 * Check if a master data entity exists by name
 */
export const checkEntityExists = catchAsync(async (req, res, next) => {
  const { type, name } = req.query;

  if (!type || !name) {
    return next(new AppError('Entity type and name are required', 400));
  }

  let exists = false;
  let entity = null;

  try {
    const options = {
      search: name,
      limit: 1,
    };

    let result;

    switch (type) {
      case 'packingType':
        result = await master_packingTypesModel.getAllPackingTypes(options);
        if (result.packingTypes.length > 0) {
          exists =
            result.packingTypes[0].name.toLowerCase() === name.toLowerCase();
          entity = exists ? result.packingTypes[0] : null;
        }
        break;

      case 'productNameType':
        result = await master_productNameTypesModel.getAllProductNameTypes(
          options
        );
        if (result.productNameTypes.length > 0) {
          exists =
            result.productNameTypes[0].name.toLowerCase() ===
            name.toLowerCase();
          entity = exists ? result.productNameTypes[0] : null;
        }
        break;

      case 'certificateType':
        result = await master_certificateTypesModel.getAllCertificateTypes(
          options
        );
        if (result.certificateTypes.length > 0) {
          exists =
            result.certificateTypes[0].name.toLowerCase() ===
            name.toLowerCase();
          entity = exists ? result.certificateTypes[0] : null;
        }
        break;

      case 'category':
        result = await master_categoriesModel.getAllCategories(options);
        if (result.categories.length > 0) {
          exists =
            result.categories[0].name.toLowerCase() === name.toLowerCase();
          entity = exists ? result.categories[0] : null;
        }
        break;

      default:
        return next(new AppError(`Unknown entity type: ${type}`, 400));
    }

    res.prints = {
      status: 'success',
      exists,
      entity,
    };

    next();
  } catch (error) {
    next(
      new AppError(`Failed to check entity existence: ${error.message}`, 500)
    );
  }
});
