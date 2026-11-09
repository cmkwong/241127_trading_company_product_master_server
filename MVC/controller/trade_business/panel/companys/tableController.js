import * as TableModel from '../../../../models/trade_business/panel/companys/tableModel.js';
import catchAsync from '../../../../../utils/catchAsync.js';
import AppError from '../../../../../utils/appError.js';

/**
 * Create all company tables
 * @route POST /api/trade_business/panel/companys/table/create-all
 */
export const createAllTables = catchAsync(async (req, res, next) => {
  const { tableType } = req.query;
  const result = await TableModel.createAllCompanyTables(tableType);

  res.status(201).json({
    status: 'success',
    message: result.message,
  });
});

/**
 * Create companys table
 * @route POST /api/trade_business/panel/companys/table/create/companys
 */
export const createCompanyTable = catchAsync(async (req, res, next) => {
  const result = await TableModel.createCompanysTable();

  res.status(201).json({
    status: 'success',
    message: result.message,
  });
});

/**
 * Create company address table
 * @route POST /api/trade_business/panel/companys/table/create/addresses
 */
export const createCompanyAddressTable = catchAsync(async (req, res, next) => {
  const result = await TableModel.createCompanyAddressTable();

  res.status(201).json({
    status: 'success',
    message: result.message,
  });
});

/**
 * Drop all company tables
 * @route DELETE /api/trade_business/panel/companys/table/drop-all
 */
export const dropAllTables = catchAsync(async (req, res, next) => {
  const { confirm } = req.body;
  const { tableType } = req.query;

  if (!confirm || confirm !== 'DROP_ALL_COMPANY_TABLES') {
    return next(
      new AppError(
        'Confirmation string required to drop all tables. Please provide { "confirm": "DROP_ALL_COMPANY_TABLES" } in the request body.',
        400,
      ),
    );
  }

  const result = await TableModel.dropAllCompanyTables(tableType);

  res.status(200).json({
    status: 'success',
    message: result.message,
  });
});

/**
 * Check if all company tables exist
 * @route GET /api/trade_business/panel/companys/table/check-exists
 */
export const checkTablesExist = catchAsync(async (req, res, next) => {
  const allTablesExist = await TableModel.checkCompanyTablesExist();

  res.status(200).json({
    status: 'success',
    data: {
      allTablesExist,
    },
  });
});

/**
 * Get schema information for all company tables
 * @route GET /api/trade_business/panel/companys/table/schema
 */
export const getTablesSchema = catchAsync(async (req, res, next) => {
  const schema = await TableModel.getCompanyTablesSchema();

  res.status(200).json({
    status: 'success',
    data: {
      schema,
    },
  });
});
