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
  return createTable('PRODUCT_NAME_TYPES');
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
  return createTable('CATEGORIES');
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
  return createTable('PACKING_TYPES');
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
  return createTable('CERTIFICATE_TYPES');
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
 * Creates all product-related tables in the correct order to respect foreign key constraints
 * @returns {Promise} Promise that resolves when all tables are created
 */
export const createAllProductTables = async () => {
  try {
    // Create tables in order to respect foreign key constraints
    // The order is important due to foreign key constraints
    const tableCreationOrder = [
      'PRODUCTS',
      'MASTER_PRODUCT_NAME_TYPES',
      'PRODUCT_NAMES',
      'MASTER_CATEGORIES',
      'PRODUCT_CATEGORIES',
      'PRODUCT_CUSTOMIZATIONS',
      'PRODUCT_CUSTOMIZATION_IMAGES',
      'PRODUCT_LINKS',
      'PRODUCT_LINK_IMAGES',
      'PRODUCT_ALIBABA_IDS',
      'MASTER_PACKING_TYPES',
      'PRODUCT_PACKINGS',
      'MASTER_CERTIFICATE_TYPES',
      'PRODUCT_CERTIFICATES',
      'PRODUCT_CERTIFICATE_FILES',
    ];

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

    // Drop tables in reverse order to respect foreign key constraints
    const tableDropOrder = [
      'PRODUCT_CERTIFICATE_FILES',
      'PRODUCT_CERTIFICATES',
      'PRODUCT_PACKINGS',
      'PRODUCT_ALIBABA_IDS',
      'PRODUCT_LINK_IMAGES',
      'PRODUCT_LINKS',
      'PRODUCT_CUSTOMIZATION_IMAGES',
      'PRODUCT_CUSTOMIZATIONS',
      'PRODUCT_CATEGORIES',
      'PRODUCT_NAMES',
      'MASTER_PACKING_TYPES',
      'MASTER_CERTIFICATE_TYPES',
      'MASTER_CATEGORIES',
      'MASTER_PRODUCT_NAME_TYPES',
      'PRODUCTS',
    ];

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

/**
 * Initializes master data for product-related tables
 * @returns {Promise} Promise that resolves when data is initialized
 */
export const initializeMasterData = async () => {
  try {
    const pool = dbConn.tb_pool;

    // Initialize product name types
    const nameTypes = [
      { name: 'English', description: 'English product name' },
      { name: 'Chinese', description: 'Chinese product name' },
      { name: 'Internal', description: 'Internal reference name' },
      { name: 'Marketing', description: 'Marketing/promotional name' },
    ];

    for (const type of nameTypes) {
      await dbModel.executeQuery(
        pool,
        `INSERT IGNORE INTO ${TABLE_MASTER.PRODUCT_NAME_TYPES.name} (name, description) VALUES (?, ?)`,
        [type.name, type.description]
      );
    }

    // Initialize packing types
    const packingTypes = [
      { name: 'Carton', description: 'Standard cardboard carton' },
      { name: 'Pallet', description: 'Wooden pallet' },
      { name: 'Container', description: 'Shipping container' },
      { name: 'Individual', description: 'Individual product packaging' },
    ];

    for (const type of packingTypes) {
      await dbModel.executeQuery(
        pool,
        `INSERT IGNORE INTO ${TABLE_MASTER.PACKING_TYPES.name} (name, description) VALUES (?, ?)`,
        [type.name, type.description]
      );
    }

    // Initialize certificate types
    const certificateTypes = [
      { name: 'CE', description: 'European Conformity' },
      { name: 'RoHS', description: 'Restriction of Hazardous Substances' },
      { name: 'FDA', description: 'Food and Drug Administration' },
      { name: 'ISO9001', description: 'Quality Management System' },
    ];

    for (const type of certificateTypes) {
      await dbModel.executeQuery(
        pool,
        `INSERT IGNORE INTO ${TABLE_MASTER.CERTIFICATE_TYPES.name} (name, description) VALUES (?, ?)`,
        [type.name, type.description]
      );
    }

    return { message: 'Master data initialized successfully' };
  } catch (error) {
    throw new AppError(
      `Failed to initialize master data: ${error.message}`,
      500
    );
  }
};
