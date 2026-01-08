import AppError from '../../../utils/appError.js';
import { v4 as uuidv4 } from 'uuid';
import { PRODUCT_TABLE_MASTER } from '../../tables.js';
import { tradeBusinessDbc } from '../../dbModel.js';
import DataModelUtils from '../../../utils/dataModelUtils.js';

// Import related data models
import * as ProductImages from './data_product_images.js';
import * as ProductNames from './data_product_names.js';
import * as ProductCustomizations from './data_product_customizations.js';
import * as ProductLinks from './data_product_links.js';
import * as ProductPackings from './data_product_packings.js';
import * as ProductCategories from './data_product_categories.js';
import * as ProductAlibabaIds from './data_product_alibaba_ids.js';
import * as ProductCertificates from './data_product_certificates.js';

// Create a data model utility for products
export const productModel = new DataModelUtils({
  dbc: tradeBusinessDbc,
  tableName: PRODUCT_TABLE_MASTER['PRODUCTS'].name,
  tableFields: PRODUCT_TABLE_MASTER['PRODUCTS'].fields,
  entityName: 'product',
  entityIdField: 'id',
  requiredFields: ['product_id'],
  validations: {
    product_id: { required: true },
    icon_url: { required: false },
    remark: { required: false },
  },
  defaults: {
    id: uuidv4,
  },
  fileConfig: {
    fileUrlField: 'icon_url',
    uploadDir: 'public/{id}/icon/',
    imagesOnly: true,
  },
  // Add relationship with child table (customization images)
  childTableConfig: [
    {
      tableName: PRODUCT_TABLE_MASTER['PRODUCT_NAMES'].name,
      connectedKeys: { id: 'productId' }, // parent table -> child table
      model: ProductNames.productNameModel,
    },
    {
      tableName: PRODUCT_TABLE_MASTER['PRODUCT_IMAGES'].name,
      connectedKeys: { id: 'productId' }, // parent table -> child table
      model: ProductImages.productImagesModel,
    },
    {
      tableName: PRODUCT_TABLE_MASTER['PRODUCT_CATEGORIES'].name,
      connectedKeys: { id: 'productId' }, // parent table -> child table
      model: ProductCategories.productCategoryModel,
    },
    {
      tableName: PRODUCT_TABLE_MASTER['PRODUCT_CUSTOMIZATIONS'].name,
      // connectedKeys: { id: 'productId' }, // parent table -> child table
      model: ProductCustomizations.customizationModel,
    },
    {
      tableName: PRODUCT_TABLE_MASTER['PRODUCT_LINKS'].name,
      connectedKeys: { id: 'productId' }, // parent table -> child table
      model: ProductLinks.productLinkModel,
    },
    {
      tableName: PRODUCT_TABLE_MASTER['PRODUCT_ALIBABA_IDS'].name,
      connectedKeys: { id: 'productId' }, // parent table -> child table
      model: ProductAlibabaIds.alibabaIdModel,
    },
    {
      tableName: PRODUCT_TABLE_MASTER['PRODUCT_PACKINGS'].name,
      connectedKeys: { id: 'productId' }, // parent table -> child table
      model: ProductPackings.packingModel,
    },
    {
      tableName: PRODUCT_TABLE_MASTER['PRODUCT_CERTIFICATES'].name,
      connectedKeys: { id: 'productId' }, // parent table -> child table
      model: ProductCertificates.certificateModel,
    },
  ],
});

/**
 * Checks if a product exists by ID
 * @param {string} id - The ID of the product to check
 * @returns {Promise<boolean>} Promise that resolves with true if product exists, false otherwise
 */
export const productExists = async (id) => {
  try {
    const sql = `SELECT COUNT(*) as count FROM ${productModel.tableName} WHERE id = ?`;
    const result = await productModel.executeQuery(sql, [id]);
    return result[0].count > 0;
  } catch (error) {
    throw new AppError(
      `Failed to check if product exists: ${error.message}`,
      error.statusCode || 500
    );
  }
};

/**
 * Truncates all product-related tables
 * @returns {Promise<Object>} Promise that resolves with the result of the truncation operation
 */
export const truncateAllProductTables = async () => {
  try {
    // List of product-related tables in the correct order for truncation
    // We need to truncate child tables before parent tables to avoid foreign key constraints
    const productTables = Object.values(PRODUCT_TABLE_MASTER)
      .map((table) => table.table_type === 'data' && table.name)
      .reverse();

    const results = {
      truncated: [],
      errors: [],
    };

    // Create temporary model instances for each table and truncate them using truncateTable()
    for (const tableName of productTables) {
      try {
        // Create a temporary model for this table
        const tempModel = new DataModelUtils({
          dbc: tradeBusinessDbc,
          tableName: tableName,
          entityName: tableName.replace(/_/g, ' ').toLowerCase(),
        });

        // Use the truncateTable method which handles foreign key checks internally
        await tempModel.truncateTable();

        results.truncated.push(tableName);
      } catch (error) {
        results.errors.push({
          table: tableName,
          error: error.message,
        });
      }
    }

    return {
      success: results.errors.length === 0,
      message: `Truncated ${results.truncated.length} product-related tables`,
      truncatedTables: results.truncated,
      errors: results.errors,
    };
  } catch (error) {
    throw new AppError(
      `Failed to truncate product tables: ${error.message}`,
      error.statusCode || 500
    );
  }
};
