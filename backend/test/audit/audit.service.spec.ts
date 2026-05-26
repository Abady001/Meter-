import { Test, TestingModule } from '@nestjs/testing';
import { AuditService } from '../../src/audit/audit.service';
import { PrismaService } from '../../src/common/database/prisma.service';

describe('AuditService', () => {
  let service: AuditService;
  let prisma: jest.Mocked<PrismaService>;

  const mockAuditLog = {
    create: jest.fn(),
  };

  beforeEach(async () => {
    prisma = {
      auditLog: mockAuditLog,
    } as unknown as jest.Mocked<PrismaService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<AuditService>(AuditService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create an audit log entry with all fields', async () => {
      mockAuditLog.create.mockResolvedValue({ id: 'audit-1' });

      await service.create({
        actorId: 'user-1',
        actorRole: 'operator',
        action: 'UPDATE',
        resourceType: 'meter',
        resourceId: 'meter-1',
        beforeState: { status: 'active' },
        afterState: { status: 'inactive' },
        correlationId: 'corr-123',
      });

      expect(mockAuditLog.create).toHaveBeenCalledWith({
        data: {
          actorId: 'user-1',
          actorRole: 'operator',
          action: 'UPDATE',
          resourceType: 'meter',
          resourceId: 'meter-1',
          beforeState: { status: 'active' },
          afterState: { status: 'inactive' },
          reason: null,
          correlationId: 'corr-123',
        },
      });
    });

    it('should create an audit entry with minimal fields', async () => {
      mockAuditLog.create.mockResolvedValue({ id: 'audit-2' });

      await service.create({
        actorId: 'system',
        actorRole: 'super_admin',
        action: 'DELETE',
        resourceType: 'user',
        resourceId: 'user-5',
      });

      expect(mockAuditLog.create).toHaveBeenCalledWith({
        data: {
          actorId: 'system',
          actorRole: 'super_admin',
          action: 'DELETE',
          resourceType: 'user',
          resourceId: 'user-5',
          beforeState: undefined,
          afterState: undefined,
          reason: null,
          correlationId: null,
        },
      });
    });

    it('should not throw when Prisma write fails (fail-safe)', async () => {
      mockAuditLog.create.mockRejectedValue(new Error('DB connection lost'));

      await expect(
        service.create({
          actorId: 'user-1',
          actorRole: 'operator',
          action: 'UPDATE',
          resourceType: 'meter',
          resourceId: 'meter-1',
        }),
      ).resolves.toBeUndefined();
    });

    it('should include reason when provided', async () => {
      mockAuditLog.create.mockResolvedValue({ id: 'audit-3' });

      await service.create({
        actorId: 'user-1',
        actorRole: 'finance',
        action: 'ADJUST',
        resourceType: 'invoice',
        resourceId: 'inv-123',
        reason: 'Customer dispute resolved',
      });

      expect(mockAuditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            reason: 'Customer dispute resolved',
          }),
        }),
      );
    });
  });
});
