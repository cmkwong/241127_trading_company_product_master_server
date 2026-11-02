import * as Products from '../../../../models/trade_business/panel/products/data_products.js';
import AppError from '../../../../../utils/appError.js';
import catchAsync from '../../../../../utils/catchAsync.js';
import { toBool } from '../../../../../utils/booleanFn.js';
import { getSafeSelectedFieldsForTable } from '../../../../../utils/readFieldSelection.js';
import { getProductsSeedData } from '../../../../../utils/productsSource.js';
import { productModel } from '../../../../models/trade_business/panel/products/data_products.js';
import { currencyModel } from '../../../../models/trade_business/panel/master/master_currenciesModel.js';
import { exchangeRateHkdModel } from '../../../../models/trade_business/panel/master/master_exchangeRateHkdModel.js';
import { masterProductAttributesModel } from '../../../../models/trade_business/panel/master/master_product_attributes_model.js';
import {
  startAiImageEditJob,
  getAiImageEditJob,
} from '../../../../models/trade_business/AI/product_images.js';
import { productImagesModel } from '../../../../models/trade_business/panel/products/data_product_images.js';
import { productImagesTypeModel } from '../../../../models/trade_business/panel/master/master_productImagesTypeModel.js';

const ICON_COMPRESSION_DEFAULTS = {
  maxWidth: 220,
  maxHeight: 220,
  quality: 0.45,
};

const toPositiveInt = (value, fallback) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }

  return Math.floor(parsed);
};

const toQuality = (value, fallback) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return Math.min(1, Math.max(0.1, parsed));
};

const buildReadOptions = (source = {}) => {
  const {
    includeBase64,
    iconOnly,
    compress,
    fields,
    iconCompress,
    iconMaxWidth,
    iconMaxHeight,
    iconQuality,
  } = source;

  const normalizedIconOnly = toBool(iconOnly);
  const normalizedCompress = toBool(compress);
  const normalizedIncludeBase64 = toBool(includeBase64);
  const iconCompressionEnabled =
    normalizedIconOnly &&
    normalizedCompress &&
    (iconCompress === undefined ? true : toBool(iconCompress));

  const readOptions = {
    includeBase64: normalizedIncludeBase64,
    base64OnlyTable: normalizedIconOnly ? ['products'] : null,
    compress: normalizedCompress,
    fields,
  };

  if (iconCompressionEnabled) {
    readOptions.maxWidth = toPositiveInt(
      iconMaxWidth,
      ICON_COMPRESSION_DEFAULTS.maxWidth,
    );
    readOptions.maxHeight = toPositiveInt(
      iconMaxHeight,
      ICON_COMPRESSION_DEFAULTS.maxHeight,
    );
    readOptions.quality = toQuality(
      iconQuality,
      ICON_COMPRESSION_DEFAULTS.quality,
    );
  }

  return readOptions;
};

const parseCatalogIds = (idsInput) => {
  const parts = Array.isArray(idsInput)
    ? idsInput
    : String(idsInput || '').split(',');

  return [
    ...new Set(parts.map((id) => String(id || '').trim()).filter(Boolean)),
  ];
};

const CATALOG_EXCHANGE_RATE_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** Local (server) today formatted as YYYY-MM-DD. */
const getTodayDateString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/** Trim + uppercase a requested base currency, defaulting to 'USD'. */
const normalizeCatalogBaseCurrency = (value) => {
  const normalized = String(value || '').trim().toUpperCase();
  return normalized || 'USD';
};

/**
 * Image type whose images populate the catalog thumbnail strip.
 * Matched by normalized name so a master-data rename still resolves.
 */
const CATALOG_IMAGE_TYPE_NAME = 'Edited - catalog';

/** Resolve the catalog thumbnail image type ids (and the matched type). */
const resolveCatalogImageType = (rows = []) => {
  const target = CATALOG_IMAGE_TYPE_NAME.trim().toLowerCase();
  const list = Array.isArray(rows) ? rows : [];

  const matched = list.find(
    (row) => String(row?.name || '').trim().toLowerCase() === target,
  );

  if (!matched) {
    return { ids: new Set(), type: null };
  }

  const ids = new Set();
  list.forEach((row) => {
    const name = String(row?.name || '').trim().toLowerCase();
    if (name === target && row?.id) {
      ids.add(String(row.id));
    }
  });

  return {
    ids,
    type: { id: String(matched.id), name: String(matched.name) },
  };
};

