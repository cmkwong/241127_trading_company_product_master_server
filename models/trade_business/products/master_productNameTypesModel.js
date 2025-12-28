import DataModelUtils from '../../../utils/dataModelUtils.js';
import AppError from '../../../utils/appError.js';
import { PRODUCT_TABLE_MASTER } from '../../tables.js';
import { tradeBusinessDbc } from '../../dbModel.js';

// Table name constants for consistency
const PRODUCT_NAME_TYPES_TABLE =
  PRODUCT_TABLE_MASTER['MASTER_PRODUCT_NAME_TYPES'].name;
const PRODUCT_NAMES_TABLE = PRODUCT_TABLE_MASTER['PRODUCT_NAMES'].name;

// Create DataModelUtils instance for product name types
export const productNameTypeModel = new DataModelUtils({
  dbc: tradeBusinessDbc,
  tableName: PRODUCT_NAME_TYPES_TABLE,
  tableFields: PRODUCT_TABLE_MASTER['MASTER_PRODUCT_NAME_TYPES'].fields,
  entityName: 'product name type',
  requiredFields: ['name'],
  validations: {
    name: { required: true },
  },
});

/**
 * Creates a new product name type
 * @param {Object} nameTypeData - The product name type data to create
 * @param {string} nameTypeData.name - The name of the product name type
 * @param {string} [nameTypeData.description] - Optional description of the product name type
 * @returns {Promise<Object>} Promise that resolves with the created product name type
 */
export const createProductNameType = async (nameTypeData) => {
  try {
    return await productNameTypeModel.create(nameTypeData);
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      throw new AppError(
        'A product name type with this name already exists',
        409
      );
    }
    throw error;
  }
};

/**
 * Gets a product name type by ID
 * @param {string} id - The ID of the product name type to retrieve
 * @returns {Promise<Object>} Promise that resolves with the product name type data
 */
export const getProductNameTypeById = async (id) => {
  return await productNameTypeModel.getById(id);
};

/**
 * Gets all product name types with optional filtering and pagination
 * @param {Object} [options] - Query options
 * @param {string} [options.search] - Search term for product name type name
 * @param {number} [options.page=1] - Page number for pagination
 * @param {number} [options.limit=100] - Number of results per page
 * @returns {Promise<Object>} Promise that resolves with the product name types and pagination info
 */
export const getAllProductNameTypes = async (options = {}) => {
  try {
    const page = options.page || 1;
    const limit = options.limit || 100;
    const offset = (page - 1) * limit;

    // Build the WHERE clause based on filters
    let whereClause = '1=1';
    const params = [];

    if (options.search) {
      whereClause += ' AND name LIKE ?';
      params.push(`%${options.search}%`);
    }

    // Get total count for pagination
    const countSQL = `
      SELECT COUNT(*) as total
      FROM ${PRODUCT_NAME_TYPES_TABLE}
      WHERE ${whereClause}
    `;

    const countResult = await productNameTypeModel.executeQuery(
      countSQL,
      params
    );
    const total = countResult[0].total;

    // Get product name types with pagination and usage count
    const selectSQL = `
      SELECT pt.id, pt.name, pt.description,
             (SELECT COUNT(*) FROM ${PRODUCT_NAMES_TABLE} WHERE name_type_id = pt.id) as usage_count
      FROM ${PRODUCT_NAME_TYPES_TABLE} pt
      WHERE ${whereClause}
      ORDER BY pt.name ASC
      LIMIT ? OFFSET ?
    `;

    // Add pagination parameters
    const queryParams = [...params, limit, offset];
    const productNameTypes = await productNameTypeModel.executeQuery(
      selectSQL,
      queryParams
    );

    return {
      productNameTypes,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    throw new AppError(
      `Failed to get product name types: ${error.message}`,
      500
    );
  }
};

/**
 * Updates a product name type
 * @param {string} id - The ID of the product name type to update
 * @param {Object} updateData - The product name type data to update
 * @param {string} [updateData.name] - The updated name of the product name type
 * @param {string} [updateData.description] - The updated description of the product name type
 * @returns {Promise<Object>} Promise that resolves with the updated product name type
 */
export const updateProductNameType = async (id, updateData) => {
  try {
    return await productNameTypeModel.update(id, updateData);
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      throw new AppError(
        'A product name type with this name already exists',
        409
      );
    }
    throw error;
  }
};

/**
 * Deletes a product name type
 * @param {string} id - The ID of the product name type to delete
 * @param {boolean} [force=false] - Whether to force deletion even if in use
 * @returns {Promise<Object>} Promise that resolves with deletion result
 */
