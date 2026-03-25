import * as Products from '../../../models/trade_business/products/data_products.js';
import AppError from '../../../utils/appError.js';
import catchAsync from '../../../utils/catchAsync.js';
import { toBool } from '../../../utils/booleanFn.js';
import { getSafeSelectedFieldsForTable } from '../../../utils/readFieldSelection.js';
import { getProductsSeedData } from '../../../utils/productsSource.js';
import { productModel } from '../../../models/trade_business/products/data_products.js';
import { productImagesModel } from '../../../models/trade_business/products/data_product_images.js';

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

  const selectedProductFields = getSafeSelectedFieldsForTable(
    fields,
    'products',
    {
      ensureField: 'id',
    },
  );

  const productRows =
    selectedProductFields && !toBool(includeBase64)
      ? await productModel.executeQuery(
          `SELECT ${selectedProductFields.join(', ')} FROM products;`,
        )
      : await productModel.executeQuery('SELECT id FROM products;');

  const data = { products: productRows };
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
 * Download product images by product_id and image_type_id
 * @route POST /api/products/data/images/download
 */
export const downloadProductImages = catchAsync(async (req, res, next) => {
  const source = {
    ...(req.query || {}),
    ...(req.body || {}),
  };

  const { product_id, image_type_id, id, compress } = source;

  if (!product_id || !image_type_id) {
    return next(new AppError('product_id and image_type_id are required', 400));
  }

  const imageRows = id
    ? await productModel.executeQuery(
        `SELECT id FROM ${productImagesModel.tableName} WHERE product_id = ? AND image_type_id = ? AND id = ? LIMIT 1`,
        [product_id, image_type_id, id],
      )
    : await productModel.executeQuery(
        `SELECT id FROM ${productImagesModel.tableName} WHERE product_id = ? AND image_type_id = ? ORDER BY created_at DESC`,
        [product_id, image_type_id],
      );

  const structuredData = await productImagesModel.processStructureDataOperation(
    { [productImagesModel.tableName]: imageRows },
    'read',
    {
      includeBase64: true,
      base64OnlyTable: [productImagesModel.tableName],
      compress: toBool(compress),
    },
  );

  res.status(200).json({
    status: 'success',
    count: imageRows.length,
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
