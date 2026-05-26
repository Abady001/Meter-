import { ForbiddenException, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from '../../src/auth/roles.guard';
import { Role } from '../../src/auth/types';
import { ROLES_KEY } from '../../src/auth/roles.decorator';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: jest.Mocked<Reflector>;

  beforeEach(() => {
    reflector = {
      getAllAndOverride: jest.fn(),
      getAllAndMerge: jest.fn(),
      get: jest.fn(),
      getAll: jest.fn(),
    } as unknown as jest.Mocked<Reflector>;

    guard = new RolesGuard(reflector);
  });

  const mockContext = (user?: { role: string }): ExecutionContext =>
    ({
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
      getHandler: () => ({}),
      getClass: () => ({}),
    }) as unknown as ExecutionContext;

  describe('when no roles are required', () => {
    it('should allow access', () => {
      reflector.getAllAndOverride.mockReturnValue(undefined);
      const context = mockContext({ role: Role.OPERATOR });
      expect(guard.canActivate(context)).toBe(true);
    });

    it('should allow access when roles array is empty', () => {
      reflector.getAllAndOverride.mockReturnValue([]);
      const context = mockContext({ role: Role.OPERATOR });
      expect(guard.canActivate(context)).toBe(true);
    });
  });

  describe('when roles are required', () => {
    it('should allow access for a user with a matching role', () => {
      reflector.getAllAndOverride.mockReturnValue([Role.OPERATOR]);
      const context = mockContext({ role: Role.OPERATOR });
      expect(guard.canActivate(context)).toBe(true);
    });

    it('should deny access for a user without a matching role', () => {
      reflector.getAllAndOverride.mockReturnValue([Role.SUPER_ADMIN]);
      const context = mockContext({ role: Role.OPERATOR });
      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('should deny access when user is not authenticated', () => {
      reflector.getAllAndOverride.mockReturnValue([Role.OPERATOR]);
      const context = mockContext(undefined);
      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('should deny access when user object is missing from request', () => {
      reflector.getAllAndOverride.mockReturnValue([Role.OPERATOR]);
      const context = mockContext(undefined);
      expect(() => guard.canActivate(context)).toThrow('Authentication required');
    });

    it('should allow access for multiple roles when user has one', () => {
      reflector.getAllAndOverride.mockReturnValue([Role.SUPER_ADMIN, Role.OPERATOR]);
      const context = mockContext({ role: Role.OPERATOR });
      expect(guard.canActivate(context)).toBe(true);
    });

    it('should deny access when user role does not match any required role', () => {
      reflector.getAllAndOverride.mockReturnValue([Role.SUPER_ADMIN, Role.PROJECT_ADMIN]);
      const context = mockContext({ role: Role.TECHNICIAN });
      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('should include required roles in the error message', () => {
      reflector.getAllAndOverride.mockReturnValue([Role.SUPER_ADMIN, Role.PROJECT_ADMIN]);
      const context = mockContext({ role: Role.TECHNICIAN });
      try {
        guard.canActivate(context);
      } catch (e) {
        const error = e as ForbiddenException;
        expect(error.message).toContain(Role.SUPER_ADMIN);
        expect(error.message).toContain(Role.PROJECT_ADMIN);
      }
    });
  });

  describe('role enum values match frontend expectations', () => {
    it('should have super_admin role', () => {
      expect(Role.SUPER_ADMIN).toBe('super_admin');
    });

    it('should have project_admin role', () => {
      expect(Role.PROJECT_ADMIN).toBe('project_admin');
    });

    it('should have operator role', () => {
      expect(Role.OPERATOR).toBe('operator');
    });

    it('should have technician role', () => {
      expect(Role.TECHNICIAN).toBe('technician');
    });

    it('should have finance role', () => {
      expect(Role.FINANCE).toBe('finance');
    });

    it('should have support role', () => {
      expect(Role.SUPPORT).toBe('support');
    });

    it('should have customer role', () => {
      expect(Role.CUSTOMER).toBe('customer');
    });

    it('should contain exactly 7 roles matching frontend UserRole type', () => {
      const roles = Object.values(Role);
      expect(roles).toHaveLength(7);
      expect(roles.sort()).toEqual([
        'customer',
        'finance',
        'operator',
        'project_admin',
        'super_admin',
        'support',
        'technician',
      ]);
    });
  });
});
