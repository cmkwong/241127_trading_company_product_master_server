import catchAsync from '../../../utils/catchAsync.js';
import AppError from '../../../utils/appError.js';
import { defaultApInvoices } from '../../../datas/ap.js';
import { apInvoiceModel } from '../../../models/trade_business/ap/data_ap_invoices.js';

const AP_ROW_DETAIL_KEY = 'ap_invoice_row_details';

const isBlank = (value) =>
  value === undefined ||
  value === null ||
  (typeof value === 'string' && value.trim() === '');

const getApInvoicesFromPayload = (payload) => {
  if (!payload || typeof payload !== 'object') return [];
  if (!Array.isArray(payload.ap_invoices)) return [];
  return payload.ap_invoices;
};

const assertInvoiceTypeCodesExist = async (typeCodes, rowLabel) => {
  if (typeCodes.length === 0) return;

  const placeholders = typeCodes.map(() => '?').join(', ');
  const sql = `
    SELECT code
    FROM master_invoice_types
    WHERE code IN (${placeholders});
  `;

  const matchedRows = await apInvoiceModel.executeQuery(sql, typeCodes);
  const matchedSet = new Set((matchedRows || []).map((row) => row.code));
  const invalidCodes = typeCodes.filter((code) => !matchedSet.has(code));

  if (invalidCodes.length > 0) {
    throw new AppError(
      `${rowLabel} has invalid ap_invoice_type codes: ${invalidCodes.join(', ')}`,
      400,
    );
  }
};

const validateRowDetails = async (invoiceRow, rowLabel) => {
  const rowDetails = Array.isArray(invoiceRow?.[AP_ROW_DETAIL_KEY])
    ? invoiceRow[AP_ROW_DETAIL_KEY]
    : [];

  const typeCodes = [];

  rowDetails.forEach((detailRow, detailIndex) => {
    const detailLabel = `${rowLabel}.${AP_ROW_DETAIL_KEY}[${detailIndex}]`;

    if (!detailRow || typeof detailRow !== 'object') {
      throw new AppError(`${detailLabel} must be an object`, 400);
    }

    const amount = detailRow?.amount;
    if (!isBlank(amount) && Number.isNaN(Number(amount))) {
      throw new AppError(`${detailLabel}.amount must be a valid number`, 400);
    }

    const typeCode = String(detailRow?.ap_invoice_type || '').trim();
    if (typeCode) {
      typeCodes.push(typeCode);
    }
  });

  const uniqueTypeCodes = [...new Set(typeCodes)];
  await assertInvoiceTypeCodesExist(uniqueTypeCodes, rowLabel);
};

const validateApInvoiceRow = async (invoiceRow, index) => {
  const rowLabel = `ap_invoices[${index}]`;

  if (!invoiceRow || typeof invoiceRow !== 'object') {
    throw new AppError(`${rowLabel} must be an object`, 400);
  }

  if (isBlank(invoiceRow.supplier_id)) {
    throw new AppError(`${rowLabel} requires supplier_id`, 400);
  }

  if (isBlank(invoiceRow.purchase_request_id)) {
    throw new AppError(`${rowLabel} requires purchase_request_id`, 400);
  }

  const purchaseRequestRows = await apInvoiceModel.executeQuery(
    'SELECT id, supplier_id FROM purchase_requests WHERE id = ? LIMIT 1;',
    [invoiceRow.purchase_request_id],
  );

  if (!purchaseRequestRows?.length) {
    throw new AppError(
      `${rowLabel} has invalid purchase_request_id ${invoiceRow.purchase_request_id}`,
      400,
    );
  }

  const purchaseRequestSupplierId = purchaseRequestRows[0].supplier_id;
  if (String(purchaseRequestSupplierId) !== String(invoiceRow.supplier_id)) {
    throw new AppError(
      `${rowLabel} supplier_id ${invoiceRow.supplier_id} does not match purchase request supplier_id ${purchaseRequestSupplierId}`,
      400,
    );
  }

  await validateRowDetails(invoiceRow, rowLabel);
};

const validateApInvoicePayload = async (payload) => {
  const apInvoiceRows = getApInvoicesFromPayload(payload);

  for (let index = 0; index < apInvoiceRows.length; index += 1) {
    await validateApInvoiceRow(apInvoiceRows[index], index);
  }
};

export const createApInvoice = catchAsync(async (req, res, next) => {
  await validateApInvoicePayload(req.body.data);
  const structuredData = await apInvoiceModel.processStructureDataOperation(
    req.body.data,
    'create',
  );
  res.status(201).json({ status: 'success', structuredData });
});

export const importDefaultApInvoices = catchAsync(async (req, res, next) => {
  await validateApInvoicePayload(defaultApInvoices);
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
  await validateApInvoicePayload(req.body.data);
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
