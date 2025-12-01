import * as dbConn from '../../../utils/dbConn.js';
import * as dbModel from '../../dbModel.js';
import AppError from '../../../utils/appError.js';
import {
  TABLE_MASTER,
  generateCreateTableSQL,
  getAllTableNames,
  getTableFields,
} from '../../tables.js';

/**
 * Creates a table based on its definition in TABLE_MASTER
 * @param {string} tableKey - The key of the table in TABLE_MASTER
 * @returns {Promise} Promise that resolves when the table is created
 */
const createTable = async (tableKey) => {
  try {
    const pool = dbConn.tb_pool;
    const tableDefinition = TABLE_MASTER[tableKey];

    if (!tableDefinition) {
      throw new Error(
        `Table definition for ${tableKey} not found in TABLE_MASTER`
      );
    }

    const createTableSQL = generateCreateTableSQL(tableDefinition);
    await dbModel.executeQuery(pool, createTableSQL);

    return {
      message: `${tableDefinition.name} table created successfully`,
    };
  } catch (error) {
    const tableName = TABLE_MASTER[tableKey]?.name || tableKey;
    throw new AppError(
      `Failed to create ${tableName} table: ${error.message}`,
      500
    );
  }
};

/**
 * Creates the main products table
 * @returns {Promise} Promise that resolves when the table is created
 */
export const createProductsTable = async () => {
  return createTable('PRODUCTS');
};

/**
 * Creates the master_product_name_types master table
 * @returns {Promise} Promise that resolves when the table is created
 */
export const createProductNameTypesTable = async () => {
  return createTable('MASTER_PRODUCT_NAME_TYPES');
};

/**
 * Creates the product_names table with reference to master_product_name_types
 * @returns {Promise} Promise that resolves when the table is created
 */
export const createProductNamesTable = async () => {
  return createTable('PRODUCT_NAMES');
};

/**
 * Creates the master_categories table
 * @returns {Promise} Promise that resolves when the table is created
 */
export const createCategoriesTable = async () => {
  return createTable('MASTER_CATEGORIES');
};

/**
 * Creates the product_categories junction table
 * @returns {Promise} Promise that resolves when the table is created
 */
export const createProductCategoriesTable = async () => {
  return createTable('PRODUCT_CATEGORIES');
};

/**
 * Creates the product_customizations table
 * @returns {Promise} Promise that resolves when the table is created
 */
export const createCustomizationsTable = async () => {
  return createTable('PRODUCT_CUSTOMIZATIONS');
};

/**
 * Creates the product_customization_images table
 * @returns {Promise} Promise that resolves when the table is created
 */
export const createCustomizationImagesTable = async () => {
  return createTable('PRODUCT_CUSTOMIZATION_IMAGES');
};

/**
 * Creates the product_links table
 * @returns {Promise} Promise that resolves when the table is created
 */
export const createProductLinksTable = async () => {
  return createTable('PRODUCT_LINKS');
};

/**
 * Creates the product_link_images table
 * @returns {Promise} Promise that resolves when the table is created
 */
export const createProductLinkImagesTable = async () => {
  return createTable('PRODUCT_LINK_IMAGES');
};

/**
 * Creates the product_alibaba_ids table
 * @returns {Promise} Promise that resolves when the table is created
 */
export const createAlibabaIdsTable = async () => {
  return createTable('PRODUCT_ALIBABA_IDS');
};

/**
 * Creates the master_packing_types master table
 * @returns {Promise} Promise that resolves when the table is created
 */
export const createPackingTypesTable = async () => {
  return createTable('MASTER_PACKING_TYPES');
};

/**
 * Creates the product_packings table with reference to master_packing_types
 * @returns {Promise} Promise that resolves when the table is created
 */
export const createProductPackingsTable = async () => {
  return createTable('PRODUCT_PACKINGS');
};

/**
 * Creates the master_certificate_types master table
 * @returns {Promise} Promise that resolves when the table is created
 */
export const createCertificateTypesTable = async () => {
  return createTable('MASTER_CERTIFICATE_TYPES');
};

/**
 * Creates the product_certificates table with reference to master_certificate_types
 * @returns {Promise} Promise that resolves when the table is created
 */
export const createProductCertificatesTable = async () => {
  return createTable('PRODUCT_CERTIFICATES');
};

/**
 * Creates the product_certificate_files table
 * @returns {Promise} Promise that resolves when the table is created
 */
export const createProductCertificateFilesTable = async () => {
  return createTable('PRODUCT_CERTIFICATE_FILES');
};

/**
 * Get the table creation order from TABLE_MASTER
 * @returns {string[]} Array of table keys in the correct creation order
 */
const getTableCreationOrder = () => {
  // The order of keys in TABLE_MASTER determines the creation order
  return Object.keys(TABLE_MASTER);
};

/**
 * Creates all product-related tables in the correct order to respect foreign key constraints
 * @returns {Promise} Promise that resolves when all tables are created
 */
export const createAllProductTables = async () => {
  try {
    // Get table keys in the order they appear in TABLE_MASTER
    const tableCreationOrder = getTableCreationOrder();

    for (const tableKey of tableCreationOrder) {
      await createTable(tableKey);
    }

    return { message: 'All product tables created successfully' };
  } catch (error) {
    throw new AppError(
      `Failed to create product tables: ${error.message}`,
      500
    );
  }
};

/**
 * Drops all product-related tables in reverse order to respect foreign key constraints
 * @returns {Promise} Promise that resolves when all tables are dropped
 */
export const dropAllProductTables = async () => {
  try {
    const pool = dbConn.tb_pool;

    // Get table keys in reverse order of TABLE_MASTER
    const tableDropOrder = getTableCreationOrder().reverse();

    for (const tableKey of tableDropOrder) {
      const tableName = TABLE_MASTER[tableKey].name;
      await dbModel.executeQuery(pool, `DROP TABLE IF EXISTS ${tableName};`);
    }

    return { message: 'All product tables dropped successfully' };
  } catch (error) {
    throw new AppError(`Failed to drop product tables: ${error.message}`, 500);
  }
};

/**
 * Checks if all product tables exist
 * @returns {Promise<boolean>} Promise that resolves with true if all tables exist, false otherwise
 */
export const checkProductTablesExist = async () => {
  try {
    const pool = dbConn.tb_pool;
    const tableNames = Object.values(TABLE_MASTER).map((table) => table.name);

    const checkTableSQL = `
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = DATABASE() 
      AND table_name IN (${tableNames.map(() => '?').join(',')});
    `;

    const result = await dbModel.executeQuery(pool, checkTableSQL, tableNames);
    return result[0].count === tableNames.length;
  } catch (error) {
    throw new AppError(
      `Failed to check if product tables exist: ${error.message}`,
      500
    );
  }
};

/**
 * Gets the database schema for all product tables
 * @returns {Promise<Object>} Promise that resolves with the schema information
 */
export const getProductTablesSchema = async () => {
  try {
    const pool = dbConn.tb_pool;
    const tableNames = Object.values(TABLE_MASTER).map((table) => table.name);
    const schemas = {};

    for (const tableName of tableNames) {
      const schemaSQL = `DESCRIBE ${tableName};`;
      try {
        const columns = await dbModel.executeQuery(pool, schemaSQL);
        schemas[tableName] = columns;
      } catch (error) {
        schemas[tableName] = {
          error: `Table doesn't exist or error: ${error.message}`,
        };
      }
    }

    return schemas;
  } catch (error) {
    throw new AppError(
      `Failed to get product tables schema: ${error.message}`,
      500
    );
  }
};
