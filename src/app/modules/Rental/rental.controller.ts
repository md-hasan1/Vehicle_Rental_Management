import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { RentalServices } from './rental.service';
import { IRental, ICreateRentalBody, IUpdateRentalBody, RentalStatus } from './rental.interface';
import { IPaginatedResult } from '../../../interfaces/common';

const findAll = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const { vehicle_id, status, start_date, end_date, page, limit } = req.query;

  const result: IPaginatedResult<IRental> = await RentalServices.findAll({
    vehicle_id: vehicle_id ? Number(vehicle_id) : undefined,
    status: status as RentalStatus | undefined,
    start_date: start_date as string | undefined,
    end_date: end_date as string | undefined,
    page: page ? Number(page) : 1,
    limit: limit ? Number(limit) : 10,
  });

  sendResponse<IRental[]>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Rentals retrieved successfully',
    meta: result.meta,
    data: result.data,
  });
});

const findById = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const id = Number(req.params.id);
  const result: IRental = await RentalServices.findById(id);

  sendResponse<IRental>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Rental retrieved successfully',
    data: result,
  });
});

const create = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const body: ICreateRentalBody = req.body;
  const result: IRental = await RentalServices.create(body);

  sendResponse<IRental>(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Rental created successfully',
    data: result,
  });
});

const update = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const id = Number(req.params.id);
  const body: IUpdateRentalBody = req.body;
  const result: IRental = await RentalServices.update(id, body);

  sendResponse<IRental>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Rental updated successfully',
    data: result,
  });
});

const deleteRental = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const id = Number(req.params.id);
  await RentalServices.delete(id);

  sendResponse<null>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Rental deleted successfully',
    data: null,
  });
});

export const RentalController = {
  findAll,
  findById,
  create,
  update,
  delete: deleteRental,
};
