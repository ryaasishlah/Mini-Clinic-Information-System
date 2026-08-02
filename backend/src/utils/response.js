/**
 * Standarisasi Response API untuk Mini Clinic Information System
 */

const successResponse = (res, statusCode = 200, message = 'Success', data = {}) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

const errorResponse = (res, statusCode = 500, message = 'Internal Server Error', errors = null) => {
  const responseBody = {
    success: false,
    message
  };

  if (errors) {
    responseBody.errors = errors;
  }

  return res.status(statusCode).json(responseBody);
};

module.exports = {
  successResponse,
  errorResponse
};
