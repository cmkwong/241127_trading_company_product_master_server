import { TABLE_MASTER } from '../../../tables.js';
import { v4 as uuidv4 } from 'uuid';
import fs from 'node:fs/promises';
import path from 'node:path';
import DataModelUtils from '../../../../../utils/dataModelUtils.js';
import AppError from '../../../../../utils/appError.js';
import {
  getConfiguredPublicRoot,
  resolveStoredFilePathForRead,
} from '../../../../../utils/fileUpload.js';
import { tradeBusinessDbc } from '../../../dbModel.js';
import {
  uploadImageToCloudinary,
  deleteCloudinaryAsset,
} from '../../AI/cloudinary_uploader.js';
import {
  editImageWithNanoBanana,
  downloadImageBuffer,
} from '../../AI/banana_image2image.js';

// Create a data model utility for product categories with multiple joins
export const productImagesModel = new DataModelUtils({
  dbc: tradeBusinessDbc,
  tableName: TABLE_MASTER['PRODUCT_IMAGES'].name,
  tableFields: TABLE_MASTER['PRODUCT_IMAGES'].fields,
  entityName: 'product images',
  entityIdField: 'id',
  requiredFields: ['product_id', 'image_url', 'image_type_id'],
  validations: {
    image_type_id: { required: true },
  },
  defaults: {
    id: uuidv4,
  },
  fileConfig: {
    fileUrlField: 'image_url',
    uploadDir: 'public/products/{id}/images/',
    imagesOnly: true,
  },
});

// ============================================================
// 🤖 AI IMAGE EDITING (NanoBanana) — BACKGROUND JOB ORCHESTRATION
// ============================================================
//
// The NanoBanana editing API is asynchronous, so these helpers run the
// multi-step pipeline (upload → edit → save → update DB) in the background and
// expose an in-memory job store that the controller can query for status.
//
// NOTE: jobs live in memory only. A server restart loses in-flight job status
// (any DB updates already applied remain). Jobs are auto-pruned after a TTL.

const aiJobStore = new Map();

// Keep a job's status queryable for 30 minutes after it finishes.
const AI_JOB_TTL_MS = 30 * 60 * 1000;

const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);

const isHttpUrl = (value) => /^https?:\/\//i.test(String(value || ''));

const readImageSourceBuffer = async (imageUrl) => {
  if (isHttpUrl(imageUrl)) {
    return downloadImageBuffer(imageUrl);
  }

  const filePath = resolveStoredFilePathForRead(imageUrl);
  if (!filePath) {
    throw new Error(`Cannot resolve stored path for image_url: ${imageUrl}`);
  }

  return fs.readFile(filePath);
};

// Suffix appended to a row's id to name its pristine source backup, e.g.
// `{imageId}.source.jpg`. The AI pipeline always edits this backup (never the
// previous AI output) so re-runs stay repeatable and the original is never lost.
const SOURCE_SUFFIX = '.source';

const extensionFromName = (name = '') => {
  const ext = path.extname(String(name || '')).toLowerCase();
  return IMAGE_EXTENSIONS.has(ext) ? ext : '.jpg';
};

/** Reads width/height/format without throwing (returns null on failure). */
const readImageMetadata = async (buffer) => {
  try {
    const sharp = (await import('sharp')).default;
    const metadata = await sharp(buffer).metadata();
    return {
      width: metadata.width || null,
      height: metadata.height || null,
      format: metadata.format || null,
    };
  } catch {
    return null;
  }
};

/** Returns the absolute path to an existing pristine source backup, or null. */
const findPristineSourcePath = async (outputDir, imageId) => {
  let entries = [];
  try {
    entries = await fs.readdir(outputDir);
  } catch {
    return null;
  }

  const prefix = `${imageId}${SOURCE_SUFFIX}`;
  const match = entries.find((name) => name.startsWith(prefix));
  return match ? path.join(outputDir, match) : null;
};

/**
 * Resolves the buffer that should be sent to the AI.
 *
 * If a pristine source backup already exists it is used verbatim; otherwise the
 * current stored file is read and (when `keepSource` is true) backed up first so
 * the original survives the in-place overwrite of `image_name` / `image_url`.
 *
 * @returns {Promise<{ buffer: Buffer, created: boolean }>}
 */
