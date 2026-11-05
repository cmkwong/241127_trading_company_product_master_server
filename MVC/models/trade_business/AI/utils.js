import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { v4 as uuidv4 } from 'uuid';
import {
  getConfiguredPublicRoot,
  resolveStoredFilePathForRead,
} from '../../../../utils/fileUpload.js';
import {
  uploadImageToCloudinary,
  deleteCloudinaryAsset,
} from './cloudinary_uploader.js';
import {
  editImageWithNanoBanana,
  downloadImageBuffer,
} from './banana_image2image.js';
import AppError from '../../../../utils/appError.js';
import logger from '../../../../utils/logger.js';

// ============================================================
// 🤖 AI IMAGE EDITING (NanoBanana) — SHARED PIPELINE
// ============================================================
//
// Reusable primitives + orchestration for AI image editing. Any module that
// holds image rows (product_images, edited files, ...) can drive this pipeline
// by supplying a DataModelUtils-style `model` (with `tableName`, `executeQuery`
// and `getUploadDir`) plus a few field/row-resolver knobs.
//
// Every edit is copy-on-write: the source file is never modified in place, the
// result is written to a brand-new uuid-named file in the row's own images
// folder, and the row's image URL column is repointed at it. A byte-identical
// output is skipped (no new file, no DB write).
//
// NOTE: jobs live in memory only. A server restart loses in-flight job status
// (any DB updates already applied remain). Jobs are auto-pruned after a TTL.

// Keep a job's status queryable for 30 minutes after it finishes.
const DEFAULT_JOB_TTL_MS = 30 * 60 * 1000;

export const IMAGE_EXTENSIONS = new Set([
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.gif',
]);

export const isHttpUrl = (value) => /^https?:\/\//i.test(String(value || ''));

export const sha256 = (buffer) =>
  crypto.createHash('sha256').update(buffer).digest('hex');

export const extensionFromName = (name = '') => {
  const ext = path.extname(String(name || '')).toLowerCase();
  return IMAGE_EXTENSIONS.has(ext) ? ext : '.jpg';
};

// Map the image format reported by sharp (or other readers) to a file extension.
export const EXTENSION_BY_FORMAT = {
  jpeg: '.jpg',
  jpg: '.jpg',
  png: '.png',
  webp: '.webp',
  gif: '.gif',
};

export const extensionForFormat = (format, fallbackName = '') => {
  const key = String(format || '').toLowerCase();
  return EXTENSION_BY_FORMAT[key] || extensionFromName(fallbackName);
};

