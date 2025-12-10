import * as master_packingTypesModel from '../../../models/trade_business/products/master_packingTypesModel.js';
import * as master_productNameTypesModel from '../../../models/trade_business/products/master_productNameTypesModel.js';
import * as master_certificateTypesModel from '../../../models/trade_business/products/master_certificateTypesModel.js';
import * as master_categoriesModel from '../../../models/trade_business/products/master_categoriesModel.js';
import catchAsync from '../../../utils/catchAsync.js';
import AppError from '../../../utils/appError.js';

/**
 * Generic controller to handle master data operations
 * @param {Object} modelMap - Map of model functions for each master data type
 * @param {string} entityType - Type of master data entity
 * @returns {Object} Controller functions for the entity type
 */
const createMasterDataController = (modelMap, entityType) => {
  return {
    create: catchAsync(async (req, res, next) => {
      const result = await modelMap.create(req.body);

      res.prints = {
        status: 'success',
        message: result.message,
        [entityType]: result[entityType],
      };

      next();
    }),

    getById: catchAsync(async (req, res, next) => {
      const { id } = req.params;

      if (!id) {
        return next(new AppError(`${entityType} ID is required`, 400));
      }

      const entity = await modelMap.getById(id);

      res.prints = {
        status: 'success',
        [entityType]: entity,
      };

      next();
    }),

    getAll: catchAsync(async (req, res, next) => {
      const options = {
        search: req.query.search,
        page: req.query.page ? parseInt(req.query.page) : 1,
        limit: req.query.limit ? parseInt(req.query.limit) : 100,
      };

      // Add parent_id filter for categories if available
      if (entityType === 'category' && req.query.parent_id !== undefined) {
        options.parent_id =
          req.query.parent_id === 'null' ? null : req.query.parent_id;
      }

      const result = await modelMap.getAll(options);

      res.prints = {
        status: 'success',
        [`${entityType}s`]: result[`${entityType}s`],
        pagination: result.pagination,
      };

      next();
    }),

    update: catchAsync(async (req, res, next) => {
      const { id } = req.params;

      if (!id) {
        return next(new AppError(`${entityType} ID is required`, 400));
      }

      const result = await modelMap.update(id, req.body);

      res.prints = {
        status: 'success',
        message: result.message,
        [entityType]: result[entityType],
      };

      next();
    }),

    delete: catchAsync(async (req, res, next) => {
      const { id } = req.params;
      const force = req.query.force === 'true';

      if (!id) {
        return next(new AppError(`${entityType} ID is required`, 400));
      }

      // Special handling for categories with reassignChildren option
      if (entityType === 'category') {
        const reassignChildren = req.query.reassignChildren === 'true';
        const result = await modelMap.delete(id, reassignChildren);

        res.prints = {
          status: 'success',
          message: result.message,
          reassignedChildren: result.reassignedChildren,
        };
      } else {
        // Standard handling for other entity types
        const result = await modelMap.delete(id, force);

        res.prints = {
          status: 'success',
          message: result.message,
          deletedAssociations: result.deletedAssociations || 0,
        };
      }

      next();
    }),

    getRelatedProducts: catchAsync(async (req, res, next) => {
      const { id } = req.params;

      if (!id) {
        return next(new AppError(`${entityType} ID is required`, 400));
      }

      const options = {
        page: req.query.page ? parseInt(req.query.page) : 1,
        limit: req.query.limit ? parseInt(req.query.limit) : 20,
      };

      const result = await modelMap.getRelatedProducts(id, options);

      res.prints = {
        status: 'success',
        products: result.products,
        pagination: result.pagination,
      };

      next();
    }),

    batchCreate: catchAsync(async (req, res, next) => {
      if (!Array.isArray(req.body)) {
        return next(
          new AppError(`Request body must be an array of ${entityType}s`, 400)
        );
      }

      const result = await modelMap.batchCreate(req.body);

      res.prints = {
        status: 'success',
        total: result.total,
        successful: result.successful,
        failed: result.failed,
        details: result.details,
      };

      next();
    }),

    insertDefaults: catchAsync(async (req, res, next) => {
      const result = await modelMap.insertDefaults();

      res.prints = {
        status: 'success',
        message: result.message,
        results: result.results,
      };

      next();
    }),

    // Add truncate functionality
    truncate: catchAsync(async (req, res, next) => {
      if (!modelMap.truncate) {
        return next(
          new AppError(`Truncate not supported for ${entityType}`, 400)
        );
      }

      const result = await modelMap.truncate();

      res.prints = {
        status: 'success',
        message: result.message,
      };

      next();
    }),

    // Reset functionality - truncate and then insert defaults
    reset: catchAsync(async (req, res, next) => {
      if (!modelMap.truncate) {
        return next(new AppError(`Reset not supported for ${entityType}`, 400));
      }

      // First truncate the table
      const truncateResult = await modelMap.truncate();

      // Then insert default data
      const insertResult = await modelMap.insertDefaults();

      res.prints = {
        status: 'success',
        message: `${entityType} data has been reset successfully`,
        truncate: truncateResult,
        defaults: insertResult,
      };

      next();
    }),
  };
};

