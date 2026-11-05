import AppError from '../../../../utils/appError.js';
import { productImagesModel } from '../../../models/trade_business/panel/products/data_product_images.js';
import { createImageAiJobService } from './utils.js';

// ============================================================
// 🤖 AI IMAGE EDITING (NanoBanana) — PRODUCT IMAGES MODULE
// ============================================================
//
// Thin product_images-specific glue around the shared AI pipeline in
// `./utils.js`. Everything reusable (copy-on-write file save, Cloudinary
// staging, NanoBanana edit, in-memory job store) lives in that util; this
// module only teaches it which table/columns to operate on and how to resolve
// rows.

/**
 * Resolves which product_images rows to process.
 * Supports either an explicit list of ids, or product_id + image_type_id
 * (with optional image_row), matching the existing images/download endpoint.
 */
const resolveImageRows = async (input = {}) => {
  const { ids = [], productId, imageTypeId, imageRow } = input;

  if (Array.isArray(ids) && ids.length > 0) {
    const placeholders = ids.map(() => '?').join(', ');
    return productImagesModel.executeQuery(
      `SELECT * FROM ${productImagesModel.tableName} WHERE id IN (${placeholders})`,
      ids,
    );
  }

  if (productId && imageTypeId) {
    const conditions = ['product_id = ?', 'image_type_id = ?'];
    const params = [productId, imageTypeId];

    if (imageRow) {
      conditions.push('image_row = ?');
      params.push(imageRow);
    }

    return productImagesModel.executeQuery(
      `SELECT * FROM ${productImagesModel.tableName} WHERE ${conditions.join(
        ' AND ',
      )} ORDER BY display_order ASC, created_at ASC`,
      params,
    );
  }

  throw new AppError(
    'Provide either "ids" or "product_id" + "image_type_id"',
    400,
  );
};

const aiImageEditService = createImageAiJobService({
  model: productImagesModel,
  imageUrlField: 'image_url',
  nameField: 'image_name',
  idField: 'id',
  resolveRows: resolveImageRows,
  uploadDirResolver: (row) => productImagesModel.getUploadDir(row.product_id),
  rowIdentityFields: ['product_id', 'image_name'],
});

export const startAiImageEditJob = aiImageEditService.startJob;
export const getAiImageEditJob = aiImageEditService.getJob;
export const listAiImageEditJobs = aiImageEditService.listJobs;
