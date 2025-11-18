import * as dbConn from '../../../utils/dbConn.js';
import AppError from '../../../utils/appError.js';
import CrudOperations from '../../../utils/crud.js';
import { v4 as uuidv4 } from 'uuid';

// Import related data models
import * as ProductNames from './data_product_names.js';
import * as ProductCustomizations from './data_product_customizations.js';
import * as ProductLinks from './data_product_links.js';
import * as ProductPackings from './data_product_packings.js';
import * as ProductCategories from './data_product_categories.js';
import * as ProductAlibabaIds from './data_product_alibaba_ids.js';
import * as ProductCertificates from './data_product_certificates.js';
import { TABLE_MASTER } from '../../tables.js';

// Table name constant for consistency
const TABLE_NAME = TABLE_MASTER['PRODUCTS'];

/**
 * Generates a unique product ID
 * @param {string} [format] - Optional format to use ('prefix' for P{YY}{MM}{NNNN} format, defaults to timestamp format)
 * @returns {Promise<string>} Promise that resolves with the generated product ID
 */
export const generateProductId = async (format) => {
  try {
    // If format is 'prefix', use the P{YY}{MM}{NNNN} format
    if (format === 'prefix') {
      const pool = dbConn.tb_pool;

      // Get the current date
      const date = new Date();
      const year = date.getFullYear().toString().slice(-2);
      const month = (date.getMonth() + 1).toString().padStart(2, '0');

      // Generate prefix based on year and month
      const prefix = `P${year}${month}`;

      // Find the highest product_id with this prefix
      const sql = `
        SELECT MAX(product_id) as max_id
        FROM ${TABLE_NAME}
        WHERE product_id LIKE ?
      `;

      const result = await pool.query(sql, [`${prefix}%`]);
      const maxId = result[0][0].max_id;

      let sequenceNumber = 1;

      if (maxId) {
        // Extract the sequence number from the max ID
        const currentSequence = parseInt(maxId.slice(-4), 10);
        sequenceNumber = currentSequence + 1;
      }

      // Format the sequence number with leading zeros
      const formattedSequence = sequenceNumber.toString().padStart(4, '0');

      // Combine to create the new product ID
      return `${prefix}${formattedSequence}`;
    } else {
      // Default: Use timestamp format yyyymmddhhmmss
      const now = new Date();
      const year = now.getFullYear();
      const month = (now.getMonth() + 1).toString().padStart(2, '0');
      const day = now.getDate().toString().padStart(2, '0');
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const seconds = now.getSeconds().toString().padStart(2, '0');

      return `${year}${month}${day}${hours}${minutes}${seconds}`;
    }
  } catch (error) {
    throw new AppError(
      `Failed to generate product ID: ${error.message}`,
      error.statusCode || 500
    );
  }
};

/**
 * Creates a new product
 * @param {Object} data - The product data
 * @param {string} [data.product_id] - Optional product ID (generated if not provided)
 * @param {string} [data.icon_url] - Optional icon URL
 * @param {string} [data.remark] - Optional remark
 * @param {string} [data.id] - Optional UUID (generated if not provided)
 * @param {Array<{name_type_id: number, name: string}>} [data.names] - Optional array of product names
 * @param {Array<Object>} [data.packings] - Optional array of packing data
 * @param {Array<Object>} [data.customizations] - Optional array of customization data
 * @param {Array<Object>} [data.links] - Optional array of link data
 * @param {Array<{category_id: string}>} [data.categories] - Optional array of category IDs
 * @param {Array<{alibaba_id: string, url: string}>} [data.alibaba_ids] - Optional array of Alibaba IDs
 * @param {Array<Object>} [data.certificates] - Optional array of certificate data
 * @returns {Promise<Object>} Promise that resolves with the created product
 */
