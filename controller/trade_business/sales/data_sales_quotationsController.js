import catchAsync from '../../../utils/catchAsync.js';
import { defaultSalesQuotations } from '../../../datas/sales.js';
import { salesQuotationModel } from '../../../models/trade_business/sales/data_sales_quotations.js';

export const createSalesQuotation = catchAsync(async (req, res, next) => {
  const structuredData =
    await salesQuotationModel.processStructureDataOperation(
      req.body.data,
      'create',
    );

  res.status(201).json({ status: 'success', structuredData });
});

export const importDefaultSalesQuotations = catchAsync(
  async (req, res, next) => {
    const structuredData =
      await salesQuotationModel.processStructureDataOperation(
        defaultSalesQuotations,
        'create',
      );

    res.status(200).json({ status: 'success', structuredData });
  },
);

export const getAllSalesQuotations = catchAsync(async (req, res, next) => {
  const ids = await salesQuotationModel.executeQuery(
    'SELECT id FROM sales_quotations;',
  );
  const structuredData =
    await salesQuotationModel.processStructureDataOperation(
      { sales_quotations: ids },
      'read',
    );

  res.status(200).json({ status: 'success', structuredData });
});

export const getSalesQuotationById = catchAsync(async (req, res, next) => {
  const structuredData =
    await salesQuotationModel.processStructureDataOperation(
      req.body.data,
      'read',
    );

  res.status(200).json({ status: 'success', structuredData });
});

export const updateSalesQuotation = catchAsync(async (req, res, next) => {
  const structuredData =
    await salesQuotationModel.processStructureDataOperation(
      req.body.data,
      'update',
    );

  res.status(200).json({ status: 'success', structuredData });
});

export const deleteSalesQuotation = catchAsync(async (req, res, next) => {
  const structuredData =
    await salesQuotationModel.processStructureDataOperation(
      req.body.data,
      'delete',
    );

  res.status(200).json({ status: 'success', structuredData });
});

export const truncateSalesTables = catchAsync(async (req, res, next) => {
  const ids = await salesQuotationModel.executeQuery(
    'SELECT id FROM sales_quotations;',
  );
  await salesQuotationModel.processStructureDataOperation(
    { sales_quotations: ids },
    'delete',
  );

  res.status(200).json({ status: 'success' });
});
