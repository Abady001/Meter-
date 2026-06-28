import { Injectable, HttpException, HttpStatus, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/database/prisma.service';
import { ThresholdService } from '../projects/thresholds/threshold.service';
import { CreateReadingDto } from './dto/create-reading.dto';
import { ReadingResponseDto } from './dto/reading-response.dto';

@Injectable()
export class ReadingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly thresholdService: ThresholdService
  ) {}

  private async toDto(reading: any): Promise<ReadingResponseDto> {
    let meterSerial = '';
    let meterType: any = 'electricity';
    if (reading.meterId) {
      const meter = await this.prisma.meter.findUnique({
        where: { id: reading.meterId },
        select: { serialNumber: true, meterType: true },
      });
      if (meter) {
        meterSerial = meter.serialNumber;
        meterType = meter.meterType;
      }
    }

    return {
      id: reading.id,
      meterId: reading.meterId,
      meterSerial,
      meterType: meterType as any,
      customerId: reading.customerIdSnapshot || undefined,
      customerName: undefined,
      unitId: reading.unitIdSnapshot || undefined,
      unitNumber: undefined,
      projectId: reading.projectId || undefined,
      previousReading: reading.previousReadingValue ? Number(reading.previousReadingValue) : 0,
      currentReading: Number(reading.readingValue),
      consumption: reading.consumptionValue ? Number(reading.consumptionValue) : 0,
      readingDate: reading.readingAt instanceof Date
        ? reading.readingAt.toISOString()
        : new Date(reading.readingAt).toISOString(),
      source: reading.source as any,
      status: reading.status as any,
      anomaly: reading.status === 'suspicious',
      enteredBy: reading.enteredBy,
      notes: reading.notes || undefined,
      projectThresholdProfile: null,
    };
  }

  async findAll(projectId?: string): Promise<ReadingResponseDto[]> {
    const where: any = {};
    if (projectId) where.projectId = projectId;

    const readings = await this.prisma.reading.findMany({
      where,
      orderBy: { readingAt: 'desc' },
      take: 500,
    });

    return Promise.all(readings.map((r) => this.toDto(r)));
  }

  async findOne(id: string): Promise<ReadingResponseDto> {
    const reading = await this.prisma.reading.findUnique({ where: { id } });
    if (!reading) throw new NotFoundException(`Reading ${id} not found`);
    return this.toDto(reading);
  }

  async listReviewQueue(filters: {
    projectId?: string;
    status?: string;
  }): Promise<{ items: ReadingResponseDto[] }> {
    const where: any = {
      status: { in: ['pending_review', 'suspicious'] }
    };
    if (filters.projectId) where.projectId = filters.projectId;
    if (filters.status) where.status = filters.status;

    const readings = await this.prisma.reading.findMany({ where, orderBy: { readingAt: 'desc' } });

    return {
      items: await Promise.all(readings.map((r) => this.toDto(r)))
    };
  }

  async createReading(dto: CreateReadingDto, userId: string): Promise<ReadingResponseDto> {
    const previous = await this.prisma.reading.findFirst({
      where: { meterId: dto.meterId },
      orderBy: { readingAt: 'desc' }
    });

    const previousReadingValue = previous ? Number(previous.readingValue) : null;
    const currentValue = dto.readingValue;
    let consumptionValue: number | null = null;

    if (previousReadingValue !== null) {
      consumptionValue = currentValue - previousReadingValue;
    }

    const profile = await this.thresholdService.getProfile(dto.projectId);
    let status = 'valid';
    let profileName: string | null = null;

    if (
      consumptionValue !== null &&
      consumptionValue < 0 &&
      profile.alertOnNegativeConsumption !== false
    ) {
      status = 'suspicious';
      profileName = 'negative-consumption';
    }

    if (
      consumptionValue !== null &&
      consumptionValue === 0 &&
      profile.alertOnZeroConsumption === true
    ) {
      status = 'pending_review';
      profileName = 'zero-consumption';
    }

    if (
      profile.maxConsumptionPerMonth !== null &&
      profile.maxConsumptionPerMonth !== undefined &&
      consumptionValue !== null
    ) {
      if (consumptionValue > profile.maxConsumptionPerMonth) {
        status = 'pending_review';
        profileName = 'high-consumption';
      }
    }

    if (
      consumptionValue !== null &&
      profile.alertOnSpike === true &&
      profile.spikeMultiplier !== null &&
      profile.spikeMultiplier !== undefined
    ) {
      const avgConsumption = await this.getAverageConsumption(dto.meterId);
      if (avgConsumption > 0 && consumptionValue > avgConsumption * profile.spikeMultiplier) {
        status = 'suspicious';
        profileName = 'spike-detected';
      }
    }

    let reading;
    try {
      reading = await this.prisma.reading.create({
        data: {
          meterId: dto.meterId,
          projectId: dto.projectId,
          customerIdSnapshot: '',
          unitIdSnapshot: '',
          readingValue: currentValue,
          readingAt: new Date(dto.readingAt),
          source: dto.source as any,
          previousReadingValue: previousReadingValue ?? undefined,
          consumptionValue: consumptionValue ?? undefined,
          status: status as any,
          rawPayload: dto.rawPayload ? JSON.parse(JSON.stringify(dto.rawPayload)) : undefined,
          enteredBy: userId
        }
      });
    } catch (err: any) {
      if (err?.code === 'P2002') {
        throw new HttpException(
          'Duplicate reading: meterId + readingAt + source already exists',
          HttpStatus.UNPROCESSABLE_ENTITY
        );
      }
      throw err;
    }

    return this.toDto(reading);
  }

  private async getAverageConsumption(meterId: string): Promise<number> {
    const recent = await this.prisma.reading.findMany({
      where: { meterId, consumptionValue: { not: null } },
      orderBy: { readingAt: 'desc' },
      take: 5
    });
    if (recent.length === 0) return 0;
    const sum = recent.reduce((acc, r) => acc + Number(r.consumptionValue ?? 0), 0);
    return sum / recent.length;
  }
}