const sortValueOrMax = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : Number.MAX_SAFE_INTEGER;
};

/**
 * Reduce each product's `product_images` to the catalog thumbnail type only,
 * ordered by `image_row` then `display_order`. Operates on copies so pricing,
 * `icon_url` and deletion flags on the source records are left untouched.
 */
const selectCatalogImages = (products = [], catalogTypeIds) => {
  const ids = catalogTypeIds instanceof Set ? catalogTypeIds : new Set();

  return (Array.isArray(products) ? products : []).map((product) => {
    if (!product || typeof product !== 'object') {
      return product;
    }

    const images = Array.isArray(product.product_images)
      ? product.product_images
      : [];

    const selected = images
      .filter((img) => !img?._delete)
      .filter((img) => ids.has(String(img?.image_type_id || '').trim()))
      .sort((a, b) => {
        const rowDiff = sortValueOrMax(a?.image_row) - sortValueOrMax(b?.image_row);
        if (rowDiff !== 0) {
          return rowDiff;
        }
        return (
          sortValueOrMax(a?.display_order) - sortValueOrMax(b?.display_order)
        );
      });

    return { ...product, product_images: selected };
  });
};

/** Currency columns (besides HKD) present on a master_exchange_rate_hkd row. */
const buildExchangeRateMap = (row = {}) => {
  const map = { HKD: 1 };
  if (!row || typeof row !== 'object') {
    return map;
  }

  Object.entries(row).forEach(([key, value]) => {
    if (key === 'id' || key === 'Date' || /_at$/.test(key)) {
      return;
    }
    const code = String(key || '').trim().toUpperCase();
    const rate = Number(value);
    if (!code || !Number.isFinite(rate) || rate <= 0) {
      return;
    }
    map[code] = rate;
  });

  return map;
};

/** Convert `amount` from `fromCode` to `toCode` using per-HKD rates. */
const convertCatalogAmount = (amount, fromCode, toCode, rateMap = {}) => {
  const value = Number(amount);
  if (!Number.isFinite(value)) {
    return null;
  }

  const sourceRate = Number(rateMap[String(fromCode || '').toUpperCase()]);
  const targetRate = Number(rateMap[String(toCode || '').toUpperCase()]);

  if (!Number.isFinite(sourceRate) || sourceRate <= 0) {
    return null;
  }
  if (!Number.isFinite(targetRate) || targetRate <= 0) {
    return null;
  }

  return (value / sourceRate) * targetRate;
};

const roundCatalogMoney = (value) => {
  const amount = Number(value);
  if (!Number.isFinite(amount)) {
    return value;
  }
  return Math.round((amount + Number.EPSILON) * 100) / 100;
};

/**
 * Convert every price the catalog prints into the requested base currency.
 * Rows whose source currency cannot be resolved keep their numeric value
 * (treated as already expressed in the base currency).
 */
