import * as Products from '../../../models/trade_business/products/data_products.js';
import catchAsync from '../../../utils/catchAsync.js';
import { toBool } from '../../../utils/booleanFn.js';
import { getProductsSeedData } from '../../../utils/productsSource.js';
import { productModel } from '../../../models/trade_business/products/data_products.js';

/**
 * Create a new product
 * @route POST /api/products
 */
export const createProduct = catchAsync(async (req, res, next) => {
  const structuredData = await productModel.processStructureDataOperation(
    req.body.data,
    'create',
  );
  res.status(201).json({
    status: 'success',
  });
});

export const getAllProducts = catchAsync(async (req, res, next) => {
  const source = {
    ...(req.query || {}),
    ...(req.body || {}),
  };

  const { includeBase64, iconOnly, compress, fields } = source;

  const productIds = await productModel.executeQuery(
    'SELECT id FROM products;',
  );

  const data = { products: productIds };
  const structuredData = await productModel.processStructureDataOperation(
    data,
    'read',
    {
      includeBase64: toBool(includeBase64),
      base64OnlyTable: toBool(iconOnly) ? ['products'] : null, // to control which tables should return only base64 data
      compress: toBool(compress),
      fields,
    },
  );
  res.status(200).json({
    status: 'success',
    structuredData,
  });
});

/**
 * Get first-level product comparison keys for front-end
 * @route GET /api/v1/trade_business/products/data/comparison-keys
 */
export const getProductComparisonKeys = catchAsync(async (req, res, next) => {
  const comparisonKeyData = productModel.getFirstLevelFieldNames();

  res.status(200).json({
    status: 'success',
    data: comparisonKeyData,
  });
});

/**
 * Get a product by ID
 * @route GET /api/products/:id
 */
export const getProductById = catchAsync(async (req, res, next) => {
  const source = req.body || {};

  const { includeBase64, iconOnly, compress, fields, data } = source;

  const structuredData = await productModel.processStructureDataOperation(
    data,
    'read',
    {
      includeBase64: toBool(includeBase64),
      base64OnlyTable: toBool(iconOnly) ? ['products'] : null, // to control which tables should return only base64 data
      compress: toBool(compress),
      fields,
    },
  );

  res.status(200).json({
    status: 'success',
    structuredData,
  });
});

/**
 * Update a product
 * @route PATCH /api/products/:id
 */
export const updateProduct = catchAsync(async (req, res, next) => {
  const structuredData = await productModel.processStructureDataOperation(
    req.body.data,
    'update',
  );

  res.status(200).json({
    status: 'success',
    structuredData,
  });
});

/**
 * Delete a product
 * @route DELETE /api/products/:id
 */
export const deleteProduct = catchAsync(async (req, res, next) => {
  const structuredData = await productModel.processStructureDataOperation(
    req.body.data,
    'delete',
  );

  res.status(200).json({
    status: 'success',
    structuredData,
  });
});

/**
 * Check if a product exists by ID
 * @route GET /api/products/exists/:id
 */
export const checkProductExists = catchAsync(async (req, res, next) => {
  const exists = await Products.productExists(req.params.id);

  res.status(200).json({
    status: 'success',
    exists,
  });
});

/**
 * Import sample products data
 * @route POST /api/products/samples
 */
export const importDefaultProducts = catchAsync(async (req, res, next) => {
  const structuredData = await productModel.processStructureDataOperation(
    getProductsSeedData(),
    'create',
  );

  res.status(200).json({
    status: 'success',
  });
});

/**
 * Truncate all product-related tables
 * @route POST /api/products/truncate
 */
export const truncateProductTables = catchAsync(async (req, res, next) => {
  // getting all of the product id
  const sql = `SELECT id FROM products;`;
  const ids = await productModel.dbc.executeQuery(sql);
  await productModel.processStructureDataOperation({ products: ids }, 'delete');

  // await productModel.truncateTable();

  // const result = await Products.truncateAllProductTables();

  res.status(200).json({
    status: 'success',
  });
});
