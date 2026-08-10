import Joi from 'joi';
import { RentalStatus } from './rental.interface';

export const createRentalValidation = Joi.object({
  vehicle_id: Joi.number().integer().positive().required().messages({
    'any.required': 'Vehicle ID is required',
  }),
  customer_name: Joi.string().trim().min(1).max(255).required().messages({
    'any.required': 'Customer name is required',
  }),
  customer_phone: Joi.string().trim().min(1).max(50).required().messages({
    'any.required': 'Customer phone is required',
  }),
  start_date: Joi.date().iso().required().messages({
    'date.format': 'Start date must be in YYYY-MM-DD format',
    'any.required': 'Start date is required',
  }),
  end_date: Joi.date().iso().min(Joi.ref('start_date')).required().messages({
    'date.min': 'End date must be on or after start date',
    'date.format': 'End date must be in YYYY-MM-DD format',
    'any.required': 'End date is required',
  }),
});

export const updateRentalValidation = Joi.object({
  vehicle_id: Joi.number().integer().positive(),
  customer_name: Joi.string().trim().min(1).max(255),
  customer_phone: Joi.string().trim().min(1).max(50),
  start_date: Joi.date().iso(),
  end_date: Joi.date().iso(),
  status: Joi.string().valid(
    RentalStatus.BOOKED,
    RentalStatus.ONGOING,
    RentalStatus.COMPLETED,
    RentalStatus.CANCELLED,
  ),
})
  .min(1)
  .messages({
    'object.min': 'At least one field must be provided for update',
  });

export const rentalQueryValidation = Joi.object({
  vehicle_id: Joi.number().integer().positive(),
  status: Joi.string().valid(
    RentalStatus.BOOKED,
    RentalStatus.ONGOING,
    RentalStatus.COMPLETED,
    RentalStatus.CANCELLED,
  ),
  start_date: Joi.date().iso(),
  end_date: Joi.date().iso(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
});