/** Reads width/height/format without throwing (returns null on failure). */
export const readImageMetadata = async (buffer) => {
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

/** Reads an image into a Buffer from a stored `/public/...` path or an http URL. */
export const readImageSourceBuffer = async (imageUrl) => {
  if (isHttpUrl(imageUrl)) {
    return downloadImageBuffer(imageUrl);
  }

  const filePath = resolveStoredFilePathForRead(imageUrl);
  if (!filePath) {
    throw new Error(`Cannot resolve stored path for image_url: ${imageUrl}`);
  }

  return fs.readFile(filePath);
};

/**
 * Re-encodes the edited image to JPEG and (optionally) restores the original
 * pixel dimensions so the AI output stays consistent with the source.
 */
export const normalizeEditedImage = async (buffer, originalDimensions) => {
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
 * Converts a DataModelUtils-style upload dir (`public/.../`) into an absolute
 * path under the configured public root.
 */
export const resolveUploadDirAbsolute = (uploadDir) => {
  const relativeUnderPublic = String(uploadDir)
    .replace(/\\/g, '/')
    .replace(/^public\/?/, '')
    .replace(/^\/+/, '');
  return path.join(getConfiguredPublicRoot(), relativeUnderPublic);
};

/**
 * Converts an absolute path inside the configured public root into the DB
 * `/public/...` URL shape that `image_url` uses.
 */
export const buildPublicImageUrl = (absolutePath) => {
  const publicRoot = path.resolve(getConfiguredPublicRoot());
  const rel = path
    .relative(publicRoot, path.resolve(absolutePath))
    .replace(/\\/g, '/');
  if (!rel || rel === '..' || rel.startsWith('../') || path.isAbsolute(rel)) {
    throw new Error(
      `AI edit: output path ${absolutePath} escapes the configured public root ${publicRoot}`,
    );
  }
  return `/public/${rel}`.replace(/\/{2,}/g, '/');
};

/**
 * Writes image bytes to a brand-new uuid-named file in `outputDir` (copy-on-write).
 *
 * Writes atomically (temp file + rename, with a direct-write fallback for
 * Windows file-lock cases), verifies the bytes on disk match what was produced,
 * and removes the file again if verification fails.
 *
 * @returns {Promise<{ fileName: string, filePath: string, publicUrl: string }>}
 */
export const writeImageCopyOnWrite = async ({
  buffer,
  outputDir,
  extension = '.jpg',
}) => {
  const fileName = `${uuidv4()}${extension}`;
  const filePath = path.join(outputDir, fileName);

  await fs.mkdir(outputDir, { recursive: true });

  const tmpPath = `${filePath}.${uuidv4()}.tmp`;
  await fs.writeFile(tmpPath, buffer);
  try {
    await fs.rename(tmpPath, filePath);
  } catch (renameError) {
    logger.warn(
      `AI edit: atomic rename failed (${renameError.message}); falling back to direct write`,
    );
    await fs.writeFile(filePath, buffer);
    await fs.unlink(tmpPath).catch(() => {});
  }

  const writtenStat = await fs.stat(filePath);
  const writtenBuffer = await fs.readFile(filePath);
  const writtenHash = sha256(writtenBuffer);
  const outputHash = sha256(buffer);
  if (writtenStat.size !== buffer.length || writtenHash !== outputHash) {
    await fs.unlink(filePath).catch(() => {});
    throw new Error(
      `Output verification failed: wrote ${writtenStat.size} bytes but produced ${buffer.length}`,
    );
  }

  return { fileName, filePath, publicUrl: buildPublicImageUrl(filePath) };
};

/**
 * Runs the upload → edit → (optional) resize portion of the pipeline.
 *
 * Stages the source on Cloudinary so NanoBanana can reach it over a public URL,
 * edits it, and (optionally) restores the source dimensions. The temporary
 * Cloudinary asset is always cleaned up unless `keepTemporaryUpload` is set.
 *
 * @param {Object} params
 * @param {Buffer} params.sourceBuffer
 * @param {string} params.prompt
 * @param {Object} [params.options] - folder, keepTemporaryUpload, numImages, imageSize, pollOptions, resizeToOriginal.
 * @param {(status: string) => void} [params.onStatus] - Progress callback.
 * @returns {Promise<{ taskId: string, outputBuffer: Buffer, sourceMeta: Object|null, outputMeta: Object|null }>}
 */
export const applyAiEdit = async ({ sourceBuffer, prompt, options = {}, onStatus }) => {
  const {
    folder = 'temporary-nanobanana-inputs',
    keepTemporaryUpload = false,
    numImages = 1,
    imageSize,
    pollOptions,
    resizeToOriginal = false,
  } = options;

  const sourceMeta = await readImageMetadata(sourceBuffer);
  let tempPublicId = null;

  try {
    if (onStatus) onStatus('uploading');
    const upload = await uploadImageToCloudinary(sourceBuffer, { folder });
    tempPublicId = upload.publicId;

    if (onStatus) onStatus('editing');
    const edited = await editImageWithNanoBanana({
      imageUrls: [upload.secureUrl],
      prompt,
      numImages,
      imageSize,
      pollOptions,
    });

    let outputBuffer = edited.buffer;
    if (resizeToOriginal) {
      outputBuffer = await normalizeEditedImage(
        outputBuffer,
        sourceMeta
          ? { width: sourceMeta.width, height: sourceMeta.height }
          : null,
      );
    }

    const outputMeta = await readImageMetadata(outputBuffer);
    return { taskId: edited.taskId, outputBuffer, sourceMeta, outputMeta };
  } finally {
    if (tempPublicId && !keepTemporaryUpload) {
      try {
        await deleteCloudinaryAsset(tempPublicId);
      } catch {
        // Cleanup is best-effort only.
      }
    }
  }
};

/**
 * Runs the full pipeline for a single image row:
 *   a. read the source image
 *   b. upload → edit (NanoBanana), optional resize
 *   c. save the result to a NEW file (copy-on-write) and update the row's URL
 *
 * The source file (which may be a shared file-bank image or a local upload) is
 * never modified. Returns a result object shaped like a job entry.
 *
 * @param {Object} params
 * @param {Object} params.model - DataModelUtils-style model ({ tableName, executeQuery }).
 * @param {Object} params.row - The image row.
 * @param {string} params.prompt
 * @param {Object} [params.options]
 * @param {string} [params.imageUrlField='image_url']
 * @param {string} [params.nameField='image_name']
 * @param {string} [params.idField='id']
 * @param {(row: Object) => string} params.uploadDirResolver - Returns a `public/...` upload dir.
 * @param {string[]} [params.rowIdentityFields=[]] - Extra row fields copied onto the result.
 */
export const processImageRow = async ({
  model,
  row,
  prompt,
  options = {},
  imageUrlField = 'image_url',
  nameField = 'image_name',
  idField = 'id',
  uploadDirResolver,
  rowIdentityFields = [],
}) => {
  const imageUrl = row[imageUrlField];
  const imageName = row[nameField];

  const result = {
    id: row[idField],
    status: 'processing',
    image_url: null,
    taskId: null,
    error: null,
  };
  for (const field of rowIdentityFields) {
    result[field] = row[field];
  }

  try {
    const outputDir = resolveUploadDirAbsolute(uploadDirResolver(row));

    // Always edit the row's current image. Because the output is written to a
    // brand-new file, the source (file-bank or local) is never modified.
    const sourceBuffer = await readImageSourceBuffer(imageUrl);

    const { taskId, outputBuffer, sourceMeta, outputMeta } = await applyAiEdit({
      sourceBuffer,
      prompt,
      options,
      onStatus: (status) => {
        result.status = status;
      },
    });
    result.taskId = taskId;

    // c. Save the AI result verbatim (no resize / re-encode by default).
    result.status = 'saving';

    // Copy-on-write: the result gets a brand-new uuid id/name in the row's own
    // images folder, so the original (file-bank or local) is never overwritten.
    const outputFileName = `${uuidv4()}${extensionForFormat(
      outputMeta?.format,
      imageName || imageUrl,
    )}`;

    const outputHash = sha256(outputBuffer);
    const sourceHash = sha256(sourceBuffer);
    const changed = outputHash !== sourceHash;

    result.diagnostics = {
      source: {
        width: sourceMeta?.width ?? null,
        height: sourceMeta?.height ?? null,
        format: sourceMeta?.format ?? null,
      },
      output: {
        width: outputMeta?.width ?? null,
        height: outputMeta?.height ?? null,
        format: outputMeta?.format ?? null,
        bytes: outputBuffer.length,
        fileName: outputFileName,
        verified: false,
        changed,
      },
    };
    result.changed = changed;
    result.previous_image_url = imageUrl || null;

    if (!changed) {
      // Byte-identical to the source: don't create a new file or touch the DB.
      result.image_url = imageUrl || null;
      result.warning =
        'AI returned the same image as the source; no new file was written.';
      logger.warn(
        `AI edit: output for ${row[idField]} (${imageName}) is byte-identical to its source — no new file written`,
      );
      result.status = 'completed';
      return result;
    }

    const { filePath, publicUrl } = await writeImageCopyOnWrite({
      buffer: outputBuffer,
      outputDir,
      extension: path.extname(outputFileName),
    });

    // Repoint the row at the new file. If the DB write fails, remove the new
    // file so we don't leave an orphan, and surface the error as a failed row.
    try {
      await model.executeQuery(
        `UPDATE ${model.tableName} SET ${imageUrlField} = ? WHERE ${idField} = ?`,
        [publicUrl, row[idField]],
      );
    } catch (dbError) {
      await fs.unlink(filePath).catch(() => {});
      throw new Error(
        `DB update failed after writing ${outputFileName}: ${dbError.message}`,
      );
    }

    result.image_url = publicUrl;
    result.diagnostics.output.verified = true;

    logger.info(
      `AI edit: wrote verified output for ${row[idField]} (${imageName}) → ${filePath} (${outputBuffer.length} bytes); ${imageUrlField} updated to ${publicUrl}`,
    );

    result.status = 'completed';
  } catch (error) {
    result.status = 'failed';
    result.error = error.message;
    logger.error(
      `AI edit failed for row ${row[idField]}: ${error.message}\n${error.stack || ''}`,
    );
  }

  return result;
};

/**
 * Creates a reusable AI image-editing job service backed by an in-memory job
 * store. The returned `startJob` runs the pipeline in the background and the
 * returned `getJob`/`listJobs` expose status for polling.
 *
 * @param {Object} config
 * @param {Object} config.model - DataModelUtils-style model ({ tableName, executeQuery }).
 * @param {(criteria: Object) => Promise<Object[]>} config.resolveRows - Resolves image rows from criteria.
 * @param {string} [config.imageUrlField='image_url']
 * @param {string} [config.nameField='image_name']
 * @param {string} [config.idField='id']
 * @param {(row: Object) => string} config.uploadDirResolver - Returns a `public/...` upload dir.
 * @param {string[]} [config.rowIdentityFields=[]] - Extra row fields copied onto each job entry.
 * @param {number} [config.ttlMs] - Job retention TTL (default 30 minutes).
 * @returns {{ startJob: Function, getJob: Function, listJobs: Function }}
 */
export const createImageAiJobService = (config = {}) => {
  const {
    model,
    resolveRows,
    imageUrlField = 'image_url',
    nameField = 'image_name',
    idField = 'id',
    uploadDirResolver,
    rowIdentityFields = [],
    ttlMs = DEFAULT_JOB_TTL_MS,
  } = config;

  const jobStore = new Map();

  const startJob = async (input = {}) => {
    const { prompt, options = {}, ...criteria } = input;

    if (!prompt) {
      throw new AppError('prompt is required', 400);
    }

    const rows = await resolveRows(criteria);

    if (!rows.length) {
      throw new AppError('No images matched the provided criteria', 404);
    }

    logger.info(
      `AI edit: matched ${rows.length} image row(s) for prompt "${String(prompt).slice(0, 120)}"`,
    );

    const job = {
      id: uuidv4(),
      status: 'queued',
      total: rows.length,
      processed: 0,
      results: rows.map((row) => ({
        id: row[idField],
        ...Object.fromEntries(
          rowIdentityFields.map((field) => [field, row[field]]),
        ),
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

    jobStore.set(job.id, job);

    // Run in the background without blocking the response.
    setImmediate(() => {
      runJob(job.id, rows, prompt, options).catch((error) => {
        const current = jobStore.get(job.id);
        if (current) {
          current.status = 'failed';
          current.error = error.message;
          current.finishedAt = new Date().toISOString();
        }
      });
    });

    return job;
  };

  const runJob = async (jobId, rows, prompt, options) => {
    const job = jobStore.get(jobId);
    if (!job) return;

    job.status = 'processing';
    job.startedAt = new Date().toISOString();
    logger.info(
      `AI edit job ${jobId} started: ${rows.length} image(s), prompt "${String(prompt || '').slice(0, 120)}"`,
    );

    for (const row of rows) {
      const entry = job.results.find((r) => r[idField] === row[idField]);

      try {
        const outcome = await processImageRow({
          model,
          row,
          prompt,
          options,
          imageUrlField,
          nameField,
          idField,
          uploadDirResolver,
          rowIdentityFields,
        });
        if (entry) Object.assign(entry, outcome);
      } catch (error) {
        if (entry) {
          entry.status = 'failed';
          entry.error = error.message;
        }
        logger.error(
          `AI edit job ${jobId} failed for row ${row[idField]}: ${error.message}`,
        );
      }

      job.processed += 1;
    }

    const failed = job.results.filter((r) => r.status === 'failed').length;
    const unchanged = job.results
      .filter((r) => r.changed === false)
      .map((r) => r[idField]);
    job.status =
      failed === job.total
        ? 'failed'
        : failed > 0
          ? 'completed-with-errors'
          : 'completed';
    job.finishedAt = new Date().toISOString();

    logger.info(
      `AI edit job ${jobId} finished: ${job.total} total, ${failed} failed, ${unchanged.length} unchanged`,
    );
    if (unchanged.length > 0) {
      logger.warn(
        `AI edit job ${jobId}: the following rows completed but were byte-identical to their source (file not modified): ${unchanged.join(', ')}`,
      );
    }

    setTimeout(() => {
      jobStore.delete(jobId);
    }, ttlMs);
  };

  const getJob = (jobId) => jobStore.get(jobId) || null;
  const listJobs = (limit = 50) =>
    [...jobStore.values()]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit);

  return { startJob, getJob, listJobs };
};

