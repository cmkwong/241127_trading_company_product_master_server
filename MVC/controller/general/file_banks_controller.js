import fs from 'fs';
import path from 'path';
import catchAsync from '../../../utils/catchAsync.js';
import AppError from '../../../utils/appError.js';
import { getConfiguredPublicRoot } from '../../../utils/fileUpload.js';

const IMAGE_EXTENSIONS = new Set([
  '.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.ico', '.avif', '.tiff', '.tif', '.svg',
]);

const MIME_BY_EXT = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.bmp': 'image/bmp',
  '.ico': 'image/x-icon',
  '.avif': 'image/avif',
  '.tiff': 'image/tiff',
  '.tif': 'image/tiff',
  '.svg': 'image/svg+xml',
  '.pdf': 'application/pdf',
  '.txt': 'text/plain',
  '.json': 'application/json',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.xls': 'application/vnd.ms-excel',
  '.doc': 'application/msword',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.zip': 'application/zip',
};

const normalizeStoredPath = (input = '') => {
  const cleaned = String(input)
    .replace(/\\/g, '/')
    .replace(/^\/+/, '');
  if (cleaned === 'public') return 'public';
  if (cleaned.startsWith('public/')) return cleaned;
  return `public/${cleaned}`;
};

const toPublicPath = (relativeUnderRoot = '') => {
  const normalized = String(relativeUnderRoot)
    .replace(/\\/g, '/')
    .replace(/^\/+/, '');
  return `/public/${normalized}`.replace(/\/+/g, '/');
};

// Resolve a stored/public path to an absolute filesystem path strictly inside
// the configured public root (prevents path traversal / arbitrary reads).
const resolveSafePath = (storedPath) => {
  const normalized = normalizeStoredPath(storedPath);
  const relativeUnderPublic = normalized
    .replace(/^public\/?/, '')
    .replace(/^\/+/, '');
  const configuredRoot = path.resolve(getConfiguredPublicRoot());
  const resolved = path.resolve(configuredRoot, relativeUnderPublic);
  const rel = path.relative(configuredRoot, resolved);
  if (rel.startsWith('..') || path.isAbsolute(rel)) {
    return null;
  }
  return resolved;
};

const statEntry = (absolutePath, configuredRoot) => {
  const stats = fs.statSync(absolutePath);
  const isDir = stats.isDirectory();
  const ext = isDir ? '' : path.extname(absolutePath).toLowerCase();
  return {
    name: path.basename(absolutePath),
    path: toPublicPath(path.relative(configuredRoot, absolutePath)),
    type: isDir ? 'folder' : 'file',
    extension: ext || null,
    isImage: !isDir && IMAGE_EXTENSIONS.has(ext),
    size: isDir ? null : stats.size,
    modifiedAt: stats.mtime.toISOString(),
    createdAt: stats.birthtime.toISOString(),
  };
};

const buildTree = (absolutePath, configuredRoot, depth, maxDepth) => {
  const entry = statEntry(absolutePath, configuredRoot);
  if (entry.type === 'file') return entry;
  if (maxDepth != null && depth >= maxDepth) return entry;
  let children;
  try {
    children = fs
      .readdirSync(absolutePath, { withFileTypes: true })
      .filter((dirent) => !dirent.name.startsWith('.'))
      .map((dirent) => {
        try {
          return buildTree(path.join(absolutePath, dirent.name), configuredRoot, depth + 1, maxDepth);
        } catch {
          return null;
        }
      })
      .filter(Boolean);
  } catch {
    children = [];
  }
  entry.children = children;
  return entry;
};

export const getFileBankTree = catchAsync(async (req, res, next) => {
  const configuredRoot = path.resolve(getConfiguredPublicRoot());
  if (!fs.existsSync(configuredRoot)) {
    return next(new AppError('Public storage root does not exist', 404));
  }

  const maxDepthParam = req.query.maxDepth;
  const maxDepth =
    maxDepthParam === undefined || maxDepthParam === ''
      ? null
      : Number.parseInt(maxDepthParam, 10);

  const tree = buildTree(configuredRoot, configuredRoot, 0, maxDepth);
  res.prints = { fileBanks: tree };
  next();
});