const getSourceBuffer = async (row, outputDir, keepSource) => {
  const existing = keepSource
    ? await findPristineSourcePath(outputDir, row.id)
    : null;

  if (existing) {
    return { buffer: await fs.readFile(existing), created: false };
  }

  const buffer = await readImageSourceBuffer(row.image_url);

  if (keepSource) {
    await fs.mkdir(outputDir, { recursive: true });
    const ext = extensionFromName(row.image_name || row.image_url);
    const pristinePath = path.join(
      outputDir,
      `${row.id}${SOURCE_SUFFIX}${ext}`,
    );
    await fs.writeFile(pristinePath, buffer);
    return { buffer, created: true };
  }

  return { buffer, created: false };
};

/**
 * Resolves the on-disk path of the file the product_images row already points
 * at. The AI result is written back to this exact path (same name, same folder)
 * so the row's `image_url` keeps resolving without any DB update.
 */
const resolveAiOutputPath = (row) => {
  if (!isHttpUrl(row.image_url)) {
    const resolved = resolveStoredFilePathForRead(row.image_url);
    if (resolved) {
      return resolved;
    }
  }

  // Fallback for remote / unresolvable sources: the standard images folder
  // with a name derived from the row's image_name (which is the row id here).
  return path.join(
    getConfiguredPublicRoot(),
    'products',
    row.product_id,
    'images',
    `${row.id}${extensionFromName(row.image_name || row.image_url)}`,
  );
};

/**
 * Re-encodes the edited image to JPEG and (optionally) restores the original
 * pixel dimensions so the AI output stays consistent with the source.
 */
const normalizeEditedImage = async (buffer, originalDimensions) => {
  let sharp;
  try {
    sharp = (await import('sharp')).default;
  } catch {
    return buffer;
  }

  let pipeline = sharp(buffer).rotate();

  if (originalDimensions?.width && originalDimensions?.height) {
    pipeline = pipeline.resize(
      originalDimensions.width,
      originalDimensions.height,
      { fit: 'fill', withoutEnlargement: false },
    );
  }

  return pipeline.jpeg({ quality: 95, chromaSubsampling: '4:4:4' }).toBuffer();
};

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

/**
 * Runs the full pipeline for a single product_images row:
 *   a. upload the source image to Cloudinary (temporary)
 *   b. edit it with NanoBanana according to the prompt
 *   c. save the result back over the source file (same name) — no DB update
 */
const processSingleImage = async (row, prompt, options = {}) => {
  const {
    folder = 'temporary-nanobanana-inputs',
    keepTemporaryUpload = false,
    numImages = 1,
    imageSize,
    pollOptions,
    resizeToOriginal = false,
    keepSource = true,
  } = options;

  const result = {
    id: row.id,
    product_id: row.product_id,
    status: 'processing',
    image_url: null,
    taskId: null,
    error: null,
  };

  let tempPublicId = null;

  try {
    const targetPath = resolveAiOutputPath(row);
    const outputDir = path.dirname(targetPath);

    // Resolve the image to send: a pristine backup when it exists (so re-runs
    // stay repeatable), otherwise the current stored file (backed up first).
    const source = await getSourceBuffer(row, outputDir, keepSource);
    const sourceMeta = await readImageMetadata(source.buffer);

    // a. Upload to Cloudinary so NanoBanana can access it via a public URL.
    result.status = 'uploading';
    const upload = await uploadImageToCloudinary(source.buffer, { folder });
    tempPublicId = upload.publicId;

    // b. Edit with NanoBanana.
    result.status = 'editing';
    const edited = await editImageWithNanoBanana({
      imageUrls: [upload.secureUrl],
      prompt,
      numImages,
      imageSize,
      pollOptions,
    });
    result.taskId = edited.taskId;

    // c. Save the AI result verbatim (no resize / re-encode by default).
    result.status = 'saving';
    let outputBuffer = edited.buffer;

    if (resizeToOriginal) {
      outputBuffer = await normalizeEditedImage(
        outputBuffer,
        sourceMeta ? { width: sourceMeta.width, height: sourceMeta.height } : null,
      );
    }

    const outputMeta = await readImageMetadata(outputBuffer);
    const outputFileName = path.basename(targetPath);

    await fs.mkdir(outputDir, { recursive: true });
    await fs.writeFile(targetPath, outputBuffer);

    // No DB update: the file is overwritten under its original name, so the
    // row's `image_name` / `image_url` keep resolving unchanged.
    result.image_url = row.image_url || null;
    result.diagnostics = {
      source: {
        width: sourceMeta?.width ?? null,
        height: sourceMeta?.height ?? null,
        format: sourceMeta?.format ?? null,
        pristineCopied: source.created,
      },
      output: {
        width: outputMeta?.width ?? null,
        height: outputMeta?.height ?? null,
        format: outputMeta?.format ?? null,
        bytes: outputBuffer.length,
        fileName: outputFileName,
      },
    };
    result.status = 'completed';
  } catch (error) {
    result.status = 'failed';
    result.error = error.message;
  } finally {
    if (tempPublicId && !keepTemporaryUpload) {
      try {
        await deleteCloudinaryAsset(tempPublicId);
      } catch {
        // Cleanup is best-effort only.
      }
    }
  }

  return result;
};

