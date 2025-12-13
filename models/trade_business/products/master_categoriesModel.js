import DataModelUtils from '../../../utils/dataModelUtils.js';
import AppError from '../../../utils/appError.js';
import { TABLE_MASTER } from '../../tables.js';

// Table name constants for consistency
const CATEGORIES_TABLE = TABLE_MASTER['MASTER_CATEGORIES'].name;
const PRODUCT_CATEGORIES_TABLE = TABLE_MASTER['PRODUCT_CATEGORIES'].name;

// Create DataModelUtils instance for categories
const categoryMasterModel = new DataModelUtils({
  tableName: CATEGORIES_TABLE,
  entityName: 'category',
  entityIdField: 'id',
  requiredFields: ['name'],
  validations: {
    name: { required: true },
  },
});

/**
 * Creates a new category
 * @param {Object} categoryData - The category data to create
 * @param {string} categoryData.name - The name of the category
 * @param {string} [categoryData.description] - Optional description of the category
 * @param {number} [categoryData.parent_id] - Optional parent category ID
 * @returns {Promise<Object>} Promise that resolves with the created category
 */
export const createCategory = (categoryData) =>
  categoryMasterModel.create(categoryData);

/**
 * Gets a category by ID
 * @param {number} id - The ID of the category to retrieve
 * @returns {Promise<Object>} Promise that resolves with the category data
 */
export const getCategoryById = async (id) => {
  return await categoryMasterModel.getById(id);
};

/**
 * Gets all categories with optional filtering and pagination
 * @param {Object} [options] - Query options
 * @param {string} [options.search] - Search term for category name
 * @param {number} [options.parentId] - Filter by parent category ID
 * @param {number} [options.page=1] - Page number for pagination
 * @param {number} [options.limit=100] - Number of results per page
 * @returns {Promise<Object>} Promise that resolves with the categories and pagination info
 */
