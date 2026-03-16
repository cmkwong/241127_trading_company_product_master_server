import catchAsync from '../../utils/catchAsync.js';
import AppError from '../../utils/appError.js';
import { tradeBusinessDbc } from '../../models/dbModel.js';
import { TABLE_MASTER, generateCreateTableSQL } from '../../models/tables.js';
import {
  getMasterDefaultMappings,
  getDataDefaultMappings,
} from '../../models/mappings/defaultDataMappings.js';
import {
  getSchemaDiff,
  syncSchemaWithTableMaster,
} from '../../models/schemaSync.js';

const TRADE_BUSINESS_TABLE_PREFIXES = [
  'products-',
  'suppliers-',
  'customers-',
  'services-',
  'sales-',
  'ar-',
  'purchase-',
  'ap-',
];

const TRADE_BUSINESS_SCOPE_VALUES = ['all', 'master', 'data'];

const isTradeBusinessTableType = (tableType) => {
  if (!tableType) {
    return false;
  }

  return TRADE_BUSINESS_TABLE_PREFIXES.some((prefix) =>
    tableType.startsWith(prefix),
  );
};

const normalizeScope = (scope = 'all') => {
  const normalizedScope = String(scope).toLowerCase();

  if (!TRADE_BUSINESS_SCOPE_VALUES.includes(normalizedScope)) {
    throw new AppError(
      `Invalid scope: ${scope}. Expected one of: ${TRADE_BUSINESS_SCOPE_VALUES.join(', ')}`,
      400,
    );
  }

  return normalizedScope;
};

const matchScope = (tableType, scope) => {
  if (scope === 'all') {
    return true;
  }

  return tableType.endsWith(`-${scope}`);
};

const getTradeBusinessTableDefinitions = (scope = 'all') => {
  const normalizedScope = normalizeScope(scope);

  return Object.values(TABLE_MASTER).filter((tableDefinition) => {
    const { table_type: tableType } = tableDefinition;

    return (
      isTradeBusinessTableType(tableType) &&
      matchScope(tableType, normalizedScope)
    );
  });
};

const createTradeBusinessTables = async (scope = 'all') => {
  const tableDefinitions = getTradeBusinessTableDefinitions(scope);
  const results = {};

  for (const tableDefinition of tableDefinitions) {
    const tableName = tableDefinition.name;

    try {
      await tradeBusinessDbc.executeQuery(
        generateCreateTableSQL(tableDefinition),
      );
      results[tableName] = { success: true, message: `${tableName} created` };
    } catch (error) {
      results[tableName] = { success: false, error: error.message };
    }
  }

  return {
    scope: normalizeScope(scope),
    totalTables: tableDefinitions.length,
    results,
  };
};

const dropTradeBusinessTables = async (scope = 'all') => {
  const tableDefinitions = getTradeBusinessTableDefinitions(scope).reverse();
  const results = {};

  await tradeBusinessDbc.executeQuery('SET FOREIGN_KEY_CHECKS = 0');

  try {
    for (const tableDefinition of tableDefinitions) {
      const tableName = tableDefinition.name;

      try {
        await tradeBusinessDbc.executeQuery(
          `DROP TABLE IF EXISTS ${tableName}`,
        );
        results[tableName] = { success: true, message: `${tableName} dropped` };
      } catch (error) {
        results[tableName] = { success: false, error: error.message };
      }
    }
  } finally {
    await tradeBusinessDbc.executeQuery('SET FOREIGN_KEY_CHECKS = 1');
  }

  return {
    scope: normalizeScope(scope),
    totalTables: tableDefinitions.length,
    results,
  };
};

const getDropConfirmationByScope = (scope) => {
  const normalizedScope = normalizeScope(scope);

  if (normalizedScope === 'master') {
    return 'DROP_ALL_TRADE_BUSINESS_MASTER_TABLES';
  }

  if (normalizedScope === 'data') {
    return 'DROP_ALL_TRADE_BUSINESS_DATA_TABLES';
  }

  return 'DROP_ALL_TRADE_BUSINESS_TABLES';
};

