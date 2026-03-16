import AppError from '../utils/appError.js';
import { tradeBusinessDbc } from './dbModel.js';
import { TABLE_MASTER, generateCreateTableSQL } from './tables.js';

const SCOPES = ['all', 'master', 'data'];

const normalizeScope = (scope = 'all') => {
  const normalized = String(scope).toLowerCase();
  if (!SCOPES.includes(normalized)) {
    throw new AppError(
      `Invalid scope: ${scope}. Expected one of: ${SCOPES.join(', ')}`,
      400,
    );
  }
  return normalized;
};

const matchScope = (tableType, scope) => {
  if (scope === 'all') return true;
  return String(tableType || '').endsWith(`-${scope}`);
};

const getTargetTableEntries = (scope = 'all') => {
  const normalizedScope = normalizeScope(scope);

  return Object.entries(TABLE_MASTER)
    .filter(([, def]) => matchScope(def.table_type, normalizedScope))
    .map(([key, definition]) => ({ key, definition }));
};

const normalizeType = (v) => {
  const normalized = String(v || '')
    .replace(/\s+/g, '')
    .toLowerCase();

  if (normalized === 'boolean' || normalized === 'bool') {
    return 'tinyint(1)';
  }

  return normalized;
};

const normalizeNullable = (fieldDef) =>
  fieldDef.notNull === true || fieldDef.primaryKey === true ? 'NO' : 'YES';

const normalizeDefault = (v) => {
  if (v === undefined || v === null) return '__no_default__';
  if (typeof v === 'boolean') return v ? '1' : '0';
  return String(v)
    .replace(/\(\)/g, '')
    .replace(/\s+/g, '')
    .replace(/^'(.*)'$/, '$1')
    .toLowerCase();
};

const getTargetDefaultMeta = (fieldDef) => {
  if (fieldDef.default === undefined) {
    return { value: '__no_default__', onUpdateCurrentTimestamp: false };
  }

  if (typeof fieldDef.default === 'string') {
    const hasOnUpdate = /on\s+update\s+current_timestamp/i.test(
      fieldDef.default,
    );

    const defaultValue = fieldDef.default.replace(
      /on\s+update\s+current_timestamp/i,
      '',
    );

    return {
      value: normalizeDefault(defaultValue),
      onUpdateCurrentTimestamp: hasOnUpdate,
    };
  }

  return {
    value: normalizeDefault(fieldDef.default),
    onUpdateCurrentTimestamp: false,
  };
};

const getDbDefaultMeta = (dbCol) => ({
  value: normalizeDefault(dbCol.default),
  onUpdateCurrentTimestamp: /on\s+update\s+current_timestamp/i.test(
    String(dbCol.extra || ''),
  ),
});

const getColumnPositionClause = (fields, columnName) => {
  const fieldNames = Object.keys(fields);
  const index = fieldNames.indexOf(columnName);

  if (index <= 0) {
    return ' FIRST';
  }

  return ` AFTER \`${fieldNames[index - 1]}\``;
};

const getColumnSql = (columnName, fieldDef) => {
  let sql = `\`${columnName}\` ${fieldDef.type}`;

  const shouldBeNotNull =
    fieldDef.notNull === true || fieldDef.primaryKey === true;

  if (shouldBeNotNull) {
    sql += ' NOT NULL';
  } else {
    sql += ' NULL';
  }

  if (fieldDef.default !== undefined) {
    if (fieldDef.default === null) {
      sql += ' DEFAULT NULL';
    } else if (typeof fieldDef.default === 'number') {
      sql += ` DEFAULT ${fieldDef.default}`;
    } else if (typeof fieldDef.default === 'boolean') {
      sql += ` DEFAULT ${fieldDef.default ? 1 : 0}`;
    } else {
      const rawDefault = String(fieldDef.default);
      if (/^CURRENT_TIMESTAMP/i.test(rawDefault)) {
        sql += ` DEFAULT ${rawDefault}`;
      } else {
        sql += ` DEFAULT '${rawDefault.replace(/'/g, "''")}'`;
      }
    }
  }

  if (fieldDef.autoIncrement) {
    sql += ' AUTO_INCREMENT';
  }

  if (fieldDef.primaryKey) {
    sql += ' PRIMARY KEY';
  }

  return sql;
};

const buildConstraintName = (tableName, columnName) =>
  `fk_${tableName}_${columnName}`.slice(0, 62);

const getColumnForeignKeys = async (tableName, columnName) => {
  const sql = `
    SELECT CONSTRAINT_NAME
    FROM information_schema.KEY_COLUMN_USAGE
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = ?
      AND COLUMN_NAME = ?
      AND REFERENCED_TABLE_NAME IS NOT NULL
  `;

  return tradeBusinessDbc.executeQuery(sql, [tableName, columnName]);
};

