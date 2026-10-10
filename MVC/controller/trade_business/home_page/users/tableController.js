import * as TableModel from '../../../../models/trade_business/home_page/users/tableModel.js';
import catchAsync from '../../../../../utils/catchAsync.js';
import AppError from '../../../../../utils/appError.js';

export const createAllTables = catchAsync(async (req, res, next) => {
  const { tableType } = req.query;
  const result = await TableModel.createAllUserTables(tableType);

  res.status(201).json({
    status: 'success',
    message: result.message,
  });
});

export const createUsersTable = catchAsync(async (req, res, next) => {
  const result = await TableModel.createUsersTable();
  res.status(201).json({ status: 'success', message: result.message });
});

export const createUserAuthsTable = catchAsync(async (req, res, next) => {
  const result = await TableModel.createUserAuthsTable();
  res.status(201).json({ status: 'success', message: result.message });
});

export const createUserAddressesTable = catchAsync(async (req, res, next) => {
  const result = await TableModel.createUserAddressesTable();
  res.status(201).json({ status: 'success', message: result.message });
});

export const createUserCartsTable = catchAsync(async (req, res, next) => {
  const result = await TableModel.createUserCartsTable();
  res.status(201).json({ status: 'success', message: result.message });
});

export const createUserCartItemsTable = catchAsync(async (req, res, next) => {
  const result = await TableModel.createUserCartItemsTable();
  res.status(201).json({ status: 'success', message: result.message });
});

export const createUserFavouritesTable = catchAsync(async (req, res, next) => {
  const result = await TableModel.createUserFavouritesTable();
  res.status(201).json({ status: 'success', message: result.message });
});

export const createUserProductHistoryTable = catchAsync(
  async (req, res, next) => {
    const result = await TableModel.createUserProductHistoryTable();
    res.status(201).json({ status: 'success', message: result.message });
  },
);

export const createUserRfqsTable = catchAsync(async (req, res, next) => {
  const result = await TableModel.createUserRfqsTable();
  res.status(201).json({ status: 'success', message: result.message });
});

export const createUserRfqItemsTable = catchAsync(async (req, res, next) => {
  const result = await TableModel.createUserRfqItemsTable();
  res.status(201).json({ status: 'success', message: result.message });
});

export const createUserRfqAttachmentsTable = catchAsync(
  async (req, res, next) => {
    const result = await TableModel.createUserRfqAttachmentsTable();
    res.status(201).json({ status: 'success', message: result.message });
  },
);

export const createUserMembershipsTable = catchAsync(
  async (req, res, next) => {
    const result = await TableModel.createUserMembershipsTable();
    res.status(201).json({ status: 'success', message: result.message });
  },
);

export const createUserNotificationsTable = catchAsync(
  async (req, res, next) => {
    const result = await TableModel.createUserNotificationsTable();
    res.status(201).json({ status: 'success', message: result.message });
  },
);

export const createUserPaymentMethodsTable = catchAsync(
  async (req, res, next) => {
    const result = await TableModel.createUserPaymentMethodsTable();
    res.status(201).json({ status: 'success', message: result.message });
  },
);

export const dropAllTables = catchAsync(async (req, res, next) => {
  const { confirm } = req.body;
  const { tableType } = req.query;

  if (!confirm || confirm !== 'DROP_ALL_USER_TABLES') {
    return next(
      new AppError(
        'Confirmation string required to drop all tables. Please provide { "confirm": "DROP_ALL_USER_TABLES" } in the request body.',
        400,
      ),
    );
  }

  const result = await TableModel.dropAllUserTables(tableType);

  res.status(200).json({
    status: 'success',
    message: result.message,
  });
});

export const checkTablesExist = catchAsync(async (req, res, next) => {
  const allTablesExist = await TableModel.checkUserTablesExist();

  res.status(200).json({
    status: 'success',
    data: {
      allTablesExist,
    },
  });
});

export const getTablesSchema = catchAsync(async (req, res, next) => {
  const schema = await TableModel.getUserTablesSchema();

  res.status(200).json({
    status: 'success',
    data: {
      schema,
    },
  });
});