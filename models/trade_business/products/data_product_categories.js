import { PRODUCT_TABLE_MASTER } from '../../tables.js';
import DataModelUtils from '../../../utils/dataModelUtils.js';
import AppError from '../../../utils/appError.js';
import * as master_categoriesModel from '../../../models/trade_business/products/master_categoriesModel.js';
import { tradeBusinessDbc } from '../../dbModel.js';

// Create a data model utility for product categories with multiple joins
export const productCategoryModel = new DataModelUtils({
  dbc: tradeBusinessDbc,
  tableName: PRODUCT_TABLE_MASTER['PRODUCT_CATEGORIES'].name,
  tableFields: PRODUCT_TABLE_MASTER['PRODUCT_CATEGORIES'].fields,
  entityName: 'product category',
  entityIdField: 'product_id',
  requiredFields: ['product_id', 'category_id'],
  validations: {
    category_id: { required: true },
    bulk_id: { required: false },
  },
  joinConfig: [
    {
      joinTable: 'master_categories',
      joinField: 'category_id',
      targetField: 'id', // Optional, defaults to 'id'
      selectFields:
        'master_categories.name as category_name, master_categories.description as category_description, master_categories.parent_id',
      orderBy: 'master_categories.name',
    },
  ],
});

/**
 * Gets categories with hierarchical structure
 * @returns {Promise<Array>} Promise that resolves with the hierarchical categories
 */
export const getCategoryHierarchy = async () => {
  try {
    // Get all categories first
    const allCategories = await master_categoriesModel.getAllCategories();

    // Build hierarchy
    const categoryMap = {};
    const rootCategories = [];

    // First pass: map categories by ID
    allCategories.forEach((category) => {
      categoryMap[category.id] = {
        ...category,
        children: [],
      };
    });

    // Second pass: build the hierarchy
    allCategories.forEach((category) => {
      if (category.parent_id) {
        // This is a child category
        if (categoryMap[category.parent_id]) {
          categoryMap[category.parent_id].children.push(
            categoryMap[category.id]
          );
        } else {
          // Parent not found, treat as root
          rootCategories.push(categoryMap[category.id]);
        }
      } else {
        // This is a root category
        rootCategories.push(categoryMap[category.id]);
      }
    });

    return rootCategories;
  } catch (error) {
    throw new AppError(
      `Failed to get category hierarchy: ${error.message}`,
      error.statusCode || 500
    );
  }
};

/**
 * Gets products by category ID
 * @param {number} categoryId - The category ID
 * @returns {Promise<Array>} Promise that resolves with the products in the category
 */
export const getProductsByCategoryId = async (categoryId) => {
  try {
    const result = await productCategoryModel.executeQuery(
      `
      SELECT p.* 
      FROM products p
      JOIN ${PRODUCT_TABLE_MASTER['PRODUCT_CATEGORIES'].name} pc ON p.id = pc.product_id
      WHERE pc.category_id = ?
      ORDER BY p.name
      `,
      [categoryId]
    );
    return result;
  } catch (error) {
    throw new AppError(
      `Failed to get products by category: ${error.message}`,
      error.statusCode || 500
    );
  }
};
