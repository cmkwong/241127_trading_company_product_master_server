import AppError from '../../../utils/appError.js';
import { tradeBusinessDbc } from '../../dbModel.js';
import { TABLE_MASTER, generateCreateTableSQL } from '../../tables.js';

const SUPPLIER_TABLE_KEYS = [
  'MASTER_SUPPLIER_TYPES',
  'SUPPLIERS',
  'MASTER_ADDRESS_TYPES',
  'SUPPLIER_ADDRESSES',
  'MASTER_CONTACT_TYPES',
  'SUPPLIER_CONTACTS',
  'MASTER_SUPPLIER_LINK_TYPES',
  'SUPPLIER_LINKS',
  'MASTER_SERVICE_TYPES',
  'SUPPLIER_SERVICES',
  'SUPPLIER_SERVICE_IMAGES',
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

const normalizeSupplierTableType = (tableType) => {
  if (!tableType) {
    return null;
  }

  if (tableType === 'data') {
    return 'suppliers-data';
  }

  if (tableType === 'master') {
    return 'suppliers-master';
  }

  return tableType;
};

const getRequiredSupplierTablesByType = (tableType) => {
  const normalizedTableType = normalizeSupplierTableType(tableType);

  if (!normalizedTableType) {
    return SUPPLIER_TABLE_KEYS;
  }

  if (
    normalizedTableType !== 'suppliers-data' &&
    normalizedTableType !== 'suppliers-master'
  ) {
    throw new AppError(
      `Invalid tableType: ${tableType}. Expected one of: suppliers-data, suppliers-master`,
      400,
    );
  }

  return SUPPLIER_TABLE_KEYS.filter(
    (key) => TABLE_MASTER[key]?.table_type === normalizedTableType,
  );
};

export const createMasterSupplierTypesTable = async () => {
  return createTable('MASTER_SUPPLIER_TYPES');
};

export const createSuppliersTable = async () => {
  return createTable('SUPPLIERS');
};

export const createAddressTypesTable = async () => {
  return createTable('MASTER_ADDRESS_TYPES');
};

export const createSupplierAddressesTable = async () => {
  return createTable('SUPPLIER_ADDRESSES');
};

export const createContactTypesTable = async () => {
  return createTable('MASTER_CONTACT_TYPES');
};

export const createSupplierContactsTable = async () => {
  return createTable('SUPPLIER_CONTACTS');
};

export const createSupplierLinkTypesTable = async () => {
  return createTable('MASTER_SUPPLIER_LINK_TYPES');
};

export const createSupplierLinksTable = async () => {
  return createTable('SUPPLIER_LINKS');
};

export const createServiceTypesTable = async () => {
  return createTable('MASTER_SERVICE_TYPES');
};

export const createSupplierServicesTable = async () => {
  return createTable('SUPPLIER_SERVICES');
};

export const createSupplierServiceImagesTable = async () => {
  return createTable('SUPPLIER_SERVICE_IMAGES');
};

export const createAllSupplierTables = async (tableType) => {
  try {
    const tableCreationOrder = getRequiredSupplierTablesByType(tableType);

    for (const tableKey of tableCreationOrder) {
      await createTable(tableKey);
    }

    return { message: 'All supplier tables created successfully' };
  } catch (error) {
    throw new AppError(
      `Failed to create supplier tables: ${error.message}`,
      500,
    );
  }
};

export const dropAllSupplierTables = async (tableType) => {
  try {
    const tableDropOrder = getRequiredSupplierTablesByType(tableType).reverse();

    for (const tableKey of tableDropOrder) {
      const tableName = TABLE_MASTER[tableKey].name;
      await tradeBusinessDbc.executeQuery(`DROP TABLE IF EXISTS ${tableName};`);
    }

    return { message: 'All supplier tables dropped successfully' };
  } catch (error) {
    throw new AppError(`Failed to drop supplier tables: ${error.message}`, 500);
  }
};

export const checkSupplierTablesExist = async () => {
  try {
    const tableNames = SUPPLIER_TABLE_KEYS.map((key) => TABLE_MASTER[key].name);

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
      `Failed to check if supplier tables exist: ${error.message}`,
      500,
    );
  }
};

export const getSupplierTablesSchema = async () => {
  try {
    const tableNames = SUPPLIER_TABLE_KEYS.map((key) => TABLE_MASTER[key].name);
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
      `Failed to get supplier tables schema: ${error.message}`,
      500,
    );
  }
};
