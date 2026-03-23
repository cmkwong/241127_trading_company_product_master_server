export const toBool = (value) => {
  if (value === true || value === 1) return true;

  const normalized = String(value || '')
    .trim()
    .toLowerCase();

  if (['1', 'true', 'yes', 'y', 'on'].includes(normalized)) {
    return true;
  }

  if (['0', 'false', 'no', 'n', 'off', ''].includes(normalized)) {
    return false;
  }

  return false;
};
