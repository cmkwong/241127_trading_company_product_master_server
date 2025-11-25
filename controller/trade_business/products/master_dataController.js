import * as packingTypesModel from '../../../models/trade_business/products/master_packingTypesModel.js';
import * as productNameTypesModel from '../../../models/trade_business/products/master_productNameTypesModel.js';
import * as certificateTypesModel from '../../../models/trade_business/products/master_certificateTypesModel.js';
import * as categoriesModel from '../../../models/trade_business/products/master_categoriesModel.js';
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
        [entityType]: result[entityType]
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
        [entityType]: entity
      };
      
      next();
    }),

    getAll: catchAsync(async (req, res, next) => {
      const options = {
        search: req.query.search,
        page: req.query.page ? parseInt(req.query.page) : 1,
        limit: req.query.limit ? parseInt(req.query.limit) : 100
      };
      
      const result = await modelMap.getAll(options);
      
      res.prints = {
        status: 'success',
        [`${entityType}s`]: result[`${entityType}s`],
        pagination: result.pagination
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
        [entityType]: result[entityType]
      };
      
      next();
    }),

    delete: catchAsync(async (req, res, next) => {
      const { id } = req.params;
      const force = req.query.force === 'true';
      
      if (!id) {
        return next(new AppError(`${entityType} ID is required`, 400));
      }
      
      const result = await modelMap.delete(id, force);
      
      res.prints = {
        status: 'success',
        message: result.message,
        deletedAssociations: result.deletedAssociations || 0
      };
      
      next();
    }),

    getRelatedProducts: catchAsync(async (req, res, next) => {
      const { id } = req.params;
      
      if (!id) {
        return next(new AppError(`${entityType} ID is required`, 400));
      }
      
      const options = {
        page: req.query.page ? parseInt(req.query.page) : 1,
        limit: req.query.limit ? parseInt(req.query.limit) : 20
      };
      
      const result = await modelMap.getRelatedProducts(id, options);
      
      res.prints = {
        status: 'success',
        products: result.products,
        pagination: result.pagination
      };
      
      next();
    }),

    batchCreate: catchAsync(async (req, res, next) => {
      if (!Array.isArray(req.body)) {
        return next(new AppError(`Request body must be an array of ${entityType}s`, 400));
      }
      
      const result = await modelMap.batchCreate(req.body);
      
      res.prints = {
        status: 'success',
        total: result.total,
        successful: result.successful,
        failed: result.failed,
        details: result.details
      };
      
      next();
    }),

    insertDefaults: catchAsync(async (req, res, next) => {
      const result = await modelMap.insertDefaults();
      
      res.prints = {
        status: 'success',
        message: result.message,
        results: result.results
      };
      
      next();
    })
  };
};

// Model function maps for each master data type
const packingTypesModelMap = {
  create: packingTypesModel.createPackingType,
  getById: packingTypesModel.getPackingTypeById,
  getAll: packingTypesModel.getAllPackingTypes,
  update: packingTypesModel.updatePackingType,
  delete: packingTypesModel.deletePackingType,
  getRelatedProducts: packingTypesModel.getProductsByPackingType,
  batchCreate: packingTypesModel.batchCreatePackingTypes,
  insertDefaults: packingTypesModel.insertDefaultPackingTypes
};

const productNameTypesModelMap = {
  create: productNameTypesModel.createProductNameType,
  getById: productNameTypesModel.getProductNameTypeById,
  getAll: productNameTypesModel.getAllProductNameTypes,
  update: productNameTypesModel.updateProductNameType,
  delete: productNameTypesModel.deleteProductNameType,
  getRelatedProducts: productNameTypesModel.getProductsByNameType,
  batchCreate: productNameTypesModel.batchCreateProductNameTypes,
  insertDefaults: productNameTypesModel.insertDefaultProductNameTypes
};

// Assuming certificateTypesModel has similar function structure
const certificateTypesModelMap = {
  create: certificateTypesModel.createCertificateType,
  getById: certificateTypesModel.getCertificateTypeById,
  getAll: certificateTypesModel.getAllCertificateTypes,
  update: certificateTypesModel.updateCertificateType,
  delete: certificateTypesModel.deleteCertificateType,
  getRelatedProducts: certificateTypesModel.getProductsByCertificateType,
  batchCreate: certificateTypesModel.batchCreateCertificateTypes,
  insertDefaults: certificateTypesModel.insertDefaultCertificateTypes
};

