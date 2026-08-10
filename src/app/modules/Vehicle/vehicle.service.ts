import httpStatus from 'http-status';
import fs from 'fs';
import path from 'path';
import db from '../../db/connection';
import config from '../../../config';
import ApiError from '../../../errors/ApiErrors';
import { IPaginatedResult } from '../../../interfaces/common';
import {
  IVehicle,
  ICreateVehicleBody,
  IUpdateVehicleBody,
  IVehicleFilters,
} from './vehicle.interface';

class VehicleService {
  async findAll(filters: IVehicleFilters): Promise<IPaginatedResult<IVehicle>> {
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const offset = (page - 1) * limit;

    const query = db('vehicles').whereNull('deleted_at');

    if (filters.category) {
      query.where('category', filters.category);
    }

    if (filters.search) {
      query.whereILike('name', `%${filters.search}%`);
    }

    const countQuery = query.clone().count('* as count').first();
    const dataQuery = query
      .clone()
      .select(
        'id',
        'name',
        'plate_number',
        'category',
        'daily_rate',
        'photo_path',
        'deleted_at',
        'created_at',
        'updated_at',
      )
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset(offset);

    const [countResult, data] = await Promise.all([countQuery, dataQuery]);
    const total = parseInt(String(countResult?.count || '0'), 10);

    return {
      data,
      meta: { page, limit, total },
    };
  }

  async findById(id: number): Promise<IVehicle> {
    const vehicle = await db('vehicles')
      .select(
        'id',
        'name',
        'plate_number',
        'category',
        'daily_rate',
        'photo_path',
        'deleted_at',
        'created_at',
        'updated_at',
      )
      .where({ id })
      .whereNull('deleted_at')
      .first();

    if (!vehicle) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Vehicle not found');
    }

    return vehicle;
  }

  async create(body: ICreateVehicleBody, photoPath?: string): Promise<IVehicle> {
    const [vehicle] = await db('vehicles')
      .insert({
        name: body.name,
        plate_number: body.plate_number,
        category: body.category,
        daily_rate: body.daily_rate,
        photo_path: photoPath || null,
      })
      .returning('*');

    return vehicle;
  }

  async update(id: number, body: IUpdateVehicleBody, photoPath?: string): Promise<IVehicle> {
    const existingVehicle = await this.findById(id);

    const updateData: any = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.plate_number !== undefined) updateData.plate_number = body.plate_number;
    if (body.category !== undefined) updateData.category = body.category;
    if (body.daily_rate !== undefined) updateData.daily_rate = body.daily_rate;
    if (photoPath !== undefined) updateData.photo_path = photoPath;

    updateData.updated_at = db.fn.now();

    if (photoPath && existingVehicle.photo_path) {
      try {
        const filename = existingVehicle.photo_path.split('/').pop();
        if (filename) {
          const uploadDir = path.resolve(config.uploadPath);
          const oldFilePath = path.join(uploadDir, filename);
          if (fs.existsSync(oldFilePath)) {
            fs.unlinkSync(oldFilePath);
          }
        }
      } catch (error) {
        console.error('Failed to delete old vehicle photo:', error);
      }
    }

    const [updatedVehicle] = await db('vehicles')
      .where({ id })
      .whereNull('deleted_at')
      .update(updateData)
      .returning('*');

    if (!updatedVehicle) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Vehicle not found');
    }

    return updatedVehicle;
  }

  async softDelete(id: number): Promise<void> {
    const [deletedVehicle] = await db('vehicles')
      .where({ id })
      .whereNull('deleted_at')
      .update({ deleted_at: db.fn.now(), updated_at: db.fn.now() })
      .returning('id');

    if (!deletedVehicle) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Vehicle not found');
    }
  }
}

export const VehicleServices = new VehicleService();
