import catchAsync from '../../../utils/catchAsync.js';
import { defaultApInvoices } from '../../../datas/ap.js';
import { apInvoiceModel } from '../../../models/trade_business/ap/data_ap_invoices.js';

export const createApInvoice = catchAsync(async (req, res, next) => {
  const structuredData = await apInvoiceModel.processStructureDataOperation(
    req.body.data,
    'create',
  );
  res.status(201).json({ status: 'success', structuredData });
});

export const importDefaultApInvoices = catchAsync(async (req, res, next) => {
  const structuredData = await apInvoiceModel.processStructureDataOperation(
    defaultApInvoices,
    'create',
  );
  res.status(200).json({ status: 'success', structuredData });
});

export const getAllApInvoices = catchAsync(async (req, res, next) => {
  const ids = await apInvoiceModel.executeQuery('SELECT id FROM ap_invoices;');
  const structuredData = await apInvoiceModel.processStructureDataOperation(
    { ap_invoices: ids },
    'read',
  );
  res.status(200).json({ status: 'success', structuredData });
});

export const getApInvoiceById = catchAsync(async (req, res, next) => {
  const structuredData = await apInvoiceModel.processStructureDataOperation(
    req.body.data,
    'read',
  );
  res.status(200).json({ status: 'success', structuredData });
});

export const updateApInvoice = catchAsync(async (req, res, next) => {
  const structuredData = await apInvoiceModel.processStructureDataOperation(
    req.body.data,
    'update',
  );
  res.status(200).json({ status: 'success', structuredData });
});

export const deleteApInvoice = catchAsync(async (req, res, next) => {
  const structuredData = await apInvoiceModel.processStructureDataOperation(
    req.body.data,
    'delete',
  );
  res.status(200).json({ status: 'success', structuredData });
});

export const truncateApTables = catchAsync(async (req, res, next) => {
  const ids = await apInvoiceModel.executeQuery('SELECT id FROM ap_invoices;');
  await apInvoiceModel.processStructureDataOperation(
    { ap_invoices: ids },
    'delete',
  );
  res.status(200).json({ status: 'success' });
});
