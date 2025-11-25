import * as Products from '../../../models/trade_business/products/data_products.js';
import AppError from '../../../utils/appError.js';
import catchAsync from '../../../utils/catchAsync.js';
import sampleProducts from '../../../samples/products.js';
import { tb_pool } from '../../../utils/dbConn.js'; // Add this import

/**
 * Create a new product
 * @route POST /api/products
 */
export const createProduct = catchAsync(async (req, res, next) => {
  const result = await Products.createProduct(req.body);

  res.status(201).json({
    status: 'success',
    message: result.message,
    data: {
      product: result.product,
    },
  });
});

/**
 * Get a product by ID
 * @route GET /api/products/:id
 */
export const getProductById = catchAsync(async (req, res, next) => {
  const includeRelated = req.query.includeRelated === 'true';
  const product = await Products.getProductById(req.params.id, includeRelated);

  res.status(200).json({
    status: 'success',
    data: {
      product,
    },
  });
});

/**
 * Get a product by product code
 * @route GET /api/products/code/:code
 */
export const getProductByCode = catchAsync(async (req, res, next) => {
  const includeRelated = req.query.includeRelated === 'true';
  const product = await Products.getProductByCode(
    req.params.code,
    includeRelated
  );

  res.status(200).json({
    status: 'success',
    data: {
      product,
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
  const result = await Products.updateProduct(req.params.id, req.body);

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
  const result = await Products.deleteProduct(req.params.id);

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
 * Generate a product ID
 * @route GET /api/products/generate-id
 */
export const generateProductId = catchAsync(async (req, res, next) => {
  const format = req.query.format || 'prefix';
  const productId = await Products.generateProductId(format);

  res.status(200).json({
    status: 'success',
    data: {
      productId,
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
 * Check if a product exists by code
 * @route GET /api/products/exists-by-code/:code
 */
export const checkProductExistsByCode = catchAsync(async (req, res, next) => {
  const exists = await Products.productExistsByCode(req.params.code);

  res.status(200).json({
    status: 'success',
    data: {
      exists,
    },
  });
});

/**
 * Get product statistics
 * @route GET /api/products/stats
 */
export const getProductStats = catchAsync(async (req, res, next) => {
  const stats = await Products.getProductStats();

  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
});

/**
 * Import sample products data
 * @route POST /api/products/samples
 */
export const importSampleProducts = catchAsync(async (req, res, next) => {
  try {
    // Get the sample data from the imported file
    const productsData = sampleProducts.products;

    if (!productsData || !Array.isArray(productsData)) {
      return next(new AppError('Invalid sample products data structure', 400));
    }

    // Process each product in the sample data
    const results = {
      total: productsData.length,
      successful: 0,
      failed: 0,
      errors: [],
      products: [],
    };

    // Process each product individually
    for (const productData of productsData) {
      try {
        console.log('before.....................');
        // Insert the product
        const [productResult] = await tb_pool.query(
          'INSERT INTO products (id, product_id, icon_url, remark) VALUES (?, ?, ?, ?)',
          [
            productData.id,
            productData.product_id,
            productData.icon_url || null,
            productData.remark || null,
          ]
        );
        console.log('after......................');

        if (productResult.affectedRows > 0) {
          // Add product names if available
          const names = sampleProducts.product_names.filter(
            (name) => name.product_id === productData.id
          );

          if (names && names.length > 0) {
            for (const name of names) {
              try {
                await tb_pool.query(
                  'INSERT INTO data_product_names (product_id, name, name_type_id) VALUES (?, ?, ?)',
                  [productData.id, name.name, name.name_type_id]
                );
              } catch (error) {
                console.error(
                  `Error adding name for product ${productData.id}:`,
                  error.message
                );
              }
            }
          }

          // Add categories if available
          const categories = sampleProducts.product_categories.filter(
            (category) => category.product_id === productData.id
          );

          if (categories && categories.length > 0) {
            for (const category of categories) {
              try {
                await tb_pool.query(
                  'INSERT INTO data_product_categories (product_id, category_id) VALUES (?, ?)',
                  [productData.id, category.category_id]
                );
              } catch (error) {
                console.error(
                  `Error adding category for product ${productData.id}:`,
                  error.message
                );
              }
            }
          }

          // Add packings if available
          const packings = sampleProducts.product_packings?.filter(
            (packing) => packing.product_id === productData.id
          );

          if (packings && packings.length > 0) {
            for (const packing of packings) {
              try {
                await tb_pool.query(
                  'INSERT INTO data_product_packings (id, product_id, packing_type_id, width, height, length, weight, volume, pcs_per_ctn, moq, display_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                  [
                    packing.id,
                    productData.id,
                    packing.packing_type_id,
                    packing.width || null,
                    packing.height || null,
                    packing.length || null,
                    packing.weight || null,
                    packing.volume || null,
                    packing.pcs_per_ctn || null,
                    packing.moq || null,
                    packing.display_order || 0,
                  ]
                );
              } catch (error) {
                console.error(
                  `Error adding packing for product ${productData.id}:`,
                  error.message
                );
              }
            }
          }

          // Add alibaba IDs if available
          const alibabaIds = sampleProducts.product_alibaba_ids?.filter(
            (alibabaId) => alibabaId.product_id === productData.id
          );

          if (alibabaIds && alibabaIds.length > 0) {
            for (const alibabaId of alibabaIds) {
              try {
                await tb_pool.query(
                  'INSERT INTO data_product_alibaba_ids (product_id, alibaba_id, url) VALUES (?, ?, ?)',
                  [productData.id, alibabaId.alibaba_id, alibabaId.url || null]
                );
              } catch (error) {
                console.error(
                  `Error adding alibaba ID for product ${productData.id}:`,
                  error.message
                );
              }
            }
          }

          results.successful++;
          results.products.push({
            id: productData.id,
            product_id: productData.product_id,
            status: 'success',
          });
        }
      } catch (error) {
        results.failed++;
        results.errors.push({
          product_id: productData.product_id,
          error: error.message,
        });
      }
    }

    // Store the results in res.prints for endController to use
    res.prints = {
      message: `Imported ${results.successful} out of ${results.total} sample products`,
      data: results,
    };

    // Call next() to proceed to endController
    next();
  } catch (error) {
    return next(
      new AppError(`Failed to import sample products: ${error.message}`, 500)
    );
  }
});

/**
 * Get sample products data without importing
 * @route GET /api/products/sample-data
 */
export const getSampleProductsData = catchAsync(async (req, res, next) => {
  res.status(200).json({
    status: 'success',
    data: {
      sampleProducts,
    },
  });
});

/**
 * Validate product data before creation
 * @middleware
 */
export const validateProductData = (req, res, next) => {
  // Basic validation for required fields
  if (!req.body.names || !req.body.names.length) {
    return next(new AppError('At least one product name is required', 400));
  }

  // Proceed to next middleware
  next();
};

/**
 * Validate product ID format
 * @middleware
 */
export const validateProductId = (req, res, next) => {
  const id = req.params.id;

  // Check if ID is a valid UUID
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  if (!uuidRegex.test(id)) {
    return next(new AppError('Invalid product ID format', 400));
  }

  // Proceed to next middleware
  next();
};

/**
 * Validate product code format
 * @middleware
 */
export const validateProductCode = (req, res, next) => {
  const code = req.params.code;

  // Check if code is in a valid format (prefix format or timestamp format)
  const prefixRegex = /^P\d{6}\d{4}$/; // P{YY}{MM}{NNNN}
  const timestampRegex = /^\d{14}$/; // yyyymmddhhmmss

  if (!prefixRegex.test(code) && !timestampRegex.test(code)) {
    return next(new AppError('Invalid product code format', 400));
  }

  // Proceed to next middleware
  next();
};

/**
 * Truncate all product-related tables
 * @route POST /api/products/truncate
 */
export const truncateProductTables = catchAsync(async (req, res, next) => {
  try {
    // Call the model function to truncate all product tables
    const result = await Products.truncateAllProductTables();

    res.status(200).json({
      status: 'success',
      message: result.message,
      data: {
        truncatedTables: result.truncatedTables,
        errors: result.errors,
      },
    });
  } catch (error) {
    return next(
      new AppError(`Failed to truncate product tables: ${error.message}`, 500)
    );
  }
});
