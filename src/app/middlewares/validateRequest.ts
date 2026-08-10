import { NextFunction, Request, Response } from 'express';
import Joi from 'joi';
import httpStatus from 'http-status';
import ApiError from '../../errors/ApiErrors';

type ValidationSource = 'body' | 'query' | 'params';

const validateRequest = (schema: Joi.ObjectSchema, source: ValidationSource = 'body') => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req[source], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const messages = error.details.map((detail) => detail.message).join(', ');
      next(new ApiError(httpStatus.BAD_REQUEST, messages));
      return;
    }

    req[source] = value;
    next();
  };
};

export default validateRequest;
