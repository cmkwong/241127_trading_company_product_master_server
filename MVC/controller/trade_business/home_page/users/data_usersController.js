import catchAsync from '../../../../../utils/catchAsync.js';
import { userModel } from '../../../../models/trade_business/home_page/users/data_users.js';

export const createUser = catchAsync(async (req, res, next) => {
  const structuredData = await userModel.processStructureDataOperation(
    req.body.data,
    'create',
  );

  res.status(201).json({
    status: 'success',
    structuredData,
  });
});

export const getAllUsers = catchAsync(async (req, res, next) => {
  const { includeBase64, iconOnly, compress } = req.query;

  const userIds = await userModel.executeQuery('SELECT id FROM users;');

  const data = { users: userIds };
  const structuredData = await userModel.processStructureDataOperation(
    data,
    'read',
    {
      includeBase64: includeBase64 === '1',
      base64OnlyTable: iconOnly === '1' ? ['users'] : null,
      compress: compress === '1',
    },
  );

  res.status(200).json({
    status: 'success',
    structuredData,
  });
});

export const getUserComparisonKeys = catchAsync(async (req, res, next) => {
  const comparisonKeyData = userModel.getFirstLevelFieldNames();

  res.status(200).json({
    status: 'success',
    data: {
      firstLevelKeys: comparisonKeyData,
    },
  });
});

export const getUserById = catchAsync(async (req, res, next) => {
  const { includeBase64, iconOnly, compress } = req.query;

  const structuredData = await userModel.processStructureDataOperation(
    req.body.data,
    'read',
    {
      includeBase64: includeBase64 === '1',
      base64OnlyTable: iconOnly === '1' ? ['users'] : null,
      compress: compress === '1',
    },
  );

  res.status(200).json({
    status: 'success',
    structuredData,
  });
});

export const updateUser = catchAsync(async (req, res, next) => {
  const structuredData = await userModel.processStructureDataOperation(
    req.body.data,
    'update',
  );

  res.status(200).json({
    status: 'success',
    structuredData,
  });
});

export const deleteUser = catchAsync(async (req, res, next) => {
  const structuredData = await userModel.processStructureDataOperation(
    req.body.data,
    'delete',
  );

  res.status(200).json({
    status: 'success',
    structuredData,
  });
});

export const truncateUserTables = catchAsync(async (req, res, next) => {
  const sql = `SELECT id FROM users;`;
  const ids = await userModel.dbc.executeQuery(sql);
  await userModel.processStructureDataOperation({ users: ids }, 'delete');

  res.status(200).json({
    status: 'success',
  });
});