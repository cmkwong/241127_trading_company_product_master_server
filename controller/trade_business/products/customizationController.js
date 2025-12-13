import * as customizationModel from '../../../models/trade_business/products/data_product_customizations.js';
import catchAsync from '../../../utils/catchAsync.js';

export const createCustomization = catchAsync(async (req, res, next) => {
  const { data } = res.body;

  const result = await customizationModel.createCustomization(data);

  res.status(200).json({
    status: 'success',
    result,
  });
});

export const getCustomizations = catchAsync(async (req, res, next) => {
  const { includeBase64, compress } = req.query;
  const { id, productId, includeImages } = req.params;

  let customizations;
  if (productId) {
    customizations = await customizationModel.getCustomizationsByProductId(
      productId,
      includeImages === '1' ? true : false,
      {
        includeBase64: includeBase64 === '1' ? true : false,
        compress: compress === '1' ? true : false,
      }
    );
  } else {
    customizations = await customizationModel.getCustomizationById(
      id,
      includeImages === '1' ? true : false,
      {
        includeBase64: includeBase64 === '1' ? true : false,
        compress: compress === '1' ? true : false,
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
