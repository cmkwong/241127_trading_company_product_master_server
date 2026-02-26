import * as TableModel from '../../../models/trade_business/products/tableModel.js';
import catchAsync from '../../../utils/catchAsync.js';
import AppError from '../../../utils/appError.js';

/**
 * Create all product tables
 * @route POST /api/products/table/create-all
 */
export const createAllTables = catchAsync(async (req, res, next) => {
  const { tableType } = req.query;
  const result = await TableModel.createAllProductTables(tableType);

  res.status(201).json({
    status: 'success',
    message: result.message,
  });
});

/**
 * Create products table
 * @route POST /api/products/table/create/products
 */
export const createProductsTable = catchAsync(async (req, res, next) => {
  const result = await TableModel.createProductsTable();

  res.status(201).json({
    status: 'success',
    message: result.message,
  });
});

/**
 * Create product name types table
 * @route POST /api/products/table/create/name-types
 */
export const createProductNameTypesTable = catchAsync(
  async (req, res, next) => {
    const result = await TableModel.createProductNameTypesTable();

    res.status(201).json({
      status: 'success',
      message: result.message,
    });
  },
);

/**
 * Create product names table
 * @route POST /api/products/table/create/names
 */
export const createProductNamesTable = catchAsync(async (req, res, next) => {
  const result = await TableModel.createProductNamesTable();

  res.status(201).json({
    status: 'success',
    message: result.message,
  });
});

/**
 * Create categories table
 * @route POST /api/products/table/create/categories
 */
export const createCategoriesTable = catchAsync(async (req, res, next) => {
  const result = await TableModel.createCategoriesTable();

  res.status(201).json({
    status: 'success',
    message: result.message,
  });
});

/**
 * Create product categories table
 * @route POST /api/products/table/create/product-categories
 */
export const createProductCategoriesTable = catchAsync(
  async (req, res, next) => {
    const result = await TableModel.createProductCategoriesTable();

    res.status(201).json({
      status: 'success',
      message: result.message,
    });
  },
);

/**
 * Create customizations table
 * @route POST /api/products/table/create/customizations
 */
export const createCustomizationsTable = catchAsync(async (req, res, next) => {
  const result = await TableModel.createCustomizationsTable();

  res.status(201).json({
    status: 'success',
    message: result.message,
  });
});

/**
 * Create customization images table
 * @route POST /api/products/table/create/customization-images
 */
export const createCustomizationImagesTable = catchAsync(
  async (req, res, next) => {
    const result = await TableModel.createCustomizationImagesTable();

    res.status(201).json({
      status: 'success',
      message: result.message,
    });
  },
);

/**
 * Create product links table
 * @route POST /api/products/table/create/links
 */
export const createProductLinksTable = catchAsync(async (req, res, next) => {
  const result = await TableModel.createProductLinksTable();

  res.status(201).json({
    status: 'success',
    message: result.message,
  });
});

/**
 * Create product link images table
 * @route POST /api/products/table/create/link-images
 */
export const createProductLinkImagesTable = catchAsync(
  async (req, res, next) => {
    const result = await TableModel.createProductLinkImagesTable();

    res.status(201).json({
      status: 'success',
      message: result.message,
    });
  },
);

/**
 * Create Alibaba IDs table
 * @route POST /api/products/table/create/alibaba-ids
 */
export const createAlibabaIdsTable = catchAsync(async (req, res, next) => {
  const result = await TableModel.createAlibabaIdsTable();

  res.status(201).json({
    status: 'success',
    message: result.message,
  });
});

/**
 * Create packing types table
 * @route POST /api/products/table/create/packing-types
 */
export const createPackingTypesTable = catchAsync(async (req, res, next) => {
  const result = await TableModel.createPackingTypesTable();

  res.status(201).json({
    status: 'success',
    message: result.message,
  });
});

/**
 * Create packing reliability types table
 * @route POST /api/products/table/create/packing-reliability-types
 */
export const createPackingReliabilityTypesTable = catchAsync(
  async (req, res, next) => {
    const result = await TableModel.createPackingReliabilityTypesTable();

    res.status(201).json({
      status: 'success',
      message: result.message,
    });
  },
);

/**
 * Create product packings table
 * @route POST /api/products/table/create/packings
 */
export const createProductPackingsTable = catchAsync(async (req, res, next) => {
  const result = await TableModel.createProductPackingsTable();

  res.status(201).json({
    status: 'success',
    message: result.message,
  });
});

/**
 * Create certificate types table
 * @route POST /api/products/table/create/certificate-types
 */
export const createCertificateTypesTable = catchAsync(
  async (req, res, next) => {
    const result = await TableModel.createCertificateTypesTable();

    res.status(201).json({
      status: 'success',
      message: result.message,
    });
  },
);

/**
 * Create product certificates table
 * @route POST /api/products/table/create/certificates
 */
export const createProductCertificatesTable = catchAsync(
  async (req, res, next) => {
    const result = await TableModel.createProductCertificatesTable();

    res.status(201).json({
      status: 'success',
      message: result.message,
    });
  },
);

/**
 * Create product certificate files table
 * @route POST /api/products/table/create/certificate-files
 */
export const createProductCertificateFilesTable = catchAsync(
  async (req, res, next) => {
    const result = await TableModel.createProductCertificateFilesTable();

    res.status(201).json({
      status: 'success',
      message: result.message,
    });
  },
);

/**
 * Drop all product tables
 * @route DELETE /api/products/table/drop-all
 */
export const dropAllTables = catchAsync(async (req, res, next) => {
  // Add confirmation check to prevent accidental deletion
  const { confirm } = req.body;
  const { tableType } = req.query;

  if (!confirm || confirm !== 'DROP_ALL_PRODUCT_TABLES') {
    return next(
      new AppError(
        'Confirmation string required to drop all tables. Please provide { "confirm": "DROP_ALL_PRODUCT_TABLES" } in the request body.',
        400,
      ),
    );
  }

  const result = await TableModel.dropAllProductTables(tableType);

  res.status(200).json({
    status: 'success',
    message: result.message,
  });
});

/**
 * Check if all product tables exist
 * @route GET /api/products/table/check-exists
 */
export const checkTablesExist = catchAsync(async (req, res, next) => {
  const allTablesExist = await TableModel.checkProductTablesExist();

  res.status(200).json({
    status: 'success',
    data: {
      allTablesExist,
    },
  });
});

/**
 * Get schema information for all product tables
 * @route GET /api/products/table/schema
 */
export const getTablesSchema = catchAsync(async (req, res, next) => {
  const schema = await TableModel.getProductTablesSchema();

  res.status(200).json({
    status: 'success',
    data: {
      schema,
    },
  });
});
