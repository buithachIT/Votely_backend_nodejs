import { Response } from 'express';

interface SuccessResponse {
  data?: unknown;
  message?: string;
  statusCode?: number;
}

interface ErrorResponse {
  message?: string;
  statusCode?: number;
  errors?: unknown;
}

const sendSuccess = (
  res: Response,
  { data = null, message = 'Success', statusCode = 200 }: SuccessResponse = {},
) => {
  return res.status(statusCode).json({
    success: true,
    data,
    message,
    errors: null,
  });
};

const sendError = (
  res: Response,
  { message = 'Error', statusCode = 500, errors = null }: ErrorResponse = {},
) => {
  return res.status(statusCode).json({
    success: false,
    data: null,
    message,
    errors,
  });
};

export { sendSuccess, sendError };
