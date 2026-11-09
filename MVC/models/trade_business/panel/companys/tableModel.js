import AppError from '../../../../../utils/appError.js';
import { tradeBusinessDbc } from '../../../dbModel.js';
import { TABLE_MASTER, generateCreateTableSQL } from '../../../tables.js';

// Company tables. `company_address` references `master_address_types`,
// so the master table is created first during create-all (FK dependency).
const COMPANY_TABLE_KEYS = ['COMPANYS', 'COMPANY_ADDRESS'];

const normalizeCompanyTableType = (tableType) => {
  if (!tableType) {
    return null;
  }

  if (tableType === 'data') {
    return 'company-data';
  }

  return tableType;
};

const getRequiredCompanyTablesByType = (tableType) => {
  const normalizedTableType = normalizeCompanyTableType(tableType);

  if (!normalizedTableType) {
    return COMPANY_TABLE_KEYS;
  }

  if (normalizedTableType !== 'company-data') {
    throw new AppError(
      `Invalid tableType: ${tableType}. Expected: company-data`,
      400,
    );
  }

  return COMPANY_TABLE_KEYS.filter(
    (key) => TABLE_MASTER[key]?.table_type === normalizedTableType,
  );
};

const createTable = async (tableKey) => {
  try {
    const tableDefinition = TABLE_MASTER[tableKey];

    if (!tableDefinition) {
      throw new Error(`Table definition for ${tableKey} not found in TABLE_MASTER`);
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

export const createCompanysTable = async () => {
  return createTable('COMPANYS');
};

export const createCompanyAddressTable = async () => {
  return createTable('COMPANY_ADDRESS');
};

export const createAllCompanyTables = async (tableType) => {
  try {
    // Ensure the referenced master table exists first (FK dependency).
    await createTable('MASTER_ADDRESS_TYPES');

    const tableCreationOrder = getRequiredCompanyTablesByType(tableType);

    for (const tableKey of tableCreationOrder) {
      await createTable(tableKey);
    }

    return { message: 'All company tables created successfully' };
  } catch (error) {
    throw new AppError(
      `Failed to create company tables: ${error.message}`,
      500,
    );
  }
};

export const dropAllCompanyTables = async (tableType) => {
  try {
    const tableDropOrder = getRequiredCompanyTablesByType(tableType).reverse();

    for (const tableKey of tableDropOrder) {
      const tableName = TABLE_MASTER[tableKey].name;
      await tradeBusinessDbc.executeQuery(`DROP TABLE IF EXISTS ${tableName};`);
    }

    return { message: 'All company tables dropped successfully' };
  } catch (error) {
    throw new AppError(`Failed to drop company tables: ${error.message}`, 500);
  }
};

export const checkCompanyTablesExist = async () => {
  try {
    const tableNames = COMPANY_TABLE_KEYS.map((key) => TABLE_MASTER[key].name);

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
      `Failed to check if company tables exist: ${error.message}`,
      500,
    );
  }
};

export const getCompanyTablesSchema = async () => {
  try {
    const tableNames = COMPANY_TABLE_KEYS.map((key) => TABLE_MASTER[key].name);
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
      `Failed to get company tables schema: ${error.message}`,
      500,
    );
  }
};
