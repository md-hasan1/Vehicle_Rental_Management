import express from 'express';
import { AuthController } from './auth.controller';
import validateRequest from '../../middlewares/validateRequest';
import { loginValidation } from './auth.validation';

const router = express.Router();

router.post('/login', validateRequest(loginValidation), AuthController.login);

export const AuthRoutes = router;
