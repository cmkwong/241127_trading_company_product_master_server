import catchAsync from '../../../utils/catchAsync.js';
import { defaultSuppliers } from '../../../datas/suppliers.js';
import { supplierModel } from '../../../models/trade_business/suppliers/data_suppliers.js';

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
  const { includeBase64, iconOnly, compress } = req.query;

  const supplierIds = await supplierModel.executeQuery(
    'SELECT id FROM suppliers;',
  );

  const data = { suppliers: supplierIds };
  const structuredData = await supplierModel.processStructureDataOperation(
    data,
    'read',
    {
      includeBase64: includeBase64 === '1' ? true : false,
      base64OnlyTable: iconOnly === '1' ? ['suppliers'] : null, // to control which tables should return only base64 data
      compress: compress === '1' ? true : false,
    },
  );
  res.status(200).json({
    status: 'success',
    structuredData,
  });
});

/**
 * Get a supplier by ID
 * @route GET /api/suppliers/data/:id
 */
export const getSupplierById = catchAsync(async (req, res, next) => {
  const { includeBase64, iconOnly, compress } = req.query;

  const structuredData = await supplierModel.processStructureDataOperation(
    req.body.data,
    'read',
    {
      includeBase64: includeBase64 === '1' ? true : false,
      base64OnlyTable: iconOnly === '1' ? ['suppliers'] : null, // to control which tables should return only base64 data
      compress: compress === '1' ? true : false,
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
