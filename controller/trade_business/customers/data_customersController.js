import catchAsync from '../../../utils/catchAsync.js';
import { defaultCustomers } from '../../../datas/customers.js';
import { customerModel } from '../../../models/trade_business/customers/data_customers.js';

export const createCustomer = catchAsync(async (req, res, next) => {
  const structuredData = await customerModel.processStructureDataOperation(
    req.body.data,
    'create',
  );

  res.status(201).json({
    status: 'success',
    structuredData,
  });
});

export const importDefaultCustomers = catchAsync(async (req, res, next) => {
  const structuredData = await customerModel.processStructureDataOperation(
    defaultCustomers,
    'create',
  );

  res.status(200).json({
    status: 'success',
    structuredData,
  });
});

export const getAllCustomers = catchAsync(async (req, res, next) => {
  const { includeBase64, iconOnly, compress } = req.query;

  const customerIds = await customerModel.executeQuery(
    'SELECT id FROM customers;',
  );

  const data = { customers: customerIds };
  const structuredData = await customerModel.processStructureDataOperation(
    data,
    'read',
    {
      includeBase64: includeBase64 === '1',
      base64OnlyTable: iconOnly === '1' ? ['customers'] : null,
      compress: compress === '1',
    },
  );

  res.status(200).json({
    status: 'success',
    structuredData,
  });
});

export const getCustomerById = catchAsync(async (req, res, next) => {
  const { includeBase64, iconOnly, compress } = req.query;

  const structuredData = await customerModel.processStructureDataOperation(
    req.body.data,
    'read',
    {
      includeBase64: includeBase64 === '1',
      base64OnlyTable: iconOnly === '1' ? ['customers'] : null,
      compress: compress === '1',
    },
  );

  res.status(200).json({
    status: 'success',
    structuredData,
  });
});

export const updateCustomer = catchAsync(async (req, res, next) => {
  const structuredData = await customerModel.processStructureDataOperation(
    req.body.data,
    'update',
  );

  res.status(200).json({
    status: 'success',
    structuredData,
  });
});

export const deleteCustomer = catchAsync(async (req, res, next) => {
  const structuredData = await customerModel.processStructureDataOperation(
    req.body.data,
    'delete',
  );

  res.status(200).json({
    status: 'success',
    structuredData,
  });
});

export const truncateCustomerTables = catchAsync(async (req, res, next) => {
  const sql = `SELECT id FROM customers;`;
  const ids = await customerModel.dbc.executeQuery(sql);
  await customerModel.processStructureDataOperation(
    { customers: ids },
    'delete',
  );

  res.status(200).json({
    status: 'success',
  });
});
