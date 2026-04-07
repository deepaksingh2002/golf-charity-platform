class ApiResponse {
  constructor(statusCode, data, message = 'Success') {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400;
  }
}

const sendApiResponse = (res, statusCode, data, message = 'Success', options = {}) => {
  const payload = new ApiResponse(statusCode, data, message);

  if (options.collectionKey) {
    payload[options.collectionKey] = data;
  }

  if (options.legacy && data && typeof data === 'object' && !Array.isArray(data)) {
    Object.assign(payload, data);
  }

  return res.status(statusCode).json(payload);
};

export { ApiResponse, sendApiResponse };
