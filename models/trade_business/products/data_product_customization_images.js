import * as dbConn from '../../../utils/dbConn.js';
import AppError from '../../../utils/appError.js';
import CrudOperations from '../../../utils/crud.js';

// Table name constant for consistency
const TABLE_NAME = 'customization_images';

/**
 * Adds an image to a customization
 * @param {Object} data - The customization image data
 * @param {string} data.customization_id - The customization ID
 * @param {string} data.image_url - The URL of the image
 * @param {number} [data.display_order] - Optional display order (defaults to end of list)
 * @returns {Promise<Object>} Promise that resolves with the created customization image
 */
export const addCustomizationImage = async (data) => {
  try {
    const pool = dbConn.tb_pool;
    
    // Validate required fields
    if (!data.customization_id) {
      throw new AppError('Customization ID is required', 400);
    }
    
    if (!data.image_url) {
      throw new AppError('Image URL is required', 400);
    }
    
    // If display_order not provided, get the next available order
    if (data.display_order === undefined) {
      const orderSQL = `
        SELECT COALESCE(MAX(display_order) + 1, 0) as next_order
        FROM ${TABLE_NAME}
        WHERE customization_id = ?
      `;
      
      const orderResult = await pool.query(orderSQL, [data.customization_id]);
      data.display_order = orderResult[0][0].next_order;
    }
    
    // Create the customization image using CRUD utility
    const result = await CrudOperations.performCrud({
      operation: 'create',
      tableName: TABLE_NAME,
      data: data,
      connection: pool
    });
    
    return {
      message: 'Customization image added successfully',
      customizationImage: result.record
    };
  } catch (error) {
    throw new AppError(
      `Failed to add customization image: ${error.message}`,
      error.statusCode || 500
    );
  }
};

/**
 * Gets all images for a customization
 * @param {string} customizationId - The customization ID to get images for
 * @returns {Promise<Array>} Promise that resolves with the customization images
 */
export const getCustomizationImagesByCustomizationId = async (customizationId) => {
  try {
    const pool = dbConn.tb_pool;
    
    // Get the customization images using CRUD utility with ordering
    const sql = `
      SELECT id, customization_id, image_url, display_order
      FROM ${TABLE_NAME}
      WHERE customization_id = ?
      ORDER BY display_order
    `;
    
    const result = await pool.query(sql, [customizationId]);
    return result[0];
  } catch (error) {
    throw new AppError(
      `Failed to get customization images: ${error.message}`,
      error.statusCode || 500
    );
  }
};

/**
 * Updates a customization image
 * @param {number} id - The ID of the customization image to update
 * @param {Object} data - The customization image data to update
 * @param {string} [data.image_url] - The updated image URL
 * @param {number} [data.display_order] - The updated display order
 * @returns {Promise<Object>} Promise that resolves with the updated customization image
 */
export const updateCustomizationImage = async (id, data) => {
  try {
    const pool = dbConn.tb_pool;
    
    // Update the customization image using CRUD utility
    const result = await CrudOperations.performCrud({
      operation: 'update',
      tableName: TABLE_NAME,
      id: id,
      data: data,
      connection: pool
    });
    
    if (!result.record) {
      throw new AppError('Customization image not found', 404);
    }
    
    return {
      message: 'Customization image updated successfully',
      customizationImage: result.record
    };
  } catch (error) {
    throw new AppError(
      `Failed to update customization image: ${error.message}`,
      error.statusCode || 500
    );
  }
};

/**
 * Deletes a customization image
 * @param {number} id - The ID of the customization image to delete
 * @returns {Promise<Object>} Promise that resolves with deletion result
 */
export const deleteCustomizationImage = async (id) => {
  try {
    const pool = dbConn.tb_pool;
    
    // Delete the customization image using CRUD utility
    await CrudOperations.performCrud({
      operation: 'delete',
      tableName: TABLE_NAME,
      id: id,
      connection: pool
    });
    
    return {
      message: 'Customization image deleted successfully',
      id
    };
  } catch (error) {
    throw new AppError(
      `Failed to delete customization image: ${error.message}`,
      error.statusCode || 500
    );
  }
};

/**
 * Updates customization images (replaces existing images)
 * @param {string} customizationId - The customization ID
 * @param {Array<string>} imageUrls - Array of image URLs
 * @returns {Promise<Object>} Promise that resolves with update result
 */
export const updateCustomizationImages = async (customizationId, imageUrls) => {
  try {
    const pool = dbConn.tb_pool;
    
    // Start transaction
    await pool.query('START TRANSACTION');
    
    try {
      // Delete existing images
      await CrudOperations.performCrud({
        operation: 'delete',
        tableName: TABLE_NAME,
        conditions: { customization_id: customizationId },
        connection: pool
      });
      
      // Add new images
      if (imageUrls && imageUrls.length > 0) {
        const imageData = imageUrls.map((imageUrl, index) => ({
          customization_id: customizationId,
          image_url: imageUrl,
          display_order: index
        }));
        
        await CrudOperations.performCrud({
          operation: 'bulkcreate',
          tableName: TABLE_NAME,
          data: imageData,
          connection: pool
        });
      }
      
      // Commit transaction
      await pool.query('COMMIT');
      
      // Get the updated images
      const images = await getCustomizationImagesByCustomizationId(customizationId);
      
      return {
        message: 'Customization images updated successfully',
        customizationId,
        imageCount: images.length,
        images
      };
    } catch (error) {
      // Rollback transaction on error
      await pool.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    throw new AppError(
      `Failed to update customization images: ${error.message}`,
      error.statusCode || 500
    );
  }
};

/**
 * Reorders customization images
 * @param {string} customizationId - The customization ID
 * @param {Array<{id: number, display_order: number}>} orderData - Array of objects with image IDs and new display orders
 * @returns {Promise<Object>} Promise that resolves with reordering result
 */
export const reorderCustomizationImages = async (customizationId, orderData) => {
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
          connection: pool
        });
      }
      
      // Commit transaction
      await pool.query('COMMIT');
      
      // Get the updated images
      const images = await getCustomizationImagesByCustomizationId(customizationId);
      
      return {
        message: 'Customization images reordered successfully',
        customizationId,
        images
      };
    } catch (error) {
      // Rollback transaction on error
      await pool.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    throw new AppError(
      `Failed to reorder customization images: ${error.message}`,
      error.statusCode || 500
    );
  }
};