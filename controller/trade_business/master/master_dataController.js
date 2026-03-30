import catchAsync from '../../../utils/catchAsync.js';
import AppError from '../../../utils/appError.js';
import {
  TABLE_MASTER,
  generateCreateTableSQL,
} from '../../../models/tables.js';
import { getMasterDefaultMappings } from '../../../models/mappings/defaultDataMappings.js';

/**
 * Get table mapping with models and data
 * @returns {Object} Map of table names to their models and data
 */
const getTableDataMapping = getMasterDefaultMappings;

const _insertAllDefaults = async (tableName) => {
  const results = {};

  // Map of table names to their corresponding models and data
  const tableDataMap = getTableDataMapping();

  // If specific tableName is provided, insert only that table
  if (tableName) {
    if (!tableDataMap[tableName]) {
      throw new AppError(
        `Unknown table: ${tableName}. Valid tables: ${Object.keys(
          tableDataMap,
        ).join(', ')}`,
        400,
      );
    }

    try {
      const { model, data } = tableDataMap[tableName];
      const rows = Array.isArray(data) ? data : [];
      results[tableName] =
        rows.length > 0
          ? await model.creates(rows)
          : { message: `No default rows configured for ${tableName}` };
    } catch (error) {
      results[tableName] = { error: error.message };
    }

    return results;
  }

  // If no tableName, insert all master data tables
  for (const [name, { model, data }] of Object.entries(tableDataMap)) {
    try {
      const rows = Array.isArray(data) ? data : [];
      results[name] =
        rows.length > 0
          ? await model.creates(rows)
          : { message: `No default rows configured for ${name}` };
    } catch (error) {
      results[name] = { error: error.message };
    }
  }

  return results;
};

/**
 * Insert defaults for all master data types
 */
export const insertAllDefaults = catchAsync(async (req, res, next) => {
  const results = await _insertAllDefaults();

  res.prints = {
    status: 'success',
    message: 'Default data insertion completed',
    results,
  };
  next();
});

const _clearMasterData = async (tableName) => {
  const results = {};

  // Get table mapping and extract just the models
  const tableDataMap = getTableDataMapping();
  const tableModels = Object.entries(tableDataMap).reduce(
    (acc, [name, { model }]) => {
      acc[name] = model;
      return acc;
    },
    {},
  );

  // If specific tableName is provided, truncate only that table
  if (tableName) {
    if (!tableModels[tableName]) {
      throw new AppError(
        `Unknown table: ${tableName}. Valid tables: ${Object.keys(
          tableModels,
        ).join(', ')}`,
        400,
      );
    }

    try {
      results[tableName] = await tableModels[tableName].truncateTable();
    } catch (error) {
      results[tableName] = { error: error.message };
    }

    return results;
  }

  // If no tableName, truncate all master data tables
  for (const [name, model] of Object.entries(tableModels)) {
    try {
      results[name] = await model.truncateTable();
    } catch (error) {
      results[name] = { error: error.message };
    }
  }

  return results;
};

const _dropMasterTables = async (tableName) => {
  const tableDataMap = getTableDataMapping();
  const validTables = Object.keys(tableDataMap);

  if (tableName && !tableDataMap[tableName]) {
    throw new AppError(
      `Unknown table: ${tableName}. Valid tables: ${validTables.join(', ')}`,
      400,
    );
  }

  const targetTables = tableName ? [tableName] : validTables;
  const dropOrder = [...targetTables].reverse();
  const queryRunner = tableDataMap[validTables[0]].model;
  const results = {};

  await queryRunner.executeQuery('SET FOREIGN_KEY_CHECKS = 0');
  try {
    for (const table of dropOrder) {
      try {
        await queryRunner.executeQuery(`DROP TABLE IF EXISTS ${table}`);
        results[table] = { success: true, message: `${table} dropped` };
      } catch (error) {
        results[table] = { success: false, error: error.message };
      }
    }
  } finally {
    await queryRunner.executeQuery('SET FOREIGN_KEY_CHECKS = 1');
  }

  return results;
};

