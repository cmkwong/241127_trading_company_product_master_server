import * as customizationModel from '../../../models/trade_business/products/data_product_customizations.js';
import catchAsync from '../../../utils/catchAsync.js';
import { parseStringToBoolean } from '../../../utils/http.js';

export const createCustomization = catchAsync(async (req, res, next) => {
  const { data } = req.body;

  const result = await customizationModel.createCustomization(data);

  res.status(200).json({
    status: 'success',
    result,
  });
});

export const getCustomizations = catchAsync(async (req, res, next) => {
  const { includeImages, includeBase64, compress } = req.query;
  const { id, productId } = req.params;

  let customizations;
  if (productId) {
    customizations = await customizationModel.getCustomizationsByProductId(
      productId,
      parseStringToBoolean(includeImages),
      {
        includeBase64: parseStringToBoolean(includeBase64),
        compress: parseStringToBoolean(compress),
      }
    );
  } else {
    customizations = await customizationModel.getCustomizationById(
      id,
      parseStringToBoolean(includeImages),
      {
        includeBase64: parseStringToBoolean(includeBase64),
        compress: parseStringToBoolean(compress),
      }
    );
  }
  res.status(200).json({
    status: 'success',
    data: {
      customizations,
    },
  });
});

export const updateCustomization = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { data } = req.body;

  const customizations = await customizationModel.updateCustomization(id, data);
  res.status(200).json({
    status: 'success',
    data: {
      customizations,
    },
  });
});

export const deleteCustomization = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const result = await customizationModel.deleteCustomization(id);
  res.status(200).json({
    status: 'success',
    result,
  });
});

export const upsertCustomizations = catchAsync(async (req, res, next) => {
  const { productId } = req.params;
  const { data } = req.body;
  const result = await customizationModel.upsertCustomizations(productId, data);
  res.status(200).json({
    status: 'success',
    result,
  });
});
