import catchAsync from '../../../../../utils/catchAsync.js';
import { catalogModel } from '../../../../models/trade_business/panel/catalogs/data_catalogs.js';
import { toBool } from '../../../../../utils/booleanFn.js';
import { getSafeSelectedFieldsForTable } from '../../../../../utils/readFieldSelection.js';

const getCatalogReadOptions = (source = {}) => {
  const { includeBase64, compress, fields } = source;

  return {
    includeBase64: toBool(includeBase64),
    compress: toBool(compress),
    fields,
  };
};

export const createCatalog = catchAsync(async (req, res, next) => {
  const structuredData = await catalogModel.processStructureDataOperation(
    req.body.data,
    'create',
  );

  res.status(201).json({ status: 'success', structuredData });
});

export const getAllCatalogs = catchAsync(async (req, res, next) => {
  const source = {
    ...(req.query || {}),
    ...(req.body || {}),
  };

  const selectedCatalogFields = getSafeSelectedFieldsForTable(
    source.fields,
    'catalogs',
    {
      ensureField: 'id',
    },
  );

  const rows = selectedCatalogFields
    ? await catalogModel.executeQuery(
        `SELECT ${selectedCatalogFields.join(', ')} FROM catalogs;`,
      )
    : await catalogModel.executeQuery('SELECT id FROM catalogs;');

  const structuredData = await catalogModel.processStructureDataOperation(
    { catalogs: rows },
    'read',
    getCatalogReadOptions(source),
  );

  res.status(200).json({ status: 'success', structuredData });
});

export const getCatalogById = catchAsync(async (req, res, next) => {
  const source = {
    ...(req.query || {}),
    ...(req.body || {}),
  };

  const structuredData = await catalogModel.processStructureDataOperation(
    source.data,
    'read',
    getCatalogReadOptions(source),
  );

  res.status(200).json({ status: 'success', structuredData });
});

export const getCatalogComparisonKeys = catchAsync(async (req, res, next) => {
  const comparisonKeyData = catalogModel.getFirstLevelFieldNames();

  res.status(200).json({
    status: 'success',
    data: comparisonKeyData,
  });
});

export const updateCatalog = catchAsync(async (req, res, next) => {
  const structuredData = await catalogModel.processStructureDataOperation(
    req.body.data,
    'update',
  );

  res.status(200).json({ status: 'success', structuredData });
});

export const deleteCatalog = catchAsync(async (req, res, next) => {
  const structuredData = await catalogModel.processStructureDataOperation(
    req.body.data,
    'delete',
  );

  res.status(200).json({ status: 'success', structuredData });
});

export const truncateCatalogTables = catchAsync(async (req, res, next) => {
  const ids = await catalogModel.executeQuery('SELECT id FROM catalogs;');
  await catalogModel.processStructureDataOperation(
    { catalogs: ids },
    'delete',
  );

  res.status(200).json({ status: 'success' });
});