const _createMasterTables = async (tableName) => {
  const tableDataMap = getTableDataMapping();
  const validTables = Object.keys(tableDataMap);

  if (tableName && !tableDataMap[tableName]) {
    throw new AppError(
      `Unknown table: ${tableName}. Valid tables: ${validTables.join(', ')}`,
      400,
    );
  }

  const tableDefinitionsByName = Object.values(TABLE_MASTER).reduce(
    (acc, tableDef) => {
      acc[tableDef.name] = tableDef;
      return acc;
    },
    {},
  );

  const targetTables = tableName ? [tableName] : validTables;
  const queryRunner = tableDataMap[validTables[0]].model;
  const results = {};

  for (const table of targetTables) {
    const tableDefinition = tableDefinitionsByName[table];

    if (!tableDefinition) {
      results[table] = {
        success: false,
        error: `Table definition not found for ${table}`,
      };
      continue;
    }

    try {
      const sql = generateCreateTableSQL(tableDefinition);
      await queryRunner.executeQuery(sql);
      results[table] = { success: true, message: `${table} created` };
    } catch (error) {
      results[table] = { success: false, error: error.message };
    }
  }

  return results;
};

/**
 * Truncate all master data tables
 */
export const truncateAllTables = catchAsync(async (req, res, next) => {
  const results = await _clearMasterData();
  res.prints = {
    status: 'success',
    message: 'All master data tables have been truncated',
    results,
  };
  next();
});

export const createAllMasterTables = catchAsync(async (req, res, next) => {
  const results = await _createMasterTables();

  res.prints = {
    status: 'success',
    message: 'All master tables have been created',
    results,
  };

  next();
});

export const createMasterTableByName = catchAsync(async (req, res, next) => {
  const { tableName } = req.params;
  const results = await _createMasterTables(tableName);

  res.prints = {
    status: 'success',
    message: `Master table ${tableName} has been created`,
    results,
  };

  next();
});

export const dropAllMasterTables = catchAsync(async (req, res, next) => {
  const { confirm } = req.body || {};

  if (confirm !== 'DROP_ALL_MASTER_TABLES') {
    return next(
      new AppError(
        'Confirmation string required to drop all master tables. Please provide { "confirm": "DROP_ALL_MASTER_TABLES" } in the request body.',
        400,
      ),
    );
  }

  const results = await _dropMasterTables();

  res.prints = {
    status: 'success',
    message: 'All master tables have been dropped',
    results,
  };

  next();
});

export const dropMasterTableByName = catchAsync(async (req, res, next) => {
  const { tableName } = req.params;
  const { confirm } = req.body || {};

  if (confirm !== 'DROP_MASTER_TABLE') {
    return next(
      new AppError(
        'Confirmation string required to drop master table. Please provide { "confirm": "DROP_MASTER_TABLE" } in the request body.',
        400,
      ),
    );
  }

  const results = await _dropMasterTables(tableName);

  res.prints = {
    status: 'success',
    message: `Master table ${tableName} has been dropped`,
    results,
  };

  next();
});

/**
 * Reset all master data - truncate and then insert defaults
 */
export const resetAllMasterData = catchAsync(async (req, res, next) => {
  // First truncate all tables
  await _clearMasterData();

  // Insert the default data
  const results = await _insertAllDefaults();

  res.prints = {
    status: 'success',
    message: 'All master data has been reset successfully',
    results,
  };

  next();
});

export const resetMasterDataByTable = catchAsync(async (req, res, next) => {
  const { tableName } = req.params;
  // First truncate the specified table
  await _clearMasterData(tableName);

  // Insert the default data for the specified table
  const tableDataMap = getTableDataMapping();

  if (!tableDataMap[tableName]) {
    return next(
      new AppError(`Unknown table: ${tableName}. Cannot reset data.`, 400),
    );
  }

  const { model, data } = tableDataMap[tableName];
  await model.creates(data);

  res.prints = {
    status: 'success',
    message: `Master data for table ${tableName} has been reset successfully`,
  };

  next();
});

const _extractRowsPayload = (requestData, tableDataMap, options = {}) => {
  const { requireId = false } = options;

  if (
    !requestData ||
    typeof requestData !== 'object' ||
    Array.isArray(requestData)
  ) {
    throw new AppError('Invalid request body data', 400);
  }

  const tableNames = Object.keys(requestData);
  if (tableNames.length !== 1) {
    throw new AppError(
      'Request body data must contain exactly one table key, e.g. { data: { master_keywords: [...] } }',
      400,
    );
  }

  const tableName = tableNames[0];
  if (!tableDataMap[tableName]) {
    throw new AppError(`Unknown table: ${tableName}`, 400);
  }

  const { model } = tableDataMap[tableName];
  const pkField = model.entityIdField || 'id';

  const rawRows = requestData[tableName];
  const tableRows = Array.isArray(rawRows) ? rawRows : [rawRows];

  if (tableRows.length === 0) {
    throw new AppError(`No rows provided for table ${tableName}`, 400);
  }

  if (requireId) {
    const invalidRow = tableRows.find(
      (row) =>
        !row ||
        typeof row !== 'object' ||
        row[pkField] === undefined ||
        row[pkField] === null ||
        row[pkField] === '',
    );

    if (invalidRow) {
      throw new AppError(`Each row must include ${pkField}`, 400);
    }
  }

  return { tableName, model, pkField, tableRows };
};

