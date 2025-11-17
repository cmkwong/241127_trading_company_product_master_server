import * as dbConn from '../../../utils/dbConn.js';
import AppError from '../../../utils/appError.js';
import CrudOperations from '../../../utils/crud.js';
import { v4 as uuidv4 } from 'uuid';

// Table name constants for consistency
const PRODUCT_LINKS_TABLE = 'product_links';
const PRODUCT_LINK_IMAGES_TABLE = 'product_link_images';

/**
 * Creates a new product link
 * @param {Object} data - The product link data
 * @param {string} data.product_id - The product ID this link belongs to
 * @param {string} data.link - The URL link
 * @param {string} [data.remark] - Optional remark about the link
 * @param {Date} [data.link_date] - Optional date for the link (defaults to current date)
 * @param {string} [data.id] - Optional UUID (generated if not provided)
 * @param {Array<string>} [data.images] - Optional array of image URLs
 * @returns {Promise<Object>} Promise that resolves with the created product link
 */
export const createProductLink = async (data) => {
  try {
    const pool = dbConn.tb_pool;
    
    // Validate required fields
    if (!data.product_id) {
      throw new AppError('Product ID is required', 400);
    }
    
    if (!data.link) {
      throw new AppError('Link URL is required', 400);
    }
    
    // Generate UUID if not provided
    const linkId = data.id || uuidv4();
    
    // Start transaction
    await pool.query('START TRANSACTION');
    
    try {
      // Create the product link using CRUD utility
      const linkData = {
        id: linkId,
        product_id: data.product_id,
        link: data.link,
        remark: data.remark || null,
        link_date: data.link_date || new Date()
      };
      
      const result = await CrudOperations.performCrud({
        operation: 'create',
        tableName: PRODUCT_LINKS_TABLE,
        data: linkData,
        connection: pool
      });
      
      // Add link images if provided
      if (data.images && data.images.length > 0) {
        const imageData = data.images.map((imageUrl, index) => ({
          product_link_id: linkId,
          image_url: imageUrl,
          display_order: index
        }));
        
        await CrudOperations.performCrud({
          operation: 'bulkcreate',
          tableName: PRODUCT_LINK_IMAGES_TABLE,
          data: imageData,
          connection: pool
        });
      }
      
      // Commit transaction
      await pool.query('COMMIT');
      
      // Get the complete link with images
      const productLink = await getProductLinkById(linkId);
      
      return {
        message: 'Product link created successfully',
        productLink
      };
    } catch (error) {
      // Rollback transaction on error
      await pool.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    throw new AppError(
      `Failed to create product link: ${error.message}`,
      error.statusCode || 500
    );
  }
};

/**
 * Gets a product link by ID with its images
 * @param {string} id - The ID of the product link to retrieve
 * @returns {Promise<Object>} Promise that resolves with the product link data
 */
export const getProductLinkById = async (id) => {
  try {
    const pool = dbConn.tb_pool;
    
    // Get the product link using CRUD utility
    const linkResult = await CrudOperations.performCrud({
      operation: 'read',
      tableName: PRODUCT_LINKS_TABLE,
      id: id,
      connection: pool
    });
    
    if (!linkResult.record) {
      throw new AppError('Product link not found', 404);
    }
    
    const productLink = linkResult.record;
    
    // Get link images
    const imagesSQL = `
      SELECT image_url
      FROM ${PRODUCT_LINK_IMAGES_TABLE}
      WHERE product_link_id = ?
      ORDER BY display_order
    `;
    
    const imagesResult = await pool.query(imagesSQL, [id]);
    productLink.images = imagesResult[0].map(img => img.image_url);
    
    return productLink;
  } catch (error) {
    throw new AppError(
      `Failed to get product link: ${error.message}`,
      error.statusCode || 500
    );
  }
};

/**
 * Gets all links for a product
 * @param {string} productId - The product ID to get links for
 * @returns {Promise<Array>} Promise that resolves with the product links
 */
export const getProductLinksByProductId = async (productId) => {
  try {
    const pool = dbConn.tb_pool;
    
    // Get the product links using CRUD utility
    const result = await CrudOperations.performCrud({
      operation: 'read',
      tableName: PRODUCT_LINKS_TABLE,
      conditions: { product_id: productId },
      connection: pool
    });
    
    const productLinks = result.records;
    
    // Get images for each link
    for (const link of productLinks) {
      const imagesSQL = `
        SELECT image_url
        FROM ${PRODUCT_LINK_IMAGES_TABLE}
        WHERE product_link_id = ?
        ORDER BY display_order
      `;
      
      const imagesResult = await pool.query(imagesSQL, [link.id]);
      link.images = imagesResult[0].map(img => img.image_url);
    }
    
    return productLinks;
  } catch (error) {
    throw new AppError(
      `Failed to get product links: ${error.message}`,
      error.statusCode || 500
    );
  }
};

/**
 * Updates a product link
 * @param {string} id - The ID of the product link to update
 * @param {Object} data - The product link data to update
 * @param {string} [data.link] - The updated URL link
 * @param {string} [data.remark] - The updated remark
 * @param {Date} [data.link_date] - The updated link date
 * @param {Array<string>} [data.images] - Updated array of image URLs
 * @returns {Promise<Object>} Promise that resolves with the updated product link
 */
export const updateProductLink = async (id, data) => {
  try {
    const pool = dbConn.tb_pool;
    
    // Check if product link exists
    await getProductLinkById(id);
    
    // Start transaction
    await pool.query('START TRANSACTION');
    
    try {
      // Update product link data if provided
      if (data.link !== undefined || data.remark !== undefined || data.link_date !== undefined) {
        const updateData = {};
        
        if (data.link !== undefined) {
          updateData.link = data.link;
        }
        
        if (data.remark !== undefined) {
          updateData.remark = data.remark;
        }
        
        if (data.link_date !== undefined) {
          updateData.link_date = data.link_date;
        }
        
        await CrudOperations.performCrud({
          operation: 'update',
          tableName: PRODUCT_LINKS_TABLE,
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
          tableName: PRODUCT_LINK_IMAGES_TABLE,
          conditions: { product_link_id: id },
          connection: pool
        });
        
        // Add new images
        if (data.images && data.images.length > 0) {
          const imageData = data.images.map((imageUrl, index) => ({
            product_link_id: id,
            image_url: imageUrl,
            display_order: index
          }));
          
          await CrudOperations.performCrud({
            operation: 'bulkcreate',
            tableName: PRODUCT_LINK_IMAGES_TABLE,
            data: imageData,
            connection: pool
          });
        }
      }
      
      // Commit transaction
      await pool.query('COMMIT');
      
      // Get the updated product link
      const productLink = await getProductLinkById(id);
      
      return {
        message: 'Product link updated successfully',
        productLink
      };
    } catch (error) {
      // Rollback transaction on error
      await pool.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    throw new AppError(
      `Failed to update product link: ${error.message}`,
      error.statusCode || 500
    );
  }
};

/**
 * Deletes a product link and its images
 * @param {string} id - The ID of the product link to delete
 * @returns {Promise<Object>} Promise that resolves with deletion result
 */
export const deleteProductLink = async (id) => {
  try {
    const pool = dbConn.tb_pool;
    
    // Check if product link exists
    await getProductLinkById(id);
    
    // Start transaction
    await pool.query('START TRANSACTION');
    
    try {
      // Delete product link images first
      await CrudOperations.performCrud({
        operation: 'delete',
        tableName: PRODUCT_LINK_IMAGES_TABLE,
        conditions: { product_link_id: id },
        connection: pool
      });
      
      // Delete the product link
      await CrudOperations.performCrud({
        operation: 'delete',
        tableName: PRODUCT_LINKS_TABLE,
        id: id,
        connection: pool
      });
      
      // Commit transaction
      await pool.query('COMMIT');
      
      return {
        message: 'Product link deleted successfully',
        id
      };
    } catch (error) {
      // Rollback transaction on error
      await pool.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    throw new AppError(
      `Failed to delete product link: ${error.message}`,
      error.statusCode || 500
    );
  }
};

/**
 * Deletes all links for a product
 * @param {string} productId - The product ID to delete links for
 * @returns {Promise<Object>} Promise that resolves with deletion result
 */
export const deleteProductLinksByProductId = async (productId) => {
  try {
    const pool = dbConn.tb_pool;
    
    // Get all links for this product
    const productLinks = await getProductLinksByProductId(productId);
    
    if (productLinks.length === 0) {
      return {
        message: 'No product links found for this product',
        count: 0
      };
    }
    
    // Start transaction
    await pool.query('START TRANSACTION');
    
    try {
      // Delete product link images first
      for (const link of productLinks) {
        await CrudOperations.performCrud({
          operation: 'delete',
          tableName: PRODUCT_LINK_IMAGES_TABLE,
          conditions: { product_link_id: link.id },
          connection: pool
        });
      }
      
      // Delete the product links
      await CrudOperations.performCrud({
        operation: 'delete',
        tableName: PRODUCT_LINKS_TABLE,
        conditions: { product_id: productId },
        connection: pool
      });
      
      // Commit transaction
      await pool.query('COMMIT');
      
      return {
        message: 'Product links deleted successfully',
        count: productLinks.length
      };
    } catch (error) {
      // Rollback transaction on error
      await pool.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    throw new AppError(
      `Failed to delete product links: ${error.message}`,
      error.statusCode || 500
    );
  }
};