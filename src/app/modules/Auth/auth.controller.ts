import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { AuthServices } from './auth.service';
import { ILoginBody, ILoginResponse } from './auth.interface';

const login = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const body: ILoginBody = req.body;
  const result: ILoginResponse = await AuthServices.login(body);

  sendResponse<ILoginResponse>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Login successful',
    data: result,
  });
});

export const AuthController = {
  login,
};