export const getMasterDataRows = catchAsync(async (req, res, next) => {
  const tableDataMap = getTableDataMapping();

  const tableNameFromQuery = req.query?.tableName;
  const tableNameFromBody = req.body?.data
    ? Object.keys(req.body.data || {})[0]
    : null;
  const tableName = tableNameFromQuery || tableNameFromBody;

  if (!tableName) {
    return next(
      new AppError('tableName is required (query or body.data key)', 400),
    );
  }

  if (!tableDataMap[tableName]) {
    return next(
      new AppError(`Unknown table: ${tableName}. Cannot get data.`, 400),
    );
  }

  const { model } = tableDataMap[tableName];
  const sql = `SELECT * FROM ${tableName}`;
  const results = await model.executeQuery(sql);

  res.prints = {
    status: 'success',
    tableName,
    results,
  };
  next();
});

export const updateMasterData = catchAsync(async (req, res, next) => {
  const tableDataMap = getTableDataMapping();
  const requestData = req.body?.data;

  const { tableName, model, tableRows } = _extractRowsPayload(
    requestData,
    tableDataMap,
  );

  const result = await model.processStructureDataOperation(
    { [tableName]: tableRows },
    'update',
  );

  res.prints = {
    status: 'success',
    message: `Master data for table ${tableName} has been upserted successfully`,
    result,
  };

  next();
});

export const createMasterData = catchAsync(async (req, res, next) => {
  const tableDataMap = getTableDataMapping();
  const requestData = req.body?.data;

  const { tableName, model, tableRows } = _extractRowsPayload(
    requestData,
    tableDataMap,
  );

  const result = await model.processStructureDataOperation(
    { [tableName]: tableRows },
    'create',
  );

  res.prints = {
    status: 'success',
    message: `Master data for table ${tableName} has been created successfully`,
    result,
  };

  next();
});

export const deleteMasterData = catchAsync(async (req, res, next) => {
  const tableDataMap = getTableDataMapping();
  const requestData = req.body?.data;

  const { tableName, model, tableRows } = _extractRowsPayload(
    requestData,
    tableDataMap,
    { requireId: true },
  );

  const result = await model.processStructureDataOperation(
    { [tableName]: tableRows },
    'delete',
  );

  res.prints = {
    status: 'success',
    message: `Master data for table ${tableName} has been deleted successfully`,
    result,
  };

  next();
});

export const getMasterData = catchAsync(async (req, res, next) => {
  const tableName = req.params.tableName;
  const tableDataMap = getTableDataMapping();
  if (!tableDataMap[tableName]) {
    return next(
      new AppError(`Unknown table: ${tableName}. Cannot get data.`, 400),
    );
  }
  const { model } = tableDataMap[tableName];

  const sql = `SELECT * FROM ${tableName}`;

  const results = await model.executeQuery(sql);

  res.prints = {
    status: 'success',
    results,
  };
  next();
});

export const getMasterTableSchema = catchAsync(async (req, res, next) => {
  const { tableName } = req.params;

  const tableDefinitionsByName = Object.values(TABLE_MASTER).reduce(
    (acc, tableDef) => {
      acc[tableDef.name] = tableDef;
      return acc;
    },
    {},
  );

  if (tableName) {
    const schema = tableDefinitionsByName[tableName];

    if (!schema) {
      return next(
        new AppError(
          `Unknown table: ${tableName}. Valid tables: ${Object.keys(
            tableDefinitionsByName,
          ).join(', ')}`,
          400,
        ),
      );
    }

    res.prints = {
      status: 'success',
      tableName,
      schema,
    };
    return next();
  }

  res.prints = {
    status: 'success',
    schemas: tableDefinitionsByName,
  };
  next();
});

/**
 * Get statistics for all master data types
 */
export const getMasterDataStatistics = catchAsync(async (req, res, next) => {
  next();
});
