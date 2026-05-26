import { Role } from '../types';

export interface JwtPayload {
  sub: string;
  userId?: string;
  role: Role;
  projectScope?: string;
  iat?: number;
  exp?: number;
}
