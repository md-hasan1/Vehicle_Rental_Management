import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { VehicleServices } from './vehicle.service';
import { IVehicle, ICreateVehicleBody, IUpdateVehicleBody } from './vehicle.interface';
import { IPaginatedResult } from '../../../interfaces/common';

const findAll = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const { category, search, page, limit } = req.query;

  const result: IPaginatedResult<IVehicle> = await VehicleServices.findAll({
    category: category as string,
    search: search as string,
    page: page ? Number(page) : 1,
    limit: limit ? Number(limit) : 10,
  });

  sendResponse<IVehicle[]>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Vehicles retrieved successfully',
    meta: result.meta,
    data: result.data,
  });
});

const findById = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const id = Number(req.params.id);
  const result: IVehicle = await VehicleServices.findById(id);

  sendResponse<IVehicle>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Vehicle retrieved successfully',
    data: result,
  });
});

const create = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const body: ICreateVehicleBody = req.body;
  const photoPath = req.file
    ? `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`
    : undefined;

  const result: IVehicle = await VehicleServices.create(body, photoPath);

  sendResponse<IVehicle>(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Vehicle created successfully',
    data: result,
  });
});

const update = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const id = Number(req.params.id);
  const body: IUpdateVehicleBody = req.body;
  const photoPath = req.file
    ? `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`
    : undefined;

  const result: IVehicle = await VehicleServices.update(id, body, photoPath);

  sendResponse<IVehicle>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Vehicle updated successfully',
    data: result,
  });
});

const softDelete = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const id = Number(req.params.id);
  await VehicleServices.softDelete(id);

  sendResponse<null>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Vehicle deleted successfully',
    data: null,
  });
});

export const VehicleController = {
  findAll,
  findById,
  create,
  update,
  softDelete,
};
