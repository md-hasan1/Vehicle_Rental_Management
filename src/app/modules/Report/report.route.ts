import express from 'express';
import { ReportController } from './report.controller';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { reportQueryValidation } from './report.validation';

const router = express.Router();

router.get(
  '/rentals',
  auth(),
  validateRequest(reportQueryValidation, 'query'),
  ReportController.getMonthlyReport,
);

export const ReportRoutes = router;
