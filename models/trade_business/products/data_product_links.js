import AppError from '../../../utils/appError.js';
import { v4 as uuidv4 } from 'uuid';
import { TABLE_MASTER } from '../../tables.js';
import DataModelUtils from '../../../utils/dataModelUtils.js';
import * as ProductLinkImages from './data_product_link_images.js';

// Create a data model utility for product links
export const productLinkModel = new DataModelUtils({
  tableName: TABLE_MASTER['PRODUCT_LINKS'].name,
  entityName: 'product link',
  entityIdField: 'product_id',
  requiredFields: ['product_id', 'link'],
  validations: {
    product_id: { required: true },
    name: { required: true },
    url: { required: true },
    description: { required: false },
  },
  defaults: {
    id: uuidv4,
  },
});

/**
 * Gets all links for a product
 * @param {string} productId - The product ID to get links for
 * @param {boolean} [includeImages=false] - Whether to include images
 * @param {Object} [imageOptions] - Optional image options for base64 retrieval
 * @param {boolean} [imageOptions.includeBase64=false] - Whether to include base64 image data
 * @param {boolean} [imageOptions.compress=false] - Whether to compress images
 * @returns {Promise<Array>} Promise that resolves with the product links
 */
export const getProductLinksByProductId = async (
  productId,
  includeImages = false,
  imageOptions = {}
) => {
  try {
    // Get all links for this product using the model
    const links = await productLinkModel.getAllByParentId(productId);

    // Include images if requested
    if (includeImages && links.length > 0) {
      for (const link of links) {
        if (imageOptions.includeBase64) {
          // Get images with base64 content
          const images =
            await ProductLinkImages.getProductLinkImagesWithBase64ByLinkId(
              link.id,
              {
                compress: imageOptions.compress || false,
                maxWidth: imageOptions.maxWidth || 800,
                maxHeight: imageOptions.maxHeight || 800,
                quality: imageOptions.quality || 0.7,
              }
            );
          link.images = images;
        } else {
          // Get just the image metadata
          const images = await ProductLinkImages.getProductLinkImagesByLinkId(
            link.id
          );
          link.images = images;
        }
      }
    }

    return links;
  } catch (error) {
    throw new AppError(
      `Failed to get product links: ${error.message}`,
      error.statusCode || 500
    );
  }
};

/**
 * Gets a product link by ID with its images
 * @param {string} id - The ID of the link to retrieve
 * @param {boolean} [includeImages=true] - Whether to include images
 * @param {Object} [imageOptions] - Optional image options for base64 retrieval
 * @param {boolean} [imageOptions.includeBase64=false] - Whether to include base64 image data
 * @param {boolean} [imageOptions.compress=false] - Whether to compress images
 * @returns {Promise<Object>} Promise that resolves with the link data
 */
export const getProductLinkById = async (
  id,
  includeImages = true,
  imageOptions = {}
) => {
  try {
    // Get the link using the model
    const link = await productLinkModel.getById(id);

    // Include images if requested
    if (includeImages) {
      if (imageOptions.includeBase64) {
        // Get images with base64 content
        const images =
          await ProductLinkImages.getProductLinkImagesWithBase64ByLinkId(id, {
            compress: imageOptions.compress || false,
            maxWidth: imageOptions.maxWidth || 800,
            maxHeight: imageOptions.maxHeight || 800,
            quality: imageOptions.quality || 0.7,
          });
        link.images = images;
      } else {
        // Get just the image metadata
        const images = await ProductLinkImages.getProductLinkImagesByLinkId(id);
        link.images = images;
      }
    }

    return link;
  } catch (error) {
    throw new AppError(
      `Failed to get product link: ${error.message}`,
      error.statusCode || 500
    );
  }
};

/**
 * Creates a new product link
 * @param {Object} data - The link data
 * @param {string} data.product_id - The product ID this link belongs to
 * @param {string} data.name - The name of the link
 * @param {string} data.url - The URL for the link
 * @param {string} [data.description] - Optional description for the link
 * @param {string} [data.id] - Optional UUID (generated if not provided)
 * @param {Array<string>} [data.images] - Optional array of image URLs
 * @returns {Promise<Object>} Promise that resolves with the created link
 */
export const createProductLink = async (data) => {
  try {
    return await productLinkModel.withTransaction(async () => {
      // Extract images from the data as they're handled separately
      const images = data.images;

      // Create a copy of the data to avoid modifying the original
      const linkData = { ...data };
      delete linkData.images;

      // Create the link using the model
      const result = await productLinkModel.create(linkData);
      const linkId = result.productLink.id;

      // Add link images if provided
      if (images && images.length > 0) {
        await ProductLinkImages.upsertProductLinkImages(linkId, images);
      }

      // Get the complete link with images
      const link = await getProductLinkById(linkId);

      return {
        message: 'Product link created successfully',
        productLink: link,
      };
    });
  } catch (error) {
    throw new AppError(
      `Failed to create product link: ${error.message}`,
      error.statusCode || 500
    );
  }
};

