import 'dotenv/config';

export const shouldUseImportedProductsData = () =>
  String(process.env.USE_IMPORTED_PRODUCTS_DATA || 'false').toLowerCase() ===
  'true';

export const getProductsSeedData = () =>
  shouldUseImportedProductsData() ? [] : [];
