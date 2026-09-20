// Centralized table exports and helpers.
// Table schema definitions are split into models/tables/*.js for maintainability.
import { PRODUCTS_TABLE_DEFINITIONS } from './table_schema/products.js';
import { SUPPLIERS_TABLE_DEFINITIONS } from './table_schema/suppliers.js';
import { CUSTOMERS_TABLE_DEFINITIONS } from './table_schema/customers.js';
import { SALES_QUOTATIONS_TABLE_DEFINITIONS } from './table_schema/sales.js';
import { PURCHASE_REQUESTS_TABLE_DEFINITIONS } from './table_schema/purchases.js';
import { AP_INVOICES_TABLE_DEFINITIONS } from './table_schema/ap_invoices.js';
import { AR_INVOICES_TABLE_DEFINITIONS } from './table_schema/ar_invoices.js';
import { MASTER_TABLE_DEFINITIONS } from './table_schema/master.js';

const TABLE_MASTER_RAW = {
  ...PRODUCTS_TABLE_DEFINITIONS,
  ...SUPPLIERS_TABLE_DEFINITIONS,
  ...CUSTOMERS_TABLE_DEFINITIONS,
  ...SALES_QUOTATIONS_TABLE_DEFINITIONS,
  ...PURCHASE_REQUESTS_TABLE_DEFINITIONS,
  ...AP_INVOICES_TABLE_DEFINITIONS,
  ...AR_INVOICES_TABLE_DEFINITIONS,
  ...MASTER_TABLE_DEFINITIONS,
};

// Keep TABLE_MASTER organized as: master tables first, then data tables.
// Relative order inside each group follows the declaration order in TABLE_MASTER_RAW.
const getTableOrderRank = (tableType = '') => {
  if (tableType.endsWith('-master')) return 0;
  if (tableType.endsWith('-data')) return 1;
  return 2;
};

export const TABLE_MASTER = Object.fromEntries(
  Object.entries(TABLE_MASTER_RAW)
    .map(([key, value], index) => ({ key, value, index }))
    .sort((a, b) => {
      const rankDiff =
        getTableOrderRank(a.value.table_type) -
        getTableOrderRank(b.value.table_type);

      if (rankDiff !== 0) return rankDiff;
      return a.index - b.index;
    })
    .map(({ key, value }) => [key, value]),
);

/**
 * Helper function to generate SQL for creating a table based on its definition
 * @param {Object} tableDefinition - Table definition from TABLE_MASTER
 * @returns {string} SQL statement for creating the table
 */
export const generateCreateTableSQL = (tableDefinition) => {
  const { name, fields, constraints = {} } = tableDefinition;

  let sql = `CREATE TABLE IF NOT EXISTS ${name} (\n`;

  const fieldDefinitions = [];
  for (const [fieldName, fieldDef] of Object.entries(fields)) {
    let fieldSql = `  ${fieldName} ${fieldDef.type}`;

    if (fieldDef.primaryKey) {
      fieldSql += ' PRIMARY KEY';
    }
    if (fieldDef.autoIncrement) {
      fieldSql += ' AUTO_INCREMENT';
    }
    if (fieldDef.notNull) {
      fieldSql += ' NOT NULL';
    }
    if (fieldDef.unique) {
      fieldSql += ' UNIQUE';
    }
    if (fieldDef.default !== undefined) {
      if (
        typeof fieldDef.default === 'string' &&
        !fieldDef.default.includes('CURRENT_TIMESTAMP')
      ) {
        fieldSql += ` DEFAULT '${fieldDef.default}'`;
      } else {
        fieldSql += ` DEFAULT ${fieldDef.default}`;
      }
    }

    fieldDefinitions.push(fieldSql);
  }

  for (const [constraintName, constraintDef] of Object.entries(constraints)) {
    if (constraintDef.type === 'PRIMARY KEY') {
      fieldDefinitions.push(
        `  PRIMARY KEY (${constraintDef.fields.join(', ')})`,
      );
    } else if (constraintDef.type === 'UNIQUE') {
      fieldDefinitions.push(
        `  CONSTRAINT ${constraintName} UNIQUE (${constraintDef.fields.join(
          ', ',
        )})`,
      );
    }
  }

  for (const [fieldName, fieldDef] of Object.entries(fields)) {
    if (fieldDef.references) {
      const { table, field, onDelete = 'RESTRICT' } = fieldDef.references;
      fieldDefinitions.push(
        `  FOREIGN KEY (${fieldName}) REFERENCES ${table}(${field}) ON DELETE ${onDelete}`,
      );
    }
  }

  sql += fieldDefinitions.join(',\n');
  sql +=
    '\n) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;';

  return sql;
};

/**
 * Get all table names as an array
 * @returns {string[]} Array of table names
 */
export const getAllTableNames = () => {
  return Object.values(TABLE_MASTER).map((table) => table.name);
};

/**
 * Get field definitions for a specific table
 * @param {string} tableName - Name of the table
 * @returns {Object|null} Field definitions or null if table not found
 */
export const getTableFields = (tableName) => {
  for (const table of Object.values(TABLE_MASTER)) {
    if (table.name === tableName) {
      return table.fields;
    }
  }
  return null;
};
