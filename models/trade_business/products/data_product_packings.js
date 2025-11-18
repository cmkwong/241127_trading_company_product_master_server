import * as dbConn from '../../../utils/dbConn.js';
import AppError from '../../../utils/appError.js';
import CrudOperations from '../../../utils/crud.js';
import { v4 as uuidv4 } from 'uuid';
import { TABLE_NAMES } from '../../tables.js';

// Table name constant for consistency
const TABLE_NAME = TABLE_NAMES['PRODUCT_PACKINGS'];

/**
 * Creates a new product packing
 * @param {Object} data - The product packing data
 * @param {string} data.product_id - The product ID this packing belongs to
 * @param {number} data.packing_type_id - The packing type ID
 * @param {number} data.length - The length of the packing in cm
 * @param {number} data.width - The width of the packing in cm
 * @param {number} data.height - The height of the packing in cm
 * @param {number} data.quantity - The quantity of items in this packing
 * @param {number} data.weight - The weight of the packing in kg
 * @returns {Promise<Object>} Promise that resolves with the created product packing
 */
export const createProductPacking = async (data) => {
  try {
    const pool = dbConn.tb_pool;

    // Validate required fields
    if (!data.product_id) {
      throw new AppError('Product ID is required', 400);
    }

    if (!data.packing_type_id) {
      throw new AppError('Packing type ID is required', 400);
    }

    if (!data.length || data.length <= 0) {
      throw new AppError('Valid length is required', 400);
    }

    if (!data.width || data.width <= 0) {
      throw new AppError('Valid width is required', 400);
    }

    if (!data.height || data.height <= 0) {
      throw new AppError('Valid height is required', 400);
    }

    if (!data.weight || data.weight <= 0) {
      throw new AppError('Valid weight is required', 400);
    }

    // Set default quantity if not provided
    const packingData = {
      ...data,
      quantity: data.quantity || 1,
    };

    // Create the product packing using CRUD utility
    const result = await CrudOperations.performCrud({
      operation: 'create',
      tableName: TABLE_NAME,
      data: packingData,
      connection: pool,
    });

    return {
      message: 'Product packing created successfully',
      productPacking: result.record,
    };
  } catch (error) {
    throw new AppError(
      `Failed to create product packing: ${error.message}`,
      error.statusCode || 500
    );
  }
};

/**
 * Gets a product packing by ID
 * @param {number} id - The ID of the product packing to retrieve
 * @returns {Promise<Object>} Promise that resolves with the product packing data
 */
export const getProductPackingById = async (id) => {
  try {
    const pool = dbConn.tb_pool;

    // Get the product packing using CRUD utility
    const result = await CrudOperations.performCrud({
      operation: 'read',
      tableName: TABLE_NAME,
      id: id,
      connection: pool,
    });

    if (!result.record) {
      throw new AppError('Product packing not found', 404);
    }

    return result.record;
  } catch (error) {
    throw new AppError(
      `Failed to get product packing: ${error.message}`,
      error.statusCode || 500
    );
  }
};

/**
 * Gets all packings for a product with packing type details
 * @param {string} productId - The product ID to get packings for
 * @returns {Promise<Array>} Promise that resolves with the product packings
 */
export const getProductPackingsByProductId = async (productId) => {
  try {
    const pool = dbConn.tb_pool;

    // For this query with joins, we'll use direct SQL
    const sql = `
      SELECT pp.*, mpt.name as packing_type_name, mpt.description as packing_type_description
      FROM ${TABLE_NAME} pp
      LEFT JOIN master_packing_types mpt ON pp.packing_type_id = mpt.id
      WHERE pp.product_id = ?
      ORDER BY pp.packing_type_id
    `;

    const result = await pool.query(sql, [productId]);
    return result[0];
  } catch (error) {
    throw new AppError(
      `Failed to get product packings: ${error.message}`,
      error.statusCode || 500
    );
  }
};

/**
 * Updates a product packing
 * @param {number} id - The ID of the product packing to update
 * @param {Object} data - The product packing data to update
 * @param {number} [data.packing_type_id] - The updated packing type ID
 * @param {number} [data.length] - The updated length
 * @param {number} [data.width] - The updated width
 * @param {number} [data.height] - The updated height
 * @param {number} [data.quantity] - The updated quantity
 * @param {number} [data.weight] - The updated weight
 * @returns {Promise<Object>} Promise that resolves with the updated product packing
 */
export const updateProductPacking = async (id, data) => {
  try {
    const pool = dbConn.tb_pool;

    // Validate dimensions and weight if provided
    if (data.length !== undefined && data.length <= 0) {
      throw new AppError('Length must be greater than zero', 400);
    }

    if (data.width !== undefined && data.width <= 0) {
      throw new AppError('Width must be greater than zero', 400);
    }

    if (data.height !== undefined && data.height <= 0) {
      throw new AppError('Height must be greater than zero', 400);
    }

    if (data.weight !== undefined && data.weight <= 0) {
      throw new AppError('Weight must be greater than zero', 400);
    }

    // Update the product packing using CRUD utility
    const result = await CrudOperations.performCrud({
      operation: 'update',
      tableName: TABLE_NAME,
      id: id,
      data: data,
      connection: pool,
    });

    if (!result.record) {
      throw new AppError('Product packing not found', 404);
    }

    return {
      message: 'Product packing updated successfully',
      productPacking: result.record,
    };
  } catch (error) {
    throw new AppError(
      `Failed to update product packing: ${error.message}`,
      error.statusCode || 500
    );
  }
};

