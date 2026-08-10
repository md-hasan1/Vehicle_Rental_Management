import { Response } from 'express';

interface ISendResponseData<T> {
  statusCode: number;
  success: boolean;
  message: string;
  meta?: {
    page: number;
    limit: number;
    total: number;
  };
  data: T | null | undefined;
}

const sendResponse = <T>(res: Response, jsonData: ISendResponseData<T>): void => {
  res.status(jsonData.statusCode).json({
    success: jsonData.success,
    message: jsonData.message,
    meta: jsonData.meta || undefined,
    data: jsonData.data ?? null,
  });
};

export default sendResponse;
