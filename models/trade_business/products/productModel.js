import * as dbConn from '../../../utils/dbConn.js';
import * as dbModel from '../../../models/dbModel.js';
import AppError from '../../../utils/appError.js';

/**
 * Creates the main products table
 * @returns {Promise} Promise that resolves when the table is created
 */
export const createProductsTable = async () => {
  try {
    const pool = dbConn.tb_pool;

    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS products (
        id VARCHAR(36) PRIMARY KEY,
        product_id VARCHAR(12) NOT NULL UNIQUE,
        icon_url VARCHAR(255),
        remark TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    await dbModel.executeQuery(pool, createTableSQL);
    return { message: 'products table created successfully' };
  } catch (error) {
    throw new AppError(
      `Failed to create products table: ${error.message}`,
      500
    );
  }
};

/**
 * Creates the name_types master table
 * @returns {Promise} Promise that resolves when the table is created
 */
export const createProductNameTypesTable = async () => {
  try {
    const pool = dbConn.tb_pool;

    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS name_types (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description VARCHAR(255),
        UNIQUE KEY unique_name_type (name)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    await dbModel.executeQuery(pool, createTableSQL);
    return { message: 'name_types table created successfully' };
  } catch (error) {
    throw new AppError(
      `Failed to create name_types table: ${error.message}`,
      500
    );
  }
};

/**
 * Creates the product_names table with reference to name_types
 * @returns {Promise} Promise that resolves when the table is created
 */
export const createProductNamesTable = async () => {
  try {
    const pool = dbConn.tb_pool;

    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS product_names (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id VARCHAR(36) NOT NULL,
        name VARCHAR(255) NOT NULL,
        name_type_id INT NOT NULL,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        FOREIGN KEY (name_type_id) REFERENCES name_types(id) ON DELETE RESTRICT,
        UNIQUE KEY unique_product_name_type (product_id, name_type_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    await dbModel.executeQuery(pool, createTableSQL);
    return { message: 'product_names table created successfully' };
  } catch (error) {
    throw new AppError(
      `Failed to create product_names table: ${error.message}`,
      500
    );
  }
};

/**
 * Creates the categories table
 * @returns {Promise} Promise that resolves when the table is created
 */
export const createCategoriesTable = async () => {
  try {
    const pool = dbConn.tb_pool;

    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description VARCHAR(255),
        parent_id INT,
        FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    await dbModel.executeQuery(pool, createTableSQL);
    return { message: 'categories table created successfully' };
  } catch (error) {
    throw new AppError(
      `Failed to create categories table: ${error.message}`,
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
      CREATE TABLE IF NOT EXISTS product_categories (
        product_id VARCHAR(36) NOT NULL,
        category_id INT NOT NULL,
        PRIMARY KEY (product_id, category_id),
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    await dbModel.executeQuery(pool, createTableSQL);
    return { message: 'product_categories table created successfully' };
  } catch (error) {
    throw new AppError(
      `Failed to create product_categories table: ${error.message}`,
      500
    );
  }
};

/**
 * Creates the customizations table
 * @returns {Promise} Promise that resolves when the table is created
 */
export const createCustomizationsTable = async () => {
  try {
    const pool = dbConn.tb_pool;

    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS customizations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id VARCHAR(36) NOT NULL,
        name VARCHAR(100) NOT NULL,
        code VARCHAR(50),
        remark TEXT,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    await dbModel.executeQuery(pool, createTableSQL);
    return { message: 'customizations table created successfully' };
  } catch (error) {
    throw new AppError(
      `Failed to create customizations table: ${error.message}`,
      500
    );
  }
};

/**
 * Creates the customization_images table
 * @returns {Promise} Promise that resolves when the table is created
 */
export const createCustomizationImagesTable = async () => {
  try {
    const pool = dbConn.tb_pool;

    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS customization_images (
        id INT AUTO_INCREMENT PRIMARY KEY,
        customization_id INT NOT NULL,
        image_url VARCHAR(255) NOT NULL,
        display_order INT DEFAULT 0,
        FOREIGN KEY (customization_id) REFERENCES customizations(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    await dbModel.executeQuery(pool, createTableSQL);
    return { message: 'customization_images table created successfully' };
  } catch (error) {
    throw new AppError(
      `Failed to create customization_images table: ${error.message}`,
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
      CREATE TABLE IF NOT EXISTS product_links (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id VARCHAR(36) NOT NULL,
        link VARCHAR(255) NOT NULL,
        remark TEXT,
        link_date DATE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    await dbModel.executeQuery(pool, createTableSQL);
    return { message: 'product_links table created successfully' };
  } catch (error) {
    throw new AppError(
      `Failed to create product_links table: ${error.message}`,
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
      CREATE TABLE IF NOT EXISTS product_link_images (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_link_id INT NOT NULL,
        image_url VARCHAR(255) NOT NULL,
        display_order INT DEFAULT 0,
        FOREIGN KEY (product_link_id) REFERENCES product_links(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    await dbModel.executeQuery(pool, createTableSQL);
    return { message: 'product_link_images table created successfully' };
  } catch (error) {
    throw new AppError(
      `Failed to create product_link_images table: ${error.message}`,
      500
    );
  }
};

/**
 * Creates the alibaba_ids table
 * @returns {Promise} Promise that resolves when the table is created
 */
export const createAlibabaIdsTable = async () => {
  try {
    const pool = dbConn.tb_pool;

    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS alibaba_ids (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id VARCHAR(36) NOT NULL,
        value VARCHAR(100) NOT NULL,
        link VARCHAR(255),
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    await dbModel.executeQuery(pool, createTableSQL);
    return { message: 'alibaba_ids table created successfully' };
  } catch (error) {
    throw new AppError(
      `Failed to create alibaba_ids table: ${error.message}`,
      500
    );
  }
};

/**
 * Creates the packing_types master table
 * @returns {Promise} Promise that resolves when the table is created
 */
export const createPackingTypesTable = async () => {
  try {
    const pool = dbConn.tb_pool;

    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS packing_types (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description VARCHAR(255),
        UNIQUE KEY unique_packing_name (name)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    await dbModel.executeQuery(pool, createTableSQL);
    return { message: 'packing_types table created successfully' };
  } catch (error) {
    throw new AppError(
      `Failed to create packing_types table: ${error.message}`,
      500
    );
  }
};

/**
 * Creates the certificate_types master table
 * @returns {Promise} Promise that resolves when the table is created
 */
export const createCertificateTypesTable = async () => {
  try {
    const pool = dbConn.tb_pool;

    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS certificate_types (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description VARCHAR(255),
        code VARCHAR(50),
        UNIQUE KEY unique_certificate_type_name (name)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    await dbModel.executeQuery(pool, createTableSQL);
    return { message: 'certificate_types table created successfully' };
  } catch (error) {
    throw new AppError(
      `Failed to create certificate_types table: ${error.message}`,
      500
    );
  }
};

/**
 * Creates the certificates table with reference to certificate_types
 * @returns {Promise} Promise that resolves when the table is created
 */
export const createProductCertificatesTable = async () => {
  try {
    const pool = dbConn.tb_pool;

    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS certificates (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id VARCHAR(36) NOT NULL,
        certificate_type_id INT NOT NULL,
        remark TEXT,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        FOREIGN KEY (certificate_type_id) REFERENCES certificate_types(id) ON DELETE RESTRICT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    await dbModel.executeQuery(pool, createTableSQL);
    return { message: 'certificates table created successfully' };
  } catch (error) {
    throw new AppError(
      `Failed to create certificates table: ${error.message}`,
      500
    );
  }
};
/**
 * Creates the certificate_files table
 * @returns {Promise} Promise that resolves when the table is created
 */
export const createProductCertificateFilesTable = async () => {
  try {
    const pool = dbConn.tb_pool;

    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS certificate_files (
        id INT AUTO_INCREMENT PRIMARY KEY,
        certificate_id INT NOT NULL,
        file_url VARCHAR(255) NOT NULL,
        FOREIGN KEY (certificate_id) REFERENCES certificates(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    await dbModel.executeQuery(pool, createTableSQL);
    return { message: 'certificate_files table created successfully' };
  } catch (error) {
    throw new AppError(
      `Failed to create certificate_files table: ${error.message}`,
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
    await dbModel.executeQuery(pool, 'DROP TABLE IF EXISTS certificate_files;');
    await dbModel.executeQuery(pool, 'DROP TABLE IF EXISTS certificates;');
    await dbModel.executeQuery(pool, 'DROP TABLE IF EXISTS certificate_types;');
    await dbModel.executeQuery(pool, 'DROP TABLE IF EXISTS product_packings;');
    await dbModel.executeQuery(pool, 'DROP TABLE IF EXISTS packing_types;');
    await dbModel.executeQuery(pool, 'DROP TABLE IF EXISTS alibaba_ids;');
    await dbModel.executeQuery(
      pool,
      'DROP TABLE IF EXISTS product_link_images;'
    );
    await dbModel.executeQuery(pool, 'DROP TABLE IF EXISTS product_links;');
    await dbModel.executeQuery(
      pool,
      'DROP TABLE IF EXISTS customization_images;'
    );
    await dbModel.executeQuery(pool, 'DROP TABLE IF EXISTS customizations;');
    await dbModel.executeQuery(
      pool,
      'DROP TABLE IF EXISTS product_categories;'
    );
    await dbModel.executeQuery(pool, 'DROP TABLE IF EXISTS categories;');
    await dbModel.executeQuery(pool, 'DROP TABLE IF EXISTS product_names;');
    await dbModel.executeQuery(pool, 'DROP TABLE IF EXISTS name_types;');
    await dbModel.executeQuery(pool, 'DROP TABLE IF EXISTS products;');

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
    const tables = [
      'products',
      'name_types',
      'product_names',
      'categories',
      'product_categories',
      'customizations',
      'customization_images',
      'product_links',
      'product_link_images',
      'alibaba_ids',
      'packing_types',
      'product_packings',
      'certificate_types',
      'certificates',
      'certificate_files',
    ];

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
    const tables = [
      'products',
      'name_types',
      'product_names',
      'categories',
      'product_categories',
      'customizations',
      'customization_images',
      'product_links',
      'product_link_images',
      'alibaba_ids',
      'packing_types',
      'product_packings',
      'certificate_types',
      'certificates',
      'certificate_files',
    ];

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
