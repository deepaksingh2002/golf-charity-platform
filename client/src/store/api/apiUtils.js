export const unwrapApiResponse = (payload) => {
  if (
    payload &&
    typeof payload === 'object' &&
    'success' in payload &&
    'data' in payload
  ) {
    const { data, ...rest } = payload;

    if (Array.isArray(data)) {
      const hasSiblingArray = Object.values(rest).some(Array.isArray);
      return hasSiblingArray ? payload : data;
    }

    if (data && typeof data === 'object') {
      return { ...rest, ...data };
    }

    return data;
  }

  return payload;
};

export const normalizeApiList = (payload, listKey) => {
  if (Array.isArray(payload)) return payload;

  if (!payload || typeof payload !== 'object') return [];

  const direct = payload?.[listKey];
  if (Array.isArray(direct)) return direct;

  const nestedByKey =
    payload?.data?.[listKey] ??
    payload?.result?.[listKey] ??
    payload?.results?.[listKey] ??
    payload?.payload?.[listKey];
  if (Array.isArray(nestedByKey)) return nestedByKey;

  const genericCandidates = [
    payload?.data,
    payload?.items,
    payload?.results,
    payload?.rows,
    payload?.docs,
    payload?.payload,
  ];

  for (const candidate of genericCandidates) {
    if (Array.isArray(candidate)) return candidate;
  }

  const value = payload?.[listKey] ?? payload ?? [];
  return Array.isArray(value) ? value : [];
};

export const getApiErrorMessage = (error, fallback = 'Something went wrong') => {
  if (!error) return fallback;

  if (typeof error === 'string') return error;

  if (typeof error === 'object') {
    if (typeof error.message === 'string' && error.message) {
      return error.message;
    }

    if (typeof error.error === 'string' && error.error) {
      return error.error;
    }

    if ('data' in error && error.data) {
      const data = error.data;

      if (typeof data === 'string') return data;

      if (typeof data === 'object') {
        if (typeof data.message === 'string' && data.message) {
          return data.message;
        }

        if (Array.isArray(data.errors) && data.errors.length > 0) {
          const firstValidationError = data.errors[0];
          if (typeof firstValidationError === 'string') return firstValidationError;
          if (firstValidationError?.msg) return firstValidationError.msg;
          if (firstValidationError?.message) return firstValidationError.message;
        }

        if (Array.isArray(data.error) && data.error.length > 0) {
          const firstError = data.error[0];
          if (typeof firstError === 'string') return firstError;
          if (firstError?.message) return firstError.message;
        }
      }
    }
  }

  return fallback;
};