export const getAllCategories = async (options = {}) => {
  try {
    const page = options.page || 1;
    const limit = options.limit || 100;
    const offset = (page - 1) * limit;

    // Build the WHERE clause based on filters
    let whereClause = '1=1';
    const params = [];

    if (options.search) {
      whereClause += ' AND c.name LIKE ?';
      params.push(`%${options.search}%`);
    }

    if (options.parentId !== undefined) {
      if (options.parentId === null) {
        whereClause += ' AND c.parent_id IS NULL';
      } else {
        whereClause += ' AND c.parent_id = ?';
        params.push(options.parentId);
      }
    }

    // Get total count for pagination
    const countSQL = `
      SELECT COUNT(*) as total
      FROM ${CATEGORIES_TABLE} c
      WHERE ${whereClause}
    `;

    const countResult = await categoryMasterModel.executeQuery(
      countSQL,
      params
    );
    const total = countResult[0].total;

    // Get categories with pagination, parent name, and usage count
    const selectSQL = `
      SELECT c.id, c.name, c.description, c.parent_id,
             p.name as parent_name,
             (SELECT COUNT(*) FROM ${PRODUCT_CATEGORIES_TABLE} WHERE category_id = c.id) as usage_count,
             (SELECT COUNT(*) FROM ${CATEGORIES_TABLE} WHERE parent_id = c.id) as child_count
      FROM ${CATEGORIES_TABLE} c
      LEFT JOIN ${CATEGORIES_TABLE} p ON c.parent_id = p.id
      WHERE ${whereClause}
      ORDER BY c.name ASC
      LIMIT ? OFFSET ?
    `;

    // Add pagination parameters
    const queryParams = [...params, limit, offset];
    const categories = await categoryMasterModel.executeQuery(
      selectSQL,
      queryParams
    );

    return {
      categories,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    throw new AppError(`Failed to get categories: ${error.message}`, 500);
  }
};

/**
 * Gets the category hierarchy as a tree structure
 * @returns {Promise<Array>} Promise that resolves with the category tree
 */
export const getCategoryTree = async () => {
  try {
    // Get all categories
    const allCategoriesSQL = `
      SELECT c.id, c.name, c.description, c.parent_id,
             (SELECT COUNT(*) FROM ${PRODUCT_CATEGORIES_TABLE} WHERE category_id = c.id) as usage_count
      FROM ${CATEGORIES_TABLE} c
      ORDER BY c.name ASC
    `;

    const allCategories = await categoryMasterModel.executeQuery(
      allCategoriesSQL
    );

    // Build the tree structure
    const categoryMap = {};
    const rootCategories = [];

    // First, map all categories by ID
    allCategories.forEach((category) => {
      categoryMap[category.id] = {
        ...category,
        children: [],
      };
    });

    // Then, build the tree structure
    allCategories.forEach((category) => {
      if (category.parent_id === null) {
        rootCategories.push(categoryMap[category.id]);
      } else {
        if (categoryMap[category.parent_id]) {
          categoryMap[category.parent_id].children.push(
            categoryMap[category.id]
          );
        } else {
          // If parent doesn't exist, treat as root
          rootCategories.push(categoryMap[category.id]);
        }
      }
    });

    return rootCategories;
  } catch (error) {
    throw new AppError(`Failed to get category tree: ${error.message}`, 500);
  }
};

/**
 * Updates a category
 * @param {number} id - The ID of the category to update
 * @param {Object} updateData - The category data to update
 * @param {string} [updateData.name] - The updated name of the category
 * @param {string} [updateData.description] - The updated description of the category
 * @param {number} [updateData.parent_id] - The updated parent category ID
 * @returns {Promise<Object>} Promise that resolves with the updated category
 */
export const updateCategory = (id, updateData) =>
  categoryMasterModel.update(id, updateData);

/**
 * Checks if one category is a descendant of another
 * @param {number} categoryId - The category to check
 * @param {number} potentialAncestorId - The potential ancestor category
 * @returns {Promise<boolean>} True if categoryId is a descendant of potentialAncestorId
 * @private
 */
const isDescendantOf = async (categoryId, potentialAncestorId) => {
  try {
    const category = await getCategoryById(categoryId);

    if (!category.parent_id) {
      return false;
    }

    if (category.parent_id === potentialAncestorId) {
      return true;
    }

    return await isDescendantOf(category.parent_id, potentialAncestorId);
  } catch (error) {
    throw new AppError(
      `Failed to check category hierarchy: ${error.message}`,
      500
    );
  }
};

/**
 * Deletes a category
 * @param {number} id - The ID of the category to delete
 * @param {boolean} [force=false] - Whether to force deletion even if in use
 * @returns {Promise<Object>} Promise that resolves with deletion result
 */
export const deleteCategory = async (id, force = false) => {
  try {
    // Check if category exists
    await getCategoryById(id);

    // Check if the category has children
    const childrenSQL = `SELECT COUNT(*) as count FROM ${CATEGORIES_TABLE} WHERE parent_id = ?`;
    const childrenResult = await categoryMasterModel.executeQuery(childrenSQL, [
      id,
    ]);
    const childCount = childrenResult[0].count;

    if (childCount > 0 && !force) {
      throw new AppError(
        `Cannot delete category that has ${childCount} subcategories. Use force=true to override.`,
        400
      );
    }

    // Check if the category is in use by products
    const usageSQL = `SELECT COUNT(*) as count FROM ${PRODUCT_CATEGORIES_TABLE} WHERE category_id = ?`;
    const usageResult = await categoryMasterModel.executeQuery(usageSQL, [id]);
    const usageCount = usageResult[0].count;

    if (usageCount > 0 && !force) {
      throw new AppError(
        `Cannot delete category that is in use by ${usageCount} products. Use force=true to override.`,
        400
      );
    }

    // Use transaction for this operation
    return await categoryMasterModel.withTransaction(async (connection) => {
      // If force is true and there are usages, delete the associated product categories first
      if (force && usageCount > 0) {
        const deleteCategoriesSQL = `DELETE FROM ${PRODUCT_CATEGORIES_TABLE} WHERE category_id = ?`;
        await categoryMasterModel.executeQuery(deleteCategoriesSQL, [id]);
      }

      // If force is true and there are children, update children to have no parent
      if (force && childCount > 0) {
        const updateChildrenSQL = `UPDATE ${CATEGORIES_TABLE} SET parent_id = NULL WHERE parent_id = ?`;
        await categoryMasterModel.executeQuery(updateChildrenSQL, [id]);
      }

      // Delete the category
      await categoryMasterModel.delete(id);

      return {
        message: 'Category deleted successfully',
        deletedAssociations: force ? usageCount : 0,
        updatedChildren: force ? childCount : 0,
      };
    });
  } catch (error) {
    throw new AppError(
      `Failed to delete category: ${error.message}`,
      error.statusCode || 500
    );
  }
};

/**
 * Gets products in a specific category
 * @param {number} categoryId - The ID of the category
 * @param {Object} [options] - Query options
 * @param {boolean} [options.includeSubcategories=false] - Whether to include products from subcategories
 * @param {number} [options.page=1] - Page number for pagination
 * @param {number} [options.limit=20] - Number of results per page
 * @returns {Promise<Object>} Promise that resolves with products and pagination info
 */
export const getProductsByCategory = async (categoryId, options = {}) => {
  try {
    // Check if category exists
    await getCategoryById(categoryId);

    const page = options.page || 1;
    const limit = options.limit || 20;
    const offset = (page - 1) * limit;
    const includeSubcategories = options.includeSubcategories || false;

    let categoryIds = [categoryId];

    // If including subcategories, get all descendant category IDs
    if (includeSubcategories) {
      const descendants = await getDescendantCategoryIds(categoryId);
      categoryIds = [...categoryIds, ...descendants];
    }

    // Format the category IDs for the IN clause
    const categoryIdsStr = categoryIds.join(',');

    // Get total count for pagination
    const countSQL = `
      SELECT COUNT(DISTINCT p.id) as total
      FROM products p
      JOIN product_categories pc ON p.id = pc.product_id
      WHERE pc.category_id IN (${categoryIdsStr})
    `;

    const countResult = await categoryMasterModel.executeQuery(countSQL);
    const total = countResult[0].total;

    // Get products with pagination
    const selectSQL = `
      SELECT p.id, p.product_id, p.icon_url, p.remark,
             GROUP_CONCAT(DISTINCT pn.name ORDER BY pn.name_type_id SEPARATOR '|') as names,
             GROUP_CONCAT(DISTINCT c.name ORDER BY c.id SEPARATOR '|') as categories
      FROM products p
      JOIN product_categories pc ON p.id = pc.product_id
      JOIN ${CATEGORIES_TABLE} c ON pc.category_id = c.id
      LEFT JOIN product_names pn ON p.id = pn.product_id
      WHERE pc.category_id IN (${categoryIdsStr})
      GROUP BY p.id
      ORDER BY p.product_id ASC
      LIMIT ? OFFSET ?
    `;

    const products = await categoryMasterModel.executeQuery(selectSQL, [
      limit,
      offset,
    ]);

    // Format product names and categories
    products.forEach((product) => {
      if (product.names) {
        product.names = product.names.split('|');
      } else {
        product.names = [];
      }

      if (product.categories) {
        product.categories = product.categories.split('|');
      } else {
        product.categories = [];
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
      `Failed to get products by category: ${error.message}`,
      error.statusCode || 500
    );
  }
};

/**
 * Gets all descendant category IDs for a given category
 * @param {number} categoryId - The parent category ID
 * @returns {Promise<Array<number>>} Array of descendant category IDs
 * @private
 */
const getDescendantCategoryIds = async (categoryId) => {
  try {
    // Get direct children
    const childrenSQL = `SELECT id FROM ${CATEGORIES_TABLE} WHERE parent_id = ?`;
    const children = await categoryMasterModel.executeQuery(childrenSQL, [
      categoryId,
    ]);

    if (children.length === 0) {
      return [];
    }

    const childIds = children.map((child) => child.id);
    let allDescendants = [...childIds];

    // Recursively get descendants for each child
    for (const childId of childIds) {
      const descendants = await getDescendantCategoryIds(childId);
      allDescendants = [...allDescendants, ...descendants];
    }

    return allDescendants;
  } catch (error) {
    throw new AppError(
      `Failed to get category descendants: ${error.message}`,
      500
    );
  }
};

/**
 * Batch creates multiple categories
 * @param {Array<Object>} categories - Array of category objects to create
 * @returns {Promise<Object>} Promise that resolves with creation results
 */
export const batchCreateCategories = async (categories) => {
  try {
    return await categoryMasterModel.withTransaction(async (connection) => {
      const results = {
        total: categories.length,
        successful: 0,
        failed: 0,
        details: [],
      };

      for (const category of categories) {
        try {
          const result = await createCategory(category);
          results.successful++;
          results.details.push({
            name: category.name,
            success: true,
            id: result.category.id,
          });
        } catch (error) {
          results.failed++;
          results.details.push({
            name: category.name,
            success: false,
            error: error.message,
          });
        }
      }

      return results;
    });
  } catch (error) {
    throw new AppError(
      `Failed to batch create categories: ${error.message}`,
      500
    );
  }
};

/**
 * Truncates the categories table
 * @returns {Promise<Object>} Promise that resolves with truncation result
 */
export const truncateCategories = () => categoryMasterModel.truncateTable();

/**
 * Inserts default categories
 * @returns {Promise<Object>} Promise that resolves with insertion results
 */
export const insertDefaultCategories = async () => {
  try {
    // Import categories from data file
    const defaultProducts = await import('../../../datas/products.js');
    const defaultCategories = defaultProducts.default.master_categories;

    const results = await batchCreateCategories(defaultCategories);

    return {
      message: 'Default categories inserted successfully',
      results,
    };
  } catch (error) {
    throw new AppError(
      `Failed to insert default categories: ${error.message}`,
      500
    );
  }
};
