import * as dbConn from '../../../utils/dbConn.js';
import * as dbModel from '../../../models/dbModel.js';
import AppError from '../../../utils/appError.js';
import CrudOperations from '../../../utils/crud.js';
import { TABLE_MASTER } from '../../tables.js';

// Table name constant for consistency
const CATEGORIES_TABLE = TABLE_MASTER['CATEGORIES'].name;

/**
 * Creates a new category
 * @param {Object} categoryData - The category data to create
 * @param {string} categoryData.name - The name of the category
 * @param {string} [categoryData.description] - Optional description of the category
 * @param {number} [categoryData.parent_id] - Optional parent category ID for hierarchical structure
 * @returns {Promise<Object>} Promise that resolves with the created category
 */
export const createCategory = async (categoryData) => {
  try {
    const pool = dbConn.tb_pool;

    // Validate required fields
    if (!categoryData.name) {
      throw new AppError('Category name is required', 400);
    }

    // Check if parent category exists if provided
    if (categoryData.parent_id) {
      const parentResult = await CrudOperations.performCrud({
        operation: 'read',
        tableName: CATEGORIES_TABLE,
        id: categoryData.parent_id,
        connection: pool,
      });

      if (!parentResult.record) {
        throw new AppError('Parent category not found', 404);
      }
    }

    // Create the category using CRUD utility
    const result = await CrudOperations.performCrud({
      operation: 'create',
      tableName: CATEGORIES_TABLE,
      data: categoryData,
      connection: pool,
    });

    // Enhance the result with parent name if needed
    if (result.record.parent_id) {
      const parentResult = await CrudOperations.performCrud({
        operation: 'read',
        tableName: CATEGORIES_TABLE,
        id: result.record.parent_id,
        fields: ['name'],
        connection: pool,
      });

      if (parentResult.record) {
        result.record.parent_name = parentResult.record.name;
      }
    }

    return {
      message: 'Category created successfully',
      category: result.record,
    };
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      throw new AppError('A category with this name already exists', 409);
    }
    throw new AppError(
      `Failed to create category: ${error.message}`,
      error.statusCode || 500
    );
  }
};

/**
 * Gets a category by ID
 * @param {number} id - The ID of the category to retrieve
 * @returns {Promise<Object>} Promise that resolves with the category data
 */
export const getCategoryById = async (id) => {
  try {
    const pool = dbConn.tb_pool;

    // Use CRUD utility to get the category
    const result = await CrudOperations.performCrud({
      operation: 'read',
      tableName: CATEGORIES_TABLE,
      id: id,
      connection: pool,
    });

    if (!result.record) {
      throw new AppError('Category not found', 404);
    }

    // Add parent name if parent_id exists
    if (result.record.parent_id) {
      const parentResult = await CrudOperations.performCrud({
        operation: 'read',
        tableName: CATEGORIES_TABLE,
        id: result.record.parent_id,
        fields: ['name'],
        connection: pool,
      });

      if (parentResult.record) {
        result.record.parent_name = parentResult.record.name;
      }
    }

    return result.record;
  } catch (error) {
    throw new AppError(
      `Failed to get category: ${error.message}`,
      error.statusCode || 500
    );
  }
};

/**
 * Gets all categories with optional filtering and pagination
 * @param {Object} [options] - Query options
 * @param {string} [options.search] - Search term for category name
 * @param {number} [options.parent_id] - Filter by parent category ID
 * @param {number} [options.page=1] - Page number for pagination
 * @param {number} [options.limit=100] - Number of results per page
 * @returns {Promise<Object>} Promise that resolves with the categories and pagination info
 */
