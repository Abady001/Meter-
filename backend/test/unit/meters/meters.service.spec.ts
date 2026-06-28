import { Test, TestingModule } from '@nestjs/testing';
import { MetersService } from '../../../src/meters/meters.service';
import { MeterStateService } from '../../../src/meters/meter-state.service';
import { PrismaService } from '../../../src/common/database/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('MetersService', () => {
  let service: MetersService;
  let prisma: any;

  const mockMeter = {
    id: 'meter-1',
    serialNumber: 'MTR-001',
    meterType: 'electricity',
    brand: 'TestBrand',
    model: 'TM-100',
    status: 'available',
    installationDate: new Date('2026-01-01'),
    activationDate: new Date('2026-01-15'),
    terminationDate: null,
    projectId: 'proj-1',
    locationId: null,
    parentMainMeterId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'user-1',
    updatedBy: 'user-1'
  };

  beforeEach(async () => {
    prisma = {
      meter: {
        create: jest.fn().mockResolvedValue(mockMeter),
        findMany: jest.fn().mockResolvedValue([mockMeter]),
        findUnique: jest.fn().mockResolvedValue(mockMeter),
        update: jest.fn().mockResolvedValue({ ...mockMeter, status: 'retired' })
      }
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [MetersService, MeterStateService, { provide: PrismaService, useValue: prisma }]
    }).compile();

    service = module.get<MetersService>(MetersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a meter with status available', async () => {
      const dto = {
        serialNumber: 'MTR-001',
        meterType: 'electricity' as const,
        brand: 'TestBrand',
        model: 'TM-100',
        installationDate: '2026-01-01T00:00:00Z',
        activationDate: '2026-01-15T00:00:00Z',
        projectId: 'proj-1'
      };
      const result = await service.create(dto, 'user-1');
      expect(result.serialNumber).toBe('MTR-001');
      expect(prisma.meter.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ serialNumber: 'MTR-001', status: 'available' })
        })
      );
    });

    it('should create with optional locationId', async () => {
      const dto = {
        serialNumber: 'MTR-002',
        meterType: 'water_main' as const,
        brand: 'Brand',
        model: 'WM-200',
        installationDate: '2026-01-01T00:00:00Z',
        activationDate: '2026-01-15T00:00:00Z',
        projectId: 'proj-1',
        locationId: 'loc-1'
      };
      await service.create(dto, 'user-1');
      expect(prisma.meter.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ locationId: 'loc-1' })
        })
      );
    });
  });

  describe('findAll', () => {
    it('should return all meters', async () => {
      const result = await service.findAll();
      expect(result).toHaveLength(1);
      expect(result[0].serialNumber).toBe('MTR-001');
    });

    it('should filter by projectId', async () => {
      await service.findAll({ projectId: 'proj-1' });
      expect(prisma.meter.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ projectId: 'proj-1' })
        })
      );
    });

    it('should filter by status', async () => {
      await service.findAll({ status: 'available' });
      expect(prisma.meter.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: 'available' })
        })
      );
    });

    it('should filter by meterType', async () => {
      await service.findAll({ meterType: 'electricity' });
      expect(prisma.meter.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ meterType: 'electricity' })
        })
      );
    });
  });

  describe('findOne', () => {
    it('should return a meter by id', async () => {
      const result = await service.findOne('meter-1');
      expect(result.id).toBe('meter-1');
    });

    it('should throw NotFoundException when not found', async () => {
      prisma.meter.findUnique.mockResolvedValue(null);
      await expect(service.findOne('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a meter', async () => {
      const dto = { brand: 'UpdatedBrand' };
      const result = await service.update('meter-1', dto, 'user-1');
      expect(result.brand).toBe('TestBrand');
    });

    it('should throw NotFoundException when updating nonexistent meter', async () => {
      prisma.meter.findUnique.mockResolvedValue(null);
      await expect(service.update('nonexistent', {}, 'user-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should soft-delete a meter (status = retired)', async () => {
      await service.remove('meter-1', 'user-1');
      expect(prisma.meter.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'meter-1' },
          data: expect.objectContaining({ status: 'retired' })
        })
      );
    });

    it('should throw NotFoundException when removing nonexistent meter', async () => {
      prisma.meter.findUnique.mockResolvedValue(null);
      await expect(service.remove('nonexistent', 'user-1')).rejects.toThrow(NotFoundException);
    });
  });
});
