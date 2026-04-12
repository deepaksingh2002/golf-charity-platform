class ApiResponse {
  constructor(statusCode, data, message = 'Success') {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400;
  }
}

const sendApiResponse = (res, statusCode, data, message = 'Success') => {
  return res.status(statusCode).json(new ApiResponse(statusCode, data, message));
};

export { ApiResponse, sendApiResponse };
