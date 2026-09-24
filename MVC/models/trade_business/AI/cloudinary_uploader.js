import 'dotenv/config';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'node:stream';

/*
 * Generic Cloudinary helper module.
 *
 * These functions are used to stage product images on Cloudinary so that the
 * NanoBanana image-editing API can reach them over a public URL, and to clean
 * those temporary assets up afterwards.
 *
 * Configuration is lazy: importing this module never throws, and Cloudinary is
 * only configured on first use. This keeps the main server bootable even when
 * the AI credentials are not yet present in the environment.
 */

const REQUIRED_VARS = [
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
];

let configured = false;

export const isCloudinaryConfigured = () =>
  REQUIRED_VARS.every((name) => Boolean(process.env[name]));

const ensureCloudinaryConfigured = () => {
  const missing = REQUIRED_VARS.filter((name) => !process.env[name]);

  if (missing.length > 0) {
    throw new Error(
      `Cloudinary is not configured. Missing environment variable(s): ${missing.join(', ')}`,
    );
  }

  if (!configured) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    });
    configured = true;
  }

  return cloudinary;
};

const isHttpUrl = (value) => /^https?:\/\//i.test(String(value || ''));

const isDataUri = (value) => String(value || '').startsWith('data:');

/**
 * Uploads a Buffer to Cloudinary using an upload stream.
 * @param {Buffer} buffer - Image bytes.
 * @param {Object} options - Cloudinary upload options.
 * @returns {Promise<Object>} Cloudinary upload result.
 */
const uploadBuffer = (buffer, options) =>
  new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      options,
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      },
    );

    Readable.from(buffer).pipe(uploadStream);
  });

/**
 * Uploads an image to Cloudinary and returns a normalized summary.
 *
 * `source` may be:
 *   - a Buffer of image bytes
 *   - an absolute local file path
 *   - an http(s) URL (Cloudinary fetches it server-side)
 *   - a `data:` URI
 *
 * @param {Buffer|string} source - The image to upload.
 * @param {Object} [options]
 * @param {string} [options.folder='temporary-nanobanana-inputs'] - Target folder.
 * @param {string} [options.publicId] - Explicit public id (otherwise auto).
 * @param {boolean} [options.overwrite=false] - Overwrite an existing asset.
 * @param {string[]} [options.tags] - Tags to apply.
 * @param {Object} [options.transformation] - Incoming transformation.
 * @returns {Promise<Object>} Normalized upload summary.
 */
export const uploadImageToCloudinary = async (source, options = {}) => {
  const {
    folder = 'temporary-nanobanana-inputs',
    publicId,
    overwrite = false,
    tags,
    transformation,
  } = options;

  ensureCloudinaryConfigured();

  if (source === undefined || source === null || source === '') {
    throw new Error('uploadImageToCloudinary: no source provided');
  }

  const uploadOptions = {
    folder,
    resource_type: 'image',
    overwrite,
    unique_filename: !publicId,
    use_filename: false,
  };

  if (publicId) uploadOptions.public_id = publicId;
  if (tags) uploadOptions.tags = tags;
  if (transformation) uploadOptions.transformation = transformation;

  let result;

  if (Buffer.isBuffer(source)) {
    result = await uploadBuffer(source, uploadOptions);
  } else if (isDataUri(source) || isHttpUrl(source) || typeof source === 'string') {
    // Local path, remote URL or data URI are all accepted by uploader.upload.
    result = await cloudinary.uploader.upload(String(source), uploadOptions);
  } else {
    throw new Error(
      'uploadImageToCloudinary: unsupported source type (expected Buffer, path, URL or data URI)',
    );
  }

  return {
    publicId: result.public_id,
    url: result.url,
    secureUrl: result.secure_url,
    width: result.width,
    height: result.height,
    format: result.format,
    bytes: result.bytes,
    resourceType: result.resource_type || 'image',
    result,
  };
};

/**
 * Deletes an asset from Cloudinary (used to clean up temporary uploads).
 * @param {string} publicId - The Cloudinary public id.
 * @param {Object} [options]
 * @param {string} [options.resourceType='image']
 * @param {boolean} [options.invalidate=true]
 * @returns {Promise<Object>} `{ deleted, result }`.
 */
export const deleteCloudinaryAsset = async (publicId, options = {}) => {
  if (!publicId) {
    return { deleted: false, reason: 'no publicId provided' };
  }

  ensureCloudinaryConfigured();

  const { resourceType = 'image', invalidate = true } = options;

  const result = await cloudinary.uploader.destroy(publicId, {
    resource_type: resourceType,
    invalidate,
  });

  return {
    deleted: result?.result === 'ok',
    result,
  };
};

const cloudinaryUploader = {
  isCloudinaryConfigured,
  uploadImageToCloudinary,
  deleteCloudinaryAsset,
};

export default cloudinaryUploader;

