import fs from 'fs';
import { getDataDefaultMappings } from '../../mappings/defaultDataMappings.js';
import { tradeBusinessDbc } from '../../dbModel.js';
import {
  getConfiguredPublicRoot,
  resolveStoredFilePathForRead,
} from '../../../../utils/fileUpload.js';

/**
 * Dynamic "file bank" registry derived from every configured model's
 * `fileConfig.uploadDir`. Nothing here is hand-maintained: adding a new panel or
 * file field automatically appears in the file-bank directory tree / upload-dir
 * listing because this walks the same `childTableConfig` graph as
 * `panel/general/data_file_mappings.js`.
 */

const getBaseTableName = (tableName = '') => {
  const parts = String(tableName).split('.');
  return parts[parts.length - 1];
};

const normalizeUploadDir = (uploadDir = '') =>
  String(uploadDir)
    .replace(/\\/g, '/')
    .replace(/^\/+/, '')
    .replace(/\/+$/, '');

const segmentize = (uploadDir = '') =>
  normalizeUploadDir(uploadDir).split('/').filter(Boolean);

const collectFromModel = (model, registry, visitedTables) => {
  if (!model || !model.tableName) return;

  const tableName = getBaseTableName(model.tableName);
  if (visitedTables.has(tableName)) return;
  visitedTables.add(tableName);

  if (model.hasFileHandling && model.uploadDirPattern) {
    const segments = segmentize(model.uploadDirPattern);
    registry.push({
      tableName,
      entityName: model.entityName || tableName,
      fileUrlField: model.fileUrlField || null,
      fileTypeField: model.fileTypeField || null,
      descriptionField: model.descriptionField || null,
      imagesOnly: !!model.imagesOnly,
      uploadDirPattern: model.uploadDirPattern,
      segments,
      root: segments[1] || segments[0] || null,
      subPath: segments.slice(2).join('/') || null,
    });
  }

  for (const childConfig of model.childTableConfig || []) {
    if (childConfig?.model) {
      collectFromModel(childConfig.model, registry, visitedTables);
    }
  }
};

/**
 * Flat list of every uploadDir across all trade-business models.
 * @returns {Array<Object>}
 */
export const getUploadDirRegistry = () => {
  const registry = [];
  const visitedTables = new Set();
  for (const { model } of getDataDefaultMappings()) {
    collectFromModel(model, registry, visitedTables);
  }
  return registry;
};

/**
 * Distinct top-level roots (the first folder under `/public`) with the upload
 * directories that map into them.
 * @returns {Array<{ name, uploadDirs, subPaths }>}
 */
export const getFileBankRoots = () => {
  const registry = getUploadDirRegistry();
  const rootsMap = new Map();

  for (const entry of registry) {
    const root = entry.root;
    if (!root) continue;

    if (!rootsMap.has(root)) {
      rootsMap.set(root, { name: root, uploadDirs: 0, subPaths: new Set() });
    }
    const rootEntry = rootsMap.get(root);
    rootEntry.uploadDirs += 1;
    if (entry.subPath) rootEntry.subPaths.add(entry.subPath);
  }

  return [...rootsMap.values()].map((item) => ({
    name: item.name,
    uploadDirs: item.uploadDirs,
    subPaths: [...item.subPaths].sort(),
  }));
};

/**
 * Storage metadata for the breadcrumb / address bar (drive + root labels are
 * derived from the configured public root, never hardcoded).
 * @returns {{ driveLabel: string, rootLabel: string, publicPath: string, rootPath: string }}
 */
export const getFileBankStorageMeta = () => {
  const configuredRoot = String(getConfiguredPublicRoot() || '').replace(
    /\\/g,
    '/',
  );
  const parts = configuredRoot.split('/').filter(Boolean);

  const drivePart = parts[0] || '';
  const driveLetter = drivePart.replace(/[^A-Za-z]/g, '');
  const driveLabel = driveLetter
    ? `Local Disk (${driveLetter.toUpperCase()}:)`
    : 'Storage';

  // The configured root points at `.../<rootLabel>/public`, so the root label is
  // the parent folder of `public`.
  const publicIndex = parts.lastIndexOf('public');
  const rootLabel =
    publicIndex > 0 ? parts[publicIndex - 1] : 'Pet Product Images';

  return {
    driveLabel,
    rootLabel,
    publicPath: '/public',
    rootPath: configuredRoot,
  };
};

/**
 * True when the stored path resolves to an existing file inside the configured
 * public root (no copy involved — used to validate the zero-copy opt-in).
 * @param {string} storedPath
 * @returns {boolean}
 */
