import * as productModel from '../../../models/trade_business/products/productModel.js';
import catchAsync from '../../../utils/catchAsync.js';

export const createProductTables = catchAsync(async (req, res, next) => {
  const result = await productModel.createAllProductTables();

  res.prints = {
    message: result.message,
  };

  next();
});

export const dropProductTables = catchAsync(async (req, res, next) => {
  const result = await productModel.dropAllProductTables();

  res.prints = {
    message: result.message,
  };

  next();
});

export const getProductSchema = catchAsync(async (req, res, next) => {
  const schema = await productModel.getProductTablesSchema();

  res.prints = {
    schema,
  };

  next();
});
