import catchAsync from '../../../utils/catchAsync.js';
import { defaultArInvoices } from '../../../datas/ar.js';
import { arInvoiceModel } from '../../../models/trade_business/ar/data_ar_invoices.js';

export const createArInvoice = catchAsync(async (req, res, next) => {
  const structuredData = await arInvoiceModel.processStructureDataOperation(
    req.body.data,
    'create',
  );
  res.status(201).json({ status: 'success', structuredData });
});

export const importDefaultArInvoices = catchAsync(async (req, res, next) => {
  const structuredData = await arInvoiceModel.processStructureDataOperation(
    defaultArInvoices,
    'create',
  );
  res.status(200).json({ status: 'success', structuredData });
});

export const getAllArInvoices = catchAsync(async (req, res, next) => {
  const ids = await arInvoiceModel.executeQuery('SELECT id FROM ar_invoices;');
  const structuredData = await arInvoiceModel.processStructureDataOperation(
    { ar_invoices: ids },
    'read',
  );
  res.status(200).json({ status: 'success', structuredData });
});

export const getArInvoiceById = catchAsync(async (req, res, next) => {
  const structuredData = await arInvoiceModel.processStructureDataOperation(
    req.body.data,
    'read',
  );
  res.status(200).json({ status: 'success', structuredData });
});

export const updateArInvoice = catchAsync(async (req, res, next) => {
  const structuredData = await arInvoiceModel.processStructureDataOperation(
    req.body.data,
    'update',
  );
  res.status(200).json({ status: 'success', structuredData });
});

export const deleteArInvoice = catchAsync(async (req, res, next) => {
  const structuredData = await arInvoiceModel.processStructureDataOperation(
    req.body.data,
    'delete',
  );
  res.status(200).json({ status: 'success', structuredData });
});

export const truncateArTables = catchAsync(async (req, res, next) => {
  const ids = await arInvoiceModel.executeQuery('SELECT id FROM ar_invoices;');
  await arInvoiceModel.processStructureDataOperation(
    { ar_invoices: ids },
    'delete',
  );
  res.status(200).json({ status: 'success' });
});
