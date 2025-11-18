import * as dbConn from '../../../utils/dbConn.js';
import * as dbModel from '../../dbModel.js';
import AppError from '../../../utils/appError.js';
import { TABLE_NAMES } from '../../tables.js';

/**
 * Creates the main products table
 * @returns {Promise} Promise that resolves when the table is created
 */
export const createProductsTable = async () => {
  try {
    const pool = dbConn.tb_pool;

    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS ${TABLE_NAMES.PRODUCTS} (
        id VARCHAR(36) PRIMARY KEY,
        product_id VARCHAR(12) NOT NULL UNIQUE,
        icon_url VARCHAR(255),
        remark TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    await dbModel.executeQuery(pool, createTableSQL);
    return { message: `${TABLE_NAMES.PRODUCTS} table created successfully` };
  } catch (error) {
    throw new AppError(
      `Failed to create ${TABLE_NAMES.PRODUCTS} table: ${error.message}`,
      500
    );
  }
};

/**
 * Creates the master_product_name_types master table
 * @returns {Promise} Promise that resolves when the table is created
 */
export const createProductNameTypesTable = async () => {
  try {
    const pool = dbConn.tb_pool;

    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS ${TABLE_NAMES.PRODUCT_NAME_TYPES} (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description VARCHAR(255),
        UNIQUE KEY unique_name_type (name)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    await dbModel.executeQuery(pool, createTableSQL);
    return {
      message: `${TABLE_NAMES.PRODUCT_NAME_TYPES} table created successfully`,
    };
  } catch (error) {
    throw new AppError(
      `Failed to create ${TABLE_NAMES.PRODUCT_NAME_TYPES} table: ${error.message}`,
      500
    );
  }
};

/**
 * Creates the product_names table with reference to master_product_name_types
 * @returns {Promise} Promise that resolves when the table is created
 */
export const createProductNamesTable = async () => {
  try {
    const pool = dbConn.tb_pool;

    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS ${TABLE_NAMES.PRODUCT_NAMES} (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id VARCHAR(36) NOT NULL,
        name VARCHAR(255) NOT NULL,
        name_type_id INT NOT NULL,
        FOREIGN KEY (product_id) REFERENCES ${TABLE_NAMES.PRODUCTS}(id) ON DELETE CASCADE,
        FOREIGN KEY (name_type_id) REFERENCES ${TABLE_NAMES.PRODUCT_NAME_TYPES}(id) ON DELETE RESTRICT,
        UNIQUE KEY unique_product_name_type (product_id, name_type_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    await dbModel.executeQuery(pool, createTableSQL);
    return {
      message: `${TABLE_NAMES.PRODUCT_NAMES} table created successfully`,
    };
  } catch (error) {
    throw new AppError(
      `Failed to create ${TABLE_NAMES.PRODUCT_NAMES} table: ${error.message}`,
      500
    );
  }
};

/**
 * Creates the master_categories table
 * @returns {Promise} Promise that resolves when the table is created
 */
export const createCategoriesTable = async () => {
  try {
    const pool = dbConn.tb_pool;

    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS ${TABLE_NAMES.CATEGORIES} (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description VARCHAR(255),
        parent_id INT,
        FOREIGN KEY (parent_id) REFERENCES ${TABLE_NAMES.CATEGORIES}(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    await dbModel.executeQuery(pool, createTableSQL);
    return { message: `${TABLE_NAMES.CATEGORIES} table created successfully` };
  } catch (error) {
    throw new AppError(
      `Failed to create ${TABLE_NAMES.CATEGORIES} table: ${error.message}`,
      500
    );
  }
};

/**
 * Creates the product_categories junction table
 * @returns {Promise} Promise that resolves when the table is created
 */
export const createProductCategoriesTable = async () => {
  try {
    const pool = dbConn.tb_pool;

    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS ${TABLE_NAMES.PRODUCT_CATEGORIES} (
        product_id VARCHAR(36) NOT NULL,
        category_id INT NOT NULL,
        PRIMARY KEY (product_id, category_id),
        FOREIGN KEY (product_id) REFERENCES ${TABLE_NAMES.PRODUCTS}(id) ON DELETE CASCADE,
        FOREIGN KEY (category_id) REFERENCES ${TABLE_NAMES.CATEGORIES}(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    await dbModel.executeQuery(pool, createTableSQL);
    return {
      message: `${TABLE_NAMES.PRODUCT_CATEGORIES} table created successfully`,
    };
  } catch (error) {
    throw new AppError(
      `Failed to create ${TABLE_NAMES.PRODUCT_CATEGORIES} table: ${error.message}`,
      500
    );
  }
};

/**
 * Creates the product_customizations table
 * @returns {Promise} Promise that resolves when the table is created
 */
export const createCustomizationsTable = async () => {
  try {
    const pool = dbConn.tb_pool;

    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS ${TABLE_NAMES.PRODUCT_CUSTOMIZATIONS} (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id VARCHAR(36) NOT NULL,
        name VARCHAR(100) NOT NULL,
        code VARCHAR(50),
        remark TEXT,
        FOREIGN KEY (product_id) REFERENCES ${TABLE_NAMES.PRODUCTS}(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    await dbModel.executeQuery(pool, createTableSQL);
    return {
      message: `${TABLE_NAMES.PRODUCT_CUSTOMIZATIONS} table created successfully`,
    };
  } catch (error) {
    throw new AppError(
      `Failed to create ${TABLE_NAMES.PRODUCT_CUSTOMIZATIONS} table: ${error.message}`,
      500
    );
  }
};

/**
 * Creates the product_customization_images table
 * @returns {Promise} Promise that resolves when the table is created
 */
export const createCustomizationImagesTable = async () => {
  try {
    const pool = dbConn.tb_pool;

    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS ${TABLE_NAMES.PRODUCT_CUSTOMIZATION_IMAGES} (
        id INT AUTO_INCREMENT PRIMARY KEY,
        customization_id INT NOT NULL,
        image_url VARCHAR(255) NOT NULL,
        display_order INT DEFAULT 0,
        FOREIGN KEY (customization_id) REFERENCES ${TABLE_NAMES.PRODUCT_CUSTOMIZATIONS}(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    await dbModel.executeQuery(pool, createTableSQL);
    return {
      message: `${TABLE_NAMES.PRODUCT_CUSTOMIZATION_IMAGES} table created successfully`,
    };
  } catch (error) {
    throw new AppError(
      `Failed to create ${TABLE_NAMES.PRODUCT_CUSTOMIZATION_IMAGES} table: ${error.message}`,
      500
    );
  }
};

/**
 * Creates the product_links table
 * @returns {Promise} Promise that resolves when the table is created
 */
export const createProductLinksTable = async () => {
  try {
    const pool = dbConn.tb_pool;

    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS ${TABLE_NAMES.PRODUCT_LINKS} (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id VARCHAR(36) NOT NULL,
        link VARCHAR(255) NOT NULL,
        remark TEXT,
        link_date DATE,
        FOREIGN KEY (product_id) REFERENCES ${TABLE_NAMES.PRODUCTS}(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    await dbModel.executeQuery(pool, createTableSQL);
    return {
      message: `${TABLE_NAMES.PRODUCT_LINKS} table created successfully`,
    };
  } catch (error) {
    throw new AppError(
      `Failed to create ${TABLE_NAMES.PRODUCT_LINKS} table: ${error.message}`,
      500
    );
  }
};

/**
 * Creates the product_link_images table
 * @returns {Promise} Promise that resolves when the table is created
 */
export const createProductLinkImagesTable = async () => {
  try {
    const pool = dbConn.tb_pool;

    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS ${TABLE_NAMES.PRODUCT_LINK_IMAGES} (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_link_id INT NOT NULL,
        image_url VARCHAR(255) NOT NULL,
        display_order INT DEFAULT 0,
        FOREIGN KEY (product_link_id) REFERENCES ${TABLE_NAMES.PRODUCT_LINKS}(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    await dbModel.executeQuery(pool, createTableSQL);
    return {
      message: `${TABLE_NAMES.PRODUCT_LINK_IMAGES} table created successfully`,
    };
  } catch (error) {
    throw new AppError(
      `Failed to create ${TABLE_NAMES.PRODUCT_LINK_IMAGES} table: ${error.message}`,
      500
    );
  }
};

/**
 * Creates the product_alibaba_ids table
 * @returns {Promise} Promise that resolves when the table is created
 */
export const createAlibabaIdsTable = async () => {
  try {
    const pool = dbConn.tb_pool;

    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS ${TABLE_NAMES.PRODUCT_ALIBABA_IDS} (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id VARCHAR(36) NOT NULL,
        value VARCHAR(100) NOT NULL,
        link VARCHAR(255),
        FOREIGN KEY (product_id) REFERENCES ${TABLE_NAMES.PRODUCTS}(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    await dbModel.executeQuery(pool, createTableSQL);
    return {
      message: `${TABLE_NAMES.PRODUCT_ALIBABA_IDS} table created successfully`,
    };
  } catch (error) {
    throw new AppError(
      `Failed to create ${TABLE_NAMES.PRODUCT_ALIBABA_IDS} table: ${error.message}`,
      500
    );
  }
};

/**
 * Creates the master_packing_types master table
 * @returns {Promise} Promise that resolves when the table is created
 */
export const createPackingTypesTable = async () => {
  try {
    const pool = dbConn.tb_pool;

    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS ${TABLE_NAMES.PACKING_TYPES} (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description VARCHAR(255),
        UNIQUE KEY unique_packing_name (name)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    await dbModel.executeQuery(pool, createTableSQL);
    return {
      message: `${TABLE_NAMES.PACKING_TYPES} table created successfully`,
    };
  } catch (error) {
    throw new AppError(
      `Failed to create ${TABLE_NAMES.PACKING_TYPES} table: ${error.message}`,
      500
    );
  }
};

/**
 * Creates the product_packings table with reference to master_packing_types
 * @returns {Promise} Promise that resolves when the table is created
 */
export const createProductPackingsTable = async () => {
  try {
    const pool = dbConn.tb_pool;

    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS ${TABLE_NAMES.PRODUCT_PACKINGS} (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id VARCHAR(36) NOT NULL,
        packing_type_id INT NOT NULL,
        length DECIMAL(10,2) NOT NULL,
        width DECIMAL(10,2) NOT NULL,
        height DECIMAL(10,2) NOT NULL,
        quantity INT NOT NULL DEFAULT 1,
        weight DECIMAL(10,2) NOT NULL,
        FOREIGN KEY (product_id) REFERENCES ${TABLE_NAMES.PRODUCTS}(id) ON DELETE CASCADE,
        FOREIGN KEY (packing_type_id) REFERENCES ${TABLE_NAMES.PACKING_TYPES}(id) ON DELETE RESTRICT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    await dbModel.executeQuery(pool, createTableSQL);
    return {
      message: `${TABLE_NAMES.PRODUCT_PACKINGS} table created successfully`,
    };
  } catch (error) {
    throw new AppError(
      `Failed to create ${TABLE_NAMES.PRODUCT_PACKINGS} table: ${error.message}`,
      500
    );
  }
};

/**
 * Creates the master_certificate_types master table
 * @returns {Promise} Promise that resolves when the table is created
 */
export const createCertificateTypesTable = async () => {
  try {
    const pool = dbConn.tb_pool;

    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS ${TABLE_NAMES.CERTIFICATE_TYPES} (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description VARCHAR(255),
        UNIQUE KEY unique_certificate_type_name (name)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    await dbModel.executeQuery(pool, createTableSQL);
    return {
      message: `${TABLE_NAMES.CERTIFICATE_TYPES} table created successfully`,
    };
  } catch (error) {
    throw new AppError(
      `Failed to create ${TABLE_NAMES.CERTIFICATE_TYPES} table: ${error.message}`,
      500
    );
  }
};

/**
 * Creates the product_certificates table with reference to master_certificate_types
 * @returns {Promise} Promise that resolves when the table is created
 */
export const createProductCertificatesTable = async () => {
  try {
    const pool = dbConn.tb_pool;

    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS ${TABLE_NAMES.PRODUCT_CERTIFICATES} (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id VARCHAR(36) NOT NULL,
        certificate_type_id INT NOT NULL,
        remark TEXT,
        FOREIGN KEY (product_id) REFERENCES ${TABLE_NAMES.PRODUCTS}(id) ON DELETE CASCADE,
        FOREIGN KEY (certificate_type_id) REFERENCES ${TABLE_NAMES.CERTIFICATE_TYPES}(id) ON DELETE RESTRICT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    await dbModel.executeQuery(pool, createTableSQL);
    return {
      message: `${TABLE_NAMES.PRODUCT_CERTIFICATES} table created successfully`,
    };
  } catch (error) {
    throw new AppError(
      `Failed to create ${TABLE_NAMES.PRODUCT_CERTIFICATES} table: ${error.message}`,
      500
    );
  }
};

/**
 * Creates the product_certificate_files table
 * @returns {Promise} Promise that resolves when the table is created
 */
export const createProductCertificateFilesTable = async () => {
  try {
    const pool = dbConn.tb_pool;

    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS ${TABLE_NAMES.PRODUCT_CERTIFICATE_FILES} (
        id INT AUTO_INCREMENT PRIMARY KEY,
        certificate_id INT NOT NULL,
        file_url VARCHAR(255) NOT NULL,
        FOREIGN KEY (certificate_id) REFERENCES ${TABLE_NAMES.PRODUCT_CERTIFICATES}(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    await dbModel.executeQuery(pool, createTableSQL);
    return {
      message: `${TABLE_NAMES.PRODUCT_CERTIFICATE_FILES} table created successfully`,
    };
  } catch (error) {
    throw new AppError(
      `Failed to create ${TABLE_NAMES.PRODUCT_CERTIFICATE_FILES} table: ${error.message}`,
      500
    );
  }
};

/**
 * Creates all product-related tables in the correct order to respect foreign key constraints
 * @returns {Promise} Promise that resolves when all tables are created
 */
export const createAllProductTables = async () => {
  try {
    // Create tables in order to respect foreign key constraints
    await createProductsTable();
    await createProductNameTypesTable();
    await createProductNamesTable();
    await createCategoriesTable();
    await createProductCategoriesTable();
    await createCustomizationsTable();
    await createCustomizationImagesTable();
    await createProductLinksTable();
    await createProductLinkImagesTable();
    await createAlibabaIdsTable();
    await createPackingTypesTable();
    await createProductPackingsTable();
    await createCertificateTypesTable();
    await createProductCertificatesTable();
    await createProductCertificateFilesTable();

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
    await dbModel.executeQuery(
      pool,
      `DROP TABLE IF EXISTS ${TABLE_NAMES.PRODUCT_CERTIFICATE_FILES};`
    );
    await dbModel.executeQuery(
      pool,
      `DROP TABLE IF EXISTS ${TABLE_NAMES.PRODUCT_CERTIFICATES};`
    );
    await dbModel.executeQuery(
      pool,
      `DROP TABLE IF EXISTS ${TABLE_NAMES.CERTIFICATE_TYPES};`
    );
    await dbModel.executeQuery(
      pool,
      `DROP TABLE IF EXISTS ${TABLE_NAMES.PRODUCT_PACKINGS};`
    );
    await dbModel.executeQuery(
      pool,
      `DROP TABLE IF EXISTS ${TABLE_NAMES.PACKING_TYPES};`
    );
    await dbModel.executeQuery(
      pool,
      `DROP TABLE IF EXISTS ${TABLE_NAMES.PRODUCT_ALIBABA_IDS};`
    );
    await dbModel.executeQuery(
      pool,
      `DROP TABLE IF EXISTS ${TABLE_NAMES.PRODUCT_LINK_IMAGES};`
    );
    await dbModel.executeQuery(
      pool,
      `DROP TABLE IF EXISTS ${TABLE_NAMES.PRODUCT_LINKS};`
    );
    await dbModel.executeQuery(
      pool,
      `DROP TABLE IF EXISTS ${TABLE_NAMES.PRODUCT_CUSTOMIZATION_IMAGES};`
    );
    await dbModel.executeQuery(
      pool,
      `DROP TABLE IF EXISTS ${TABLE_NAMES.PRODUCT_CUSTOMIZATIONS};`
    );
    await dbModel.executeQuery(
      pool,
      `DROP TABLE IF EXISTS ${TABLE_NAMES.PRODUCT_CATEGORIES};`
    );
    await dbModel.executeQuery(
      pool,
      `DROP TABLE IF EXISTS ${TABLE_NAMES.CATEGORIES};`
    );
    await dbModel.executeQuery(
      pool,
      `DROP TABLE IF EXISTS ${TABLE_NAMES.PRODUCT_NAMES};`
    );
    await dbModel.executeQuery(
      pool,
      `DROP TABLE IF EXISTS ${TABLE_NAMES.PRODUCT_NAME_TYPES};`
    );
    await dbModel.executeQuery(
      pool,
      `DROP TABLE IF EXISTS ${TABLE_NAMES.PRODUCTS};`
    );

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
    const tables = Object.values(TABLE_NAMES);

    const checkTableSQL = `
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = DATABASE() 
      AND table_name IN (${tables.map(() => '?').join(',')});
    `;

    const result = await dbModel.executeQuery(pool, checkTableSQL, tables);
    return result[0].count === tables.length;
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
    const tables = Object.values(TABLE_NAMES);
    const schemas = {};

    for (const table of tables) {
      const schemaSQL = `DESCRIBE ${table};`;
      try {
        const columns = await dbModel.executeQuery(pool, schemaSQL);
        schemas[table] = columns;
      } catch (error) {
        schemas[table] = {
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
