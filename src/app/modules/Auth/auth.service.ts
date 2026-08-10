import bcrypt from 'bcrypt';
import httpStatus from 'http-status';
import db from '../../db/connection';
import config from '../../../config';
import ApiError from '../../../errors/ApiErrors';
import { jwtHelpers } from '../../../helpars/jwtHelpers';
import { ILoginBody, ILoginResponse } from './auth.interface';

class AuthService {
  async login(body: ILoginBody): Promise<ILoginResponse> {
    const { email, password } = body;

    const staff = await db('staff')
      .select('id', 'email', 'password_hash', 'name', 'created_at', 'updated_at')
      .where('email', email)
      .first();

    if (!staff) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }

    const isPasswordValid = await bcrypt.compare(password, staff.password_hash);

    if (!isPasswordValid) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid password');
    }

    const token = jwtHelpers.generateToken(
      { id: staff.id, email: staff.email, name: staff.name },
      config.jwt.secret,
      config.jwt.expiresIn,
    );

    return {
      token,
      staff: {
        id: staff.id,
        email: staff.email,
        name: staff.name,
      },
    };
  }
}

export const AuthServices = new AuthService();
