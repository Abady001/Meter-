import { ExecutionContext, CallHandler } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { of, throwError } from 'rxjs';
import { AuditInterceptor } from '../../src/audit/audit.interceptor';
import { AuditService } from '../../src/audit/audit.service';
import { AUDIT_RESOURCE_KEY, AUDIT_ACTION_KEY } from '../../src/audit/audit.decorator';

describe('AuditInterceptor', () => {
  let interceptor: AuditInterceptor;
  let reflector: jest.Mocked<Reflector>;
  let auditService: jest.Mocked<AuditService>;

  beforeEach(() => {
    reflector = {
      get: jest.fn(),
      getAllAndOverride: jest.fn(),
      getAllAndMerge: jest.fn(),
      getAll: jest.fn(),
    } as unknown as jest.Mocked<Reflector>;

    auditService = {
      create: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<AuditService>;

    interceptor = new AuditInterceptor(reflector, auditService);
  });

  const mockContext = (
    method: string,
    user?: { userId?: string; role?: string; sub?: string },
    params?: Record<string, string>,
    body?: Record<string, unknown>,
    correlationId?: string,
  ): ExecutionContext =>
    ({
      switchToHttp: () => ({
        getRequest: () => ({
          method,
          user,
          params: params ?? {},
          body,
          correlationId,
        }),
      }),
      getHandler: () => ({}),
      getClass: () => ({}),
    }) as unknown as ExecutionContext;

  const mockCallHandler = (response: unknown): CallHandler => ({
    handle: () => of(response),
  });

  describe('GET and OPTIONS bypass', () => {
    it('should skip audit logging for GET requests', (done) => {
      const context = mockContext('GET', { userId: 'user-1', role: 'operator' });

      interceptor.intercept(context, mockCallHandler({ data: 'ok' })).subscribe({
        next: (result) => {
          expect(result).toEqual({ data: 'ok' });
          expect(auditService.create).not.toHaveBeenCalled();
          done();
        },
      });
    });

    it('should skip audit logging for OPTIONS requests', (done) => {
      const context = mockContext('OPTIONS', { userId: 'user-1', role: 'operator' });

      interceptor.intercept(context, mockCallHandler({ data: 'ok' })).subscribe({
        next: (result) => {
          expect(auditService.create).not.toHaveBeenCalled();
          done();
        },
      });
    });
  });

  describe('mutation audit logging', () => {
    it('should log audit for POST requests', (done) => {
      reflector.get.mockReturnValueOnce('meter').mockReturnValueOnce('CREATE');
      const context = mockContext('POST', { userId: 'user-1', role: 'operator' }, {}, { name: 'meter-1' }, 'corr-123');

      interceptor.intercept(context, mockCallHandler({ id: 'meter-1' })).subscribe({
        next: () => {
          expect(auditService.create).toHaveBeenCalledWith(
            expect.objectContaining({
              actorId: 'user-1',
              actorRole: 'operator',
              action: 'CREATE',
              resourceType: 'meter',
              correlationId: 'corr-123',
            }),
          );
          done();
        },
      });
    });

    it('should log audit for PUT requests', (done) => {
      reflector.get.mockReturnValueOnce('meter').mockReturnValueOnce('UPDATE');
      const context = mockContext(
        'PUT',
        { userId: 'user-2', role: 'admin' },
        { id: 'meter-5' },
        { status: 'active', reading: 100 },
      );

      interceptor.intercept(context, mockCallHandler({ id: 'meter-5', status: 'active' })).subscribe({
        next: () => {
          expect(auditService.create).toHaveBeenCalledWith(
            expect.objectContaining({
              actorId: 'user-2',
              actorRole: 'admin',
              action: 'UPDATE',
              resourceType: 'meter',
              resourceId: 'meter-5',
            }),
          );
          done();
        },
      });
    });

    it('should log audit for PATCH requests', (done) => {
      reflector.get.mockReturnValueOnce('invoice').mockReturnValueOnce('PATCH');
      const context = mockContext(
        'PATCH',
        { userId: 'user-3', role: 'finance' },
        { id: 'inv-10' },
        { status: 'paid' },
      );

      interceptor.intercept(context, mockCallHandler({ id: 'inv-10', status: 'paid' })).subscribe({
        next: () => {
          expect(auditService.create).toHaveBeenCalledWith(
            expect.objectContaining({
              actorRole: 'finance',
              action: 'PATCH',
              resourceType: 'invoice',
              resourceId: 'inv-10',
            }),
          );
          done();
        },
      });
    });

    it('should log audit for DELETE requests', (done) => {
      reflector.get.mockReturnValueOnce('user').mockReturnValueOnce('DELETE');
      const context = mockContext('DELETE', { userId: 'user-4', role: 'super_admin' }, { id: 'user-99' });

      interceptor.intercept(context, mockCallHandler({ deleted: true })).subscribe({
        next: () => {
          expect(auditService.create).toHaveBeenCalledWith(
            expect.objectContaining({
              actorRole: 'super_admin',
              action: 'DELETE',
              resourceType: 'user',
              resourceId: 'user-99',
            }),
          );
          done();
        },
      });
    });

    it('should use fallback values when no metadata is set', (done) => {
      reflector.get.mockReturnValueOnce(undefined).mockReturnValueOnce(undefined);
      const context = mockContext('POST', { sub: 'user-1' }, {}, { data: 'test' });

      interceptor.intercept(context, mockCallHandler({ result: 'ok' })).subscribe({
        next: () => {
          expect(auditService.create).toHaveBeenCalledWith(
            expect.objectContaining({
              actorId: 'user-1',
              action: 'POST',
              resourceType: 'unknown',
            }),
          );
          done();
        },
      });
    });
  });

  describe('before/after snapshot capture', () => {
    it('should capture beforeState for PUT requests', (done) => {
      reflector.get.mockReturnValueOnce('meter').mockReturnValueOnce('UPDATE');
      const context = mockContext('PUT', { userId: 'user-1', role: 'operator' }, { id: 'm-1' }, { status: 'active' });

      interceptor.intercept(context, mockCallHandler({ id: 'm-1', status: 'active' })).subscribe({
        next: () => {
          expect(auditService.create).toHaveBeenCalledWith(
            expect.objectContaining({
              beforeState: { status: 'active' },
              afterState: { id: 'm-1', status: 'active' },
            }),
          );
          done();
        },
      });
    });

    it('should not include beforeState for POST requests', (done) => {
      reflector.get.mockReturnValueOnce('meter').mockReturnValueOnce('CREATE');
      const context = mockContext('POST', { userId: 'user-1', role: 'operator' }, {}, { name: 'new-meter' });

      interceptor.intercept(context, mockCallHandler({ id: 'm-2', name: 'new-meter' })).subscribe({
        next: () => {
          expect(auditService.create).toHaveBeenCalledWith(
            expect.objectContaining({
              beforeState: undefined,
            }),
          );
          done();
        },
      });
    });
  });

  describe('actor extraction', () => {
    it('should extract userId from request.user', (done) => {
      reflector.get.mockReturnValueOnce('test').mockReturnValueOnce('POST');
      const context = mockContext('POST', { userId: 'specific-user', role: 'operator' });

      interceptor.intercept(context, mockCallHandler({})).subscribe({
        next: () => {
          expect(auditService.create).toHaveBeenCalledWith(
            expect.objectContaining({ actorId: 'specific-user' }),
          );
          done();
        },
      });
    });

    it('should fallback to sub when userId is missing', (done) => {
      reflector.get.mockReturnValueOnce('test').mockReturnValueOnce('POST');
      const context = mockContext('POST', { sub: 'sub-user', role: 'operator' });

      interceptor.intercept(context, mockCallHandler({})).subscribe({
        next: () => {
          expect(auditService.create).toHaveBeenCalledWith(
            expect.objectContaining({ actorId: 'sub-user' }),
          );
          done();
        },
      });
    });

    it('should fallback to anonymous when no user', (done) => {
      reflector.get.mockReturnValueOnce('test').mockReturnValueOnce('POST');
      const context = mockContext('POST', undefined);

      interceptor.intercept(context, mockCallHandler({})).subscribe({
        next: () => {
          expect(auditService.create).toHaveBeenCalledWith(
            expect.objectContaining({ actorId: 'anonymous', actorRole: 'anonymous' }),
          );
          done();
        },
      });
    });
  });

  describe('failure-safe behavior', () => {
    it('should not block the response when audit service fails', (done) => {
      auditService.create.mockRejectedValue(new Error('Audit failed'));
      reflector.get.mockReturnValueOnce('test').mockReturnValueOnce('POST');
      const context = mockContext('POST', { userId: 'user-1', role: 'operator' });

      interceptor.intercept(context, mockCallHandler({ success: true })).subscribe({
        next: (result) => {
          expect(result).toEqual({ success: true });
          done();
        },
      });
    });
  });
});