export const getAllCategories = async (options = {}) => {
  try {
    const pool = dbConn.tb_pool;

    // Build conditions for CRUD utility
    const conditions = {};

    if (options.parent_id !== undefined) {
      conditions.parent_id =
        options.parent_id === null ? null : options.parent_id;
    }

    // Handle search separately since it requires LIKE operator
    let searchCondition = '';
    const searchParams = [];

    if (options.search) {
      searchCondition = 'name LIKE ?';
      searchParams.push(`%${options.search}%`);
    }

    // Get categories using CRUD utility with custom query for search
    const result = await CrudOperations.performCrud({
      operation: 'read',
      tableName: CATEGORIES_TABLE,
      conditions: conditions,
      page: options.page || 1,
      limit: options.limit || 100,
      orderBy: 'name',
      orderDirection: 'ASC',
      connection: pool,
    });

    // Filter results by search if provided
    let categories = result.records;
    let total = result.pagination.total;

    if (options.search) {
      // If search is provided, we need to filter the results manually
      // or use a custom query instead of the CRUD utility
      const searchSQL = `
        SELECT c.*, p.name as parent_name
        FROM ${CATEGORIES_TABLE} c
        LEFT JOIN ${CATEGORIES_TABLE} p ON c.parent_id = p.id
        WHERE c.name LIKE ?
        ${
          options.parent_id !== undefined
            ? options.parent_id === null
              ? 'AND c.parent_id IS NULL'
              : 'AND c.parent_id = ?'
            : ''
        }
        ORDER BY c.name ASC
        LIMIT ? OFFSET ?
      `;

      const queryParams = [`%${options.search}%`];
      if (options.parent_id !== undefined && options.parent_id !== null) {
        queryParams.push(options.parent_id);
      }

      const limit = options.limit || 100;
      const offset = ((options.page || 1) - 1) * limit;
      queryParams.push(limit, offset);

      categories = await dbModel.executeQuery(pool, searchSQL, queryParams);

      // Get total count for search
      const countSQL = `
        SELECT COUNT(*) as total
        FROM ${CATEGORIES_TABLE} c
        WHERE c.name LIKE ?
        ${
          options.parent_id !== undefined
            ? options.parent_id === null
              ? 'AND c.parent_id IS NULL'
              : 'AND c.parent_id = ?'
            : ''
        }
      `;

      const countParams = [`%${options.search}%`];
      if (options.parent_id !== undefined && options.parent_id !== null) {
        countParams.push(options.parent_id);
      }

      const countResult = await dbModel.executeQuery(
        pool,
        countSQL,
        countParams
      );
      total = countResult[0].total;
    }

    return {
      categories,
      pagination: {
        total,
        page: options.page || 1,
        limit: options.limit || 100,
        pages: Math.ceil(total / (options.limit || 100)),
      },
    };
  } catch (error) {
    throw new AppError(`Failed to get categories: ${error.message}`, 500);
  }
};

/**
 * Gets a hierarchical tree of categories
 * @returns {Promise<Array>} Promise that resolves with the category tree
 */
