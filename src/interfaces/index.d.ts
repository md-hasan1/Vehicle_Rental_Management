import { IJwtPayload } from './common';

declare global {
  namespace Express {
    interface Request {
      user?: IJwtPayload;
    }
  }
}
