import Joi from 'joi';

export const createVehicleValidation = Joi.object({
  name: Joi.string().trim().min(1).max(255).required().messages({
    'any.required': 'Vehicle name is required',
  }),
  plate_number: Joi.string().trim().min(1).max(50).required().messages({
    'any.required': 'Plate number is required',
  }),
  category: Joi.string().trim().min(1).max(100).required().messages({
    'any.required': 'Category is required',
  }),
  daily_rate: Joi.number().positive().precision(2).required().messages({
    'number.positive': 'Daily rate must be a positive number',
    'any.required': 'Daily rate is required',
  }),
});

export const updateVehicleValidation = Joi.object({
  name: Joi.string().trim().min(1).max(255),
  plate_number: Joi.string().trim().min(1).max(50),
  category: Joi.string().trim().min(1).max(100),
  daily_rate: Joi.number().positive().precision(2),
})
  .min(1)
  .messages({
    'object.min': 'At least one field must be provided for update',
  });
