import * as certificateTypesModel from '../../../models/trade_business/products/master_certificateTypesModel.js';
import catchAsync from '../../../utils/catchAsync.js';
import AppError from '../../../utils/appError.js';

/**
 * Create one or multiple certificate types
 * Handles both single object and array of objects
 */
export const createCertificateType = catchAsync(async (req, res, next) => {
  // Check if the request body is an array for batch creation
  if (Array.isArray(req.body)) {
    // Batch creation
    const result = await certificateTypesModel.batchCreateCertificateTypes(
      req.body
    );

    res.prints = {
      status: 'success',
      message: 'Batch certificate types creation processed',
      total: result.total,
      successful: result.successful,
      failed: result.failed,
      details: result.details,
    };
  } else {
    // Single certificate type creation
    const result = await certificateTypesModel.createCertificateType(req.body);

    res.prints = {
      status: 'success',
      message: result.message,
      certificateType: result.certificateType,
    };
  }

  next();
});

/**
 * Get certificate types - either a specific one by ID or all with filtering
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 */
export const getCertificateTypes = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  // If ID is provided in the URL params, get a specific certificate type
  if (id) {
    const certificateType = await certificateTypesModel.getCertificateTypeById(
      id
    );

    res.prints = {
      status: 'success',
      certificateType,
    };
  }
  // Otherwise, get all certificate types with optional filtering
  else {
    const options = {
      search: req.query.search,
      page: req.query.page ? parseInt(req.query.page) : 1,
      limit: req.query.limit ? parseInt(req.query.limit) : 100,
    };

    const result = await certificateTypesModel.getAllCertificateTypes(options);

    res.prints = {
      status: 'success',
      certificateTypes: result.certificateTypes,
      pagination: result.pagination,
    };
  }

  next();
});

/**
 * Get products using a specific certificate type
 */
export const getProductsByCertificateType = catchAsync(
  async (req, res, next) => {
    const { id } = req.params;

    if (!id) {
      return next(new AppError('Certificate type ID is required', 400));
    }

    const options = {
      page: req.query.page ? parseInt(req.query.page) : 1,
      limit: req.query.limit ? parseInt(req.query.limit) : 20,
    };

    const result = await certificateTypesModel.getProductsByCertificateType(
      id,
      options
    );

    res.prints = {
      status: 'success',
      products: result.products,
      pagination: result.pagination,
    };

    next();
  }
);

/**
 * Update a certificate type
 */
export const updateCertificateType = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  if (!id) {
    return next(new AppError('Certificate type ID is required', 400));
  }

  const result = await certificateTypesModel.updateCertificateType(
    id,
    req.body
  );

  res.prints = {
    status: 'success',
    message: result.message,
    certificateType: result.certificateType,
  };

  next();
});

/**
 * Delete a certificate type
 */
export const deleteCertificateType = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { force } = req.query;

  if (!id) {
    return next(new AppError('Certificate type ID is required', 400));
  }

  const result = await certificateTypesModel.deleteCertificateType(
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
 * Insert default certificate types
 */
export const insertDefaultCertificateTypes = catchAsync(
  async (req, res, next) => {
    const result = await certificateTypesModel.insertDefaultCertificateTypes();

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
  }
);

/**
 * Check if a certificate type exists by name
 */
export const checkCertificateTypeExists = catchAsync(async (req, res, next) => {
  const { name } = req.query;

  if (!name) {
    return next(new AppError('Certificate type name is required', 400));
  }

  try {
    const options = {
      search: name,
      limit: 1,
    };

    const result = await certificateTypesModel.getAllCertificateTypes(options);
    const exists =
      result.certificateTypes.length > 0 &&
      result.certificateTypes[0].name.toLowerCase() === name.toLowerCase();

    res.prints = {
      status: 'success',
      exists,
      certificateType: exists ? result.certificateTypes[0] : null,
    };

    next();
  } catch (error) {
    next(
      new AppError(
        `Failed to check certificate type existence: ${error.message}`,
        500
      )
    );
  }
});
