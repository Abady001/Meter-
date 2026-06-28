import { Role } from '../types';

export interface JwtPayload {
  sub: string;
  userId?: string;
  role: Role;
  projectScope?: string;
  areas?: string[];
  iat?: number;
  exp?: number;
}
