import * as TableModel from '../../../models/trade_business/suppliers/tableModel.js';
import catchAsync from '../../../utils/catchAsync.js';
import AppError from '../../../utils/appError.js';

/**
 * Create all supplier tables
 * @route POST /api/suppliers/table/create-all
 */
export const createAllTables = catchAsync(async (req, res, next) => {
  const { tableType } = req.query;
  const result = await TableModel.createAllSupplierTables(tableType);

  res.status(201).json({
    status: 'success',
    message: result.message,
  });
});

/**
 * Create master supplier types table
 * @route POST /api/suppliers/table/create/supplier-types
 */
export const createSupplierTypesTable = catchAsync(async (req, res, next) => {
  const result = await TableModel.createMasterSupplierTypesTable();

  res.status(201).json({
    status: 'success',
    message: result.message,
  });
});

/**
 * Create suppliers table
 * @route POST /api/suppliers/table/create/suppliers
 */
export const createSuppliersTable = catchAsync(async (req, res, next) => {
  const result = await TableModel.createSuppliersTable();

  res.status(201).json({
    status: 'success',
    message: result.message,
  });
});

/**
 * Create master address types table
 * @route POST /api/suppliers/table/create/address-types
 */
export const createAddressTypesTable = catchAsync(async (req, res, next) => {
  const result = await TableModel.createAddressTypesTable();

  res.status(201).json({
    status: 'success',
    message: result.message,
  });
});

/**
 * Create supplier addresses table
 * @route POST /api/suppliers/table/create/addresses
 */
export const createSupplierAddressesTable = catchAsync(
  async (req, res, next) => {
    const result = await TableModel.createSupplierAddressesTable();

    res.status(201).json({
      status: 'success',
      message: result.message,
    });
  },
);

/**
 * Create master contact types table
 * @route POST /api/suppliers/table/create/contact-types
 */
export const createContactTypesTable = catchAsync(async (req, res, next) => {
  const result = await TableModel.createContactTypesTable();

  res.status(201).json({
    status: 'success',
    message: result.message,
  });
});

/**
 * Create supplier contacts table
 * @route POST /api/suppliers/table/create/contacts
 */
export const createSupplierContactsTable = catchAsync(
  async (req, res, next) => {
    const result = await TableModel.createSupplierContactsTable();

    res.status(201).json({
      status: 'success',
      message: result.message,
    });
  },
);

/**
 * Create master supplier link types table
 * @route POST /api/suppliers/table/create/link-types
 */
export const createSupplierLinkTypesTable = catchAsync(
  async (req, res, next) => {
    const result = await TableModel.createSupplierLinkTypesTable();

    res.status(201).json({
      status: 'success',
      message: result.message,
    });
  },
);

/**
 * Create supplier links table
 * @route POST /api/suppliers/table/create/links
 */
export const createSupplierLinksTable = catchAsync(async (req, res, next) => {
  const result = await TableModel.createSupplierLinksTable();

  res.status(201).json({
    status: 'success',
    message: result.message,
  });
});

/**
 * Create master service types table
 * @route POST /api/suppliers/table/create/service-types
 */
export const createServiceTypesTable = catchAsync(async (req, res, next) => {
  const result = await TableModel.createServiceTypesTable();

  res.status(201).json({
    status: 'success',
    message: result.message,
  });
});

/**
 * Create supplier services table
 * @route POST /api/suppliers/table/create/services
 */
export const createSupplierServicesTable = catchAsync(
  async (req, res, next) => {
    const result = await TableModel.createSupplierServicesTable();

    res.status(201).json({
      status: 'success',
      message: result.message,
    });
  },
);

/**
 * Create supplier service images table
 * @route POST /api/suppliers/table/create/service-images
 */
export const createSupplierServiceImagesTable = catchAsync(
  async (req, res, next) => {
    const result = await TableModel.createSupplierServiceImagesTable();

    res.status(201).json({
      status: 'success',
      message: result.message,
    });
  },
);

/**
 * Drop all supplier tables
 * @route DELETE /api/suppliers/table/drop-all
 */
export const dropAllTables = catchAsync(async (req, res, next) => {
  const { confirm } = req.body;
  const { tableType } = req.query;

  if (!confirm || confirm !== 'DROP_ALL_SUPPLIER_TABLES') {
    return next(
      new AppError(
        'Confirmation string required to drop all tables. Please provide { "confirm": "DROP_ALL_SUPPLIER_TABLES" } in the request body.',
        400,
      ),
    );
  }

  const result = await TableModel.dropAllSupplierTables(tableType);

  res.status(200).json({
    status: 'success',
    message: result.message,
  });
});

/**
 * Check if all supplier tables exist
 * @route GET /api/suppliers/table/check-exists
 */
export const checkTablesExist = catchAsync(async (req, res, next) => {
  const allTablesExist = await TableModel.checkSupplierTablesExist();

  res.status(200).json({
    status: 'success',
    data: {
      allTablesExist,
    },
  });
});

/**
 * Get schema information for all supplier tables
 * @route GET /api/suppliers/table/schema
 */
export const getTablesSchema = catchAsync(async (req, res, next) => {
  const schema = await TableModel.getSupplierTablesSchema();

  res.status(200).json({
    status: 'success',
    data: {
      schema,
    },
  });
});