const insertMasterDefaults = async () => {
  const mappings = getMasterDefaultMappings();
  const results = {};

  for (const [tableName, { model, data }] of Object.entries(mappings)) {
    try {
      await model.creates(data);
      results[tableName] = { success: true };
    } catch (error) {
      results[tableName] = { success: false, error: error.message };
    }
  }

  return {
    totalGroups: Object.keys(mappings).length,
    results,
  };
};

const insertDataDefaults = async () => {
  const mappings = getDataDefaultMappings();
  const results = {};

  for (const { name, model, data } of mappings) {
    try {
      await model.processStructureDataOperation(data, 'create');
      results[name] = { success: true };
    } catch (error) {
      results[name] = { success: false, error: error.message };
    }
  }

  return {
    totalGroups: mappings.length,
    results,
  };
};

const insertTradeBusinessDefaults = async (scope = 'all') => {
  const normalizedScope = normalizeScope(scope);
  const data = {
    scope: normalizedScope,
    results: {},
  };

  if (normalizedScope === 'all' || normalizedScope === 'master') {
    data.results.master = await insertMasterDefaults();
  }

  if (normalizedScope === 'all' || normalizedScope === 'data') {
    data.results.data = await insertDataDefaults();
  }

  return data;
};

export const createAllTradeBusinessTables = catchAsync(
  async (req, res, next) => {
    const scope = req.query.scope || 'all';
    const summary = await createTradeBusinessTables(scope);

    res.prints = {
      message: `Trade business ${summary.scope} tables creation completed`,
      data: summary,
    };

    next();
  },
);

export const dropAllTradeBusinessTables = catchAsync(async (req, res, next) => {
  const scope = req.query.scope || 'all';
  const expectedConfirmation = getDropConfirmationByScope(scope);
  const { confirm } = req.body || {};

  if (confirm !== expectedConfirmation) {
    return next(
      new AppError(
        `Confirmation string required. Please provide { "confirm": "${expectedConfirmation}" } in the request body.`,
        400,
      ),
    );
  }

  const summary = await dropTradeBusinessTables(scope);

  res.prints = {
    message: `Trade business ${summary.scope} tables drop completed`,
    data: summary,
  };

  next();
});

export const insertAllTradeBusinessDefaults = catchAsync(
  async (req, res, next) => {
    const scope = req.query.scope || 'all';
    const summary = await insertTradeBusinessDefaults(scope);

    res.prints = {
      message: `Trade business ${summary.scope} default data insertion completed`,
      data: summary,
    };

    next();
  },
);

export const checkTradeBusinessSchema = catchAsync(async (req, res, next) => {
  const scope = req.query.scope || 'all';
  const diff = await getSchemaDiff(scope);

  res.prints = {
    message: `Schema diff generated for scope ${diff.scope}`,
    data: diff,
  };

  next();
});

export const syncTradeBusinessSchema = catchAsync(async (req, res, next) => {
  const scope = req.query.scope || req.body?.scope || 'all';
  const allowDrop = Boolean(req.body?.allowDrop);
  const dryRun = Boolean(req.body?.dryRun);

  if (allowDrop && req.body?.confirm !== 'SYNC_SCHEMA_WITH_DROPS') {
    return next(
      new AppError(
        'Confirmation string required for destructive sync. Please provide { "confirm": "SYNC_SCHEMA_WITH_DROPS" } when allowDrop=true.',
        400,
      ),
    );
  }

  const result = await syncSchemaWithTableMaster({
    scope,
    allowDrop,
    dryRun,
  });

  res.prints = {
    message: result.dryRun
      ? 'Schema dry-run completed'
      : 'Schema sync completed',
    data: result,
  };

  next();
});
