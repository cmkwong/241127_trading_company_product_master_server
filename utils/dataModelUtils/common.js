export const normalizeIdList = (values) => {
  return [
    ...new Set(
      (Array.isArray(values) ? values : [])
        .map((v) => (typeof v === 'string' ? v.trim() : v))
        .filter((v) => v !== undefined && v !== null && v !== ''),
    ),
  ];
};

export const wrapEntityFailure = (AppErrorClass, entityName, action, error) => {
  throw new AppErrorClass(
    `Failed to ${action} ${entityName}: ${error.message}`,
    error.statusCode || 500,
  );
};
