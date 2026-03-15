import AppError from '../../../utils/appError.js';
import { tradeBusinessDbc } from '../../dbModel.js';
import { TABLE_MASTER, generateCreateTableSQL } from '../../tables.js';

const SALES_TABLE_KEYS = [
  'SALES_QUOTATIONS',
  'SALES_SHIPPING_DETAILS',
  'SALES_SHIPPING_PRICES',
  'SALES_SHIPPING_IMAGES',
  'SALES_PRODUCT_DETAILS',
  'SALES_PRODUCT_DETAIL_IMAGE_SELECTIONS',
  'SALES_SERVICE_DETAILS',
  'SALES_SERVICE_DETAIL_IMAGE_SELECTIONS',
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

export const createAllSalesTables = async () => {
  try {
    for (const tableKey of SALES_TABLE_KEYS) {
      await createTable(tableKey);
    }
    return { message: 'All sales tables created successfully' };
  } catch (error) {
    throw new AppError(`Failed to create sales tables: ${error.message}`, 500);
  }
};

export const dropAllSalesTables = async () => {
  try {
    const tableDropOrder = [...SALES_TABLE_KEYS].reverse();
    for (const tableKey of tableDropOrder) {
      const tableName = TABLE_MASTER[tableKey].name;
      await tradeBusinessDbc.executeQuery(`DROP TABLE IF EXISTS ${tableName};`);
    }
    return { message: 'All sales tables dropped successfully' };
  } catch (error) {
    throw new AppError(`Failed to drop sales tables: ${error.message}`, 500);
  }
};

export const checkSalesTablesExist = async () => {
  try {
    const tableNames = SALES_TABLE_KEYS.map((key) => TABLE_MASTER[key].name);
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
      `Failed to check if sales tables exist: ${error.message}`,
      500,
    );
  }
};

export const getSalesTablesSchema = async () => {
  try {
    const tableNames = SALES_TABLE_KEYS.map((key) => TABLE_MASTER[key].name);
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
      `Failed to get sales tables schema: ${error.message}`,
      500,
    );
  }
};
