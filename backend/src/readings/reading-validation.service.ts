import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../common/database/prisma.service';

@Injectable()
export class ReadingValidationService {
  private readonly logger = new Logger(ReadingValidationService.name);

  constructor(private readonly prisma: PrismaService) {}

  async validateReading(meterId: string, readingDate: Date, readingValue: number): Promise<{
    valid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 1. Meter exists
    const meter = await this.prisma.meter.findUnique({ where: { id: meterId } });
    if (!meter) { errors.push('Meter not found'); return { valid: false, errors, warnings }; }

    // 2. Meter is ACTIVE
    if (meter.status !== 'active') errors.push('Meter is not ACTIVE');

    // 3. Installation date exists and reading is after it
    if (!meter.installationDate) errors.push('No installation date');
    else if (readingDate < meter.installationDate) errors.push('Reading before installation date');

    // 4. No duplicate reading (same meter + same date)
    const dup = await this.prisma.reading.findFirst({
      where: { meterId, readingAt: readingDate },
    });
    if (dup) errors.push('Duplicate reading — same meter and date already exists');

    // 5. No future reading
    if (readingDate > new Date()) errors.push('Future reading not allowed');

    // 6. Reading sequence: must be after previous reading
    const prev = await this.prisma.reading.findFirst({
      where: { meterId },
      orderBy: { readingAt: 'desc' },
    });
    if (prev) {
      if (readingDate <= prev.readingAt) errors.push('Reading must be after previous reading date');
      if (readingValue < Number(prev.readingValue)) errors.push('Reading rollback — value decreased from previous');
      // Check month continuity
      const prevMonth = prev.readingAt.getMonth();
      const currMonth = readingDate.getMonth();
      const prevYear = prev.readingAt.getFullYear();
      const currYear = readingDate.getFullYear();
      const monthDiff = (currYear - prevYear) * 12 + (currMonth - prevMonth);
      if (monthDiff > 1) errors.push(`Missing month: ${monthDiff - 1} month(s) skipped`);
    }

    // 7. No negative consumption
    if (prev && readingValue < Number(prev.readingValue)) errors.push('Negative consumption');

    // 8. Consumption overflow
    if (prev) {
      const consumption = readingValue - Number(prev.readingValue);
      if (consumption > 100000) warnings.push('Consumption unusually high (>100,000)');
    }

    return { valid: errors.length === 0, errors, warnings };
  }

  async getMeterStatus(meterId: string): Promise<{ canSyncReading: boolean; reason: string }> {
    const meter = await this.prisma.meter.findUnique({ where: { id: meterId } });
    if (!meter) return { canSyncReading: false, reason: 'Meter not found' };
    if (meter.status !== 'active') return { canSyncReading: false, reason: `Meter status is ${meter.status}, must be ACTIVE` };
    if (!meter.installationDate) return { canSyncReading: false, reason: 'No installation date' };

    const assignment = await this.prisma.meterAssignment.findFirst({
      where: { meterId, status: 'active' },
    });
    if (!assignment) return { canSyncReading: false, reason: 'No unit assigned' };

    const tariff = await this.prisma.tariffPlan.findFirst({
      where: { projectId: meter.projectId, status: 'active' },
    });
    if (!tariff) return { canSyncReading: false, reason: 'No tariff assigned' };

    return { canSyncReading: true, reason: 'OK' };
  }
}
