export const unwrapApiResponse = (payload) => {
  if (
    payload &&
    typeof payload === 'object' &&
    'success' in payload &&
    'data' in payload
  ) {
    return payload.data;
  }

  return payload;
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
