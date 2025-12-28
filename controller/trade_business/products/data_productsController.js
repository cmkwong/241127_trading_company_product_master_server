import * as Products from '../../../models/trade_business/products/data_products.js';
import catchAsync from '../../../utils/catchAsync.js';
import { defaultProducts } from '../../../datas/products.js';
import { productModel } from '../../../models/trade_business/products/data_products.js';

/**
 * Create a new product
 * @route POST /api/products
 */
export const createProduct = catchAsync(async (req, res, next) => {
  const refactoredData = await productModel.processStructureDataOperation(
    req.body.data,
    'create'
  );
  res.status(201).json({
    status: 'success',
  });
});

/**
 * Get a product by ID
 * @route GET /api/products/:id
 */
export const getProductById = catchAsync(async (req, res, next) => {
  const refactoredData = await productModel.processStructureDataOperation(
    req.body.data,
    'read',
    req.body.options
  );

  res.status(200).json({
    status: 'success',
    data: {
      refactoredData,
    },
  });
});

/**
 * Get all products with pagination and filtering
 * @route GET /api/products
 */
export const getProducts = catchAsync(async (req, res, next) => {
  // Parse query parameters
  const options = {
    page: req.query.page ? parseInt(req.query.page, 10) : 1,
    limit: req.query.limit ? parseInt(req.query.limit, 10) : 20,
    search: req.query.search || undefined,
    category_id: req.query.category_id || undefined,
    includeRelated: req.query.includeRelated === 'true',
    includePackings: req.query.includePackings === 'true',
    includeAlibabaIds: req.query.includeAlibabaIds === 'true',
  };

  const result = await Products.getProducts(options);

  res.status(200).json({
    status: 'success',
    data: {
      total: result.total,
      page: result.page,
      limit: result.limit,
      pages: result.pages,
      products: result.products,
    },
  });
});

/**
 * Update a product
 * @route PATCH /api/products/:id
 */
export const updateProduct = catchAsync(async (req, res, next) => {
  const refactoredData = await productModel.processStructureDataOperation(
    req.body.data,
    'update'
  );

  res.status(200).json({
    status: 'success',
    message: result.message,
    data: {
      product: result.product,
    },
  });
});

/**
 * Delete a product
 * @route DELETE /api/products/:id
 */
export const deleteProduct = catchAsync(async (req, res, next) => {
  const refactoredData = await productModel.processStructureDataOperation(
    req.body.data,
    'delete'
  );

  res.status(200).json({
    status: 'success',
    message: result.message,
    data: {
      productId: result.productId,
      productCode: result.productCode,
    },
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
    data: {
      exists,
    },
  });
});

/**
 * Import sample products data
 * @route POST /api/products/samples
 */
export const importDefaultProducts = catchAsync(async (req, res, next) => {
  const refactoredData = await productModel.processStructureDataOperation(
    defaultProducts,
    'create'
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
  productModel.processStructureDataOperation({ products: ids }, 'delete');

  // await productModel.truncateTable();

  // const result = await Products.truncateAllProductTables();

  res.status(200).json({
    status: 'success',
  });
});
