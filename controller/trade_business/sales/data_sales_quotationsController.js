import catchAsync from '../../../utils/catchAsync.js';
import { defaultSalesQuotations } from '../../../datas/sales.js';
import { salesQuotationModel } from '../../../models/trade_business/sales/data_sales_quotations.js';
import { toBool } from '../../../utils/booleanFn.js';
import { getSafeSelectedFieldsForTable } from '../../../utils/readFieldSelection.js';
import { tradeBusinessDbc } from '../../../models/dbModel.js';
import AppError from '../../../utils/appError.js';

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

export const getSalesQuotationPurchaseCosts = catchAsync(
  async (req, res, next) => {
    const { sales_quotation_id } = req.params;

    if (!sales_quotation_id) {
      return next(new AppError('sales_quotation_id is required', 400));
    }

    // 1. Find linked purchase requests whose status is ap_invoiced
    const purchaseRequests = await tradeBusinessDbc.executeQuery(
      'SELECT id FROM purchase_requests WHERE sales_quotation_id = ? AND status = ?',
      [sales_quotation_id, 'ap_invoiced'],
    );

    if (purchaseRequests.length === 0) {
      return res.status(200).json({
        status: 'success',
        sales_quotation_id,
        shipping_costs: [],
        product_costs: [],
        service_costs: [],
      });
    }

    const prIds = purchaseRequests.map((pr) => pr.id);
    const prIdPlaceholders = prIds.map(() => '?').join(', ');

    // 2. Query shipping, product, and service costs with currency codes
    const shippingCosts = await tradeBusinessDbc.executeQuery(
      `SELECT 
        psd.id AS purchase_shipping_detail_id,
        psd.purchase_request_id,
        psd.created_at,
        psd.sales_shipping_detail_id,
        psd.price,
        mc.code AS currency_code,
        s.name AS supplier_name,
        (
          SELECT msm.name
          FROM sales_shipping_prices ssp
          LEFT JOIN master_shipping_method msm ON msm.id = ssp.shipping_method_id
          WHERE ssp.sales_shipping_detail_id = psd.sales_shipping_detail_id
          ORDER BY ssp.selected DESC, ssp.created_at ASC
          LIMIT 1
        ) AS item_label
      FROM purchase_shipping_details psd
      LEFT JOIN purchase_requests pr ON pr.id = psd.purchase_request_id
      LEFT JOIN suppliers s ON s.id = pr.supplier_id
      LEFT JOIN master_currencies mc ON mc.id = psd.currency_id
      WHERE psd.purchase_request_id IN (${prIdPlaceholders})`,
      prIds,
    );

    const productCosts = await tradeBusinessDbc.executeQuery(
      `SELECT 
        ppd.id AS purchase_product_detail_id,
        ppd.purchase_request_id,
        ppd.created_at,
        ppd.sales_product_detail_id,
        ppd.price,
        mc.code AS currency_code,
        s.name AS supplier_name,
        (
          SELECT pn.name
          FROM product_names pn
          WHERE pn.product_id = ppd.product_id
          ORDER BY pn.display_order ASC, pn.name ASC
          LIMIT 1
        ) AS item_label
      FROM purchase_product_details ppd
      LEFT JOIN purchase_requests pr ON pr.id = ppd.purchase_request_id
      LEFT JOIN suppliers s ON s.id = pr.supplier_id
      LEFT JOIN master_currencies mc ON mc.id = ppd.currency_id
      WHERE ppd.purchase_request_id IN (${prIdPlaceholders})`,
      prIds,
    );

    const serviceCosts = await tradeBusinessDbc.executeQuery(
      `SELECT 
        psvd.id AS purchase_service_detail_id,
        psvd.purchase_request_id,
        psvd.created_at,
        psvd.sales_service_detail_id,
        psvd.price,
        mc.code AS currency_code,
        s.name AS supplier_name,
        ms.service_name AS item_label
      FROM purchase_service_details psvd
      LEFT JOIN purchase_requests pr ON pr.id = psvd.purchase_request_id
      LEFT JOIN suppliers s ON s.id = COALESCE(psvd.supplier_id, pr.supplier_id)
      LEFT JOIN master_currencies mc ON mc.id = psvd.currency_id
      LEFT JOIN master_services ms ON ms.id = psvd.service_id
      WHERE psvd.purchase_request_id IN (${prIdPlaceholders})`,
      prIds,
    );

    res.status(200).json({
      status: 'success',
      sales_quotation_id,
      shipping_costs: shippingCosts,
      product_costs: productCosts,
      service_costs: serviceCosts,
    });
  },
);