// Create controllers for each master data type
export const packingTypes = createMasterDataController(packingTypesModelMap, 'packingType');
export const productNameTypes = createMasterDataController(productNameTypesModelMap, 'productNameType');
export const certificateTypes = createMasterDataController(certificateTypesModelMap, 'certificateType');

/**
 * Insert defaults for all master data types
 */
export const insertAllDefaults = catchAsync(async (req, res, next) => {
  const results = {
    categories: null,
    packingTypes: null,
    productNameTypes: null,
    certificateTypes: null
  };
  
  try {
    results.categories = await categoriesModel.insertDefaultCategories();
  } catch (error) {
    results.categories = { error: error.message };
  }
  
  try {
    results.packingTypes = await packingTypesModel.insertDefaultPackingTypes();
  } catch (error) {
    results.packingTypes = { error: error.message };
  }
  
  try {
    results.productNameTypes = await productNameTypesModel.insertDefaultProductNameTypes();
  } catch (error) {
    results.productNameTypes = { error: error.message };
  }
  
  try {
    results.certificateTypes = await certificateTypesModel.insertDefaultCertificateTypes();
  } catch (error) {
    results.certificateTypes = { error: error.message };
  }
  
  res.prints = {
    status: 'success',
    message: 'Default data insertion completed',
    results
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
    const packingTypesResult = await packingTypesModel.getAllPackingTypes({ limit: 1 });
    stats.packingTypes = {
      total: packingTypesResult.pagination.total
    };
  } catch (error) {
    stats.packingTypes = { error: error.message };
  }
  
  try {
    // Get product name types count
    const nameTypesResult = await productNameTypesModel.getAllProductNameTypes({ limit: 1 });
    stats.productNameTypes = {
      total: nameTypesResult.pagination.total
    };
  } catch (error) {
    stats.productNameTypes = { error: error.message };
  }
  
  try {
    // Get certificate types count
    const certTypesResult = await certificateTypesModel.getAllCertificateTypes({ limit: 1 });
    stats.certificateTypes = {
      total: certTypesResult.pagination.total
    };
  } catch (error) {
    stats.certificateTypes = { error: error.message };
  }
  
  try {
    // Get categories count
    const categoriesResult = await categoriesModel.getAllCategories({ limit: 1 });
    stats.categories = {
      total: categoriesResult.pagination.total
    };
    
    // Get additional category stats
    const rootCategories = await categoriesModel.getChildCategories(null);
    stats.categories.rootCount = rootCategories.length;
  } catch (error) {
    stats.categories = { error: error.message };
  }
  
  res.prints = {
    status: 'success',
    statistics: stats
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
      limit: 1
    };
    
    let result;
    
    switch (type) {
      case 'packingType':
        result = await packingTypesModel.getAllPackingTypes(options);
        if (result.packingTypes.length > 0) {
          exists = result.packingTypes[0].name.toLowerCase() === name.toLowerCase();
          entity = exists ? result.packingTypes[0] : null;
        }
        break;
        
      case 'productNameType':
        result = await productNameTypesModel.getAllProductNameTypes(options);
        if (result.productNameTypes.length > 0) {
          exists = result.productNameTypes[0].name.toLowerCase() === name.toLowerCase();
          entity = exists ? result.productNameTypes[0] : null;
        }
        break;
        
      case 'certificateType':
        result = await certificateTypesModel.getAllCertificateTypes(options);
        if (result.certificateTypes.length > 0) {
          exists = result.certificateTypes[0].name.toLowerCase() === name.toLowerCase();
          entity = exists ? result.certificateTypes[0] : null;
        }
        break;
        
      case 'category':
        result = await categoriesModel.getAllCategories(options);
        if (result.categories.length > 0) {
          exists = result.categories[0].name.toLowerCase() === name.toLowerCase();
          entity = exists ? result.categories[0] : null;
        }
        break;
        
      default:
        return next(new AppError(`Unknown entity type: ${type}`, 400));
    }
    
    res.prints = {
      status: 'success',
      exists,
      entity
    };
    
    next();
  } catch (error) {
    next(new AppError(`Failed to check entity existence: ${error.message}`, 500));
  }
});