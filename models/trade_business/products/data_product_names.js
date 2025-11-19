import AppError from '../../../utils/appError.js';
import { v4 as uuidv4 } from 'uuid';
import { TABLE_MASTER } from '../../tables.js';
import DataModelUtils from '../../../utils/dataModelUtils.js';

// Create a data model utility for product names
const productNameModel = new DataModelUtils({
  tableName: TABLE_MASTER['PRODUCT_NAMES'].name,
  entityName: 'product name',
  entityIdField: 'product_id',
  requiredFields: ['product_id', 'name', 'name_type_id'],
  validations: {
    product_id: { required: true },
    name: { required: true },
    name_type_id: { required: true },
  },
  defaults: {
    id: uuidv4,
  },
  joinConfig: {
    joinTable: 'name_types',
    joinField: 'name_type_id',
    selectFields: 'name_types.name as type_name',
    orderBy: 'product_names.name_type_id',
  },
});

/**
 * Creates a new product name
 * @param {Object} data - The product name data
 * @param {string} data.product_id - The product ID this name belongs to
 * @param {string} data.name - The product name
 * @param {number} data.name_type_id - The name type ID (e.g., 1 for English, 2 for Chinese)
 * @param {string} [data.id] - Optional UUID (generated if not provided)
 * @returns {Promise<Object>} Promise that resolves with the created product name
 */
export const createProductName = async (data) => {
  try {
    // Check if a name of this type already exists for this product
    const existingName = await getProductNameByTypeAndProductId(
      data.product_id,
      data.name_type_id
    );

    if (existingName) {
      throw new AppError(
        `A name of type ${data.name_type_id} already exists for this product`,
        409
      );
    }

    // Create the product name using the model
    return await productNameModel.create(data);
  } catch (error) {
    throw new AppError(
      `Failed to create product name: ${error.message}`,
      error.statusCode || 500
    );
  }
};

/**
 * Gets a product name by ID
 * @param {string} id - The ID of the product name to retrieve
 * @returns {Promise<Object>} Promise that resolves with the product name data
 */
export const getProductNameById = async (id) => {
  try {
    return await productNameModel.getById(id);
  } catch (error) {
    throw new AppError(
      `Failed to get product name: ${error.message}`,
      error.statusCode || 500
    );
  }
};

/**
 * Gets a product name by product ID and name type ID
 * @param {string} productId - The product ID
 * @param {number} nameTypeId - The name type ID
 * @returns {Promise<Object|null>} Promise that resolves with the product name data or null if not found
 */
export const getProductNameByTypeAndProductId = async (
  productId,
  nameTypeId
) => {
  try {
    const sql = `
      SELECT * 
      FROM ${productNameModel.tableName}
      WHERE product_id = ? AND name_type_id = ?
      LIMIT 1
    `;

    const results = await productNameModel.executeQuery(sql, [
      productId,
      nameTypeId,
    ]);
    return results.length > 0 ? results[0] : null;
  } catch (error) {
    throw new AppError(
      `Failed to get product name: ${error.message}`,
      error.statusCode || 500
    );
  }
};

/**
 * Gets all names for a product
 * @param {string} productId - The product ID to get names for
 * @returns {Promise<Array>} Promise that resolves with the product names
 */
export const getProductNamesByProductId = async (productId) => {
  try {
    return await productNameModel.getAllByParentId(productId);
  } catch (error) {
    throw new AppError(
      `Failed to get product names: ${error.message}`,
      error.statusCode || 500
    );
  }
};

/**
 * Updates a product name
 * @param {string} id - The ID of the product name to update
 * @param {Object} data - The product name data to update
 * @param {string} [data.name] - The updated name
 * @param {number} [data.name_type_id] - The updated name type ID
 * @returns {Promise<Object>} Promise that resolves with the updated product name
 */
export const updateProductName = async (id, data) => {
  try {
    // Get existing product name
    const existingName = await getProductNameById(id);

    // Check if changing name type and if that type already exists for this product
    if (
      data.name_type_id !== undefined &&
      data.name_type_id !== existingName.name_type_id
    ) {
      const nameWithSameType = await getProductNameByTypeAndProductId(
        existingName.product_id,
        data.name_type_id
      );

      if (nameWithSameType) {
        throw new AppError(
          `A name of type ${data.name_type_id} already exists for this product`,
          409
        );
      }
    }

    // Update the product name using the model
    return await productNameModel.update(id, data);
  } catch (error) {
    throw new AppError(
      `Failed to update product name: ${error.message}`,
      error.statusCode || 500
    );
  }
};

/**
 * Deletes a product name
 * @param {string} id - The ID of the product name to delete
 * @returns {Promise<Object>} Promise that resolves with deletion result
 */
export const deleteProductName = async (id) => {
  try {
    // Delete the product name using the model
    return await productNameModel.delete(id);
  } catch (error) {
    throw new AppError(
      `Failed to delete product name: ${error.message}`,
      error.statusCode || 500
    );
  }
};

/**
 * Updates or creates product names (upsert operation)
 * @param {string} productId - The product ID
 * @param {Array<{name_type_id: number, name: string}>} names - Array of name objects
 * @returns {Promise<Object>} Promise that resolves with upsert result
 */
export const upsertProductNames = async (productId, names) => {
  try {
    // Start transaction
    await productNameModel.beginTransaction();

    try {
      // Get existing names for this product
      const existingNames = await getProductNamesByProductId(productId);
      const existingNamesByType = {};

      existingNames.forEach((name) => {
        existingNamesByType[name.name_type_id] = name;
      });

      const results = {
        created: [],
        updated: [],
      };

      // Process each name
      for (const nameData of names) {
        const existingName = existingNamesByType[nameData.name_type_id];

        if (existingName) {
          // Update existing name if it's different
          if (existingName.name !== nameData.name) {
            const result = await productNameModel.update(existingName.id, {
              name: nameData.name,
            });
            results.updated.push(result.productName);
          } else {
            results.updated.push(existingName);
          }
        } else {
          // Create new name
          const result = await productNameModel.create({
            product_id: productId,
            name_type_id: nameData.name_type_id,
            name: nameData.name,
          });
          results.created.push(result.productName);
        }
      }

      // Commit transaction
      await productNameModel.commitTransaction();

      return {
        message: 'Product names updated successfully',
        created: results.created.length,
        updated: results.updated.length,
        names: await getProductNamesByProductId(productId),
      };
    } catch (error) {
      // Rollback transaction on error
      await productNameModel.rollbackTransaction();
      throw error;
    }
  } catch (error) {
    throw new AppError(
      `Failed to update product names: ${error.message}`,
      error.statusCode || 500
    );
  }
};

/**
 * Deletes all names for a product
 * @param {string} productId - The product ID to delete names for
 * @returns {Promise<Object>} Promise that resolves with deletion result
 */
export const deleteProductNamesByProductId = async (productId) => {
  try {
    // Delete all product names for this product using the model
    return await productNameModel.deleteAllByParentId(productId);
  } catch (error) {
    throw new AppError(
      `Failed to delete product names: ${error.message}`,
      error.statusCode || 500
    );
  }
};
