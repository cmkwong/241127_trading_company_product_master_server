import AppError from '../../../../../utils/appError.js';
import { tradeBusinessDbc } from '../../../dbModel.js';
import { TABLE_MASTER, generateCreateTableSQL } from '../../../tables.js';

const USER_TABLE_KEYS = [
  'USERS',
  'USER_AUTHS',
  'USER_ADDRESSES',
  'USER_CARTS',
  'USER_CART_ITEMS',
  'USER_FAVOURITES',
  'USER_PRODUCT_HISTORY',
  'USER_RFQS',
  'USER_RFQ_ITEMS',
  'USER_RFQ_ATTACHMENTS',
  'USER_MEMBERSHIPS',
  'USER_NOTIFICATIONS',
  'USER_PAYMENT_METHODS',
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

const normalizeUserTableType = (tableType) => {
  if (!tableType) {
    return null;
  }

  if (tableType === 'data') {
    return 'users-data';
  }

  return tableType;
};

const getRequiredUserTablesByType = (tableType) => {
  const normalizedTableType = normalizeUserTableType(tableType);

  if (!normalizedTableType) {
    return USER_TABLE_KEYS;
  }

  if (normalizedTableType !== 'users-data') {
    throw new AppError(
      `Invalid tableType: ${tableType}. Expected: users-data`,
      400,
    );
  }

  return USER_TABLE_KEYS.filter(
    (key) => TABLE_MASTER[key]?.table_type === normalizedTableType,
  );
};

export const createUsersTable = async () => createTable('USERS');
export const createUserAuthsTable = async () => createTable('USER_AUTHS');
export const createUserAddressesTable = async () => createTable('USER_ADDRESSES');
export const createUserCartsTable = async () => createTable('USER_CARTS');
export const createUserCartItemsTable = async () => createTable('USER_CART_ITEMS');
export const createUserFavouritesTable = async () => createTable('USER_FAVOURITES');
export const createUserProductHistoryTable = async () =>
  createTable('USER_PRODUCT_HISTORY');
export const createUserRfqsTable = async () => createTable('USER_RFQS');
export const createUserRfqItemsTable = async () => createTable('USER_RFQ_ITEMS');
export const createUserRfqAttachmentsTable = async () =>
  createTable('USER_RFQ_ATTACHMENTS');
export const createUserMembershipsTable = async () =>
  createTable('USER_MEMBERSHIPS');
export const createUserNotificationsTable = async () =>
  createTable('USER_NOTIFICATIONS');
export const createUserPaymentMethodsTable = async () =>
  createTable('USER_PAYMENT_METHODS');

export const createAllUserTables = async (tableType) => {
  try {
    const tableCreationOrder = getRequiredUserTablesByType(tableType);

    for (const tableKey of tableCreationOrder) {
      await createTable(tableKey);
    }

    return { message: 'All user tables created successfully' };
  } catch (error) {
    throw new AppError(
      `Failed to create user tables: ${error.message}`,
      500,
    );
  }
};

export const dropAllUserTables = async (tableType) => {
  try {
    const tableDropOrder = getRequiredUserTablesByType(tableType).reverse();

    for (const tableKey of tableDropOrder) {
      const tableName = TABLE_MASTER[tableKey].name;
      await tradeBusinessDbc.executeQuery(`DROP TABLE IF EXISTS ${tableName};`);
    }

    return { message: 'All user tables dropped successfully' };
  } catch (error) {
    throw new AppError(`Failed to drop user tables: ${error.message}`, 500);
  }
};

export const checkUserTablesExist = async () => {
  try {
    const tableNames = USER_TABLE_KEYS.map((key) => TABLE_MASTER[key].name);

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
      `Failed to check if user tables exist: ${error.message}`,
      500,
    );
  }
};

export const getUserTablesSchema = async () => {
  try {
    const tableNames = USER_TABLE_KEYS.map((key) => TABLE_MASTER[key].name);
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
      `Failed to get user tables schema: ${error.message}`,
      500,
    );
  }
};