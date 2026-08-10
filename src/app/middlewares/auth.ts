import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import config from '../../config';
import ApiError from '../../errors/ApiErrors';
import { jwtHelpers } from '../../helpars/jwtHelpers';
import { IJwtPayload } from '../../interfaces/common';

const auth = () => {
  return async (req: Request & { user?: IJwtPayload }, _res: Response, next: NextFunction) => {
    try {
      const token = req.headers.authorization?.split(' ').includes('Bearer')
        ? req.headers.authorization?.split(' ')[1]
        : req.headers.authorization;

      if (!token) {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'You are not authorized!');
      }

      const verifiedUser = jwtHelpers.verifyToken(token, config.jwt.secret);

      req.user = verifiedUser as IJwtPayload;

      next();
    } catch (err) {
      next(err);
    }
  };
};

export default auth;
