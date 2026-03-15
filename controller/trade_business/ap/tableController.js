import * as TableModel from '../../../models/trade_business/ap/tableModel.js';
import catchAsync from '../../../utils/catchAsync.js';
import AppError from '../../../utils/appError.js';

export const createAllTables = catchAsync(async (req, res, next) => {
  const result = await TableModel.createAllApTables();
  res.status(201).json({ status: 'success', message: result.message });
});

export const dropAllTables = catchAsync(async (req, res, next) => {
  const { confirm } = req.body;
  if (!confirm || confirm !== 'DROP_ALL_AP_TABLES') {
    return next(
      new AppError(
        'Confirmation string required to drop all tables. Please provide { "confirm": "DROP_ALL_AP_TABLES" } in the request body.',
        400,
      ),
    );
  }

  const result = await TableModel.dropAllApTables();
  res.status(200).json({ status: 'success', message: result.message });
});

export const checkTablesExist = catchAsync(async (req, res, next) => {
  const allTablesExist = await TableModel.checkApTablesExist();
  res.status(200).json({ status: 'success', data: { allTablesExist } });
});

export const getTablesSchema = catchAsync(async (req, res, next) => {
  const schema = await TableModel.getApTablesSchema();
  res.status(200).json({ status: 'success', data: { schema } });
});
