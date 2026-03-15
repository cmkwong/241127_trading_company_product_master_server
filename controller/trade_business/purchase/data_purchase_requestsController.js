import catchAsync from '../../../utils/catchAsync.js';
import { defaultPurchaseRequests } from '../../../datas/purchase.js';
import { purchaseRequestModel } from '../../../models/trade_business/purchase/data_purchase_requests.js';

export const createPurchaseRequest = catchAsync(async (req, res, next) => {
  const structuredData =
    await purchaseRequestModel.processStructureDataOperation(
      req.body.data,
      'create',
    );
  res.status(201).json({ status: 'success', structuredData });
});

export const importDefaultPurchaseRequests = catchAsync(
  async (req, res, next) => {
    const structuredData =
      await purchaseRequestModel.processStructureDataOperation(
        defaultPurchaseRequests,
        'create',
      );
    res.status(200).json({ status: 'success', structuredData });
  },
);

export const getAllPurchaseRequests = catchAsync(async (req, res, next) => {
  const ids = await purchaseRequestModel.executeQuery(
    'SELECT id FROM purchase_requests;',
  );
  const structuredData =
    await purchaseRequestModel.processStructureDataOperation(
      { purchase_requests: ids },
      'read',
    );
  res.status(200).json({ status: 'success', structuredData });
});

export const getPurchaseRequestById = catchAsync(async (req, res, next) => {
  const structuredData =
    await purchaseRequestModel.processStructureDataOperation(
      req.body.data,
      'read',
    );
  res.status(200).json({ status: 'success', structuredData });
});

export const updatePurchaseRequest = catchAsync(async (req, res, next) => {
  const structuredData =
    await purchaseRequestModel.processStructureDataOperation(
      req.body.data,
      'update',
    );
  res.status(200).json({ status: 'success', structuredData });
});

export const deletePurchaseRequest = catchAsync(async (req, res, next) => {
  const structuredData =
    await purchaseRequestModel.processStructureDataOperation(
      req.body.data,
      'delete',
    );
  res.status(200).json({ status: 'success', structuredData });
});

export const truncatePurchaseTables = catchAsync(async (req, res, next) => {
  const ids = await purchaseRequestModel.executeQuery(
    'SELECT id FROM purchase_requests;',
  );
  await purchaseRequestModel.processStructureDataOperation(
    { purchase_requests: ids },
    'delete',
  );
  res.status(200).json({ status: 'success' });
});