/**
 * Starts a background AI image-editing job and returns its job descriptor.
 *
 * @param {Object} input
 * @param {string[]|string} [input.ids] - Explicit product_images id(s).
 * @param {string} [input.productId] - Alternative filter (with imageTypeId).
 * @param {string} [input.imageTypeId] - Alternative filter (with productId).
 * @param {string} [input.imageRow] - Optional row filter.
 * @param {string} input.prompt - The NanoBanana edit prompt.
 * @param {Object} [input.options] - Pipeline options (folder, pollOptions, ...).
 * @returns {Promise<Object>} `{ id, status, total, results, ... }`.
 */
export const startAiImageEditJob = async (input = {}) => {
  const { prompt, options = {}, ...criteria } = input;

  if (!prompt) {
    throw new AppError('prompt is required', 400);
  }

  const rows = await resolveImageRows(criteria);

  if (!rows.length) {
    throw new AppError('No product images matched the provided criteria', 404);
  }

  const job = {
    id: uuidv4(),
    status: 'queued',
    total: rows.length,
    processed: 0,
    results: rows.map((row) => ({
      id: row.id,
      product_id: row.product_id,
      image_name: row.image_name,
      status: 'pending',
      image_url: null,
      taskId: null,
      error: null,
    })),
    createdAt: new Date().toISOString(),
    startedAt: null,
    finishedAt: null,
    error: null,
  };

  aiJobStore.set(job.id, job);

  // Run in the background without blocking the response.
  setImmediate(() => {
    runAiImageEditJob(job.id, rows, prompt, options).catch((error) => {
      const current = aiJobStore.get(job.id);
      if (current) {
        current.status = 'failed';
        current.error = error.message;
        current.finishedAt = new Date().toISOString();
      }
    });
  });

  return job;
};

const runAiImageEditJob = async (jobId, rows, prompt, options) => {
  const job = aiJobStore.get(jobId);
  if (!job) return;

  job.status = 'processing';
  job.startedAt = new Date().toISOString();

  for (const row of rows) {
    const entry = job.results.find((r) => r.id === row.id);

    try {
      const outcome = await processSingleImage(row, prompt, options);
      if (entry) Object.assign(entry, outcome);
    } catch (error) {
      if (entry) {
        entry.status = 'failed';
        entry.error = error.message;
      }
    }

    job.processed += 1;
  }

  const failed = job.results.filter((r) => r.status === 'failed').length;
  job.status =
    failed === job.total
      ? 'failed'
      : failed > 0
        ? 'completed-with-errors'
        : 'completed';
  job.finishedAt = new Date().toISOString();

  setTimeout(() => {
    aiJobStore.delete(jobId);
  }, AI_JOB_TTL_MS);
};

/**
 * Returns the current state of an AI image-editing job, or null if unknown.
 * @param {string} jobId - The job id.
 * @returns {Object|null}
 */
export const getAiImageEditJob = (jobId) => aiJobStore.get(jobId) || null;

/**
 * Lists recent AI image-editing jobs (most recent first).
 * @param {number} [limit=50]
 * @returns {Object[]}
 */
export const listAiImageEditJobs = (limit = 50) =>
  [...aiJobStore.values()]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, limit);