/**
 * Deletes a product packing
 * @param {number} id - The ID of the product packing to delete
 * @returns {Promise<Object>} Promise that resolves with deletion result
 */
export const deleteProductPacking = async (id) => {
  try {
    const pool = dbConn.tb_pool;

    // Check if product packing exists
    await getProductPackingById(id);

    // Delete the product packing using CRUD utility
    await CrudOperations.performCrud({
      operation: 'delete',
      tableName: TABLE_NAME,
      id: id,
      connection: pool,
    });

    return {
      message: 'Product packing deleted successfully',
      id,
    };
  } catch (error) {
    throw new AppError(
      `Failed to delete product packing: ${error.message}`,
      error.statusCode || 500
    );
  }
};

/**
 * Updates or creates product packings (upsert operation)
 * @param {string} productId - The product ID
 * @param {Array<Object>} packings - Array of packing objects
 * @returns {Promise<Object>} Promise that resolves with upsert result
 */
export const upsertProductPackings = async (productId, packings) => {
  try {
    const pool = dbConn.tb_pool;

    // Start transaction
    await pool.query('START TRANSACTION');

    try {
      // Get existing packings for this product
      const existingPackings = await getProductPackingsByProductId(productId);

      // Delete all existing packings
      for (const packing of existingPackings) {
        await CrudOperations.performCrud({
          operation: 'delete',
          tableName: TABLE_NAME,
          id: packing.id,
          connection: pool,
        });
      }

      // Create new packings
      const createdPackings = [];

      for (const packing of packings) {
        const packingData = {
          ...packing,
          product_id: productId,
        };

        const result = await CrudOperations.performCrud({
          operation: 'create',
          tableName: TABLE_NAME,
          data: packingData,
          connection: pool,
        });

        createdPackings.push(result.record);
      }

      // Commit transaction
      await pool.query('COMMIT');

      return {
        message: 'Product packings updated successfully',
        deleted: existingPackings.length,
        created: createdPackings.length,
        packings: await getProductPackingsByProductId(productId),
      };
    } catch (error) {
      // Rollback transaction on error
      await pool.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    throw new AppError(
      `Failed to update product packings: ${error.message}`,
      error.statusCode || 500
    );
  }
};

/**
 * Deletes all packings for a product
 * @param {string} productId - The product ID to delete packings for
 * @returns {Promise<Object>} Promise that resolves with deletion result
 */
export const deleteProductPackingsByProductId = async (productId) => {
  try {
    const pool = dbConn.tb_pool;

    // Get all packings for this product
    const packings = await getProductPackingsByProductId(productId);

    if (packings.length === 0) {
      return {
        message: 'No product packings found for this product',
        count: 0,
      };
    }

    // Delete the product packings
    await CrudOperations.performCrud({
      operation: 'delete',
      tableName: TABLE_NAME,
      conditions: { product_id: productId },
      connection: pool,
    });

    return {
      message: 'Product packings deleted successfully',
      count: packings.length,
    };
  } catch (error) {
    throw new AppError(
      `Failed to delete product packings: ${error.message}`,
      error.statusCode || 500
    );
  }
};

/**
 * Calculates cubic meter volume for a packing
 * @param {Object} packing - The packing data with dimensions
 * @returns {number} The volume in cubic meters
 */
export const calculatePackingVolume = (packing) => {
  // Convert cm to m and calculate volume
  const lengthInM = packing.length / 100;
  const widthInM = packing.width / 100;
  const heightInM = packing.height / 100;

  return lengthInM * widthInM * heightInM;
};

/**
 * Gets all packing types from master table
 * @returns {Promise<Array>} Promise that resolves with the packing types
 */
export const getPackingTypes = async () => {
  try {
    const pool = dbConn.tb_pool;

    const sql = `SELECT * FROM master_packing_types ORDER BY id`;
    const result = await pool.query(sql);

    return result[0];
  } catch (error) {
    throw new AppError(
      `Failed to get packing types: ${error.message}`,
      error.statusCode || 500
    );
  }
};

/**
 * Creates a new packing type
 * @param {Object} data - The packing type data
 * @param {string} data.name - The name of the packing type
 * @param {string} [data.description] - Optional description
 * @returns {Promise<Object>} Promise that resolves with the created packing type
 */
export const createPackingType = async (data) => {
  try {
    const pool = dbConn.tb_pool;

    // Validate required fields
    if (!data.name) {
      throw new AppError('Packing type name is required', 400);
    }

    // Create the packing type using CRUD utility
    const result = await CrudOperations.performCrud({
      operation: 'create',
      tableName: 'master_packing_types',
      data: data,
      connection: pool,
    });

    return {
      message: 'Packing type created successfully',
      packingType: result.record,
    };
  } catch (error) {
    throw new AppError(
      `Failed to create packing type: ${error.message}`,
      error.statusCode || 500
    );
  }
};