export const getFileBankContents = catchAsync(async (req, res, next) => {
  const storedPath = req.query.path || 'public';
  const absolutePath = resolveSafePath(storedPath);
  if (!absolutePath) {
    return next(new AppError('Invalid path', 400));
  }
  if (!fs.existsSync(absolutePath) || !fs.statSync(absolutePath).isDirectory()) {
    return next(new AppError('Directory not found', 404));
  }

  const configuredRoot = path.resolve(getConfiguredPublicRoot());
  const entries = fs
    .readdirSync(absolutePath, { withFileTypes: true })
    .filter((dirent) => !dirent.name.startsWith('.'))
    .map((dirent) => {
      try {
        return statEntry(path.join(absolutePath, dirent.name), configuredRoot);
      } catch {
        return null;
      }
    })
    .filter(Boolean);

  entries.sort((a, b) => {
    if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
    return a.name.localeCompare(b.name);
  });

  res.prints = {
    path: toPublicPath(path.relative(configuredRoot, absolutePath)),
    entries,
  };
  next();
});

const resolveImagePath = (req, next) => {
  const storedPath = req.query.path || req.query.file;
  if (!storedPath) {
    next(new AppError('path is required', 400));
    return null;
  }
  const absolutePath = resolveSafePath(storedPath);
  if (!absolutePath) {
    next(new AppError('Invalid path', 400));
    return null;
  }
  if (!fs.existsSync(absolutePath) || !fs.statSync(absolutePath).isFile()) {
    next(new AppError('File not found', 404));
    return null;
  }
  return absolutePath;
};

const sendFileStream = (res, absolutePath) => {
  const ext = path.extname(absolutePath).toLowerCase();
  res.set('Content-Type', MIME_BY_EXT[ext] || 'application/octet-stream');
  res.set('Content-Length', String(fs.statSync(absolutePath).size));
  fs.createReadStream(absolutePath).pipe(res);
};

export const getFileThumbnail = catchAsync(async (req, res, next) => {
  const absolutePath = resolveImagePath(req, next);
  if (!absolutePath) return;

  const ext = path.extname(absolutePath).toLowerCase();
  if (!IMAGE_EXTENSIONS.has(ext)) {
    return next(new AppError('Thumbnail not available for this file type', 404));
  }

  let width = Number.parseInt(req.query.width || '96', 10);
  if (!Number.isFinite(width) || width < 1) width = 96;
  if (width > 4096) width = 4096;

  try {
    const sharp = (await import('sharp')).default;
    const buffer = await sharp(absolutePath)
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();
    res.set('Content-Type', 'image/webp');
    res.set('Cache-Control', 'public, max-age=86400');
    return res.send(buffer);
  } catch {
    sendFileStream(res, absolutePath);
  }
});

export const getFileImagePreview = catchAsync(async (req, res, next) => {
  const absolutePath = resolveImagePath(req, next);
  if (!absolutePath) return;

  const ext = path.extname(absolutePath).toLowerCase();
  const isImage = IMAGE_EXTENSIONS.has(ext);
  let width = Number.parseInt(req.query.width || '0', 10);

  if (isImage && Number.isFinite(width) && width > 0 && width <= 4096) {
    try {
      const sharp = (await import('sharp')).default;
      const buffer = await sharp(absolutePath)
        .resize({ width, withoutEnlargement: true })
        .webp({ quality: 88 })
        .toBuffer();
      res.set('Content-Type', 'image/webp');
      res.set('Cache-Control', 'public, max-age=86400');
      return res.send(buffer);
    } catch {
      // fall through to streaming the original file below
    }
  }

  sendFileStream(res, absolutePath);
});
