import catchAsync from '../../../utils/catchAsync.js';
import { defaultSalesQuotations } from '../../../datas/sales.js';
import { salesQuotationModel } from '../../../models/trade_business/sales/data_sales_quotations.js';
import { toBool } from '../../../utils/booleanFn.js';
import { getSafeSelectedFieldsForTable } from '../../../utils/readFieldSelection.js';

const getSalesReadOptions = (source = {}) => {
  const { includeBase64, compress, fields } = source;

  return {
    includeBase64: toBool(includeBase64),
    compress: toBool(compress),
    fields,
  };
};

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
  const source = {
    ...(req.query || {}),
    ...(req.body || {}),
  };

  const selectedQuotationFields = getSafeSelectedFieldsForTable(
    source.fields,
    'sales_quotations',
    {
      ensureField: 'id',
    },
  );

  const rows = selectedQuotationFields
    ? await salesQuotationModel.executeQuery(
        `SELECT ${selectedQuotationFields.join(', ')} FROM sales_quotations;`,
      )
    : await salesQuotationModel.executeQuery(
        'SELECT id FROM sales_quotations;',
      );

  const structuredData =
    await salesQuotationModel.processStructureDataOperation(
      { sales_quotations: rows },
      'read',
      getSalesReadOptions(source),
    );

  res.status(200).json({ status: 'success', structuredData });
});

export const getSalesQuotationById = catchAsync(async (req, res, next) => {
  const source = {
    ...(req.query || {}),
    ...(req.body || {}),
  };

  const structuredData =
    await salesQuotationModel.processStructureDataOperation(
      source.data,
      'read',
      getSalesReadOptions(source),
    );

  res.status(200).json({ status: 'success', structuredData });
});

export const getSalesComparisonKeys = catchAsync(async (req, res, next) => {
  const comparisonKeyData = salesQuotationModel.getFirstLevelFieldNames();

  res.status(200).json({
    status: 'success',
    data: comparisonKeyData,
  });
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
