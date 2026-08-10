import express from 'express';
import { AuthRoutes } from '../modules/Auth/auth.routes';
import { VehicleRoutes } from '../modules/Vehicle/vehicle.route';
import { RentalRoutes } from '../modules/Rental/rental.route';
import { ReportRoutes } from '../modules/Report/report.route';

const router = express.Router();

const moduleRoutes = [
  {
    path: '/auth',
    route: AuthRoutes,
  },
  {
    path: '/vehicles',
    route: VehicleRoutes,
  },
  {
    path: '/rentals',
    route: RentalRoutes,
  },
  {
    path: '/reports',
    route: ReportRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
