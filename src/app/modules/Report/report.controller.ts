import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { ReportServices } from './report.service';
import { IReportResponse } from './report.interface';

const getMonthlyReport = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const { month, vehicle_id } = req.query;

  const result: IReportResponse = await ReportServices.getMonthlyReport(
    month as string,
    vehicle_id ? Number(vehicle_id) : undefined,
  );

  sendResponse<IReportResponse>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Monthly rental report generated successfully',
    data: result,
  });
});

export const ReportController = {
  getMonthlyReport,
};
