import * as dbConn from '../../../utils/dbConn.js';
import AppError from '../../../utils/appError.js';
import CrudOperations from '../../../utils/crud.js';
import { v4 as uuidv4 } from 'uuid';

// Table name constants for consistency
const CUSTOMIZATIONS_TABLE = 'customizations';
const CUSTOMIZATION_IMAGES_TABLE = 'customization_images';

/**
 * Creates a new customization for a product
 * @param {Object} data - The customization data
 * @param {string} data.product_id - The product ID this customization belongs to
 * @param {string} data.name - The name of the customization
 * @param {string} [data.code] - Optional code for the customization
 * @param {string} [data.remark] - Optional remark about the customization
 * @param {string} [data.id] - Optional UUID (generated if not provided)
 * @param {Array<string>} [data.images] - Optional array of image URLs
 * @returns {Promise<Object>} Promise that resolves with the created customization
 */
export const createCustomization = async (data) => {
  try {
    const pool = dbConn.tb_pool;
    
    // Validate required fields
    if (!data.product_id) {
      throw new AppError('Product ID is required', 400);
    }
    
    if (!data.name) {
      throw new AppError('Customization name is required', 400);
    }
    
    // Generate UUID if not provided
    const customizationId = data.id || uuidv4();
    
    // Start transaction
    await pool.query('START TRANSACTION');
    
    try {
      // Create the customization using CRUD utility
      const customizationData = {
        id: customizationId,
        product_id: data.product_id,
        name: data.name,
        code: data.code || null,
        remark: data.remark || null
      };
      
      const result = await CrudOperations.performCrud({
        operation: 'create',
        tableName: CUSTOMIZATIONS_TABLE,
        data: customizationData,
        connection: pool
      });
      
      // Add customization images if provided
      if (data.images && data.images.length > 0) {
        const imageData = data.images.map((imageUrl, index) => ({
          customization_id: customizationId,
          image_url: imageUrl,
          display_order: index
        }));
        
        await CrudOperations.performCrud({
          operation: 'bulkcreate',
          tableName: CUSTOMIZATION_IMAGES_TABLE,
          data: imageData,
          connection: pool
        });
      }
      
      // Commit transaction
      await pool.query('COMMIT');
      
      // Get the complete customization with images
      const customization = await getCustomizationById(customizationId);
      
      return {
        message: 'Customization created successfully',
        customization
      };
    } catch (error) {
      // Rollback transaction on error
      await pool.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    throw new AppError(
      `Failed to create customization: ${error.message}`,
      error.statusCode || 500
    );
  }
};

/**
 * Gets a customization by ID with its images
 * @param {string} id - The ID of the customization to retrieve
 * @returns {Promise<Object>} Promise that resolves with the customization data
 */
export const getCustomizationById = async (id) => {
  try {
    const pool = dbConn.tb_pool;
    
    // Get the customization using CRUD utility
    const customizationResult = await CrudOperations.performCrud({
      operation: 'read',
      tableName: CUSTOMIZATIONS_TABLE,
      id: id,
      connection: pool
    });
    
    if (!customizationResult.record) {
      throw new AppError('Customization not found', 404);
    }
    
    const customization = customizationResult.record;
    
    // Get customization images
    const imagesSQL = `
      SELECT image_url
      FROM ${CUSTOMIZATION_IMAGES_TABLE}
      WHERE customization_id = ?
      ORDER BY display_order
    `;
    
    const imagesResult = await pool.query(imagesSQL, [id]);
    customization.images = imagesResult[0].map(img => img.image_url);
    
    return customization;
  } catch (error) {
    throw new AppError(
      `Failed to get customization: ${error.message}`,
      error.statusCode || 500
    );
  }
};

/**
 * Gets all customizations for a product
 * @param {string} productId - The product ID to get customizations for
 * @returns {Promise<Array>} Promise that resolves with the customizations
 */
export const getCustomizationsByProductId = async (productId) => {
  try {
    const pool = dbConn.tb_pool;
    
    // Get the customizations using CRUD utility
    const result = await CrudOperations.performCrud({
      operation: 'read',
      tableName: CUSTOMIZATIONS_TABLE,
      conditions: { product_id: productId },
      connection: pool
    });
    
    const customizations = result.records;
    
    // Get images for each customization
    for (const customization of customizations) {
      const imagesSQL = `
        SELECT image_url
        FROM ${CUSTOMIZATION_IMAGES_TABLE}
        WHERE customization_id = ?
        ORDER BY display_order
      `;
      
      const imagesResult = await pool.query(imagesSQL, [customization.id]);
      customization.images = imagesResult[0].map(img => img.image_url);
    }
    
    return customizations;
  } catch (error) {
    throw new AppError(
      `Failed to get customizations: ${error.message}`,
      error.statusCode || 500
    );
  }
};

/**
 * Updates a customization
 * @param {string} id - The ID of the customization to update
 * @param {Object} data - The customization data to update
 * @param {string} [data.name] - The updated name
 * @param {string} [data.code] - The updated code
 * @param {string} [data.remark] - The updated remark
 * @param {Array<string>} [data.images] - Updated array of image URLs
 * @returns {Promise<Object>} Promise that resolves with the updated customization
 */
export const updateCustomization = async (id, data) => {
  try {
    const pool = dbConn.tb_pool;
    
    // Check if customization exists
    await getCustomizationById(id);
    
    // Start transaction
    await pool.query('START TRANSACTION');
    
    try {
      // Update customization data if provided
      if (data.name !== undefined || data.code !== undefined || data.remark !== undefined) {
        const updateData = {};
        
        if (data.name !== undefined) {
          updateData.name = data.name;
        }
        
        if (data.code !== undefined) {
          updateData.code = data.code;
        }
        
        if (data.remark !== undefined) {
          updateData.remark = data.remark;
        }
        
        await CrudOperations.performCrud({
          operation: 'update',
          tableName: CUSTOMIZATIONS_TABLE,
          id: id,
          data: updateData,
          connection: pool
        });
      }
      
      // Update images if provided
      if (data.images !== undefined) {
        // Delete existing images
        await CrudOperations.performCrud({
          operation: 'delete',
          tableName: CUSTOMIZATION_IMAGES_TABLE,
          conditions: { customization_id: id },
          connection: pool
        });
        
        // Add new images
        if (data.images && data.images.length > 0) {
          const imageData = data.images.map((imageUrl, index) => ({
            customization_id: id,
            image_url: imageUrl,
            display_order: index
          }));
          
          await CrudOperations.performCrud({
            operation: 'bulkcreate',
            tableName: CUSTOMIZATION_IMAGES_TABLE,
            data: imageData,
            connection: pool
          });
        }
      }
      
      // Commit transaction
      await pool.query('COMMIT');
      
      // Get the updated customization
      const customization = await getCustomizationById(id);
      
      return {
        message: 'Customization updated successfully',
        customization
      };
    } catch (error) {
      // Rollback transaction on error
      await pool.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    throw new AppError(
      `Failed to update customization: ${error.message}`,
      error.statusCode || 500
    );
  }
};

/**
 * Deletes a customization and its images
 * @param {string} id - The ID of the customization to delete
 * @returns {Promise<Object>} Promise that resolves with deletion result
 */
export const deleteCustomization = async (id) => {
  try {
    const pool = dbConn.tb_pool;
    
    // Check if customization exists
    await getCustomizationById(id);
    
    // Start transaction
    await pool.query('START TRANSACTION');
    
    try {
      // Delete customization images first
      await CrudOperations.performCrud({
        operation: 'delete',
        tableName: CUSTOMIZATION_IMAGES_TABLE,
        conditions: { customization_id: id },
        connection: pool
      });
      
      // Delete the customization
      await CrudOperations.performCrud({
        operation: 'delete',
        tableName: CUSTOMIZATIONS_TABLE,
        id: id,
        connection: pool
      });
      
      // Commit transaction
      await pool.query('COMMIT');
      
      return {
        message: 'Customization deleted successfully',
        id
      };
    } catch (error) {
      // Rollback transaction on error
      await pool.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    throw new AppError(
      `Failed to delete customization: ${error.message}`,
      error.statusCode || 500
    );
  }
};

/**
 * Deletes all customizations for a product
 * @param {string} productId - The product ID to delete customizations for
 * @returns {Promise<Object>} Promise that resolves with deletion result
 */
export const deleteCustomizationsByProductId = async (productId) => {
  try {
    const pool = dbConn.tb_pool;
    
    // Get all customizations for this product
    const customizations = await getCustomizationsByProductId(productId);
    
    if (customizations.length === 0) {
      return {
        message: 'No customizations found for this product',
        count: 0
      };
    }
    
    // Start transaction
    await pool.query('START TRANSACTION');
    
    try {
      // Delete customization images first
      for (const customization of customizations) {
        await CrudOperations.performCrud({
          operation: 'delete',
          tableName: CUSTOMIZATION_IMAGES_TABLE,
          conditions: { customization_id: customization.id },
          connection: pool
        });
      }
      
      // Delete the customizations
      await CrudOperations.performCrud({
        operation: 'delete',
        tableName: CUSTOMIZATIONS_TABLE,
        conditions: { product_id: productId },
        connection: pool
      });
      
      // Commit transaction
      await pool.query('COMMIT');
      
      return {
        message: 'Customizations deleted successfully',
        count: customizations.length
      };
    } catch (error) {
      // Rollback transaction on error
      await pool.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    throw new AppError(
      `Failed to delete customizations: ${error.message}`,
      error.statusCode || 500
    );
  }
};