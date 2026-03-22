import 'dotenv/config';
import { defaultProducts } from '../datas/products.js';
import { imported_products } from '../datas/_products.js';

export const shouldUseImportedProductsData = () =>
  String(process.env.USE_IMPORTED_PRODUCTS_DATA || 'false').toLowerCase() ===
  'true';

export const getProductsSeedData = () =>
  shouldUseImportedProductsData() ? imported_products : defaultProducts;
