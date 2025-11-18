import * as dbConn from '../../../utils/dbConn.js';
import AppError from '../../../utils/appError.js';
import CrudOperations from '../../../utils/crud.js';
import { TABLE_MASTER } from '../../tables.js';

// Table name constant for consistency
const TABLE_NAME = TABLE_MASTER['PRODUCT_LINK_IMAGES'];

/**
 * Adds an image to a product link
 * @param {Object} data - The product link image data
 * @param {string} data.product_link_id - The product link ID
 * @param {string} data.image_url - The URL of the image
 * @param {number} [data.display_order] - Optional display order (defaults to end of list)
 * @returns {Promise<Object>} Promise that resolves with the created product link image
 */
export const addProductLinkImage = async (data) => {
  try {
    const pool = dbConn.tb_pool;

    // Validate required fields
    if (!data.product_link_id) {
      throw new AppError('Product link ID is required', 400);
    }

    if (!data.image_url) {
      throw new AppError('Image URL is required', 400);
    }

    // If display_order not provided, get the next available order
    if (data.display_order === undefined) {
      const orderSQL = `
        SELECT COALESCE(MAX(display_order) + 1, 0) as next_order
        FROM ${TABLE_NAME}
        WHERE product_link_id = ?
      `;

      const orderResult = await pool.query(orderSQL, [data.product_link_id]);
      data.display_order = orderResult[0][0].next_order;
    }

    // Create the product link image using CRUD utility
    const result = await CrudOperations.performCrud({
      operation: 'create',
      tableName: TABLE_NAME,
      data: data,
      connection: pool,
    });

    return {
      message: 'Product link image added successfully',
      productLinkImage: result.record,
    };
  } catch (error) {
    throw new AppError(
      `Failed to add product link image: ${error.message}`,
      error.statusCode || 500
    );
  }
};

/**
 * Gets all images for a product link
 * @param {string} productLinkId - The product link ID to get images for
 * @returns {Promise<Array>} Promise that resolves with the product link images
 */
export const getProductLinkImagesByLinkId = async (productLinkId) => {
  try {
    const pool = dbConn.tb_pool;

    // Get the product link images using CRUD utility with ordering
    const sql = `
      SELECT id, *
      FROM ${TABLE_NAME}
      WHERE product_link_id = ?
      ORDER BY display_order
    `;

    const result = await pool.query(sql, [productLinkId]);
    return result[0];
  } catch (error) {
    throw new AppError(
      `Failed to get product link images: ${error.message}`,
      error.statusCode || 500
    );
  }
};

/**
 * Updates a product link image
 * @param {number} id - The ID of the product link image to update
 * @param {Object} data - The product link image data to update
 * @param {string} [data.image_url] - The updated image URL
 * @param {number} [data.display_order] - The updated display order
 * @returns {Promise<Object>} Promise that resolves with the updated product link image
 */
export const updateProductLinkImage = async (id, data) => {
  try {
    const pool = dbConn.tb_pool;

    // Update the product link image using CRUD utility
    const result = await CrudOperations.performCrud({
      operation: 'update',
      tableName: TABLE_NAME,
      id: id,
      data: data,
      connection: pool,
    });

    if (!result.record) {
      throw new AppError('Product link image not found', 404);
    }

    return {
      message: 'Product link image updated successfully',
      productLinkImage: result.record,
    };
  } catch (error) {
    throw new AppError(
      `Failed to update product link image: ${error.message}`,
      error.statusCode || 500
    );
  }
};

/**
 * Deletes a product link image
 * @param {number} id - The ID of the product link image to delete
 * @returns {Promise<Object>} Promise that resolves with deletion result
 */
export const deleteProductLinkImage = async (id) => {
  try {
    const pool = dbConn.tb_pool;

    // Delete the product link image using CRUD utility
    await CrudOperations.performCrud({
      operation: 'delete',
      tableName: TABLE_NAME,
      id: id,
      connection: pool,
    });

    return {
      message: 'Product link image deleted successfully',
      id,
    };
  } catch (error) {
    throw new AppError(
      `Failed to delete product link image: ${error.message}`,
      error.statusCode || 500
    );
  }
};

/**
 * Updates product link images (replaces existing images)
 * @param {string} productLinkId - The product link ID
 * @param {Array<string>} imageUrls - Array of image URLs
 * @returns {Promise<Object>} Promise that resolves with update result
 */
export const updateProductLinkImages = async (productLinkId, imageUrls) => {
  try {
    const pool = dbConn.tb_pool;

    // Start transaction
    await pool.query('START TRANSACTION');

    try {
      // Delete existing images
      await CrudOperations.performCrud({
        operation: 'delete',
        tableName: TABLE_NAME,
        conditions: { product_link_id: productLinkId },
        connection: pool,
      });

      // Add new images
      if (imageUrls && imageUrls.length > 0) {
        const imageData = imageUrls.map((imageUrl, index) => ({
          product_link_id: productLinkId,
          image_url: imageUrl,
          display_order: index,
        }));

        await CrudOperations.performCrud({
          operation: 'bulkcreate',
          tableName: TABLE_NAME,
          data: imageData,
          connection: pool,
        });
      }

      // Commit transaction
      await pool.query('COMMIT');

      // Get the updated images
      const images = await getProductLinkImagesByLinkId(productLinkId);

      return {
        message: 'Product link images updated successfully',
        productLinkId,
        imageCount: images.length,
        images,
      };
    } catch (error) {
      // Rollback transaction on error
      await pool.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    throw new AppError(
      `Failed to update product link images: ${error.message}`,
      error.statusCode || 500
    );
  }
};

/**
 * Reorders product link images
 * @param {string} productLinkId - The product link ID
 * @param {Array<{id: number, display_order: number}>} orderData - Array of objects with image IDs and new display orders
 * @returns {Promise<Object>} Promise that resolves with reordering result
 */
export const reorderProductLinkImages = async (productLinkId, orderData) => {
  try {
    const pool = dbConn.tb_pool;

    // Start transaction
    await pool.query('START TRANSACTION');

    try {
      // Update display order for each image
      for (const item of orderData) {
        await CrudOperations.performCrud({
          operation: 'update',
          tableName: TABLE_NAME,
          id: item.id,
          data: { display_order: item.display_order },
          connection: pool,
        });
      }

      // Commit transaction
      await pool.query('COMMIT');

      // Get the updated images
      const images = await getProductLinkImagesByLinkId(productLinkId);

      return {
        message: 'Product link images reordered successfully',
        productLinkId,
        images,
      };
    } catch (error) {
      // Rollback transaction on error
      await pool.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    throw new AppError(
      `Failed to reorder product link images: ${error.message}`,
      error.statusCode || 500
    );
  }
};