const convertCatalogPrices = (
  products,
  currencyCodeById,
  rateMap,
  baseCurrency,
) => {
  if (!Array.isArray(products)) {
    return products;
  }

  return products.map((product) => {
    const result = { ...(product || {}) };

    if (Array.isArray(result.product_sale_prices_by_qty)) {
      result.product_sale_prices_by_qty = result.product_sale_prices_by_qty.map(
        (tier) => {
          if (!tier || tier._delete) {
            return tier;
          }
          const code = String(
            currencyCodeById[String(tier.currency_id || '')] || '',
          ).toUpperCase();
          const converted = convertCatalogAmount(
            tier.sale_price,
            code,
            baseCurrency,
            rateMap,
          );
          return converted === null
            ? tier
            : { ...tier, sale_price: roundCatalogMoney(converted) };
        },
      );
    }

    if (Array.isArray(result.product_costs)) {
      result.product_costs = result.product_costs.map((cost) => {
        if (!cost || cost._delete) {
          return cost;
        }
        const code = String(
          currencyCodeById[String(cost.sales_currency_id || '')] || '',
        ).toUpperCase();
        const converted = convertCatalogAmount(
          cost.sales_price,
          code,
          baseCurrency,
          rateMap,
        );
        return converted === null
          ? cost
          : { ...cost, sales_price: roundCatalogMoney(converted) };
      });
    }

    const singleCurrencyId = String(
      result.sale_single_price_currency_id || '',
    );
    const singleCode = String(
      currencyCodeById[singleCurrencyId] || '',
    ).toUpperCase();

    const convertedMin = convertCatalogAmount(
      result.sale_single_price_min,
      singleCode,
      baseCurrency,
      rateMap,
    );
    if (convertedMin !== null) {
      result.sale_single_price_min = roundCatalogMoney(convertedMin);
    }

    const convertedMax = convertCatalogAmount(
      result.sale_single_price_max,
      singleCode,
      baseCurrency,
      rateMap,
    );
    if (convertedMax !== null) {
      result.sale_single_price_max = roundCatalogMoney(convertedMax);
    }

    return result;
  });
};

/**
 * Create a new product
 * @route POST /api/products
 */
export const createProduct = catchAsync(async (req, res, next) => {
  const structuredData = await productModel.processStructureDataOperation(
    req.body.data,
    'create',
  );
  res.status(201).json({
    status: 'success',
  });
});

export const getAllProducts = catchAsync(async (req, res, next) => {
  const source = {
    ...(req.query || {}),
    ...(req.body || {}),
  };

  const { includeBase64, fields } = source;

  const selectedProductFields = getSafeSelectedFieldsForTable(
    fields,
    'products',
    {
      ensureField: 'id',
    },
  );

  const productRows =
    selectedProductFields && !toBool(includeBase64)
      ? await productModel.executeQuery(
          `SELECT ${selectedProductFields.join(', ')} FROM products;`,
        )
      : await productModel.executeQuery('SELECT id FROM products;');

  const data = { products: productRows };
  const structuredData = await productModel.processStructureDataOperation(
    data,
    'read',
    buildReadOptions(source),
  );
  res.status(200).json({
    status: 'success',
    structuredData,
  });
});

/**
 * Get first-level product comparison keys for front-end
 * @route GET /api/v1/trade_business/panel/products/data/comparison-keys
 */
export const getProductComparisonKeys = catchAsync(async (req, res, next) => {
  const comparisonKeyData = productModel.getFirstLevelFieldNames();

  res.status(200).json({
    status: 'success',
    data: comparisonKeyData,
  });
});

/**
 * Get a product by ID
 * @route GET /api/products/:id
 */
export const getProductById = catchAsync(async (req, res, next) => {
  const source = req.body || {};

  const { data } = source;

  const structuredData = await productModel.processStructureDataOperation(
    data,
    'read',
    buildReadOptions(source),
  );

  res.status(200).json({
    status: 'success',
    structuredData,
  });
});

/**
 * Get catalog payload bundle for selected product ids.
 * @route GET /api/v1/trade_business/panel/products/data/catalogData?ids=a,b,c
 */
