import * as CustomizationModel from '../../../models/trade_business/products/data_product_customizations.js';
import catchAsync from '../../../utils/catchAsync.js';
import { parseStringToBoolean } from '../../../utils/http.js';

export const createCustomization = catchAsync(async (req, res, next) => {
  const { data } = req.body;

  const refactorData =
    await CustomizationModel.customizationModel.refactoringData(data, 'create');
  console.log('\nrefactorData: \n', JSON.stringify(refactorData));

  const result = await CustomizationModel.createCustomization(data);

  res.status(200).json({
    status: 'success',
    result,
  });
});

export const getCustomizations = catchAsync(async (req, res, next) => {
  const { includeImages, includeBase64, compress } = req.query;
  const { id, productId } = req.params;

  const template = CustomizationModel.customizationModel._gettingSchemaConfig(
    {}
  );
  console.log('template--: ', JSON.stringify(template));

  let customizations;
  if (productId) {
    customizations = await CustomizationModel.getCustomizationsByProductId(
      productId,
      parseStringToBoolean(includeImages),
      {
        includeBase64: parseStringToBoolean(includeBase64),
        compress: parseStringToBoolean(compress),
      }
    );
  } else {
    customizations = await CustomizationModel.getCustomizationById(
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

  const customizations = await CustomizationModel.updateCustomization(id, data);
  res.status(200).json({
    status: 'success',
    data: {
      customizations,
    },
  });
});

export const deleteCustomization = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const result = await CustomizationModel.deleteCustomization(id);
  res.status(200).json({
    status: 'success',
    result,
  });
});

export const upsertCustomizations = catchAsync(async (req, res, next) => {
  const { productId } = req.params;
  const { data } = req.body;
  const result = await CustomizationModel.upsertCustomizations(productId, data);
  res.status(200).json({
    status: 'success',
    result,
  });
});
