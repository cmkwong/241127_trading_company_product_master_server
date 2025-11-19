import AppError from '../../../utils/appError.js';
import { v4 as uuidv4 } from 'uuid';
import { TABLE_MASTER } from '../../tables.js';
import DataModelUtils from '../../../utils/dataModelUtils.js';

// Import product link images module
import * as ProductLinkImages from './data_product_link_images.js';

// Create a data model utility for product links
const productLinkModel = new DataModelUtils({
  tableName: TABLE_MASTER['PRODUCT_LINKS'].name,
  entityName: 'product link',
  entityIdField: 'product_id',
  requiredFields: ['product_id', 'link_type', 'url'],
  validations: {
    product_id: { required: true },
    link_type: { required: true },
    url: { required: true },
    title: { required: false },
    description: { required: false },
  },
  defaults: {
    id: uuidv4,
  },
});

/**
 * Creates a new product link
 * @param {Object} data - The product link data
 * @param {string} data.product_id - The product ID this link belongs to
 * @param {string} data.link_type - The type of link (e.g., 'website', 'video', 'social')
 * @param {string} data.url - The URL of the link
 * @param {string} [data.title] - Optional title for the link
 * @param {string} [data.description] - Optional description for the link
 * @param {Array<Object>} [data.images] - Optional array of base64 image data
 * @returns {Promise<Object>} Promise that resolves with the created product link
 */