export const getCatalogData = catchAsync(async (req, res, next) => {
  const ids = parseCatalogIds(req?.query?.ids);

  const dateInput = String(req?.query?.date || '').trim();
  const date = dateInput || getTodayDateString();
  if (!CATALOG_EXCHANGE_RATE_DATE_PATTERN.test(date)) {
    return next(
      new AppError('Invalid date format. Expected YYYY-MM-DD', 400),
    );
  }

  const baseCurrency = normalizeCatalogBaseCurrency(req?.query?.baseCurrency);

  if (ids.length === 0) {
    res.status(200).json({
      status: 'success',
      date,
      baseCurrency,
      exchangeRate: null,
      catalogImageType: null,
      products: [],
      currencies: [],
      masterDataMap: {
        master_product_attributes: [],
      },
    });
    return;
  }

  const structuredData = await productModel.processStructureDataOperation(
    {
      products: ids.map((id) => ({ id })),
    },
    'read',
    buildReadOptions({
      includeBase64: true,
      compress: true,
    }),
  );

  const [
    currencies,
    masterProductAttributes,
    exchangeRateRows,
    productImageTypeRows,
  ] = await Promise.all([
    currencyModel.executeQuery(`SELECT * FROM ${currencyModel.tableName};`),
    masterProductAttributesModel.executeQuery(
      `SELECT * FROM ${masterProductAttributesModel.tableName};`,
    ),
    exchangeRateHkdModel.executeQuery(
      `SELECT * FROM ${exchangeRateHkdModel.tableName} WHERE \`Date\` <= ? ORDER BY \`Date\` DESC LIMIT 1`,
      [date],
    ),
    productImagesTypeModel.executeQuery(
      `SELECT id, name FROM ${productImagesTypeModel.tableName};`,
    ),
  ]);

  const { ids: catalogImageTypeIds, type: catalogImageType } =
    resolveCatalogImageType(productImageTypeRows);

  let exchangeRate =
    Array.isArray(exchangeRateRows) && exchangeRateRows.length > 0
      ? exchangeRateRows[0]
      : null;

  // Fall back to the latest available row when the requested date predates
  // every stored rate (mirrors `selectExchangeRateRow` on the frontend).
  if (!exchangeRate) {
    const latestRows = await exchangeRateHkdModel.executeQuery(
      `SELECT * FROM ${exchangeRateHkdModel.tableName} ORDER BY \`Date\` DESC LIMIT 1`,
    );
    exchangeRate =
      Array.isArray(latestRows) && latestRows.length > 0 ? latestRows[0] : null;
  }

  if (!exchangeRate) {
    return next(
      new AppError(`No exchange rate available on or before ${date}`, 400),
    );
  }

  const rateMap = buildExchangeRateMap(exchangeRate);

  if (!Object.prototype.hasOwnProperty.call(rateMap, baseCurrency)) {
    return next(
      new AppError(
        `Unsupported base currency: ${baseCurrency}. Supported: ${Object.keys(
          rateMap,
        ).join(', ')}`,
        400,
      ),
    );
  }

  const currencyCodeById = {};
  (Array.isArray(currencies) ? currencies : []).forEach((currency) => {
    const id = String(currency?.id || '').trim();
    const code = String(currency?.code || '').trim().toUpperCase();
    if (id && code) {
      currencyCodeById[id] = code;
    }
  });

  const products = Array.isArray(structuredData?.data?.products)
    ? structuredData.data.products
    : [];
  const convertedProducts = convertCatalogPrices(
    products,
    currencyCodeById,
    rateMap,
    baseCurrency,
  );

  // Narrow each product to its "Edited - catalog" thumbnails. When the type
  // cannot be resolved (master-data drift) leave images untouched so the
  // catalog never silently loses all its thumbnails.
  const catalogProducts = catalogImageType
    ? selectCatalogImages(convertedProducts, catalogImageTypeIds)
    : convertedProducts;

  res.status(200).json({
    status: 'success',
    date,
    baseCurrency,
    exchangeRate,
    catalogImageType,
    products: catalogProducts,
    currencies: Array.isArray(currencies) ? currencies : [],
    masterDataMap: {
      master_product_attributes: Array.isArray(masterProductAttributes)
        ? masterProductAttributes
        : [],
    },
  });
});

/**
 * Download product images by product_id and image_type_id
 * @route POST /api/products/data/images/download
 */
