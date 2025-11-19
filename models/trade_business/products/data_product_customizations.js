import AppError from '../../../utils/appError.js';
import { v4 as uuidv4 } from 'uuid';
import { TABLE_MASTER } from '../../tables.js';
import DataModelUtils from '../../../utils/dataModelUtils.js';

// Create a data model utility for product customizations
const customizationModel = new DataModelUtils({
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
});

// Create a data model utility for customization images
const customizationImageModel = new DataModelUtils({
  tableName: TABLE_MASTER['PRODUCT_CUSTOMIZATION_IMAGES'].name,
  entityName: 'customization image',
  entityIdField: 'customization_id',
  requiredFields: ['customization_id', 'image_url'],
  validations: {
    image_url: { required: true },
  },
  fileConfig: {
    fileUrlField: 'image_url',
    uploadDir: 'public/uploads/customizations/{id}',
    imagesOnly: true,
  },
});

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
    // Start transaction
    await customizationModel.beginTransaction();
    try {
      // Extract images from the data as they're handled separately
      const images = data.images;

      // Create a copy of the data to avoid modifying the original
      const customizationData = { ...data };
      delete customizationData.images;

      // Create the customization using the model
      const result = await customizationModel.create(customizationData);
      const customizationId = result.customization.id;
      // Add customization images if provided
      if (images && images.length > 0) {
        const imageData = images.map((imageUrl, index) => ({
          customization_id: customizationId,
          image_url: imageUrl,
          display_order: index,
        }));

        // Use bulkcreate through executeQuery
        await customizationImageModel.executeQuery(
          `INSERT INTO ${TABLE_MASTER['PRODUCT_CUSTOMIZATION_IMAGES'].name} 
           (customization_id, image_url, display_order) VALUES ?`,
          [
            imageData.map((img) => [
              img.customization_id,
              img.image_url,
              img.display_order,
            ]),
          ]
        );
      }

      // Commit transaction
      await customizationModel.commitTransaction();
      // Get the complete customization with images
      const customization = await getCustomizationById(customizationId);

      return {
        message: 'Customization created successfully',
        customization,
      };
    } catch (error) {
      // Rollback transaction on error
      await customizationModel.rollbackTransaction();
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
    // Get the customization using the model
    const customization = await customizationModel.getById(id);
    // Get customization images
    const images = await customizationImageModel.getAllByParentId(id);
    customization.images = images.map((img) => img.image_url);
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
    // Get all customizations for this product using the model
    const customizations = await customizationModel.getAllByParentId(productId);
    // Get images for each customization
    for (const customization of customizations) {
      const images = await customizationImageModel.getAllByParentId(
        customization.id
      );
      customization.images = images.map((img) => img.image_url);
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
    // Check if customization exists
    await customizationModel.getById(id);

    // Start transaction
    await customizationModel.beginTransaction();
    try {
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
        // Delete existing images
        await customizationImageModel.deleteAllByParentId(id);
        // Add new images
        if (images && images.length > 0) {
          const imageData = images.map((imageUrl, index) => ({
            customization_id: id,
            image_url: imageUrl,
            display_order: index,
          }));

          // Use bulkcreate through executeQuery
          await customizationImageModel.executeQuery(
            `INSERT INTO ${TABLE_MASTER['PRODUCT_CUSTOMIZATION_IMAGES'].name} 
             (customization_id, image_url, display_order) VALUES ?`,
            [
              imageData.map((img) => [
                img.customization_id,
                img.image_url,
                img.display_order,
              ]),
            ]
          );
        }
      }

      // Commit transaction
      await customizationModel.commitTransaction();
      // Get the updated customization
      const customization = await getCustomizationById(id);

      return {
        message: 'Customization updated successfully',
        customization,
      };
    } catch (error) {
      // Rollback transaction on error
      await customizationModel.rollbackTransaction();
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
    // Check if customization exists
    await customizationModel.getById(id);

    // Start transaction
    await customizationModel.beginTransaction();
    try {
      // Delete customization images first
      await customizationImageModel.deleteAllByParentId(id);
      // Delete the customization
      await customizationModel.delete(id);
      // Commit transaction
      await customizationModel.commitTransaction();
      return {
        message: 'Customization deleted successfully',
        id,
      };
    } catch (error) {
      // Rollback transaction on error
      await customizationModel.rollbackTransaction();
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
    // Get all customizations for this product
    const customizations = await getCustomizationsByProductId(productId);

    if (customizations.length === 0) {
      return {
        message: 'No customizations found for this product',
        count: 0,
      };
    }

    // Start transaction
    await customizationModel.beginTransaction();
    try {
      // Delete customization images first for each customization
      for (const customization of customizations) {
        await customizationImageModel.deleteAllByParentId(customization.id);
      }

      // Delete all customizations for this product
      await customizationModel.deleteAllByParentId(productId);
      // Commit transaction
      await customizationModel.commitTransaction();
      return {
        message: 'Customizations deleted successfully',
        count: customizations.length,
      };
    } catch (error) {
      // Rollback transaction on error
      await customizationModel.rollbackTransaction();
      throw error;
    }
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
    // Start transaction
    await customizationModel.beginTransaction();

    try {
      // Get existing customizations
      const existingCustomizations = await getCustomizationsByProductId(
        productId
      );

      // Delete all existing customizations and their images
      if (existingCustomizations.length > 0) {
        for (const customization of existingCustomizations) {
          // Delete images first
          await customizationImageModel.deleteAllByParentId(customization.id);
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
          const imageData = images.map((imageUrl, index) => ({
            customization_id: dataToCreate.id,
            image_url: imageUrl,
            display_order: index,
          }));

          await customizationImageModel.executeQuery(
            `INSERT INTO ${TABLE_MASTER['PRODUCT_CUSTOMIZATION_IMAGES'].name} 
             (customization_id, image_url, display_order) VALUES ?`,
            [
              imageData.map((img) => [
                img.customization_id,
                img.image_url,
                img.display_order,
              ]),
            ]
          );
        }

        // Get complete customization with images
        const customization = await getCustomizationById(dataToCreate.id);
        createdCustomizations.push(customization);
      }

      // Commit transaction
      await customizationModel.commitTransaction();

      return {
        message: 'Customizations updated successfully',
        deleted: existingCustomizations.length,
        created: createdCustomizations.length,
        customizations: createdCustomizations,
      };
    } catch (error) {
      // Rollback transaction on error
      await customizationModel.rollbackTransaction();
      throw error;
    }
  } catch (error) {
    throw new AppError(
      `Failed to update customizations: ${error.message}`,
      error.statusCode || 500
    );
  }
};