export const deleteProductNameType = async (id, force = false) => {
  try {
    // Check if product name type exists
    await getProductNameTypeById(id);

    // Check if the product name type is in use
    const usageSQL = `
      SELECT COUNT(*) as count 
      FROM ${PRODUCT_NAMES_TABLE} 
      WHERE name_type_id = ?
    `;
    const usageResult = await productNameTypeModel.executeQuery(usageSQL, [id]);
    const usageCount = usageResult[0].count;

    if (usageCount > 0 && !force) {
      throw new AppError(
        `Cannot delete product name type that is in use by ${usageCount} products. Use force=true to override.`,
        400
      );
    }

    // Use transaction for this operation
    return await productNameTypeModel.withTransaction(async (connection) => {
      // If force is true and there are usages, delete the associated product names first
      if (force && usageCount > 0) {
        const deleteNamesSQL = `DELETE FROM ${PRODUCT_NAMES_TABLE} WHERE name_type_id = ?`;
        await productNameTypeModel.executeQuery(deleteNamesSQL, [id]);
      }

      // Delete the product name type
      await productNameTypeModel.delete(id);

      return {
        message: 'Product name type deleted successfully',
        deletedAssociations: force ? usageCount : 0,
      };
    });
  } catch (error) {
    throw new AppError(
      `Failed to delete product name type: ${error.message}`,
      error.statusCode || 500
    );
  }
};

/**
 * Gets products using a specific product name type
 * @param {string} nameTypeId - The ID of the product name type
 * @param {Object} [options] - Query options
 * @param {number} [options.page=1] - Page number for pagination
 * @param {number} [options.limit=20] - Number of results per page
 * @returns {Promise<Object>} Promise that resolves with products and pagination info
 */
export const getProductsByNameType = async (nameTypeId, options = {}) => {
  try {
    // Check if product name type exists
    await getProductNameTypeById(nameTypeId);

    const page = options.page || 1;
    const limit = options.limit || 20;
    const offset = (page - 1) * limit;

    // Get total count for pagination
    const countSQL = `
      SELECT COUNT(DISTINCT p.id) as total
      FROM products p
      JOIN product_names pn ON p.id = pn.product_id
      WHERE pn.name_type_id = ?
    `;

    const countResult = await productNameTypeModel.executeQuery(countSQL, [
      nameTypeId,
    ]);
    const total = countResult[0].total;

    // Get products with pagination
    const selectSQL = `
      SELECT p.id, p.product_id, p.icon_url, p.remark,
             pn.name as name_of_this_type,
             (SELECT GROUP_CONCAT(DISTINCT pn2.name ORDER BY pn2.name_type_id SEPARATOR '|') 
              FROM product_names pn2 
              WHERE pn2.product_id = p.id) as all_names
      FROM products p
      JOIN product_names pn ON p.id = pn.product_id
      WHERE pn.name_type_id = ?
      GROUP BY p.id
      ORDER BY p.product_id ASC
      LIMIT ? OFFSET ?
    `;

    const products = await productNameTypeModel.executeQuery(selectSQL, [
      nameTypeId,
      limit,
      offset,
    ]);

    // Format product names
    products.forEach((product) => {
      if (product.all_names) {
        product.all_names = product.all_names.split('|');
      } else {
        product.all_names = [];
      }
    });

    return {
      products,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    throw new AppError(
      `Failed to get products by name type: ${error.message}`,
      error.statusCode || 500
    );
  }
};

/**
 * Batch creates multiple product name types
 * @param {Array<Object>} nameTypes - Array of product name type objects to create
 * @returns {Promise<Object>} Promise that resolves with creation results
 */
export const batchCreateProductNameTypes = async (nameTypes) => {
  try {
    return await productNameTypeModel.withTransaction(async (connection) => {
      const results = {
        total: nameTypes.length,
        successful: 0,
        failed: 0,
        details: [],
      };

      for (const nameType of nameTypes) {
        try {
          const result = await createProductNameType(nameType);
          results.successful++;
          results.details.push({
            name: nameType.name,
            success: true,
            id: result.productNameType.id,
          });
        } catch (error) {
          results.failed++;
          results.details.push({
            name: nameType.name,
            success: false,
            error: error.message,
          });
        }
      }

      return results;
    });
  } catch (error) {
    throw new AppError(
      `Failed to batch create product name types: ${error.message}`,
      500
    );
  }
};

/**
 * Inserts default product name types
 * @returns {Promise<Object>} Promise that resolves with insertion results
 */
export const insertDefaultProductNameTypes = async () => {
  try {
    // Import product name types from data file
    const defaultProducts = await import('../../../datas/products.js');
    const defaultNameTypes = defaultProducts.default.master_product_name_types;

    const results = await batchCreateProductNameTypes(defaultNameTypes);

    return {
      message: 'Default product name types inserted successfully',
      results,
    };
  } catch (error) {
    throw new AppError(
      `Failed to insert default product name types: ${error.message}`,
      500
    );
  }
};

/**
 * Truncates the product name types table
 * @returns {Promise<Object>} Promise that resolves with truncation result
 */
export const truncateProductNameTypes = async () => {
  try {
    return await productNameTypeModel.truncateTable();
  } catch (error) {
    throw new AppError(
      `Failed to truncate product name types: ${error.message}`,
      500
    );
  }
};
