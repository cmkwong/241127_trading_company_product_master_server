import catchAsync from '../../../utils/catchAsync.js';
import { defaultSuppliers } from '../../../datas/suppliers.js';
import { supplierModel } from '../../../models/trade_business/suppliers/data_suppliers.js';
import { toBool } from '../../../utils/booleanFn.js';
import { getSafeSelectedFieldsForTable } from '../../../utils/readFieldSelection.js';

/**
 * Create a new supplier
 * @route POST /api/suppliers/data
 */
export const createSupplier = catchAsync(async (req, res, next) => {
  const structuredData = await supplierModel.processStructureDataOperation(
    req.body.data,
    'create',
  );

  res.status(201).json({
    status: 'success',
    structuredData,
  });
});

/**
 * Import sample suppliers data
 * @route POST /api/suppliers/data/samples
 */
export const importDefaultSuppliers = catchAsync(async (req, res, next) => {
  const structuredData = await supplierModel.processStructureDataOperation(
    defaultSuppliers,
    'create',
  );

  res.status(200).json({
    status: 'success',
    structuredData,
  });
});

/**
 * Get all suppliers
 * @route GET /api/suppliers/data
 */
export const getAllSuppliers = catchAsync(async (req, res, next) => {
  const source = {
    ...(req.query || {}),
    ...(req.body || {}),
  };

  const { includeBase64, iconOnly, compress, fields } = source;

  const selectedSupplierFields = getSafeSelectedFieldsForTable(
    fields,
    'suppliers',
    {
      ensureField: 'id',
    },
  );

  const supplierRows =
    selectedSupplierFields && !toBool(includeBase64)
      ? await supplierModel.executeQuery(
          `SELECT ${selectedSupplierFields.join(', ')} FROM suppliers;`,
        )
      : await supplierModel.executeQuery('SELECT id FROM suppliers;');

  const data = { suppliers: supplierRows };
  const structuredData = await supplierModel.processStructureDataOperation(
    data,
    'read',
    {
      includeBase64: toBool(includeBase64),
      base64OnlyTable: toBool(iconOnly) ? ['suppliers'] : null, // to control which tables should return only base64 data
      compress: toBool(compress),
      fields,
    },
  );
  res.status(200).json({
    status: 'success',
    structuredData,
  });
});

/**
 * Get first-level supplier comparison keys for front-end
 * @route GET /api/v1/trade_business/suppliers/data/comparison-keys
 */
export const getSupplierComparisonKeys = catchAsync(async (req, res, next) => {
  const comparisonKeyData = supplierModel.getFirstLevelFieldNames();

  res.status(200).json({
    status: 'success',
    data: comparisonKeyData,
  });
});

/**
 * Get a supplier by ID
 * @route GET /api/suppliers/data/:id
 */
export const getSupplierById = catchAsync(async (req, res, next) => {
  const source = req.body || {};

  const { includeBase64, iconOnly, compress, fields, data } = source;

  const structuredData = await supplierModel.processStructureDataOperation(
    data,
    'read',
    {
      includeBase64: toBool(includeBase64),
      base64OnlyTable: toBool(iconOnly) ? ['suppliers'] : null, // to control which tables should return only base64 data
      compress: toBool(compress),
      fields,
    },
  );

  res.status(200).json({
    status: 'success',
    structuredData,
  });
});

/**
 * Update a supplier
 * @route PATCH /api/suppliers/data/:id
 */
export const updateSupplier = catchAsync(async (req, res, next) => {
  const structuredData = await supplierModel.processStructureDataOperation(
    req.body.data,
    'update',
  );

  res.status(200).json({
    status: 'success',
    structuredData,
  });
});

/**
 * Delete a supplier
 * @route DELETE /api/suppliers/data/:id
 */
export const deleteSupplier = catchAsync(async (req, res, next) => {
  const structuredData = await supplierModel.processStructureDataOperation(
    req.body.data,
    'delete',
  );

  res.status(200).json({
    status: 'success',
    structuredData,
  });
});

/**
 * Truncate all supplier-related data
 * @route POST /api/suppliers/data/truncate
 */
export const truncateSupplierTables = catchAsync(async (req, res, next) => {
  // getting all of the supplier id
  const sql = `SELECT id FROM suppliers;`;
  const ids = await supplierModel.dbc.executeQuery(sql);
  await supplierModel.processStructureDataOperation(
    { suppliers: ids },
    'delete',
  );

  res.status(200).json({
    status: 'success',
  });
});
