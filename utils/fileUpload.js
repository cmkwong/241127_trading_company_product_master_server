import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import AppError from './appError.js';

/**
 * File types and their corresponding MIME prefixes
 */
const FILE_TYPES = {
  IMAGE: ['image/'],
  PDF: ['application/pdf'],
  DOCUMENT: [
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
  ],
  SPREADSHEET: [
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ],
  PRESENTATION: [
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  ],
  ARCHIVE: [
    'application/zip',
    'application/x-rar-compressed',
    'application/x-7z-compressed',
  ],
};

/**
 * Validates if the MIME type is allowed
 * @param {string} mimeType - The MIME type to check
 * @param {Array<string>} allowedTypes - Array of allowed file type categories (e.g., ['IMAGE', 'PDF'])
 * @returns {boolean} Whether the MIME type is allowed
 */
const isAllowedFileType = (mimeType, allowedTypes = ['IMAGE']) => {
  for (const type of allowedTypes) {
    const allowedPrefixes = FILE_TYPES[type] || [];
    for (const prefix of allowedPrefixes) {
      // Convert both mimeType and prefix to lowercase for case-insensitive comparison
      if (mimeType.toLowerCase().startsWith(prefix.toLowerCase())) {
        return true;
      }
    }
  }
  return false;
};

/**
 * Gets file extension from MIME type
 * @param {string} mimeType - The MIME type
 * @returns {string} The file extension
 */
const getExtensionFromMimeType = (mimeType) => {
  const commonExtensions = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
    'image/svg+xml': 'svg',
    'application/pdf': 'pdf',
    'application/msword': 'doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      'docx',
    'text/plain': 'txt',
    'application/vnd.ms-excel': 'xls',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
    'application/vnd.ms-powerpoint': 'ppt',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation':
      'pptx',
    'application/zip': 'zip',
    'application/x-rar-compressed': 'rar',
    'application/x-7z-compressed': '7z',
  };

  return commonExtensions[mimeType] || mimeType.split('/')[1] || 'bin';
};

/**
 * Converts base64 data to a file and saves it to the specified directory
 * @param {string} base64Data - The base64 file data (format: "data:mime/type;base64,...")
 * @param {string} uploadDir - The directory to save the file to (relative to project root)
 * @param {Object} options - Additional options
 * @param {string} [options.filename] - Optional custom filename (without extension)
 * @param {Array<string>} [options.allowedTypes] - Array of allowed file type categories
 * @param {number} [options.maxSizeInMB] - Maximum file size in MB
 * @returns {Promise<string>} The relative URL path to the saved file
 */
export const saveBase64File = async (base64Data, uploadDir, options = {}) => {
  try {
    const {
      filename = null,
      allowedTypes = ['IMAGE'],
      maxSizeInMB = 10,
    } = options;

    // Validate base64 data
    if (!base64Data || !base64Data.includes('base64')) {
      throw new AppError('Invalid file data', 400);
    }

    // Extract file data and type
    const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);

    if (!matches || matches.length !== 3) {
      throw new AppError('Invalid base64 file format', 400);
    }

    // Get mime type and data
    const mimeType = matches[1];
    const base64FileData = matches[2];

    // Check file type
    if (!isAllowedFileType(mimeType, allowedTypes)) {
      throw new AppError(
        `Unsupported file type. Allowed types: ${allowedTypes.join(', ')}`,
        400
      );
    }

    // Create buffer from base64
    const fileBuffer = Buffer.from(base64FileData, 'base64');

    // Check file size
    const fileSizeInMB = fileBuffer.length / (1024 * 1024);
    if (fileSizeInMB > maxSizeInMB) {
      throw new AppError(
        `File size exceeds the maximum allowed size of ${maxSizeInMB}MB`,
        400
      );
    }

    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Get file extension
    const extension = getExtensionFromMimeType(mimeType);

    // Generate filename if not provided
    const finalFilename = `${filename || uuidv4()}.${extension}`;
    const filePath = path.join(uploadDir, finalFilename);

    // Write file
    fs.writeFileSync(filePath, fileBuffer);

    // Return relative URL path (for storage in database)
    return `/${uploadDir}/${finalFilename}`;
  } catch (error) {
    throw new AppError(
      `Failed to save file: ${error.message}`,
      error.statusCode || 500
    );
  }
};

/**
 * Deletes a file from the filesystem
 * @param {string} filePath - The path to the file (relative URL path stored in DB)
 * @returns {Promise<boolean>} Success status
 */
export const deleteFile = async (filePath) => {
  try {
    if (!filePath) return false;

    // Remove leading slash if present
    const normalizedPath = filePath.startsWith('/')
      ? filePath.substring(1)
      : filePath;

    // Check if file exists
    if (fs.existsSync(normalizedPath)) {
      fs.unlinkSync(normalizedPath);
    }
    return true;
  } catch (error) {
    console.error(
      `Warning: Failed to delete file at ${filePath}: ${error.message}`
    );
    return false;
  }
};

/**
 * Backwards compatibility for image-specific functions
 */
export const saveBase64Image = (base64Data, uploadDir, filename = null) => {
  return saveBase64File(base64Data, uploadDir, {
    filename,
    allowedTypes: ['IMAGE'],
  });
};

export const deleteImage = deleteFile;