export const downloadProductImages = catchAsync(async (req, res, next) => {
  const source = {
    ...(req.query || {}),
    ...(req.body || {}),
  };

  const { product_id, image_type_id, id, compress } = source;

  if (!product_id || !image_type_id) {
    return next(new AppError('product_id and image_type_id are required', 400));
  }

  const imageRows = id
    ? await productModel.executeQuery(
        `SELECT id FROM ${productImagesModel.tableName} WHERE product_id = ? AND image_type_id = ? AND id = ? LIMIT 1`,
        [product_id, image_type_id, id],
      )
    : await productModel.executeQuery(
        `SELECT id FROM ${productImagesModel.tableName} WHERE product_id = ? AND image_type_id = ? ORDER BY created_at DESC`,
        [product_id, image_type_id],
      );

  const structuredData = await productImagesModel.processStructureDataOperation(
    { [productImagesModel.tableName]: imageRows },
    'read',
    {
      includeBase64: true,
      base64OnlyTable: [productImagesModel.tableName],
      compress: toBool(compress),
    },
  );

  res.status(200).json({
    status: 'success',
    count: imageRows.length,
    structuredData,
  });
});

/**
 * Update a product
 * @route PATCH /api/products/:id
 */
export const updateProduct = catchAsync(async (req, res, next) => {
  const structuredData = await productModel.processStructureDataOperation(
    req.body.data,
    'update',
  );

  res.status(200).json({
    status: 'success',
    structuredData,
  });
});

/**
 * Delete a product
 * @route DELETE /api/products/:id
 */
export const deleteProduct = catchAsync(async (req, res, next) => {
  const structuredData = await productModel.processStructureDataOperation(
    req.body.data,
    'delete',
  );

  res.status(200).json({
    status: 'success',
    structuredData,
  });
});

/**
 * Check if a product exists by ID
 * @route GET /api/products/exists/:id
 */
export const checkProductExists = catchAsync(async (req, res, next) => {
  const exists = await Products.productExists(req.params.id);

  res.status(200).json({
    status: 'success',
    exists,
  });
});

/**
 * Import sample products data
 * @route POST /api/products/samples
 */
export const importDefaultProducts = catchAsync(async (req, res, next) => {
  const structuredData = await productModel.processStructureDataOperation(
    getProductsSeedData(),
    'create',
  );

  res.status(200).json({
    status: 'success',
  });
});

/**
 * Truncate all product-related tables
 * @route POST /api/products/truncate
 */
export const truncateProductTables = catchAsync(async (req, res, next) => {
  // getting all of the product id
  const sql = `SELECT id FROM products;`;
  const ids = await productModel.dbc.executeQuery(sql);
  await productModel.processStructureDataOperation({ products: ids }, 'delete');

  // await productModel.truncateTable();

  // const result = await Products.truncateAllProductTables();

  res.status(200).json({
    status: 'success',
  });
});

/**
 * Start an AI (NanoBanana) image-editing job for product images.
 * @route POST /api/v1/trade_business/panel/products/data/images/ai-generate
 *
 * Accepts either explicit `ids` (or `id`) or `product_id` + `image_type_id`
 * (with optional `image_row`), plus a required `prompt`. Returns 202 with a
 * `jobId` immediately; the pipeline runs in the background and updates the
 * product_images records when done.
 */
export const handleGenerateProductImagesAi = catchAsync(
  async (req, res, next) => {
    const source = { ...(req.query || {}), ...(req.body || {}) };
    const { ids, id, product_id, image_type_id, image_row, prompt } = source;

    const normalizedIds = [
      ...new Set(
        (Array.isArray(ids) ? ids : ids ? [ids] : id ? [id] : [])
          .map((value) => String(value).trim())
          .filter(Boolean),
      ),
    ];

    if (!prompt) {
      return next(new AppError('prompt is required', 400));
    }

    const job = await startAiImageEditJob({
      ids: normalizedIds,
      productId: product_id,
      imageTypeId: image_type_id,
      imageRow: image_row,
      prompt,
      options: source.options || {},
    });

    res.status(202).json({
      status: 'success',
      jobId: job.id,
    });
  },
);

/**
 * Get the status of an AI image-editing job.
 * @route GET /api/v1/trade_business/panel/products/data/images/ai-generate/:jobId
 */
export const getGenerateProductImagesAiStatus = catchAsync(
  async (req, res, next) => {
    const job = getAiImageEditJob(req.params.jobId);

    if (!job) {
      return next(new AppError('AI image job not found', 404));
    }

    res.status(200).json({
      status: 'success',
      job,
    });
  },
);