// Model function maps for each master data type
const packingTypesModelMap = {
  create: master_packingTypesModel.createPackingType,
  getById: master_packingTypesModel.getPackingTypeById,
  getAll: master_packingTypesModel.getAllPackingTypes,
  update: master_packingTypesModel.updatePackingType,
  delete: master_packingTypesModel.deletePackingType,
  getRelatedProducts: master_packingTypesModel.getProductsByPackingType,
  batchCreate: master_packingTypesModel.batchCreatePackingTypes,
  insertDefaults: master_packingTypesModel.insertDefaultPackingTypes,
  truncate: master_packingTypesModel.truncatePackingTypes, // Add truncate function reference
};

const productNameTypesModelMap = {
  create: master_productNameTypesModel.createProductNameType,
  getById: master_productNameTypesModel.getProductNameTypeById,
  getAll: master_productNameTypesModel.getAllProductNameTypes,
  update: master_productNameTypesModel.updateProductNameType,
  delete: master_productNameTypesModel.deleteProductNameType,
  getRelatedProducts: master_productNameTypesModel.getProductsByNameType,
  batchCreate: master_productNameTypesModel.batchCreateProductNameTypes,
  insertDefaults: master_productNameTypesModel.insertDefaultProductNameTypes,
  truncate: master_productNameTypesModel.truncateProductNameTypes, // Add truncate function reference
};

const certificateTypesModelMap = {
  create: master_certificateTypesModel.createCertificateType,
  getById: master_certificateTypesModel.getCertificateTypeById,
  getAll: master_certificateTypesModel.getAllCertificateTypes,
  update: master_certificateTypesModel.updateCertificateType,
  delete: master_certificateTypesModel.deleteCertificateType,
  getRelatedProducts: master_certificateTypesModel.getProductsByCertificateType,
  batchCreate: master_certificateTypesModel.batchCreateCertificateTypes,
  insertDefaults: master_certificateTypesModel.insertDefaultCertificateTypes,
  truncate: master_certificateTypesModel.truncateCertificateTypes, // Add truncate function reference
};

// Add categories model map
const categoriesModelMap = {
  create: master_categoriesModel.createCategory,
  getById: master_categoriesModel.getCategoryById,
  getAll: master_categoriesModel.getAllCategories,
  update: master_categoriesModel.updateCategory,
  delete: master_categoriesModel.deleteCategory,
  getRelatedProducts: master_categoriesModel.getProductsByCategory,
  batchCreate: master_categoriesModel.batchCreateCategories,
  insertDefaults: master_categoriesModel.insertDefaultCategories,
  truncate: master_categoriesModel.truncateCategories, // Add truncate function reference
};

// Create controllers for each master data type
export const packingTypes = createMasterDataController(
  packingTypesModelMap,
  'packingType'
);
export const productNameTypes = createMasterDataController(
  productNameTypesModelMap,
  'productNameType'
);
export const certificateTypes = createMasterDataController(
  certificateTypesModelMap,
  'certificateType'
);
export const categories = createMasterDataController(
  categoriesModelMap,
  'category'
);

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