export const storedFileExistsInPublicRoot = (storedPath) => {
  if (typeof storedPath !== 'string' || storedPath.trim() === '') {
    return false;
  }
  try {
    const resolved = resolveStoredFilePathForRead(storedPath);
    return (
      !!resolved && fs.existsSync(resolved) && fs.statSync(resolved).isFile()
    );
  } catch {
    return false;
  }
};

/**
 * Map a `fileUrlField` (`image_url` / `file_url` / `icon_url`) to its human
 * name column (`image_name` / `file_name` / `icon_name`). Returns null for any
 * non-`_url` field (e.g. `logo_icon_url`), which has no display-name sibling.
 */
export const getDisplayNameField = (fileUrlField = '') =>
  typeof fileUrlField === 'string' && fileUrlField.endsWith('_url')
    ? fileUrlField.replace(/_url$/, '_name')
    : null;

/**
 * Normalize a stored/public path for comparison: collapse slashes, strip any
 * leading slash, and lowercase. Seeded DB paths can contain doubled slashes
 * (`/public/<id>/products//<uuid>.png`) while the file-bank listing emits
 * single slashes, so matching must be tolerant of both.
 */
const normalizePathForMatch = (value = '') =>
  String(value)
    .replace(/\\/g, '/')
    .replace(/^\/+/, '')
    .replace(/\/+/g, '/')
    .toLowerCase();

/** Last non-empty segment of a path (the on-disk filename / UUID). */
const basenameOf = (value = '') => {
  const parts = String(value || '').replace(/\\/g, '/').split('/').filter(Boolean);
  return parts[parts.length - 1] || '';
};

/**
 * The registered file tables, narrowed to those that have a human name column
 * alongside their URL column (plus enough metadata to query them).
 */
const getUploadDirSources = () =>
  getUploadDirRegistry()
    .map((entry) => ({
      tableName: entry.tableName,
      fileUrlField: entry.fileUrlField,
      nameField: getDisplayNameField(entry.fileUrlField),
      root: entry.root,
      uploadDirPattern: entry.uploadDirPattern,
    }))
    .filter((entry) => entry.fileUrlField && entry.nameField);

/**
 * Resolve the DB `image_name` / `file_name` / `icon_name` for a set of on-disk
 * file-bank entries. On-disk files are UUID-named and the DB `*_url` values end
 * with that same UUID, so the join key is the filename — which also sidesteps
 * the fact that seeded DB paths use a different folder layout than the live
 * file bank. Returns a `Map<lowercased filename, display name>`.
 *
 * Failures are swallowed: display names are cosmetic and must never break a
 * directory listing.
 *
 * @param {{ entryPaths?: string[], folderPublicPath?: string }} params
 * @returns {Promise<Map<string, string>>}
 */
export const lookupFileBankDisplayNames = async ({
  entryPaths = [],
  folderPublicPath = '',
} = {}) => {
  const result = new Map();
  if (!Array.isArray(entryPaths) || entryPaths.length === 0) return result;

  const wanted = new Set(
    entryPaths.map((p) => basenameOf(p).toLowerCase()).filter(Boolean),
  );
  if (wanted.size === 0) return result;

  // Narrow the candidate tables to the folder's top-level root (e.g.
  // `products`, `customers`, `master`) when it can be derived, so we don't
  // query every file table on every navigation.
  const relativeUnderPublic = normalizePathForMatch(folderPublicPath).replace(
    /^public\/?/,
    '',
  );
  const root = relativeUnderPublic.split('/').filter(Boolean)[0] || '';

  const sources = getUploadDirSources().filter(
    (source) => !root || source.root === root,
  );

  for (const source of sources) {
    try {
      const rows = await tradeBusinessDbc.executeQuery(
        `SELECT \`${source.fileUrlField}\` AS file_url, \`${source.nameField}\` AS display_name
         FROM \`${source.tableName}\`
         WHERE \`${source.fileUrlField}\` IS NOT NULL
           AND \`${source.fileUrlField}\` <> ''
           AND \`${source.nameField}\` IS NOT NULL
           AND \`${source.nameField}\` <> ''
         LIMIT 5000`,
      );
      for (const row of rows) {
        const url = row?.file_url;
        const name = row?.display_name;
        if (!url || !name) continue;
        const key = basenameOf(url).toLowerCase();
        if (!key || !wanted.has(key)) continue;
        if (!result.has(key)) result.set(key, String(name));
      }
    } catch {
      /* cosmetic lookup; ignore this table */
    }

    // Stop early once every requested filename has been resolved.
    if (result.size >= wanted.size) break;
  }

  return result;
};
