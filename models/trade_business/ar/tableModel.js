import AppError from '../../../utils/appError.js';
import { tradeBusinessDbc } from '../../dbModel.js';
import { TABLE_MASTER, generateCreateTableSQL } from '../../tables.js';

const AR_TABLE_KEYS = [
  'AR_INVOICES',
  'ARI_SHIPPING_DETAILS',
  'ARI_SHIPPING_FILES',
  'ARI_PRODUCT_DETAILS',
  'ARI_PRODUCT_FILES',
  'ARI_SERVICE_DETAILS',
  'ARI_SERVICE_FILES',
];

const createTable = async (tableKey) => {
  try {
    const tableDefinition = TABLE_MASTER[tableKey];
    if (!tableDefinition) {
      throw new Error(
        `Table definition for ${tableKey} not found in TABLE_MASTER`,
      );
    }
    await tradeBusinessDbc.executeQuery(
      generateCreateTableSQL(tableDefinition),
    );
    return { message: `${tableDefinition.name} table created successfully` };
  } catch (error) {
    const tableName = TABLE_MASTER[tableKey]?.name || tableKey;
    throw new AppError(
      `Failed to create ${tableName} table: ${error.message}`,
      500,
    );
  }
};

export const createAllArTables = async () => {
  try {
    for (const tableKey of AR_TABLE_KEYS) {
      await createTable(tableKey);
    }
    return { message: 'All AR tables created successfully' };
  } catch (error) {
    throw new AppError(`Failed to create AR tables: ${error.message}`, 500);
  }
};

export const dropAllArTables = async () => {
  try {
    for (const tableKey of [...AR_TABLE_KEYS].reverse()) {
      await tradeBusinessDbc.executeQuery(
        `DROP TABLE IF EXISTS ${TABLE_MASTER[tableKey].name};`,
      );
    }
    return { message: 'All AR tables dropped successfully' };
  } catch (error) {
    throw new AppError(`Failed to drop AR tables: ${error.message}`, 500);
  }
};

export const checkArTablesExist = async () => {
  try {
    const tableNames = AR_TABLE_KEYS.map((key) => TABLE_MASTER[key].name);
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
      `Failed to check if AR tables exist: ${error.message}`,
      500,
    );
  }
};

export const getArTablesSchema = async () => {
  try {
    const tableNames = AR_TABLE_KEYS.map((key) => TABLE_MASTER[key].name);
    const schemas = {};

    for (const tableName of tableNames) {
      try {
        schemas[tableName] = await tradeBusinessDbc.executeQuery(
          `DESCRIBE ${tableName};`,
        );
      } catch (error) {
        schemas[tableName] = {
          error: `Table doesn't exist or error: ${error.message}`,
        };
      }
    }

    return schemas;
  } catch (error) {
    throw new AppError(`Failed to get AR tables schema: ${error.message}`, 500);
  }
};
