import * as categoriesModel from '../../../models/trade_business/products/master_categoriesModel.js';
import catchAsync from '../../../utils/catchAsync.js';
import AppError from '../../../utils/appError.js';

/**
 * Create a new category
 */
export const createCategory = catchAsync(async (req, res, next) => {
  const result = await categoriesModel.createCategory(req.body);
  
  res.prints = {
    status: 'success',
    message: result.message,
    category: result.category
  };
  
  next();
});

/**
 * Get a category by ID
 */
export const getCategoryById = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  
  if (!id) {
    return next(new AppError('Category ID is required', 400));
  }
  
  const category = await categoriesModel.getCategoryById(id);
  
  res.prints = {
    status: 'success',
    category
  };
  
  next();
});

/**
 * Get all categories with optional filtering and pagination
 */
export const getAllCategories = catchAsync(async (req, res, next) => {
  const options = {
    search: req.query.search,
    parent_id: req.query.parent_id !== undefined ? 
      (req.query.parent_id === 'null' ? null : req.query.parent_id) : undefined,
    page: req.query.page ? parseInt(req.query.page) : 1,
    limit: req.query.limit ? parseInt(req.query.limit) : 100
  };
  
  const result = await categoriesModel.getAllCategories(options);
  
  res.prints = {
    status: 'success',
    categories: result.categories,
    pagination: result.pagination
  };
  
  next();
});

/**
 * Get a hierarchical tree of categories
 */
export const getCategoryTree = catchAsync(async (req, res, next) => {
  const categoryTree = await categoriesModel.getCategoryTree();
  
  res.prints = {
    status: 'success',
    categoryTree
  };
  
  next();
});

/**
 * Update a category
 */
export const updateCategory = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  
  if (!id) {
    return next(new AppError('Category ID is required', 400));
  }
  
  const result = await categoriesModel.updateCategory(id, req.body);
  
  res.prints = {
    status: 'success',
    message: result.message,
    category: result.category
  };
  
  next();
});

/**
 * Delete a category
 */
export const deleteCategory = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { reassignChildren } = req.query;
  
  if (!id) {
    return next(new AppError('Category ID is required', 400));
  }
  
  const result = await categoriesModel.deleteCategory(
    id, 
    reassignChildren === 'true'
  );
  
  res.prints = {
    status: 'success',
    message: result.message,
    reassignedChildren: result.reassignedChildren
  };
  
  next();
});

/**
 * Get products in a category
 */
export const getProductsByCategory = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  
  if (!id) {
    return next(new AppError('Category ID is required', 400));
  }
  
  const options = {
    page: req.query.page ? parseInt(req.query.page) : 1,
    limit: req.query.limit ? parseInt(req.query.limit) : 20
  };
  
  const result = await categoriesModel.getProductsByCategory(id, options);
  
  res.prints = {
    status: 'success',
    products: result.products,
    pagination: result.pagination
  };
  
  next();
});

/**
 * Get child categories of a parent category
 */
export const getChildCategories = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  
  // If id is 'root', get root categories (parent_id is null)
  const parentId = id === 'root' ? null : id;
  
  const categories = await categoriesModel.getChildCategories(parentId);
  
  res.prints = {
    status: 'success',
    categories
  };
  
  next();
});

/**
 * Get the full path of a category (breadcrumb)
 */
export const getCategoryPath = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  
  if (!id) {
    return next(new AppError('Category ID is required', 400));
  }
  
  const path = await categoriesModel.getCategoryPath(id);
  
  res.prints = {
    status: 'success',
    path
  };
  
  next();
});

/**
 * Batch create multiple categories
 */
export const batchCreateCategories = catchAsync(async (req, res, next) => {
  if (!Array.isArray(req.body)) {
    return next(new AppError('Request body must be an array of categories', 400));
  }
  
  const result = await categoriesModel.batchCreateCategories(req.body);
  
  res.prints = {
    status: 'success',
    total: result.total,
    successful: result.successful,
    failed: result.failed,
    details: result.details
  };
  
  next();
});

/**
 * Insert default categories
 */
export const insertDefaultCategories = catchAsync(async (req, res, next) => {
  const result = await categoriesModel.insertDefaultCategories();
  
  res.prints = {
    status: 'success',
    message: 'Default categories inserted successfully',
    mainCategories: {
      total: result.mainCategories.total,
      successful: result.mainCategories.successful,
      failed: result.mainCategories.failed
    },
    subcategories: {
      total: result.subcategories.total,
      successful: result.subcategories.successful,
      failed: result.subcategories.failed
    }
  };
  
  next();
});

/**
 * Check if a category exists by name
 */
export const checkCategoryExists = catchAsync(async (req, res, next) => {
  const { name } = req.query;
  
  if (!name) {
    return next(new AppError('Category name is required', 400));
  }
  
  try {
    const options = {
      search: name,
      limit: 1
    };
    
    const result = await categoriesModel.getAllCategories(options);
    const exists = result.categories.length > 0 && 
                   result.categories[0].name.toLowerCase() === name.toLowerCase();
    
    res.prints = {
      status: 'success',
      exists,
      category: exists ? result.categories[0] : null
    };
    
    next();
  } catch (error) {
    next(new AppError(`Failed to check category existence: ${error.message}`, 500));
  }
});

/**
 * Get category statistics
 */
export const getCategoryStatistics = catchAsync(async (req, res, next) => {
  const pool = dbConn.tb_pool;
  
  // Get total counts
  const countSQL = `
    SELECT 
      (SELECT COUNT(*) FROM categories) as total_categories,
      (SELECT COUNT(*) FROM categories WHERE parent_id IS NULL) as root_categories,
      (SELECT COUNT(*) FROM categories WHERE parent_id IS NOT NULL) as sub_categories,
      (SELECT COUNT(DISTINCT product_id) FROM product_categories) as products_with_categories
  `;
  
  const counts = await dbModel.executeQuery(pool, countSQL);
  
  // Get top categories by product count
  const topCategoriesSQL = `
    SELECT c.id, c.name, COUNT(pc.product_id) as product_count
    FROM categories c
    LEFT JOIN product_categories pc ON c.id = pc.category_id
    GROUP BY c.id
    ORDER BY product_count DESC
    LIMIT 10
  `;
  
  const topCategories = await dbModel.executeQuery(pool, topCategoriesSQL);
  
  res.prints = {
    status: 'success',
    statistics: {
      counts: counts[0],
      topCategories
    }
  };
  
  next();
});