export const createProduct = async (data) => {
  try {
    const pool = dbConn.tb_pool;

    // Start transaction
    await pool.query('START TRANSACTION');

    try {
      // Extract related data that needs to be handled separately
      const {
        names,
        packings,
        customizations,
        links,
        categories,
        alibaba_ids,
        certificates,
        ...productData
      } = { ...data };

      // Generate UUID and product ID if not provided
      if (!productData.id) {
        productData.id = uuidv4();
      }

      if (!productData.product_id) {
        productData.product_id = await generateProductId();
      }

      // Create the product using CRUD utility
      const result = await CrudOperations.performCrud({
        operation: 'create',
        tableName: TABLE_NAME,
        data: productData,
        connection: pool,
      });

      const product = result.record;
      const productId = productData.id;

      // Add product names if provided
      if (names && names.length > 0) {
        await ProductNames.upsertProductNames(productId, names);
      }

      // Add packings if provided
      if (packings && packings.length > 0) {
        await ProductPackings.upsertProductPackings(productId, packings);
      }

      // Add customizations if provided
      if (customizations && customizations.length > 0) {
        for (const customization of customizations) {
          customization.product_id = productId;
          await ProductCustomizations.createCustomization(customization);
        }
      }

      // Add links if provided
      if (links && links.length > 0) {
        for (const link of links) {
          link.product_id = productId;
          await ProductLinks.createProductLink(link);
        }
      }

      // Add categories if provided
      if (categories && categories.length > 0) {
        await ProductCategories.upsertProductCategories(productId, categories);
      }

      // Add Alibaba IDs if provided
      if (alibaba_ids && alibaba_ids.length > 0) {
        await ProductAlibabaIds.upsertProductAlibabaIds(productId, alibaba_ids);
      }

      // Add certificates if provided
      if (certificates && certificates.length > 0) {
        for (const certificate of certificates) {
          certificate.product_id = productId;
          await ProductCertificates.createProductCertificate(certificate);
        }
      }

      // Commit transaction
      await pool.query('COMMIT');

      // Get the complete product with all related data
      const completeProduct = await getProductById(productId, true);

      return {
        message: 'Product created successfully',
        product: completeProduct,
      };
    } catch (error) {
      // Rollback transaction on error
      await pool.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    throw new AppError(
      `Failed to create product: ${error.message}`,
      error.statusCode || 500
    );
  }
};

/**
 * Gets a product by ID
 * @param {string} id - The ID of the product to retrieve
 * @param {boolean} [includeRelated=false] - Whether to include related data
 * @returns {Promise<Object>} Promise that resolves with the product data
 */
export const getProductById = async (id, includeRelated = false) => {
  try {
    const pool = dbConn.tb_pool;

    // Get the product using CRUD utility
    const result = await CrudOperations.performCrud({
      operation: 'read',
      tableName: TABLE_NAME,
      id: id,
      connection: pool,
    });

    if (!result.record) {
      throw new AppError('Product not found', 404);
    }

    const product = result.record;

    // Include related data if requested
    if (includeRelated) {
      // Get product names
      product.names = await ProductNames.getProductNamesByProductId(id);

      // Get packings
      product.packings = await ProductPackings.getProductPackingsByProductId(
        id
      );

      // Get customizations
      product.customizations =
        await ProductCustomizations.getCustomizationsByProductId(id);

      // Get links
      product.links = await ProductLinks.getProductLinksByProductId(id);

      // Get categories
      product.categories =
        await ProductCategories.getProductCategoriesByProductId(id);

      // Get Alibaba IDs
      product.alibaba_ids =
        await ProductAlibabaIds.getProductAlibabaIdsByProductId(id);

      // Get certificates with their files
      product.certificates =
        await ProductCertificates.getProductCertificatesByProductId(id, true);
    }

    return product;
  } catch (error) {
    throw new AppError(
      `Failed to get product: ${error.message}`,
      error.statusCode || 500
    );
  }
};

/**
 * Gets a product by product_id (code)
 * @param {string} productCode - The product_id code to search for
 * @param {boolean} [includeRelated=false] - Whether to include related data
 * @returns {Promise<Object>} Promise that resolves with the product data
 */
export const getProductByCode = async (productCode, includeRelated = false) => {
  try {
    const pool = dbConn.tb_pool;

    // Get the product using CRUD utility
    const result = await CrudOperations.performCrud({
      operation: 'read',
      tableName: TABLE_NAME,
      conditions: { product_id: productCode },
      connection: pool,
    });

    if (!result.records || result.records.length === 0) {
      throw new AppError('Product not found', 404);
    }

    const product = result.records[0];

    // Include related data if requested
    if (includeRelated) {
      // Get product names
      product.names = await ProductNames.getProductNamesByProductId(product.id);

      // Get packings
      product.packings = await ProductPackings.getProductPackingsByProductId(
        product.id
      );

      // Get customizations
      product.customizations =
        await ProductCustomizations.getCustomizationsByProductId(product.id);

      // Get links
      product.links = await ProductLinks.getProductLinksByProductId(product.id);

      // Get categories
      product.categories =
        await ProductCategories.getProductCategoriesByProductId(product.id);

      // Get Alibaba IDs
      product.alibaba_ids =
        await ProductAlibabaIds.getProductAlibabaIdsByProductId(product.id);

      // Get certificates with their files
      product.certificates =
        await ProductCertificates.getProductCertificatesByProductId(
          product.id,
          true
        );
    }

    return product;
  } catch (error) {
    throw new AppError(
      `Failed to get product: ${error.message}`,
      error.statusCode || 500
    );
  }
};

/**
 * Gets all products with pagination and optional filtering
 * @param {Object} options - Query options
 * @param {number} [options.page=1] - Page number
 * @param {number} [options.limit=20] - Results per page
 * @param {string} [options.search] - Search term for product names
 * @param {string} [options.category_id] - Filter by category ID
 * @param {boolean} [options.includeRelated=false] - Whether to include related data
 * @returns {Promise<Object>} Promise that resolves with paginated products
 */
export const getProducts = async (options = {}) => {
  try {
    const pool = dbConn.tb_pool;

    // Set default pagination values
    const page = options.page || 1;
    const limit = options.limit || 20;
    const offset = (page - 1) * limit;

    let countSQL = `SELECT COUNT(*) as total FROM ${TABLE_NAME}`;
    let productsSQL = `
      SELECT p.* 
      FROM ${TABLE_NAME} p
    `;

    const sqlParams = [];
    let whereAdded = false;

    // Add search condition if provided
    if (options.search) {
      productsSQL = `
        SELECT DISTINCT p.* 
        FROM ${TABLE_NAME} p
        LEFT JOIN product_names pn ON p.id = pn.product_id
        WHERE pn.name LIKE ?
      `;

      countSQL = `
        SELECT COUNT(DISTINCT p.id) as total 
        FROM ${TABLE_NAME} p
        LEFT JOIN product_names pn ON p.id = pn.product_id
        WHERE pn.name LIKE ?
      `;

      sqlParams.push(`%${options.search}%`);
      whereAdded = true;
    }

    // Add category filter if provided
    if (options.category_id) {
      if (!whereAdded) {
        productsSQL += ` WHERE p.id IN (
          SELECT product_id FROM product_categories WHERE category_id = ?
        )`;

        countSQL += ` WHERE id IN (
          SELECT product_id FROM product_categories WHERE category_id = ?
        )`;
        whereAdded = true;
      } else {
        productsSQL += ` AND p.id IN (
          SELECT product_id FROM product_categories WHERE category_id = ?
        )`;

        countSQL += ` AND id IN (
          SELECT product_id FROM product_categories WHERE category_id = ?
        )`;
      }

      sqlParams.push(options.category_id);
    }

    // Add pagination
    productsSQL += ` ORDER BY p.created_at DESC LIMIT ? OFFSET ?`;
    sqlParams.push(limit, offset);

    // Execute count query
    const countResult = await pool.query(
      countSQL,
      options.search || options.category_id
        ? sqlParams.slice(0, sqlParams.length - 2)
        : []
    );
    const total = countResult[0][0].total;

    // Execute products query
    const productsResult = await pool.query(productsSQL, sqlParams);
    const products = productsResult[0];

    // Include related data if requested
    if (options.includeRelated) {
      for (const product of products) {
        // Get product names
        product.names = await ProductNames.getProductNamesByProductId(
          product.id
        );

        // Get packings (only if specifically requested)
        if (options.includePackings) {
          product.packings =
            await ProductPackings.getProductPackingsByProductId(product.id);
        }

        // Get categories
        product.categories =
          await ProductCategories.getProductCategoriesByProductId(product.id);

        // Get Alibaba IDs (only if specifically requested)
        if (options.includeAlibabaIds) {
          product.alibaba_ids =
            await ProductAlibabaIds.getProductAlibabaIdsByProductId(product.id);
        }

        // Include customizations, links, and certificates only when getting a single product detail
      }
    }

    return {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
      products,
    };
  } catch (error) {
    throw new AppError(
      `Failed to get products: ${error.message}`,
      error.statusCode || 500
    );
  }
};

/**
 * Updates a product
 * @param {string} id - The ID of the product to update
 * @param {Object} data - The product data to update
 * @param {string} [data.product_id] - The updated product ID code
 * @param {string} [data.icon_url] - The updated icon URL
 * @param {string} [data.remark] - The updated remark
 * @param {Array<{name_type_id: number, name: string}>} [data.names] - Updated array of product names
 * @param {Array<Object>} [data.packings] - Updated array of packing data
 * @param {Array<{category_id: string}>} [data.categories] - Updated array of category IDs
 * @param {Array<{alibaba_id: string, url: string}>} [data.alibaba_ids] - Updated array of Alibaba IDs
 * @returns {Promise<Object>} Promise that resolves with the updated product
 */
export const updateProduct = async (id, data) => {
  try {
    const pool = dbConn.tb_pool;

    // Check if product exists
    await getProductById(id);

    // Start transaction
    await pool.query('START TRANSACTION');

    try {
      // Extract related data that needs to be handled separately
      const { names, packings, categories, alibaba_ids, ...productData } = {
        ...data,
      };

      // Update product basic data if there are fields to update
      if (Object.keys(productData).length > 0) {
        await CrudOperations.performCrud({
          operation: 'update',
          tableName: TABLE_NAME,
          id: id,
          data: productData,
          connection: pool,
        });
      }

      // Update product names if provided
      if (names !== undefined) {
        await ProductNames.upsertProductNames(id, names);
      }

      // Update packings if provided
      if (packings !== undefined) {
        await ProductPackings.upsertProductPackings(id, packings);
      }

      // Update categories if provided
      if (categories !== undefined) {
        await ProductCategories.upsertProductCategories(id, categories);
      }

      // Update Alibaba IDs if provided
      if (alibaba_ids !== undefined) {
        await ProductAlibabaIds.upsertProductAlibabaIds(id, alibaba_ids);
      }

      // Commit transaction
      await pool.query('COMMIT');

      // Get the updated product with all related data
      const product = await getProductById(id, true);

      return {
        message: 'Product updated successfully',
        product,
      };
    } catch (error) {
      // Rollback transaction on error
      await pool.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    throw new AppError(
      `Failed to update product: ${error.message}`,
      error.statusCode || 500
    );
  }
};

/**
 * Deletes a product and all related data
 * @param {string} id - The ID of the product to delete
 * @returns {Promise<Object>} Promise that resolves with deletion result
 */
export const deleteProduct = async (id) => {
  try {
    const pool = dbConn.tb_pool;

    // Check if product exists
    const product = await getProductById(id);

    // Delete the product (cascade will delete all related data)
    await CrudOperations.performCrud({
      operation: 'delete',
      tableName: TABLE_NAME,
      id: id,
      connection: pool,
    });

    return {
      message: 'Product deleted successfully',
      productId: id,
      productCode: product.product_id,
    };
  } catch (error) {
    throw new AppError(
      `Failed to delete product: ${error.message}`,
      error.statusCode || 500
    );
  }
};

/**
 * Checks if a product exists by ID
 * @param {string} id - The ID of the product to check
 * @returns {Promise<boolean>} Promise that resolves with true if product exists, false otherwise
 */
export const productExists = async (id) => {
  try {
    const pool = dbConn.tb_pool;

    const sql = `SELECT COUNT(*) as count FROM ${TABLE_NAME} WHERE id = ?`;
    const result = await pool.query(sql, [id]);

    return result[0][0].count > 0;
  } catch (error) {
    throw new AppError(
      `Failed to check if product exists: ${error.message}`,
      error.statusCode || 500
    );
  }
};

/**
 * Checks if a product exists by product_id code
 * @param {string} productCode - The product_id code to check
 * @returns {Promise<boolean>} Promise that resolves with true if product exists, false otherwise
 */
export const productExistsByCode = async (productCode) => {
  try {
    const pool = dbConn.tb_pool;

    const sql = `SELECT COUNT(*) as count FROM ${TABLE_NAME} WHERE product_id = ?`;
    const result = await pool.query(sql, [productCode]);

    return result[0][0].count > 0;
  } catch (error) {
    throw new AppError(
      `Failed to check if product exists by code: ${error.message}`,
      error.statusCode || 500
    );
  }
};

/**
 * Gets product statistics
 * @returns {Promise<Object>} Promise that resolves with product statistics
 */
export const getProductStats = async () => {
  try {
    const pool = dbConn.tb_pool;

    // Get total products count
    const countSQL = `SELECT COUNT(*) as total FROM ${TABLE_NAME}`;
    const countResult = await pool.query(countSQL);
    const total = countResult[0][0].total;

    // Get products created in the last 30 days
    const recentSQL = `
      SELECT COUNT(*) as count 
      FROM ${TABLE_NAME} 
      WHERE created_at >= DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)
    `;
    const recentResult = await pool.query(recentSQL);
    const recentCount = recentResult[0][0].count;

    // Get products by month for the last 12 months
    const monthlySQL = `
      SELECT 
        DATE_FORMAT(created_at, '%Y-%m') as month,
        COUNT(*) as count
      FROM ${TABLE_NAME}
      WHERE created_at >= DATE_SUB(CURRENT_DATE(), INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(created_at, '%Y-%m')
      ORDER BY month
    `;
    const monthlyResult = await pool.query(monthlySQL);
    const monthlyStats = monthlyResult[0];

    return {
      total,
      recentCount,
      monthlyStats,
    };
  } catch (error) {
    throw new AppError(
      `Failed to get product statistics: ${error.message}`,
      error.statusCode || 500
    );
  }
};
