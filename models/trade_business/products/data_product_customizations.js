import AppError from '../../../utils/appError.js';
import { v4 as uuidv4 } from 'uuid';
import { TABLE_MASTER } from '../../tables.js';
import DataModelUtils from '../../../utils/dataModelUtils.js';
import * as CustomizationImages from './data_product_customization_images.js';

// Create a data model utility for product customizations
export const customizationModel = new DataModelUtils({
  tableName: TABLE_MASTER['PRODUCT_CUSTOMIZATIONS'].name,
  entityName: 'customization',
  entityIdField: 'product_id',
  requiredFields: ['product_id', 'name'],
  validations: {
    name: { required: true },
    code: { required: false },
    remark: { required: false },
  },
  defaults: {
    id: uuidv4,
  },
  // Add relationship with child table (customization images)
  childTableConfig: [
    {
      tableName: TABLE_MASTER['PRODUCT_CUSTOMIZATION_IMAGES'].name,
      connectedKeys: { id: 'customization_id' }, // parent table -> child table
    },
  ],
});

/**
 * Gets all customizations for a product
 * @param {string} productId - The product ID to get customizations for
 * @param {boolean} [includeImages=false] - Whether to include images
 * @param {Object} [imageOptions] - Optional image options for base64 retrieval
 * @param {boolean} [imageOptions.includeBase64=false] - Whether to include base64 image data
 * @param {boolean} [imageOptions.compress=false] - Whether to compress images
 * @returns {Promise<Array>} Promise that resolves with the customizations
 */
