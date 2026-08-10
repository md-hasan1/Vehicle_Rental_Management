import httpStatus from 'http-status';
import { Knex } from 'knex';
import db from '../../db/connection';
import ApiError from '../../../errors/ApiErrors';
import { IPaginatedResult } from '../../../interfaces/common';
import { IRental, ICreateRentalBody, IUpdateRentalBody, IRentalFilters } from './rental.interface';

class RentalService {
  private async checkOverlap(
    vehicleId: number,
    startDate: string,
    endDate: string,
    excludeId: number = 0,
    trx?: Knex.Transaction,
  ): Promise<void> {
    const conn = trx || db;

    const overlappingRental = await conn('rentals')
      .select('id')
      .where('vehicle_id', vehicleId)
      .whereNot('id', excludeId)
      .whereNot('status', 'cancelled')
      .where('start_date', '<=', endDate)
      .where('end_date', '>=', startDate)
      .first();

    if (overlappingRental) {
      throw new ApiError(
        httpStatus.CONFLICT,
        `Vehicle already has an active rental (rental #${overlappingRental.id}) overlapping these dates`,
      );
    }
  }

  private calculateDays(startDate: string, endDate: string): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffMs = end.getTime() - start.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    return Math.max(diffDays, 1);
  }

  async findAll(filters: IRentalFilters): Promise<IPaginatedResult<IRental>> {
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const offset = (page - 1) * limit;

    const query = db('rentals as r');

    if (filters.vehicle_id) {
      query.where('r.vehicle_id', filters.vehicle_id);
    }
    if (filters.status) {
      query.where('r.status', filters.status);
    }
    if (filters.start_date) {
      query.where('r.start_date', '>=', filters.start_date);
    }
    if (filters.end_date) {
      query.where('r.end_date', '<=', filters.end_date);
    }

    const countQuery = query.clone().count('* as count').first();
    const dataQuery = query
      .clone()
      .select(
        'r.id',
        'r.vehicle_id',
        'r.customer_name',
        'r.customer_phone',
        'r.start_date',
        'r.end_date',
        'r.total_amount',
        'r.status',
        'r.created_at',
        'r.updated_at',
      )
      .orderBy('r.created_at', 'desc')
      .limit(limit)
      .offset(offset);

    const [countResult, data] = await Promise.all([countQuery, dataQuery]);
    const total = parseInt(String(countResult?.count || '0'), 10);

    return {
      data,
      meta: { page, limit, total },
    };
  }

  async findById(id: number): Promise<IRental> {
    const rental = await db('rentals')
      .select(
        'id',
        'vehicle_id',
        'customer_name',
        'customer_phone',
        'start_date',
        'end_date',
        'total_amount',
        'status',
        'created_at',
        'updated_at',
      )
      .where({ id })
      .first();

    if (!rental) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Rental not found');
    }

    return rental;
  }

  async create(body: ICreateRentalBody): Promise<IRental> {
    const { vehicle_id, customer_name, customer_phone, start_date, end_date } = body;

    return await db.transaction(async (trx) => {
      const vehicle = await trx('vehicles')
        .select('daily_rate')
        .where({ id: vehicle_id })
        .whereNull('deleted_at')
        .first();

      if (!vehicle) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Vehicle not found');
      }

      const dailyRate = parseFloat(String(vehicle.daily_rate));

      await this.checkOverlap(vehicle_id, start_date, end_date, 0, trx);

      const days = this.calculateDays(start_date, end_date);
      const totalAmount = parseFloat((dailyRate * days).toFixed(2));

      const [rental] = await trx('rentals')
        .insert({
          vehicle_id,
          customer_name,
          customer_phone,
          start_date,
          end_date,
          total_amount: totalAmount,
          status: 'booked',
        })
        .returning('*');

      return rental;
    });
  }

  async update(id: number, body: IUpdateRentalBody): Promise<IRental> {
    const existing = await this.findById(id);

    return await db.transaction(async (trx) => {
      const effectiveVehicleId = body.vehicle_id ?? existing.vehicle_id;
      const effectiveStartDate =
        body.start_date ?? new Date(existing.start_date).toISOString().split('T')[0];
      const effectiveEndDate =
        body.end_date ?? new Date(existing.end_date).toISOString().split('T')[0];

      const datesChanged =
        body.start_date !== undefined ||
        body.end_date !== undefined ||
        body.vehicle_id !== undefined;

      if (datesChanged) {
        await this.checkOverlap(effectiveVehicleId, effectiveStartDate, effectiveEndDate, id, trx);
      }

      const updateData: any = {};

      if (body.vehicle_id !== undefined) updateData.vehicle_id = body.vehicle_id;
      if (body.customer_name !== undefined) updateData.customer_name = body.customer_name;
      if (body.customer_phone !== undefined) updateData.customer_phone = body.customer_phone;
      if (body.start_date !== undefined) updateData.start_date = body.start_date;
      if (body.end_date !== undefined) updateData.end_date = body.end_date;
      if (body.status !== undefined) updateData.status = body.status;

      if (datesChanged) {
        const vehicle = await trx('vehicles')
          .select('daily_rate')
          .where({ id: effectiveVehicleId })
          .whereNull('deleted_at')
          .first();

        if (!vehicle) {
          throw new ApiError(httpStatus.NOT_FOUND, 'Vehicle not found');
        }

        const dailyRate = parseFloat(String(vehicle.daily_rate));
        const days = this.calculateDays(effectiveStartDate, effectiveEndDate);
        const totalAmount = parseFloat((dailyRate * days).toFixed(2));
        updateData.total_amount = totalAmount;
      }

      updateData.updated_at = db.fn.now();

      const [updatedRental] = await trx('rentals').where({ id }).update(updateData).returning('*');

      if (!updatedRental) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Rental not found');
      }

      return updatedRental;
    });
  }

  async delete(id: number): Promise<void> {
    const [deletedRental] = await db('rentals').where({ id }).del().returning('id');

    if (!deletedRental) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Rental not found');
    }
  }
}

export const RentalServices = new RentalService();