export const createProductLink = async (data) => {
  try {
    // Start transaction
    await productLinkModel.beginTransaction();

    try {
      // Extract images from the data as they're handled separately
      const images = data.images;

      // Create a copy of the data to avoid modifying the original
      const linkData = { ...data };
      delete linkData.images;

      // Create the product link
      const result = await productLinkModel.create(linkData);
      const productLinkId = result.productLink.id;

      // Add images if provided
      if (images && images.length > 0) {
        await ProductLinkImages.updateProductLinkImagesFromBase64(
          productLinkId,
          images
        );
      }

      // Commit transaction
      await productLinkModel.commitTransaction();

      // Get the complete product link with images
      const productLink = await getProductLinkById(productLinkId, true);

      return {
        message: 'Product link created successfully',
        productLink,
      };
    } catch (error) {
      // Rollback transaction on error
      await productLinkModel.rollbackTransaction();
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
 * Gets a product link by ID
 * @param {string} id - The ID of the product link to retrieve
 * @param {boolean} [includeImages=false] - Whether to include link images
 * @returns {Promise<Object>} Promise that resolves with the product link data
 */
export const getProductLinkById = async (id, includeImages = false) => {
  try {
    // Get the product link
    const productLink = await productLinkModel.getById(id);

    // Include images if requested
    if (includeImages) {
      productLink.images = await ProductLinkImages.getProductLinkImagesByLinkId(
        id
      );
    }

    return productLink;
  } catch (error) {
    throw new AppError(
      `Failed to get product link: ${error.message}`,
      error.statusCode || 500
    );
  }
};

/**
 * Gets all product links for a product
 * @param {string} productId - The product ID to get links for
 * @param {boolean} [includeImages=false] - Whether to include link images
 * @returns {Promise<Array>} Promise that resolves with the product links
 */
export const getProductLinksByProductId = async (
  productId,
  includeImages = false
) => {
  try {
    // Get all product links for this product
    const productLinks = await productLinkModel.getAllByParentId(productId);

    // Include images if requested
    if (includeImages && productLinks.length > 0) {
      for (const link of productLinks) {
        link.images = await ProductLinkImages.getProductLinkImagesByLinkId(
          link.id
        );
      }
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
 * @param {string} [data.link_type] - The updated link type
 * @param {string} [data.url] - The updated URL
 * @param {string} [data.title] - The updated title
 * @param {string} [data.description] - The updated description
 * @param {Array<Object>} [data.images] - Updated array of base64 image data
 * @returns {Promise<Object>} Promise that resolves with the updated product link
 */
export const updateProductLink = async (id, data) => {
  try {
    // Check if product link exists
    await productLinkModel.getById(id);

    // Start transaction
    await productLinkModel.beginTransaction();

    try {
      // Extract images from the data as they're handled separately
      const images = data.images;

      // Create a copy of the data to avoid modifying the original
      const updateData = { ...data };
      delete updateData.images;

      // Update product link data if there are fields to update
      if (Object.keys(updateData).length > 0) {
        await productLinkModel.update(id, updateData);
      }

      // Update images if provided
      if (images !== undefined) {
        await ProductLinkImages.updateProductLinkImagesFromBase64(id, images);
      }

      // Commit transaction
      await productLinkModel.commitTransaction();

      // Get the updated product link
      const productLink = await getProductLinkById(id, true);

      return {
        message: 'Product link updated successfully',
        productLink,
      };
    } catch (error) {
      // Rollback transaction on error
      await productLinkModel.rollbackTransaction();
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
    // Check if product link exists
    await productLinkModel.getById(id);

    // Start transaction
    await productLinkModel.beginTransaction();

    try {
      // Delete product link images first
      await ProductLinkImages.deleteProductLinkImagesByLinkId(id);

      // Delete the product link
      await productLinkModel.delete(id);

      // Commit transaction
      await productLinkModel.commitTransaction();

      return {
        message: 'Product link deleted successfully',
        id,
      };
    } catch (error) {
      // Rollback transaction on error
      await productLinkModel.rollbackTransaction();
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
 * Deletes all product links for a product
 * @param {string} productId - The product ID to delete links for
 * @returns {Promise<Object>} Promise that resolves with deletion result
 */
export const deleteProductLinksByProductId = async (productId) => {
  try {
    // Get all product links for this product
    const productLinks = await getProductLinksByProductId(productId);

    if (productLinks.length === 0) {
      return {
        message: 'No product links found for this product',
        count: 0,
      };
    }

    // Start transaction
    await productLinkModel.beginTransaction();

    try {
      // Delete product link images first for each link
      for (const link of productLinks) {
        await ProductLinkImages.deleteProductLinkImagesByLinkId(link.id);
      }

      // Delete all product links for this product
      await productLinkModel.deleteAllByParentId(productId);

      // Commit transaction
      await productLinkModel.commitTransaction();

      return {
        message: 'Product links deleted successfully',
        count: productLinks.length,
      };
    } catch (error) {
      // Rollback transaction on error
      await productLinkModel.rollbackTransaction();
      throw error;
    }
  } catch (error) {
    throw new AppError(
      `Failed to delete product links: ${error.message}`,
      error.statusCode || 500
    );
  }
};

/**
 * Updates or creates product links for a product (upsert operation)
 * @param {string} productId - The product ID
 * @param {Array<Object>} productLinks - Array of product link objects
 * @returns {Promise<Object>} Promise that resolves with upsert result
 */
export const upsertProductLinks = async (productId, productLinks) => {
  try {
    // Start transaction
    await productLinkModel.beginTransaction();

    try {
      // Get existing product links
      const existingLinks = await getProductLinksByProductId(productId);

      // Delete all existing product links and their images
      if (existingLinks.length > 0) {
        for (const link of existingLinks) {
          // Delete images first
          await ProductLinkImages.deleteProductLinkImagesByLinkId(link.id);
        }

        // Delete product links
        await productLinkModel.deleteAllByParentId(productId);
      }

      // Create new product links
      const createdLinks = [];

      for (const linkData of productLinks) {
        // Ensure product_id is set
        linkData.product_id = productId;

        // Extract images
        const images = linkData.images || [];
        const dataToCreate = { ...linkData };
        delete dataToCreate.images;

        // Generate ID if not provided
        if (!dataToCreate.id) {
          dataToCreate.id = uuidv4();
        }

        // Create product link
        await productLinkModel.create(dataToCreate);

        // Add images
        if (images.length > 0) {
          await ProductLinkImages.updateProductLinkImagesFromBase64(
            dataToCreate.id,
            images
          );
        }

        // Get complete product link with images
        const productLink = await getProductLinkById(dataToCreate.id, true);
        createdLinks.push(productLink);
      }

      // Commit transaction
      await productLinkModel.commitTransaction();

      return {
        message: 'Product links updated successfully',
        deleted: existingLinks.length,
        created: createdLinks.length,
        productLinks: createdLinks,
      };
    } catch (error) {
      // Rollback transaction on error
      await productLinkModel.rollbackTransaction();
      throw error;
    }
  } catch (error) {
    throw new AppError(
      `Failed to update product links: ${error.message}`,
      error.statusCode || 500
    );
  }
};
