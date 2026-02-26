import * as TableModel from '../../../models/trade_business/customers/tableModel.js';
import catchAsync from '../../../utils/catchAsync.js';
import AppError from '../../../utils/appError.js';

/**
 * Create all customer tables
 * @route POST /api/customers/table/create-all
 */
export const createAllTables = catchAsync(async (req, res, next) => {
  const { tableType } = req.query;
  const result = await TableModel.createAllCustomerTables(tableType);

  res.status(201).json({
    status: 'success',
    message: result.message,
  });
});

export const createCustomerNameTypesTable = catchAsync(
  async (req, res, next) => {
    const result = await TableModel.createMasterCustomerNameTypesTable();
    res.status(201).json({ status: 'success', message: result.message });
  },
);

export const createCustomerTypesMasterTable = catchAsync(
  async (req, res, next) => {
    const result = await TableModel.createMasterCustomerTypesTable();
    res.status(201).json({ status: 'success', message: result.message });
  },
);

export const createCustomerImageTypesTable = catchAsync(
  async (req, res, next) => {
    const result = await TableModel.createMasterCustomerImageTypesTable();
    res.status(201).json({ status: 'success', message: result.message });
  },
);

export const createCustomersTable = catchAsync(async (req, res, next) => {
  const result = await TableModel.createCustomersTable();
  res.status(201).json({ status: 'success', message: result.message });
});

export const createCustomerNamesTable = catchAsync(async (req, res, next) => {
  const result = await TableModel.createCustomerNamesTable();
  res.status(201).json({ status: 'success', message: result.message });
});

export const createCustomerTypesTable = catchAsync(async (req, res, next) => {
  const result = await TableModel.createCustomerTypesTable();
  res.status(201).json({ status: 'success', message: result.message });
});

export const createCustomerAddressesTable = catchAsync(
  async (req, res, next) => {
    const result = await TableModel.createCustomerAddressesTable();
    res.status(201).json({ status: 'success', message: result.message });
  },
);

export const createCustomerContactsTable = catchAsync(
  async (req, res, next) => {
    const result = await TableModel.createCustomerContactsTable();
    res.status(201).json({ status: 'success', message: result.message });
  },
);

export const createCustomerImagesTable = catchAsync(async (req, res, next) => {
  const result = await TableModel.createCustomerImagesTable();
  res.status(201).json({ status: 'success', message: result.message });
});

/**
 * Drop all customer tables
 * @route DELETE /api/customers/table/drop-all
 */
export const dropAllTables = catchAsync(async (req, res, next) => {
  const { confirm } = req.body;
  const { tableType } = req.query;

  if (!confirm || confirm !== 'DROP_ALL_CUSTOMER_TABLES') {
    return next(
      new AppError(
        'Confirmation string required to drop all tables. Please provide { "confirm": "DROP_ALL_CUSTOMER_TABLES" } in the request body.',
        400,
      ),
    );
  }

  const result = await TableModel.dropAllCustomerTables(tableType);

  res.status(200).json({
    status: 'success',
    message: result.message,
  });
});

/**
 * Check if all customer tables exist
 * @route GET /api/customers/table/check-exists
 */
export const checkTablesExist = catchAsync(async (req, res, next) => {
  const allTablesExist = await TableModel.checkCustomerTablesExist();

  res.status(200).json({
    status: 'success',
    data: {
      allTablesExist,
    },
  });
});

/**
 * Get schema information for all customer tables
 * @route GET /api/customers/table/schema
 */
export const getTablesSchema = catchAsync(async (req, res, next) => {
  const schema = await TableModel.getCustomerTablesSchema();

  res.status(200).json({
    status: 'success',
    data: {
      schema,
    },
  });
});
