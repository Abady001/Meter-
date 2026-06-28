import { Controller, Get, Post, Param, Body, UseGuards, Query } from '@nestjs/common';
import { PrismaService } from '../common/database/prisma.service';
import { GlobalAuthGuard } from '../auth/global-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/types/role.enum';

@Controller('chilled-water')
@UseGuards(GlobalAuthGuard, RolesGuard)
export class ChilledWaterController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('meters')
  @Roles(Role.OPERATOR, Role.ADMIN, Role.SUPER_ADMIN)
  async listMeters() {
    return this.prisma.meter.findMany({ where: { meterType: { in: ['chilled_water', 'outdoor_unit'] } } });
  }

  @Post('readings')
  @Roles(Role.OPERATOR, Role.ADMIN, Role.SUPER_ADMIN, Role.METER_READER)
  async createReading(@Body() dto: { meterId: string; projectId: string; customerId: string; readingValue: number; readingAt?: string }) {
    return this.prisma.reading.create({
      data: {
        meterId: dto.meterId,
        projectId: dto.projectId,
        customerIdSnapshot: dto.customerId,
        unitIdSnapshot: '',
        readingValue: dto.readingValue,
        readingAt: dto.readingAt ? new Date(dto.readingAt) : new Date(),
        source: 'manual',
        enteredBy: 'chilled-water-api',
        status: 'valid',
      },
    });
  }

  @Get('readings/:meterId')
  @Roles(Role.OPERATOR, Role.ADMIN, Role.SUPER_ADMIN, Role.METER_READER)
  async getReadings(@Param('meterId') meterId: string) {
    return this.prisma.reading.findMany({ where: { meterId }, orderBy: { readingAt: 'desc' }, take: 50 });
  }

  @Post('simulate')
  @Roles(Role.OPERATOR, Role.ADMIN, Role.SUPER_ADMIN)
  async simulate(@Body() dto: { previousReading: number; currentReading: number; ratePerBTU?: number }) {
    const consumption = Math.max(dto.currentReading - dto.previousReading, 0);
    const rate = dto.ratePerBTU ?? 3.0;
    const charge = consumption * rate;
    return { consumption, rate, charge, vat: charge * 0.14, total: charge * 1.14 };
  }

  @Get('dashboard')
  @Roles(Role.OPERATOR, Role.ADMIN, Role.SUPER_ADMIN)
  async getDashboard() {
    const meters = await this.prisma.meter.findMany({ where: { meterType: 'chilled_water' } });
    const outdoorUnits = await this.prisma.meter.findMany({ where: { meterType: 'outdoor_unit' } });
    const meterIds = [...meters, ...outdoorUnits].map(m => m.id);
    const readings = meterIds.length > 0 ? await this.prisma.reading.findMany({ where: { meterId: { in: meterIds } } }) : [];
    const totalConsumption = readings.reduce((s, r) => s + Number(r.readingValue), 0);
    return { meters: meters.length, outdoorUnits: outdoorUnits.length, readings: readings.length, totalConsumption: Number(totalConsumption.toFixed(3)) };
  }
}