// Merge category-specific functions into the categories controller
Object.assign(categories, categoryExtensions);

/**
 * Insert defaults for all master data types
 */
export const insertAllDefaults = catchAsync(async (req, res, next) => {
  const results = {
    categories: null,
    packingTypes: null,
    productNameTypes: null,
    certificateTypes: null,
  };

  try {
    results.categories = await master_categoriesModel.insertDefaultCategories();
  } catch (error) {
    results.categories = { error: error.message };
  }

  try {
    results.packingTypes =
      await master_packingTypesModel.insertDefaultPackingTypes();
  } catch (error) {
    results.packingTypes = { error: error.message };
  }

  try {
    results.productNameTypes =
      await master_productNameTypesModel.insertDefaultProductNameTypes();
  } catch (error) {
    results.productNameTypes = { error: error.message };
  }

  try {
    results.certificateTypes =
      await master_certificateTypesModel.insertDefaultCertificateTypes();
  } catch (error) {
    results.certificateTypes = { error: error.message };
  }

  res.prints = {
    status: 'success',
    message: 'Default data insertion completed',
    results,
  };

  next();
});

/**
 * Truncate all master data tables
 */
export const truncateAllTables = catchAsync(async (req, res, next) => {
  const results = {
    categories: null,
    packingTypes: null,
    productNameTypes: null,
    certificateTypes: null,
  };

  try {
    results.categories = await master_categoriesModel.truncateCategories();
  } catch (error) {
    results.categories = { error: error.message };
  }

  try {
    results.packingTypes =
      await master_packingTypesModel.truncatePackingTypes();
  } catch (error) {
    results.packingTypes = { error: error.message };
  }

  try {
    results.productNameTypes =
      await master_productNameTypesModel.truncateProductNameTypes();
  } catch (error) {
    results.productNameTypes = { error: error.message };
  }

  try {
    results.certificateTypes =
      await master_certificateTypesModel.truncateCertificateTypes();
  } catch (error) {
    results.certificateTypes = { error: error.message };
  }

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
  const results = {
    truncate: {
      categories: null,
      packingTypes: null,
      productNameTypes: null,
      certificateTypes: null,
    },
    defaults: {
      categories: null,
      packingTypes: null,
      productNameTypes: null,
      certificateTypes: null,
    },
  };

  // First truncate all tables
  try {
    results.truncate.categories =
      await master_categoriesModel.truncateCategories();
  } catch (error) {
    results.truncate.categories = { error: error.message };
  }

  try {
    results.truncate.packingTypes =
      await master_packingTypesModel.truncatePackingTypes();
  } catch (error) {
    results.truncate.packingTypes = { error: error.message };
  }

  try {
    results.truncate.productNameTypes =
      await master_productNameTypesModel.truncateProductNameTypes();
  } catch (error) {
    results.truncate.productNameTypes = { error: error.message };
  }

  try {
    results.truncate.certificateTypes =
      await master_certificateTypesModel.truncateCertificateTypes();
  } catch (error) {
    results.truncate.certificateTypes = { error: error.message };
  }

  // Then insert default data
  try {
    results.defaults.categories =
      await master_categoriesModel.insertDefaultCategories();
  } catch (error) {
    results.defaults.categories = { error: error.message };
  }

  try {
    results.defaults.packingTypes =
      await master_packingTypesModel.insertDefaultPackingTypes();
  } catch (error) {
    results.defaults.packingTypes = { error: error.message };
  }

  try {
    results.defaults.productNameTypes =
      await master_productNameTypesModel.insertDefaultProductNameTypes();
  } catch (error) {
    results.defaults.productNameTypes = { error: error.message };
  }

  try {
    results.defaults.certificateTypes =
      await master_certificateTypesModel.insertDefaultCertificateTypes();
  } catch (error) {
    results.defaults.certificateTypes = { error: error.message };
  }

  res.prints = {
    status: 'success',
    message: 'All master data has been reset successfully',
    results,
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
