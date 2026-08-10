import express from 'express';
import { VehicleController } from './vehicle.controller';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import upload from '../../middlewares/upload';
import { createVehicleValidation, updateVehicleValidation } from './vehicle.validation';

const router = express.Router();


router.get('/',  auth(),VehicleController.findAll);
router.get('/:id', auth(),VehicleController.findById);

router.post(
  '/',
  auth(),
  upload.single('photo'),
  validateRequest(createVehicleValidation),
  VehicleController.create,
);

router.put(
  '/:id',
  auth(),
  upload.single('photo'),
  validateRequest(updateVehicleValidation),
  VehicleController.update,
);

router.delete('/:id', auth(),VehicleController.softDelete);

export const VehicleRoutes = router;
