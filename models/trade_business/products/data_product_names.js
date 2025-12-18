import AppError from '../../../utils/appError.js';
import { v4 as uuidv4 } from 'uuid';
import { TABLE_MASTER } from '../../tables.js';
import DataModelUtils from '../../../utils/dataModelUtils.js';

// Create a data model utility for product names
export const productNameModel = new DataModelUtils({
  tableName: TABLE_MASTER['PRODUCT_NAMES'].name,
  tableFields: TABLE_MASTER['PRODUCT_NAMES'].fields,
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
    joinTable: 'master_product_name_types',
    joinField: 'name_type_id',
    selectFields: 'master_product_name_types.name as type_name',
    orderBy: 'product_names.name_type_id',
  },
  database: 'trade_business', // Explicitly specify the database
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
export const createProductName = (data) => productNameModel.create(data);

/**
 * Gets a product name by ID
 * @param {string} id - The ID of the product name to retrieve
 * @returns {Promise<Object>} Promise that resolves with the product name data
 */
export const getProductNameById = (id) => productNameModel.getById(id);

/**
 * Gets all names for a product
 * @param {string} productId - The product ID to get names for
 * @returns {Promise<Array>} Promise that resolves with the product names
 */
export const getProductNamesByProductId = (productId) =>
  productNameModel.getAllByParentId(productId);

/**
 * Updates a product name
 * @param {string} id - The ID of the product name to update
 * @param {Object} data - The product name data to update
 * @param {string} [data.name] - The updated name
 * @param {number} [data.name_type_id] - The updated name type ID
 * @returns {Promise<Object>} Promise that resolves with the updated product name
 */
export const updateProductName = (id, data) =>
  productNameModel.update(id, data);

/**
 * Deletes a product name
 * @param {string} id - The ID of the product name to delete
 * @returns {Promise<Object>} Promise that resolves with deletion result
 */
export const deleteProductName = async (id) => productNameModel.delete(id);

/**
 * Updates or creates product names (upsert operation)
 * @param {string} productId - The product ID
 * @param {Array<{name_type_id: number, name: string}>} names - Array of name objects
 * @returns {Promise<Object>} Promise that resolves with upsert result
 * **/
export const upsertProductNames = (productId, names) =>
  productNameModel.upsertAll(productId, names);

/**
 * Deletes all names for a product
 * @param {string} productId - The product ID to delete names for
 * @returns {Promise<Object>} Promise that resolves with deletion result
 */
export const deleteProductNamesByProductId = (productId) =>
  productNameModel.deleteAllByParentId(productId);

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