const syncForeignKey = async (tableName, columnName, fieldDef) => {
  const currentFks = await getColumnForeignKeys(tableName, columnName);

  for (const fk of currentFks) {
    await tradeBusinessDbc.executeQuery(
      `ALTER TABLE \`${tableName}\` DROP FOREIGN KEY \`${fk.CONSTRAINT_NAME}\``,
    );
  }

  if (fieldDef.references) {
    const { table, field, onDelete = 'RESTRICT' } = fieldDef.references;
    const constraintName = buildConstraintName(tableName, columnName);

    await tradeBusinessDbc.executeQuery(
      `ALTER TABLE \`${tableName}\` ADD CONSTRAINT \`${constraintName}\` FOREIGN KEY (\`${columnName}\`) REFERENCES \`${table}\`(\`${field}\`) ON DELETE ${onDelete}`,
    );
  }
};

const getCurrentDbSchema = async () => {
  const tableRows = await tradeBusinessDbc.executeQuery(`
    SELECT TABLE_NAME
    FROM information_schema.TABLES
    WHERE TABLE_SCHEMA = DATABASE()
  `);

  const columnRows = await tradeBusinessDbc.executeQuery(`
    SELECT
      TABLE_NAME,
      COLUMN_NAME,
      COLUMN_TYPE,
      IS_NULLABLE,
      COLUMN_DEFAULT,
      EXTRA,
      COLUMN_KEY,
      ORDINAL_POSITION
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
    ORDER BY TABLE_NAME, ORDINAL_POSITION
  `);

  const tables = new Map();

  for (const row of tableRows) {
    tables.set(row.TABLE_NAME, { columns: new Map() });
  }

  for (const col of columnRows) {
    if (!tables.has(col.TABLE_NAME)) {
      tables.set(col.TABLE_NAME, { columns: new Map() });
    }

    tables.get(col.TABLE_NAME).columns.set(col.COLUMN_NAME, {
      type: col.COLUMN_TYPE,
      nullable: col.IS_NULLABLE,
      default: col.COLUMN_DEFAULT,
      extra: col.EXTRA,
      key: col.COLUMN_KEY,
      ordinalPosition: col.ORDINAL_POSITION,
    });
  }

  return tables;
};

export const getSchemaDiff = async (scope = 'all') => {
  const targetEntries = getTargetTableEntries(scope);
  const targetByName = new Map(
    targetEntries.map((entry) => [entry.definition.name, entry]),
  );

  const currentDb = await getCurrentDbSchema();

  const diff = {
    scope: normalizeScope(scope),
    createTables: [],
    dropTables: [],
    addColumns: [],
    alterColumns: [],
    dropColumns: [],
  };

  for (const [tableName, { definition }] of targetByName.entries()) {
    if (!currentDb.has(tableName)) {
      diff.createTables.push({ tableName, tableDefinition: definition });
      continue;
    }

    const dbColumns = currentDb.get(tableName).columns;
    const targetFieldNames = Object.keys(definition.fields);
    const dbTargetFieldNames = [...dbColumns.keys()].filter((name) =>
      Object.prototype.hasOwnProperty.call(definition.fields, name),
    );
    const dbOrderIndex = new Map(
      dbTargetFieldNames.map((name, index) => [name, index]),
    );

    for (const [columnName, fieldDef] of Object.entries(definition.fields)) {
      const dbCol = dbColumns.get(columnName);

      if (!dbCol) {
        diff.addColumns.push({ tableName, columnName, fieldDef });
        continue;
      }

      const targetType = normalizeType(fieldDef.type);
      const dbType = normalizeType(dbCol.type);
      const targetNullable = normalizeNullable(fieldDef);
      const dbNullable = String(dbCol.nullable || '').toUpperCase();
      const targetDefaultMeta = getTargetDefaultMeta(fieldDef);
      const dbDefaultMeta = getDbDefaultMeta(dbCol);
      const targetAuto = fieldDef.autoIncrement ? 'auto_increment' : '';
      const dbAuto = String(dbCol.extra || '').toLowerCase();
      const targetPk = fieldDef.primaryKey ? 'PRI' : '';
      const dbPk = String(dbCol.key || '').toUpperCase();
      const targetOrder = targetFieldNames.indexOf(columnName);
      const dbOrder = dbOrderIndex.has(columnName)
        ? dbOrderIndex.get(columnName)
        : -1;
      const orderChanged = dbOrder !== -1 && dbOrder !== targetOrder;

      if (
        targetType !== dbType ||
        targetNullable !== dbNullable ||
        targetDefaultMeta.value !== dbDefaultMeta.value ||
        targetDefaultMeta.onUpdateCurrentTimestamp !==
          dbDefaultMeta.onUpdateCurrentTimestamp ||
        orderChanged ||
        (targetAuto && !dbAuto.includes('auto_increment')) ||
        (targetPk && dbPk !== 'PRI')
      ) {
        diff.alterColumns.push({
          tableName,
          columnName,
          fieldDef,
          current: dbCol,
        });
      }
    }

    for (const dbColumnName of dbColumns.keys()) {
      if (!definition.fields[dbColumnName]) {
        diff.dropColumns.push({ tableName, columnName: dbColumnName });
      }
    }
  }

  for (const dbTableName of currentDb.keys()) {
    if (!targetByName.has(dbTableName)) {
      diff.dropTables.push({ tableName: dbTableName });
    }
  }

  return diff;
};

