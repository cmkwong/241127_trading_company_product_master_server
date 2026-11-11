import catchAsync from '../../../../../utils/catchAsync.js';
import { companyModel } from '../../../../models/trade_business/panel/companys/data_companys.js';
import { toBool } from '../../../../../utils/booleanFn.js';
import { getSafeSelectedFieldsForTable } from '../../../../../utils/readFieldSelection.js';

/**
 * Create a new company (and its addresses)
 * @route POST /api/trade_business/panel/companys/data
 */
export const createCompany = catchAsync(async (req, res, next) => {
  const structuredData = await companyModel.processStructureDataOperation(
    req.body.data,
    'create',
  );

  res.status(201).json({
    status: 'success',
    structuredData,
  });
});

/**
 * Import default company data (Rivolx Limited)
 * @route POST /api/trade_business/panel/companys/data/defaults
 */
export const importDefaultCompanys = catchAsync(async (req, res, next) => {
  const structuredData = await companyModel.processStructureDataOperation(
    [], // Default empty array
    'create',
  );

  res.status(200).json({
    status: 'success',
    structuredData,
  });
});

/**
 * Get all companys
 * @route POST /api/trade_business/panel/companys/data/list
 */
export const getAllCompanys = catchAsync(async (req, res, next) => {
  const source = {
    ...(req.query || {}),
    ...(req.body || {}),
  };

  const { includeBase64, iconOnly, compress, fields } = source;

  const selectedCompanyFields = getSafeSelectedFieldsForTable(
    fields,
    'companys',
    {
      ensureField: 'id',
    },
  );

  const companyRows =
    selectedCompanyFields && !toBool(includeBase64)
      ? await companyModel.executeQuery(
          `SELECT ${selectedCompanyFields.join(', ')} FROM companys;`,
        )
      : await companyModel.executeQuery('SELECT id FROM companys;');

  const data = { companys: companyRows };
  const structuredData = await companyModel.processStructureDataOperation(
    data,
    'read',
    {
      includeBase64: toBool(includeBase64),
      base64OnlyTable: toBool(iconOnly) ? ['companys'] : null,
      compress: toBool(compress),
      fields,
    },
  );

  res.status(200).json({
    status: 'success',
    structuredData,
  });
});

/**
 * Get first-level company comparison keys for front-end
 * @route GET /api/trade_business/panel/companys/data/comparison-keys
 */
export const getCompanyComparisonKeys = catchAsync(async (req, res, next) => {
  const comparisonKeyData = companyModel.getFirstLevelFieldNames();

  res.status(200).json({
    status: 'success',
    data: comparisonKeyData,
  });
});

/**
 * Get a company by ID
 * @route POST /api/trade_business/panel/companys/data/get/ids
 */
export const getCompanyById = catchAsync(async (req, res, next) => {
  const source = req.body || {};

  const { includeBase64, iconOnly, compress, fields, data } = source;

  const structuredData = await companyModel.processStructureDataOperation(
    data,
    'read',
    {
      includeBase64: toBool(includeBase64),
      base64OnlyTable: toBool(iconOnly) ? ['companys'] : null,
      compress: toBool(compress),
      fields,
    },
  );

  res.status(200).json({
    status: 'success',
    structuredData,
  });
});

/**
 * Update a company
 * @route PATCH /api/trade_business/panel/companys/data/ids
 */
export const updateCompany = catchAsync(async (req, res, next) => {
  const structuredData = await companyModel.processStructureDataOperation(
    req.body.data,
    'update',
  );

  res.status(200).json({
    status: 'success',
    structuredData,
  });
});

/**
 * Delete a company
 * @route DELETE /api/trade_business/panel/companys/data/ids
 */
export const deleteCompany = catchAsync(async (req, res, next) => {
  const structuredData = await companyModel.processStructureDataOperation(
    req.body.data,
    'delete',
  );

  res.status(200).json({
    status: 'success',
    structuredData,
  });
});

/**
 * Truncate all company-related data
 * @route POST /api/trade_business/panel/companys/data/truncate
 */
export const truncateCompanyTables = catchAsync(async (req, res, next) => {
  const sql = `SELECT id FROM companys;`;
  const ids = await companyModel.dbc.executeQuery(sql);
  await companyModel.processStructureDataOperation({ companys: ids }, 'delete');

  res.status(200).json({
    status: 'success',
  });
});
