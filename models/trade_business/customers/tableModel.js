import AppError from '../../../utils/appError.js';
import { tradeBusinessDbc } from '../../dbModel.js';
import { TABLE_MASTER, generateCreateTableSQL } from '../../tables.js';

const CUSTOMER_TABLE_KEYS = [
  'MASTER_CUSTOMER_NAME_TYPES',
  'MASTER_CUSTOMER_TYPES',
  'MASTER_CUSTOMER_IMAGE_TYPES',
  'CUSTOMERS',
  'CUSTOMER_NAMES',
  'CUSTOMER_TYPES',
  'CUSTOMER_ADDRESSES',
  'CUSTOMER_CONTACTS',
  'CUSTOMER_IMAGES',
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

    return {
      message: `${tableDefinition.name} table created successfully`,
    };
  } catch (error) {
    const tableName = TABLE_MASTER[tableKey]?.name || tableKey;
    throw new AppError(
      `Failed to create ${tableName} table: ${error.message}`,
      500,
    );
  }
};

const normalizeCustomerTableType = (tableType) => {
  if (!tableType) {
    return null;
  }

  if (tableType === 'data') {
    return 'customers-data';
  }

  if (tableType === 'master') {
    return 'customers-master';
  }

  return tableType;
};

const getRequiredCustomerTablesByType = (tableType) => {
  const normalizedTableType = normalizeCustomerTableType(tableType);

  if (!normalizedTableType) {
    return CUSTOMER_TABLE_KEYS;
  }

  if (
    normalizedTableType !== 'customers-data' &&
    normalizedTableType !== 'customers-master'
  ) {
    throw new AppError(
      `Invalid tableType: ${tableType}. Expected one of: customers-data, customers-master`,
      400,
    );
  }

  return CUSTOMER_TABLE_KEYS.filter(
    (key) => TABLE_MASTER[key]?.table_type === normalizedTableType,
  );
};

export const createMasterCustomerNameTypesTable = async () => {
  return createTable('MASTER_CUSTOMER_NAME_TYPES');
};

export const createMasterCustomerTypesTable = async () => {
  return createTable('MASTER_CUSTOMER_TYPES');
};

export const createMasterCustomerImageTypesTable = async () => {
  return createTable('MASTER_CUSTOMER_IMAGE_TYPES');
};

export const createCustomersTable = async () => {
  return createTable('CUSTOMERS');
};

export const createCustomerNamesTable = async () => {
  return createTable('CUSTOMER_NAMES');
};

export const createCustomerTypesTable = async () => {
  return createTable('CUSTOMER_TYPES');
};

export const createCustomerAddressesTable = async () => {
  return createTable('CUSTOMER_ADDRESSES');
};

export const createCustomerContactsTable = async () => {
  return createTable('CUSTOMER_CONTACTS');
};

export const createCustomerImagesTable = async () => {
  return createTable('CUSTOMER_IMAGES');
};

export const createAllCustomerTables = async (tableType) => {
  try {
    const tableCreationOrder = getRequiredCustomerTablesByType(tableType);

    for (const tableKey of tableCreationOrder) {
      await createTable(tableKey);
    }

    return { message: 'All customer tables created successfully' };
  } catch (error) {
    throw new AppError(
      `Failed to create customer tables: ${error.message}`,
      500,
    );
  }
};

export const dropAllCustomerTables = async (tableType) => {
  try {
    const tableDropOrder = getRequiredCustomerTablesByType(tableType).reverse();

    for (const tableKey of tableDropOrder) {
      const tableName = TABLE_MASTER[tableKey].name;
      await tradeBusinessDbc.executeQuery(`DROP TABLE IF EXISTS ${tableName};`);
    }

    return { message: 'All customer tables dropped successfully' };
  } catch (error) {
    throw new AppError(`Failed to drop customer tables: ${error.message}`, 500);
  }
};

export const checkCustomerTablesExist = async () => {
  try {
    const tableNames = CUSTOMER_TABLE_KEYS.map((key) => TABLE_MASTER[key].name);

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
      `Failed to check if customer tables exist: ${error.message}`,
      500,
    );
  }
};

export const getCustomerTablesSchema = async () => {
  try {
    const tableNames = CUSTOMER_TABLE_KEYS.map((key) => TABLE_MASTER[key].name);
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
      `Failed to get customer tables schema: ${error.message}`,
      500,
    );
  }
};
