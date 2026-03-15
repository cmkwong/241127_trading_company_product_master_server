import AppError from '../../../utils/appError.js';
import { tradeBusinessDbc } from '../../dbModel.js';
import { TABLE_MASTER, generateCreateTableSQL } from '../../tables.js';

const PURCHASE_TABLE_KEYS = [
  'PURCHASE_REQUESTS',
  'PURCHASE_SHIPPING_DETAILS',
  'PURCHASE_SHIPPING_IMAGES',
  'PURCHASE_PRODUCT_DETAILS',
  'PURCHASE_PRODUCT_IMAGES',
  'PURCHASE_SERVICE_DETAILS',
  'PURCHASE_SERVICE_IMAGES',
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

export const createAllPurchaseTables = async () => {
  try {
    for (const tableKey of PURCHASE_TABLE_KEYS) {
      await createTable(tableKey);
    }
    return { message: 'All purchase tables created successfully' };
  } catch (error) {
    throw new AppError(
      `Failed to create purchase tables: ${error.message}`,
      500,
    );
  }
};

export const dropAllPurchaseTables = async () => {
  try {
    for (const tableKey of [...PURCHASE_TABLE_KEYS].reverse()) {
      await tradeBusinessDbc.executeQuery(
        `DROP TABLE IF EXISTS ${TABLE_MASTER[tableKey].name};`,
      );
    }
    return { message: 'All purchase tables dropped successfully' };
  } catch (error) {
    throw new AppError(`Failed to drop purchase tables: ${error.message}`, 500);
  }
};

export const checkPurchaseTablesExist = async () => {
  try {
    const tableNames = PURCHASE_TABLE_KEYS.map((key) => TABLE_MASTER[key].name);
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
      `Failed to check if purchase tables exist: ${error.message}`,
      500,
    );
  }
};

export const getPurchaseTablesSchema = async () => {
  try {
    const tableNames = PURCHASE_TABLE_KEYS.map((key) => TABLE_MASTER[key].name);
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
    throw new AppError(
      `Failed to get purchase tables schema: ${error.message}`,
      500,
    );
  }
};