export const getCategoryTree = async () => {
  try {
    const pool = dbConn.tb_pool;

    // Get all categories using CRUD utility
    const result = await CrudOperations.performCrud({
      operation: 'read',
      tableName: CATEGORIES_TABLE,
      orderBy: 'name',
      orderDirection: 'ASC',
      limit: 1000, // Set a high limit to get all categories
      connection: pool,
    });

    const categories = result.records;

    // Build tree structure
    const categoryMap = {};
    const rootCategories = [];

    // First, map all categories by ID
    categories.forEach((category) => {
      categoryMap[category.id] = {
        ...category,
        children: [],
      };
    });

    // Then, build the tree structure
    categories.forEach((category) => {
      if (category.parent_id === null) {
        // This is a root category
        rootCategories.push(categoryMap[category.id]);
      } else {
        // This is a child category
        if (categoryMap[category.parent_id]) {
          categoryMap[category.parent_id].children.push(
            categoryMap[category.id]
          );
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
 * @param {number|null} [updateData.parent_id] - The updated parent category ID
 * @returns {Promise<Object>} Promise that resolves with the updated category
 */
export const updateCategory = async (id, updateData) => {
  try {
    const pool = dbConn.tb_pool;

    // Check if category exists
    const existingCategory = await getCategoryById(id);

    // Prevent circular references in hierarchy
    if (
      updateData.parent_id &&
      parseInt(updateData.parent_id) === parseInt(id)
    ) {
      throw new AppError('A category cannot be its own parent', 400);
    }

    // Check for circular references in the hierarchy
    if (updateData.parent_id) {
      let parentId = updateData.parent_id;
      const visited = new Set([parseInt(id)]);

      while (parentId) {
        if (visited.has(parseInt(parentId))) {
          throw new AppError(
            'Circular reference detected in category hierarchy',
            400
          );
        }

        visited.add(parseInt(parentId));

        // Get the parent's parent using CRUD utility
        const parentResult = await CrudOperations.performCrud({
          operation: 'read',
          tableName: CATEGORIES_TABLE,
          id: parentId,
          fields: ['parent_id'],
          connection: pool,
        });

        if (!parentResult.record) {
          break;
        }

        parentId = parentResult.record.parent_id;
      }
    }

    // Update the category using CRUD utility
    const result = await CrudOperations.performCrud({
      operation: 'update',
      tableName: CATEGORIES_TABLE,
      id: id,
      data: updateData,
      connection: pool,
    });

    // Add parent name if parent_id exists
    if (result.record.parent_id) {
      const parentResult = await CrudOperations.performCrud({
        operation: 'read',
        tableName: CATEGORIES_TABLE,
        id: result.record.parent_id,
        fields: ['name'],
        connection: pool,
      });

      if (parentResult.record) {
        result.record.parent_name = parentResult.record.name;
      }
    }

    return {
      message: 'Category updated successfully',
      category: result.record,
    };
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      throw new AppError('A category with this name already exists', 409);
    }
    throw new AppError(
      `Failed to update category: ${error.message}`,
      error.statusCode || 500
    );
  }
};

/**
 * Deletes a category
 * @param {number} id - The ID of the category to delete
 * @param {boolean} [reassignChildren=false] - Whether to reassign children to parent
 * @returns {Promise<Object>} Promise that resolves with deletion result
 */
export const deleteCategory = async (id, reassignChildren = false) => {
  try {
    const pool = dbConn.tb_pool;

    // Check if category exists and get its parent
    const category = await getCategoryById(id);

    // Start transaction
    await dbModel.executeQuery(pool, 'START TRANSACTION');

    try {
      // Check for child categories
      const childrenResult = await CrudOperations.performCrud({
        operation: 'read',
        tableName: CATEGORIES_TABLE,
        conditions: { parent_id: id },
        connection: pool,
      });

      const childCount = childrenResult.records.length;

      if (childCount > 0) {
        if (reassignChildren) {
          // Reassign children to parent using bulk update
          await CrudOperations.performCrud({
            operation: 'bulkupdate',
            tableName: CATEGORIES_TABLE,
            data: childrenResult.records.map((child) => ({
              id: child.id,
              parent_id: category.parent_id,
            })),
            connection: pool,
          });
        } else {
          throw new AppError(
            `Cannot delete category with ${childCount} child categories. Use reassignChildren=true to reassign them.`,
            400
          );
        }
      }

      // Delete category using CRUD utility
      await CrudOperations.performCrud({
        operation: 'delete',
        tableName: CATEGORIES_TABLE,
        id: id,
        connection: pool,
      });

      // Commit transaction
      await dbModel.executeQuery(pool, 'COMMIT');

      return {
        message: 'Category deleted successfully',
        reassignedChildren: reassignChildren ? childCount : 0,
      };
    } catch (error) {
      // Rollback transaction on error
      await dbModel.executeQuery(pool, 'ROLLBACK');
      throw error;
    }
  } catch (error) {
    throw new AppError(
      `Failed to delete category: ${error.message}`,
      error.statusCode || 500
    );
  }
};

/**
 * Gets products in a category
 * @param {number} categoryId - The ID of the category
 * @param {Object} [options] - Query options
 * @param {number} [options.page=1] - Page number for pagination
 * @param {number} [options.limit=20] - Number of results per page
 * @returns {Promise<Object>} Promise that resolves with products and pagination info
 */
export const getProductsByCategory = async (categoryId, options = {}) => {
  try {
    const pool = dbConn.tb_pool;
    const page = options.page || 1;
    const limit = options.limit || 20;
    const offset = (page - 1) * limit;

    // Check if category exists
    await getCategoryById(categoryId);

    // For this complex query with joins, we'll use direct SQL instead of CRUD utility
    // Get total count for pagination
    const countSQL = `
      SELECT COUNT(DISTINCT p.id) as total
      FROM products p
      JOIN product_categories pc ON p.id = pc.product_id
      WHERE pc.category_id = ?
    `;

    const countResult = await dbModel.executeQuery(pool, countSQL, [
      categoryId,
    ]);
    const total = countResult[0].total;

    // Get products with pagination
    const selectSQL = `
      SELECT p.id, p.product_id, p.icon_url, p.remark,
             GROUP_CONCAT(DISTINCT pn.name ORDER BY pn.name_type_id SEPARATOR '|') as names
      FROM products p
      JOIN product_categories pc ON p.id = pc.product_id
      LEFT JOIN product_names pn ON p.id = pn.product_id
      WHERE pc.category_id = ?
      GROUP BY p.id
      ORDER BY p.product_id ASC
      LIMIT ? OFFSET ?
    `;

    const products = await dbModel.executeQuery(pool, selectSQL, [
      categoryId,
      limit,
      offset,
    ]);

    // Format product names
    products.forEach((product) => {
      if (product.names) {
        product.names = product.names.split('|');
      } else {
        product.names = [];
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
 * Gets child categories of a parent category
 * @param {number|null} parentId - The ID of the parent category, or null for root categories
 * @returns {Promise<Array>} Promise that resolves with the child categories
 */
export const getChildCategories = async (parentId) => {
  try {
    const pool = dbConn.tb_pool;

    // For this query with subqueries, we'll use direct SQL
    let whereClause = 'WHERE 1=1';
    const params = [];

    if (parentId === null) {
      whereClause += ' AND parent_id IS NULL';
    } else {
      whereClause += ' AND parent_id = ?';
      params.push(parentId);

      // Check if parent exists using CRUD utility
      const parentResult = await CrudOperations.performCrud({
        operation: 'read',
        tableName: CATEGORIES_TABLE,
        id: parentId,
        connection: pool,
      });

      if (!parentResult.record) {
        throw new AppError('Parent category not found', 404);
      }
    }

    const selectSQL = `
      SELECT c.*, 
             (SELECT COUNT(*) FROM categories WHERE parent_id = c.id) as child_count,
             (SELECT COUNT(*) FROM product_categories WHERE category_id = c.id) as product_count
      FROM categories c
      ${whereClause}
      ORDER BY c.name ASC
    `;

    const categories = await dbModel.executeQuery(pool, selectSQL, params);

    return categories;
  } catch (error) {
    throw new AppError(
      `Failed to get child categories: ${error.message}`,
      error.statusCode || 500
    );
  }
};

/**
 * Gets the full path of a category (breadcrumb)
 * @param {number} categoryId - The ID of the category
 * @returns {Promise<Array>} Promise that resolves with the category path
 */
export const getCategoryPath = async (categoryId) => {
  try {
    const pool = dbConn.tb_pool;

    // Check if category exists
    await getCategoryById(categoryId);

    const path = [];
    let currentId = categoryId;

    while (currentId) {
      // Use CRUD utility to get the category
      const result = await CrudOperations.performCrud({
        operation: 'read',
        tableName: CATEGORIES_TABLE,
        id: currentId,
        fields: ['id', 'name', 'parent_id'],
        connection: pool,
      });

      if (!result.record) {
        break;
      }

      // Add to the beginning of the path (to get root → child order)
      path.unshift(result.record);
      currentId = result.record.parent_id;
    }

    return path;
  } catch (error) {
    throw new AppError(
      `Failed to get category path: ${error.message}`,
      error.statusCode || 500
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
    const pool = dbConn.tb_pool;
    const results = {
      total: categories.length,
      successful: 0,
      failed: 0,
      details: [],
    };

    // Start transaction
    await dbModel.executeQuery(pool, 'START TRANSACTION');

    try {
      // Use bulkCreate operation from CRUD utility
      const bulkResult = await CrudOperations.performCrud({
        operation: 'bulkcreate',
        tableName: CATEGORIES_TABLE,
        data: categories,
        connection: pool,
      });

      // Process results
      results.successful = bulkResult.count;
      results.details = bulkResult.records.map((record) => ({
        name: record.name,
        success: true,
        id: record.id,
      }));

      // Commit transaction
      await dbModel.executeQuery(pool, 'COMMIT');
    } catch (error) {
      // Rollback transaction on error
      await dbModel.executeQuery(pool, 'ROLLBACK');

      // If bulk operation failed, try individual creates to get more detailed errors
      await dbModel.executeQuery(pool, 'START TRANSACTION');

      try {
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

        // Commit transaction
        await dbModel.executeQuery(pool, 'COMMIT');
      } catch (finalError) {
        // Rollback transaction on error
        await dbModel.executeQuery(pool, 'ROLLBACK');
        throw finalError;
      }
    }

    return results;
  } catch (error) {
    throw new AppError(
      `Failed to batch create categories: ${error.message}`,
      500
    );
  }
};

/**
 * Inserts default categories
 * @returns {Promise<Object>} Promise that resolves with insertion results
 */
export const insertDefaultCategories = async () => {
  try {
    // Main categories (level 1)
    const mainCategories = [
      {
        name: 'Pet Beds & Accessories',
        description: 'Beds and accessories for pets',
      },
      {
        name: 'Pet Bowls & Feeders',
        description: 'Bowls and feeders for pets',
      },
      { name: 'Pet Cages & Houses', description: 'Cages and houses for pets' },
      {
        name: 'Pet Carriers & Travel',
        description: 'Carriers and travel accessories for pets',
      },
      {
        name: 'Pet Cleaning & Grooming',
        description: 'Cleaning and grooming products for pets',
      },
      {
        name: 'Cat Items & Accessories',
        description: 'Items and accessories for cats',
      },
      { name: 'Pet Toys', description: 'Toys for pets' },
      { name: 'Aquatic Items', description: 'Items for aquatic pets' },
      { name: 'Others', description: 'Other pet products' },
    ];

    // Insert main categories
    const mainResults = await batchCreateCategories(mainCategories);

    // Map to store main category IDs by name
    const categoryMap = {};
    mainResults.details.forEach((detail) => {
      if (detail.success) {
        categoryMap[detail.name] = detail.id;
      }
    });

    // Subcategories (level 2)
    const subcategories = [
      // Pet Beds & Accessories subcategories
      {
        name: 'Pet Mats',
        description: 'Mats for pets',
        parent_id: categoryMap['Pet Beds & Accessories'],
      },

      // Pet Bowls & Feeders subcategories
      {
        name: 'Pet Dispensers',
        description: 'Dispensers for pets',
        parent_id: categoryMap['Pet Bowls & Feeders'],
      },
      {
        name: 'Dog Bowl',
        description: 'Bowls for dogs',
        parent_id: categoryMap['Pet Bowls & Feeders'],
      },
      {
        name: 'Cat Bowl',
        description: 'Bowls for cats',
        parent_id: categoryMap['Pet Bowls & Feeders'],
      },

      // Pet Cages & Houses subcategories
      {
        name: 'Pet Cages',
        description: 'Cages for pets',
        parent_id: categoryMap['Pet Cages & Houses'],
      },
      {
        name: 'Pet Nests',
        description: 'Nests for pets',
        parent_id: categoryMap['Pet Cages & Houses'],
      },

      // Pet Carriers & Travel subcategories
      {
        name: 'Dog Leash',
        description: 'Leashes for dogs',
        parent_id: categoryMap['Pet Carriers & Travel'],
      },
      {
        name: 'Dog Harness',
        description: 'Harnesses for dogs',
        parent_id: categoryMap['Pet Carriers & Travel'],
      },
      {
        name: 'Dog Collar',
        description: 'Collars for dogs',
        parent_id: categoryMap['Pet Carriers & Travel'],
      },
      {
        name: 'Cat Collar',
        description: 'Collars for cats',
        parent_id: categoryMap['Pet Carriers & Travel'],
      },
      {
        name: 'Pet Carriers',
        description: 'Carriers for pets',
        parent_id: categoryMap['Pet Carriers & Travel'],
      },

      // Pet Cleaning & Grooming subcategories
      {
        name: 'Teeth Cleaning',
        description: 'Teeth cleaning products for pets',
        parent_id: categoryMap['Pet Cleaning & Grooming'],
      },
      {
        name: 'Dog Grooming',
        description: 'Grooming products for dogs',
        parent_id: categoryMap['Pet Cleaning & Grooming'],
      },
      {
        name: 'Cat Grooming',
        description: 'Grooming products for cats',
        parent_id: categoryMap['Pet Cleaning & Grooming'],
      },

      // Cat Items & Accessories subcategories
      {
        name: 'Pet Litter Cleaning',
        description: 'Litter cleaning products for pets',
        parent_id: categoryMap['Cat Items & Accessories'],
      },
      {
        name: 'Cat Litter Box',
        description: 'Litter boxes for cats',
        parent_id: categoryMap['Cat Items & Accessories'],
      },

      // Pet Toys subcategories
      {
        name: 'Cat Toys',
        description: 'Toys for cats',
        parent_id: categoryMap['Pet Toys'],
      },
      {
        name: 'Dog Toys',
        description: 'Toys for dogs',
        parent_id: categoryMap['Pet Toys'],
      },

      // Others subcategories
      {
        name: 'Pet Ramps',
        description: 'Ramps for pets',
        parent_id: categoryMap['Others'],
      },
      {
        name: 'Pet Backrest Cover',
        description: 'Backrest covers for pets',
        parent_id: categoryMap['Others'],
      },
      {
        name: 'Cat Scratching Board',
        description: 'Scratching boards for cats',
        parent_id: categoryMap['Others'],
      },
      {
        name: 'Pet Clothing',
        description: 'Clothing for pets',
        parent_id: categoryMap['Others'],
      },
      {
        name: 'Pet Water Fountain',
        description: 'Water fountains for pets',
        parent_id: categoryMap['Others'],
      },

      // Aquatic Items subcategories
      {
        name: 'Pumps',
        description: 'Pumps for aquariums',
        parent_id: categoryMap['Aquatic Items'],
      },
      {
        name: 'Horse Supplies',
        description: 'Supplies for horses',
        parent_id: categoryMap['Aquatic Items'],
      },
      {
        name: 'Bird Supplies',
        description: 'Supplies for birds',
        parent_id: categoryMap['Aquatic Items'],
      },
      {
        name: 'Dog Barking Controller',
        description: 'Controllers for dog barking',
        parent_id: categoryMap['Aquatic Items'],
      },
    ];

    // Insert subcategories
    const subcategoryResults = await batchCreateCategories(subcategories);

    return {
      mainCategories: mainResults,
      subcategories: subcategoryResults,
    };
  } catch (error) {
    throw new AppError(
      `Failed to insert default categories: ${error.message}`,
      500
    );
  }
};
