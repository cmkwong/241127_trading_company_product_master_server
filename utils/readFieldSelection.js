const DEFAULT_SAFE_FIELD_PATTERN = /^[a-zA-Z0-9_]+$/;

export const parseFieldsSelection = (fieldsInput) => {
  if (!fieldsInput) return null;

  if (typeof fieldsInput === 'object' && !Array.isArray(fieldsInput)) {
    return fieldsInput;
  }

  if (typeof fieldsInput === 'string') {
    try {
      const parsed = JSON.parse(fieldsInput);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return parsed;
      }
    } catch (_err) {
      return null;
    }
  }

  return null;
};

export const getSafeSelectedFieldsForTable = (
  fieldsInput,
  tableName,
  options = {},
) => {
  const { ensureField = 'id', safeFieldPattern = DEFAULT_SAFE_FIELD_PATTERN } =
    options;

  const parsed = parseFieldsSelection(fieldsInput);
  if (!parsed) return null;

  const selected = Array.isArray(parsed[tableName]) ? parsed[tableName] : null;
  if (!selected || selected.length === 0) return null;

  const safeFields = [...new Set(selected.map((f) => String(f).trim()))].filter(
    (f) => safeFieldPattern.test(f),
  );

  if (safeFields.length === 0) return null;

  if (ensureField && !safeFields.includes(ensureField)) {
    safeFields.unshift(ensureField);
  }

  return safeFields;
};
