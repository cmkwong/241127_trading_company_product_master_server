import * as packingTypesModel from '../../../models/trade_business/products/master_packingTypesModel.js';
import catchAsync from '../../../utils/catchAsync.js';
import AppError from '../../../utils/appError.js';

/**
 * Create one or multiple packing types
 * Handles both single object and array of objects
 */
export const createPackingType = catchAsync(async (req, res, next) => {
  // Check if the request body is an array for batch creation
  if (Array.isArray(req.body)) {
    // Batch creation
    const result = await packingTypesModel.batchCreatePackingTypes(req.body);

    res.prints = {
      status: 'success',
      message: 'Batch packing types creation processed',
      total: result.total,
      successful: result.successful,
      failed: result.failed,
      details: result.details,
    };
  } else {
    // Single packing type creation
    const result = await packingTypesModel.createPackingType(req.body);

    res.prints = {
      status: 'success',
      message: result.message,
      packingType: result.packingType,
    };
  }

  next();
});

/**
 * Get packing types - either a specific one by ID or all with filtering
 */
export const getPackingTypes = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  // If ID is provided in the URL params, get a specific packing type
  if (id) {
    const packingType = await packingTypesModel.getPackingTypeById(id);

    res.prints = {
      status: 'success',
      packingType,
    };
  }
  // Otherwise, get all packing types with optional filtering
  else {
    const options = {
      search: req.query.search,
      page: req.query.page ? parseInt(req.query.page) : 1,
      limit: req.query.limit ? parseInt(req.query.limit) : 100,
    };

    const result = await packingTypesModel.getAllPackingTypes(options);

    res.prints = {
      status: 'success',
      packingTypes: result.packingTypes,
      pagination: result.pagination,
    };
  }

  next();
});

/**
 * Update a packing type
 */
export const updatePackingType = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  if (!id) {
    return next(new AppError('Packing type ID is required', 400));
  }

  const result = await packingTypesModel.updatePackingType(id, req.body);

  res.prints = {
    status: 'success',
    message: result.message,
    packingType: result.packingType,
  };

  next();
});

/**
 * Delete a packing type
 */
export const deletePackingType = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { force } = req.query;

  if (!id) {
    return next(new AppError('Packing type ID is required', 400));
  }

  const result = await packingTypesModel.deletePackingType(
    id,
    force === 'true'
  );

  res.prints = {
    status: 'success',
    message: result.message,
    deletedAssociations: result.deletedAssociations,
  };

  next();
});

/**
 * Get products using a specific packing type
 */
export const getProductsByPackingType = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  if (!id) {
    return next(new AppError('Packing type ID is required', 400));
  }

  const options = {
    page: req.query.page ? parseInt(req.query.page) : 1,
    limit: req.query.limit ? parseInt(req.query.limit) : 20,
  };

  const result = await packingTypesModel.getProductsByPackingType(id, options);

  res.prints = {
    status: 'success',
    products: result.products,
    pagination: result.pagination,
  };

  next();
});

/**
 * Get packing statistics by packing type
 */
export const getPackingStatistics = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  if (!id) {
    return next(new AppError('Packing type ID is required', 400));
  }

  const result = await packingTypesModel.getPackingStatistics(id);

  res.prints = {
    status: 'success',
    packingType: result.packingType,
    statistics: result.statistics,
  };

  next();
});

/**
 * Insert default packing types
 */
export const insertDefaultPackingTypes = catchAsync(async (req, res, next) => {
  const result = await packingTypesModel.insertDefaultPackingTypes();

  res.prints = {
    status: 'success',
    message: result.message,
    results: {
      total: result.results.total,
      successful: result.results.successful,
      failed: result.results.failed,
    },
  };

  next();
});

/**
 * Check if a packing type exists by name
 */
export const checkPackingTypeExists = catchAsync(async (req, res, next) => {
  const { name } = req.query;

  if (!name) {
    return next(new AppError('Packing type name is required', 400));
  }

  try {
    const options = {
      search: name,
      limit: 1,
    };

    const result = await packingTypesModel.getAllPackingTypes(options);
    const exists =
      result.packingTypes.length > 0 &&
      result.packingTypes[0].name.toLowerCase() === name.toLowerCase();

    res.prints = {
      status: 'success',
      exists,
      packingType: exists ? result.packingTypes[0] : null,
    };

    next();
  } catch (error) {
    next(
      new AppError(
        `Failed to check packing type existence: ${error.message}`,
        500
      )
    );
  }
});