export const getCustomizationsByProductId = async (
  productId,
  includeImages = false,
  imageOptions = {}
) => {
  try {
    // Get all customizations for this product using the model
    const customizations = await customizationModel.getAllByParentId(productId);

    // Include images if requested
    if (includeImages && customizations.length > 0) {
      for (const customization of customizations) {
        if (imageOptions.includeBase64) {
          // Get images with base64 content
          const images =
            await CustomizationImages.getCustomizationImagesWithBase64ByCustomizationId(
              customization.id,
              {
                compress: imageOptions.compress || false,
                maxWidth: imageOptions.maxWidth || 800,
                maxHeight: imageOptions.maxHeight || 800,
                quality: imageOptions.quality || 0.7,
              }
            );
          customization.images = images;
        } else {
          // Get just the image metadata
          const images =
            await CustomizationImages.getCustomizationImagesByCustomizationId(
              customization.id
            );
          customization.images = images;
        }
      }
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
 * Gets a customization by ID with its images
 * @param {string} id - The ID of the customization to retrieve
 * @param {boolean} [includeImages=true] - Whether to include images
 * @param {Object} [imageOptions] - Optional image options for base64 retrieval
 * @param {boolean} [imageOptions.includeBase64=false] - Whether to include base64 image data
 * @param {boolean} [imageOptions.compress=false] - Whether to compress images
 * @returns {Promise<Object>} Promise that resolves with the customization data
 */
export const getCustomizationById = async (
  id,
  includeImages = true,
  imageOptions = {}
) => {
  try {
    // Get the customization using the model
    const customization = await customizationModel.getById(id);

    // Include images if requested
    if (includeImages) {
      if (imageOptions.includeBase64) {
        // Get images with base64 content
        const images =
          await CustomizationImages.getCustomizationImagesWithBase64ByCustomizationId(
            id,
            {
              compress: imageOptions.compress || false,
              maxWidth: imageOptions.maxWidth || 800,
              maxHeight: imageOptions.maxHeight || 800,
              quality: imageOptions.quality || 0.7,
            }
          );
        customization.images = images;
      } else {
        // Get just the image metadata
        const images =
          await CustomizationImages.getCustomizationImagesByCustomizationId(id);
        customization.images = images;
      }
    }

    return customization;
  } catch (error) {
    throw new AppError(
      `Failed to get customization: ${error.message}`,
      error.statusCode || 500
    );
  }
};

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
    return await customizationModel.withTransaction(async () => {
      // Extract images from the data as they're handled separately
      const images = data.images;

      // Create a copy of the data to avoid modifying the original
      const customizationData = { ...data };
      delete customizationData.images;

      // Create the customization using the model
      const result = await customizationModel.create(customizationData);
      const customization_id = result.customization.id;

      // Add customization images if provided
      if (images && images.length > 0) {
        images.forEach(async (image) => {
          await CustomizationImages.addCustomizationImageFromBase64({
            ...image,
            customization_id,
          });
        });
      }

      // Get the complete customization with images
      const customization = await getCustomizationById(customization_id);

      return {
        message: 'Customization created successfully',
        customization,
      };
    });
  } catch (error) {
    throw new AppError(
      `Failed to create customization: ${error.message}`,
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
    // Check if customization exists
    await customizationModel.getById(id);

    return await customizationModel.withTransaction(async () => {
      // Extract images from the data as they're handled separately
      const images = data.images;

      // Create a copy of the data to avoid modifying the original
      const updateData = { ...data };
      delete updateData.images;

      // Update customization data if there are fields to update
      if (Object.keys(updateData).length > 0) {
        await customizationModel.update(id, updateData);
      }

      // Update images if provided
      if (images !== undefined) {
        await CustomizationImages.upsertCustomizationImages(id, images);
      }

      // Get the updated customization
      const customization = await getCustomizationById(id);

      return {
        message: 'Customization updated successfully',
        customization,
      };
    });
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
    return await customizationModel.withTransaction(async () => {
      // Delete customization images first
      await CustomizationImages.deleteCustomizationImagesByCustomizationId(id);

      // Delete the customization
      await customizationModel.delete(id);

      return {
        message: 'Customization deleted successfully',
        id,
      };
    });
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
    // Get all customizations for this product
    const customizations = await getCustomizationsByProductId(productId);

    if (customizations.length === 0) {
      return {
        message: 'No customizations found for this product',
        count: 0,
      };
    }

    return await customizationModel.withTransaction(async () => {
      // Delete customization images first for each customization
      for (const customization of customizations) {
        await CustomizationImages.deleteCustomizationImagesByCustomizationId(
          customization.id
        );
      }

      // Delete all customizations for this product
      await customizationModel.deleteAllByParentId(productId);

      return {
        message: 'Customizations deleted successfully',
        count: customizations.length,
      };
    });
  } catch (error) {
    throw new AppError(
      `Failed to delete customizations: ${error.message}`,
      error.statusCode || 500
    );
  }
};

/**
 * Updates or creates customizations for a product (upsert operation)
 * @param {string} productId - The product ID
 * @param {Array<Object>} customizations - Array of customization objects
 * @returns {Promise<Object>} Promise that resolves with upsert result
 */
export const upsertCustomizations = async (productId, customizations) => {
  try {
    return await customizationModel.withTransaction(async () => {
      // Get existing customizations
      const existingCustomizations = await getCustomizationsByProductId(
        productId
      );

      // Delete all existing customizations and their images
      if (existingCustomizations.length > 0) {
        for (const customization of existingCustomizations) {
          // Delete images first
          await CustomizationImages.deleteCustomizationImagesByCustomizationId(
            customization.id
          );
        }
        // Delete customizations
        await customizationModel.deleteAllByParentId(productId);
      }

      // Create new customizations
      const createdCustomizations = [];

      for (const customizationData of customizations) {
        // Ensure product_id is set
        customizationData.product_id = productId;

        // Extract images
        const images = customizationData.images || [];
        const dataToCreate = { ...customizationData };
        delete dataToCreate.images;

        // Generate ID if not provided
        if (!dataToCreate.id) {
          dataToCreate.id = uuidv4();
        }

        // Create customization
        await customizationModel.create(dataToCreate);

        // Add images
        if (images.length > 0) {
          await CustomizationImages.upsertCustomizationImages(
            dataToCreate.id,
            images
          );
        }

        // Get complete customization with images
        const customization = await getCustomizationById(dataToCreate.id);
        createdCustomizations.push(customization);
      }

      return {
        message: 'Customizations updated successfully',
        deleted: existingCustomizations.length,
        created: createdCustomizations.length,
        customizations: createdCustomizations,
      };
    });
  } catch (error) {
    throw new AppError(
      `Failed to update customizations: ${error.message}`,
      error.statusCode || 500
    );
  }
};

/**
 * Adds a base64 image to a customization
 * @param {Object} data - The image data
 * @param {string} data.customization_id - The customization ID
 * @param {string} data.base64_image - The base64 image data
 * @param {string} [data.description] - Optional image description
 * @returns {Promise<Object>} Promise that resolves with the added image
 */
export const addCustomizationImageFromBase64 = async (data) => {
  try {
    // Check if customization exists
    await customizationModel.getById(data.customization_id);

    // Add the image
    return await CustomizationImages.addCustomizationImageFromBase64(data);
  } catch (error) {
    throw new AppError(
      `Failed to add customization image: ${error.message}`,
      error.statusCode || 500
    );
  }
};

/**
 * Updates customization images from base64 data
 * @param {string} customizationId - The customization ID
 * @param {Array<Object>} base64Images - Array of base64 image data
 * @returns {Promise<Object>} Promise that resolves with the updated images
 */
export const updateCustomizationImagesFromBase64 = async (
  customizationId,
  base64Images
) => {
  try {
    // Check if customization exists
    await customizationModel.getById(customizationId);

    // Update the images
    return await CustomizationImages.updateCustomizationImagesFromBase64(
      customizationId,
      base64Images
    );
  } catch (error) {
    throw new AppError(
      `Failed to update customization images: ${error.message}`,
      error.statusCode || 500
    );
  }
};