/**
 * Updates a product link
 * @param {string} id - The ID of the link to update
 * @param {Object} data - The link data to update
 * @param {string} [data.name] - The updated name
 * @param {string} [data.url] - The updated URL
 * @param {string} [data.description] - The updated description
 * @param {Array<string>} [data.images] - Updated array of image URLs
 * @returns {Promise<Object>} Promise that resolves with the updated link
 */
export const updateProductLink = async (id, data) => {
  try {
    // Check if link exists
    await productLinkModel.getById(id);

    return await productLinkModel.withTransaction(async () => {
      // Extract images from the data as they're handled separately
      const images = data.images;

      // Create a copy of the data to avoid modifying the original
      const updateData = { ...data };
      delete updateData.images;

      // Update link data if there are fields to update
      if (Object.keys(updateData).length > 0) {
        await productLinkModel.update(id, updateData);
      }

      // Update images if provided
      if (images !== undefined) {
        await ProductLinkImages.upsertProductLinkImages(id, images);
      }

      // Get the updated link
      const link = await getProductLinkById(id);

      return {
        message: 'Product link updated successfully',
        productLink: link,
      };
    });
  } catch (error) {
    throw new AppError(
      `Failed to update product link: ${error.message}`,
      error.statusCode || 500
    );
  }
};

/**
 * Deletes a product link and its images
 * @param {string} id - The ID of the link to delete
 * @returns {Promise<Object>} Promise that resolves with deletion result
 */
export const deleteProductLink = async (id) => {
  try {
    // Check if link exists
    await productLinkModel.getById(id);

    return await productLinkModel.withTransaction(async () => {
      // Delete link images first
      await ProductLinkImages.deleteProductLinkImagesByLinkId(id);

      // Delete the link
      await productLinkModel.delete(id);

      return {
        message: 'Product link deleted successfully',
        id,
      };
    });
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
    // Get all links for this product
    const links = await getProductLinksByProductId(productId);

    if (links.length === 0) {
      return {
        message: 'No links found for this product',
        count: 0,
      };
    }

    return await productLinkModel.withTransaction(async () => {
      // Delete link images first for each link
      for (const link of links) {
        await ProductLinkImages.deleteProductLinkImagesByLinkId(link.id);
      }

      // Delete all links for this product
      await productLinkModel.deleteAllByParentId(productId);

      return {
        message: 'Product links deleted successfully',
        count: links.length,
      };
    });
  } catch (error) {
    throw new AppError(
      `Failed to delete product links: ${error.message}`,
      error.statusCode || 500
    );
  }
};

/**
 * Updates or creates links for a product (upsert operation)
 * @param {string} productId - The product ID
 * @param {Array<Object>} links - Array of link objects
 * @returns {Promise<Object>} Promise that resolves with upsert result
 */
export const upsertProductLinks = async (productId, links) => {
  try {
    return await productLinkModel.withTransaction(async () => {
      // Get existing links
      const existingLinks = await getProductLinksByProductId(productId);

      // Delete all existing links and their images
      if (existingLinks.length > 0) {
        for (const link of existingLinks) {
          // Delete images first
          await ProductLinkImages.deleteProductLinkImagesByLinkId(link.id);
        }

        // Delete links
        await productLinkModel.deleteAllByParentId(productId);
      }

      // Create new links
      const createdLinks = [];

      for (const linkData of links) {
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

        // Create link
        await productLinkModel.create(dataToCreate);

        // Add images
        if (images.length > 0) {
          await ProductLinkImages.upsertProductLinkImages(
            dataToCreate.id,
            images
          );
        }

        // Get complete link with images
        const link = await getProductLinkById(dataToCreate.id);
        createdLinks.push(link);
      }

      return {
        message: 'Product links updated successfully',
        deleted: existingLinks.length,
        created: createdLinks.length,
        productLinks: createdLinks,
      };
    });
  } catch (error) {
    throw new AppError(
      `Failed to update product links: ${error.message}`,
      error.statusCode || 500
    );
  }
};

/**
 * Adds a base64 image to a product link
 * @param {Object} data - The image data
 * @param {string} data.product_link_id - The product link ID
 * @param {string} data.base64_image - The base64 image data
 * @param {string} [data.description] - Optional image description
 * @returns {Promise<Object>} Promise that resolves with the added image
 */
export const addProductLinkImageFromBase64 = async (data) => {
  try {
    // Check if link exists
    await productLinkModel.getById(data.product_link_id);

    // Add the image
    return await ProductLinkImages.addProductLinkImageFromBase64(data);
  } catch (error) {
    throw new AppError(
      `Failed to add product link image: ${error.message}`,
      error.statusCode || 500
    );
  }
};

/**
 * Updates product link images from base64 data
 * @param {string} productLinkId - The product link ID
 * @param {Array<Object>} base64Images - Array of base64 image data
 * @returns {Promise<Object>} Promise that resolves with the updated images
 */
export const updateProductLinkImagesFromBase64 = async (
  productLinkId,
  base64Images
) => {
  try {
    // Check if link exists
    await productLinkModel.getById(productLinkId);

    // Update the images
    return await ProductLinkImages.updateProductLinkImagesFromBase64(
      productLinkId,
      base64Images
    );
  } catch (error) {
    throw new AppError(
      `Failed to update product link images: ${error.message}`,
      error.statusCode || 500
    );
  }
};
