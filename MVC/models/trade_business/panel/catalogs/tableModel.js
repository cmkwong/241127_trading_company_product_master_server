import AppError from '../../../../../utils/appError.js';
import { tradeBusinessDbc } from '../../../dbModel.js';
import { TABLE_MASTER, generateCreateTableSQL } from '../../../tables.js';

const CATALOG_TABLE_KEYS = [
  'CATALOGS',
  'CATALOG_PRODUCT_ROWS',
  'CATALOG_PRODUCT_ROW_IMAGES',
  'CATALOG_PRODUCT_ROW_ATTRIBUTE_DISPLAYS',
];

const createTable = async (tableKey) => {
  try {
    const tableDefinition = TABLE_MASTER[tableKey];

    if (!tableDefinition) {
      throw new Error(
        `Table definition for ${tableKey} not found in TABLE_MASTER`,
      );
    }

    const createTableSQL = generateCreateTableSQL(tableDefinition);
    await tradeBusinessDbc.executeQuery(createTableSQL);

    return { message: `${tableDefinition.name} table created successfully` };
  } catch (error) {
    const tableName = TABLE_MASTER[tableKey]?.name || tableKey;
    throw new AppError(
      `Failed to create ${tableName} table: ${error.message}`,
      500,
    );
  }
};

export const createAllCatalogsTables = async () => {
  try {
    for (const tableKey of CATALOG_TABLE_KEYS) {
      await createTable(tableKey);
    }
    return { message: 'All catalog tables created successfully' };
  } catch (error) {
    throw new AppError(
      `Failed to create catalog tables: ${error.message}`,
      500,
    );
  }
};

export const dropAllCatalogsTables = async () => {
  try {
    const tableDropOrder = [...CATALOG_TABLE_KEYS].reverse();
    for (const tableKey of tableDropOrder) {
      const tableName = TABLE_MASTER[tableKey].name;
      await tradeBusinessDbc.executeQuery(`DROP TABLE IF EXISTS ${tableName};`);
    }
    return { message: 'All catalog tables dropped successfully' };
  } catch (error) {
    throw new AppError(
      `Failed to drop catalog tables: ${error.message}`,
      500,
    );
  }
};

export const checkCatalogsTablesExist = async () => {
  try {
    const tableNames = CATALOG_TABLE_KEYS.map((key) => TABLE_MASTER[key].name);
    const checkTableSQL = `
      SELECT COUNT(*) as count
      FROM information_schema.tables
      WHERE table_schema = DATABASE()
      AND table_name IN (${tableNames.map(() => '?').join(',')});
    `;

    const result = await tradeBusinessDbc.executeQuery(
      checkTableSQL,
      tableNames,
    );
    return result[0].count === tableNames.length;
  } catch (error) {
    throw new AppError(
      `Failed to check if catalog tables exist: ${error.message}`,
      500,
    );
  }
};

export const getCatalogsTablesSchema = async () => {
  try {
    const tableNames = CATALOG_TABLE_KEYS.map((key) => TABLE_MASTER[key].name);
    const schemas = {};

    for (const tableName of tableNames) {
      const schemaSQL = `DESCRIBE ${tableName};`;
      try {
        const columns = await tradeBusinessDbc.executeQuery(schemaSQL);
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
      `Failed to get catalog tables schema: ${error.message}`,
      500,
    );
  }
};
