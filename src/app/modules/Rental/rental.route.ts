import express from 'express';
import { RentalController } from './rental.controller';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { createRentalValidation, updateRentalValidation } from './rental.validation';

const router = express.Router();

// router.use(auth());

router.get('/', auth(), RentalController.findAll);
router.get('/:id', auth(), RentalController.findById);
router.post('/', auth(), validateRequest(createRentalValidation), RentalController.create);
router.put('/:id', auth(), validateRequest(updateRentalValidation), RentalController.update);
router.delete('/:id', auth(), RentalController.delete);

export const RentalRoutes = router;