export const syncSchemaWithTableMaster = async ({
  scope = 'all',
  allowDrop = false,
  dryRun = false,
} = {}) => {
  const diff = await getSchemaDiff(scope);
  const tableDefinitionByName = new Map(
    Object.values(TABLE_MASTER).map((tableDef) => [tableDef.name, tableDef]),
  );

  if (dryRun) {
    return {
      dryRun: true,
      applied: null,
      diff,
    };
  }

  const applied = {
    createdTables: [],
    addedColumns: [],
    alteredColumns: [],
    droppedColumns: [],
    droppedTables: [],
    errors: [],
  };

  for (const op of diff.createTables) {
    try {
      await tradeBusinessDbc.executeQuery(
        generateCreateTableSQL(op.tableDefinition),
      );
      applied.createdTables.push(op.tableName);
    } catch (error) {
      applied.errors.push({
        step: 'create-table',
        table: op.tableName,
        error: error.message,
      });
    }
  }

  for (const op of diff.addColumns) {
    try {
      const columnSql = getColumnSql(op.columnName, op.fieldDef);
      const tableDef = tableDefinitionByName.get(op.tableName);
      const positionClause = tableDef
        ? getColumnPositionClause(tableDef.fields, op.columnName)
        : '';
      await tradeBusinessDbc.executeQuery(
        `ALTER TABLE \`${op.tableName}\` ADD COLUMN ${columnSql}${positionClause}`,
      );
      await syncForeignKey(op.tableName, op.columnName, op.fieldDef);
      applied.addedColumns.push(`${op.tableName}.${op.columnName}`);
    } catch (error) {
      applied.errors.push({
        step: 'add-column',
        table: op.tableName,
        column: op.columnName,
        error: error.message,
      });
    }
  }

  for (const op of diff.alterColumns) {
    try {
      const columnSql = getColumnSql(op.columnName, op.fieldDef);
      const tableDef = tableDefinitionByName.get(op.tableName);
      const positionClause = tableDef
        ? getColumnPositionClause(tableDef.fields, op.columnName)
        : '';
      await tradeBusinessDbc.executeQuery(
        `ALTER TABLE \`${op.tableName}\` MODIFY COLUMN ${columnSql}${positionClause}`,
      );
      await syncForeignKey(op.tableName, op.columnName, op.fieldDef);
      applied.alteredColumns.push(`${op.tableName}.${op.columnName}`);
    } catch (error) {
      applied.errors.push({
        step: 'alter-column',
        table: op.tableName,
        column: op.columnName,
        error: error.message,
      });
    }
  }

  if (allowDrop) {
    await tradeBusinessDbc.executeQuery('SET FOREIGN_KEY_CHECKS = 0');
    try {
      for (const op of diff.dropColumns) {
        try {
          const fkRows = await getColumnForeignKeys(
            op.tableName,
            op.columnName,
          );
          for (const fk of fkRows) {
            await tradeBusinessDbc.executeQuery(
              `ALTER TABLE \`${op.tableName}\` DROP FOREIGN KEY \`${fk.CONSTRAINT_NAME}\``,
            );
          }

          await tradeBusinessDbc.executeQuery(
            `ALTER TABLE \`${op.tableName}\` DROP COLUMN \`${op.columnName}\``,
          );
          applied.droppedColumns.push(`${op.tableName}.${op.columnName}`);
        } catch (error) {
          applied.errors.push({
            step: 'drop-column',
            table: op.tableName,
            column: op.columnName,
            error: error.message,
          });
        }
      }

      for (const op of [...diff.dropTables].reverse()) {
        try {
          await tradeBusinessDbc.executeQuery(
            `DROP TABLE IF EXISTS \`${op.tableName}\``,
          );
          applied.droppedTables.push(op.tableName);
        } catch (error) {
          applied.errors.push({
            step: 'drop-table',
            table: op.tableName,
            error: error.message,
          });
        }
      }
    } finally {
      await tradeBusinessDbc.executeQuery('SET FOREIGN_KEY_CHECKS = 1');
    }
  }

  return {
    dryRun: false,
    allowDrop,
    diff,
    applied,
  };
};
