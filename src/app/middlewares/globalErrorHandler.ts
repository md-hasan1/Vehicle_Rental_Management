import { ErrorRequestHandler } from 'express';
import ApiError from '../../errors/ApiErrors';
import Joi from 'joi';
import httpStatus from 'http-status';

const GlobalErrorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  let statusCode: number = 500;
  let message = 'Something went wrong!';
  let errorDetails: any;

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    errorDetails = err;
  } else if (err instanceof Joi.ValidationError) {
    statusCode = 400;
    message = 'Validation Error';
    const joiErr = err as unknown as { details: Array<{ message: string }> };
    errorDetails = {
      errors: joiErr.details.map((d) => d.message),
    };
  } else if (err.name === 'MulterError') {
    statusCode = 400;
    message = err.message;
  } else if (err.code === '23505') {
    statusCode = httpStatus.CONFLICT;
    message = 'Duplicate entry found';
    errorDetails = err;
  } else if (err.code === '23503') {
    statusCode = 400;
    message = 'Referenced record does not exist';
  }

  if (process.env.NODE_ENV === 'development') {
    console.error(`❌ [GlobalErrorHandler]`, err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(errorDetails && { errorDetails }),
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
};

export default GlobalErrorHandler;
