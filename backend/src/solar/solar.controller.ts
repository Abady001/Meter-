import { Controller, Get, Post, Param, Body, UseGuards, Query } from '@nestjs/common';
import { PrismaService } from '../common/database/prisma.service';
import { GlobalAuthGuard } from '../auth/global-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/types/role.enum';

@Controller('solar')
@UseGuards(GlobalAuthGuard, RolesGuard)
export class SolarController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('wallet/:customerId')
  @Roles(Role.OPERATOR, Role.ADMIN, Role.SUPER_ADMIN, Role.FINANCE)
  async getWallet(@Param('customerId') customerId: string) {
    const readings = await this.prisma.reading.findMany({
      where: { customerIdSnapshot: customerId },
      orderBy: { readingAt: 'desc' },
    });
    const totalProduction = readings.reduce((s, r) => s + Number(r.readingValue), 0);
    return {
      customerId,
      totalProduction: Number(totalProduction.toFixed(3)),
      readingCount: readings.length,
      availableCredits: Number((totalProduction * 0.5).toFixed(2)),
      latestReading: readings[0] ?? null,
    };
  }

  @Get('readings/:meterId')
  @Roles(Role.OPERATOR, Role.ADMIN, Role.SUPER_ADMIN, Role.METER_READER)
  async getReadings(@Param('meterId') meterId: string) {
    return this.prisma.reading.findMany({
      where: { meterId },
      orderBy: { readingAt: 'desc' },
      take: 50,
    });
  }

  @Post('readings')
  @Roles(Role.OPERATOR, Role.ADMIN, Role.SUPER_ADMIN, Role.METER_READER)
  async createReading(@Body() dto: { meterId: string; projectId: string; customerId: string; readingValue: number; readingAt?: string; enteredBy?: string }) {
    return this.prisma.reading.create({
      data: {
        meterId: dto.meterId,
        projectId: dto.projectId,
        customerIdSnapshot: dto.customerId,
        unitIdSnapshot: '',
        readingValue: dto.readingValue,
        readingAt: dto.readingAt ? new Date(dto.readingAt) : new Date(),
        source: 'manual',
        enteredBy: dto.enteredBy ?? 'solar-api',
        status: 'valid',
      },
    });
  }

  @Post('simulate')
  @Roles(Role.OPERATOR, Role.ADMIN, Role.SUPER_ADMIN)
  async simulate(@Body() dto: { consumptionBefore: number; consumptionAfter: number; productionBefore: number; productionAfter: number }) {
    const consumption = Math.max(dto.consumptionAfter - dto.consumptionBefore, 0);
    const production = Math.max(dto.productionAfter - dto.productionBefore, 0);
    const netUsage = Math.max(consumption - production, 0);
    const surplus = Math.max(production - consumption, 0);
    const creditBalance = Number((surplus * 0.5).toFixed(2));
    return {
      consumptionBefore: dto.consumptionBefore, consumptionAfter: dto.consumptionAfter, consumptionDelta: consumption,
      productionBefore: dto.productionBefore, productionAfter: dto.productionAfter, productionDelta: production,
      netUsage, surplus, creditBalance, carryForward: surplus > 0,
      totalCharge: netUsage * 1.5,
      vatAmount: netUsage * 1.5 * 0.14,
      grandTotal: netUsage * 1.5 * 1.14,
    };
  }

  @Get('dashboard')
  @Roles(Role.OPERATOR, Role.ADMIN, Role.SUPER_ADMIN)
  async getDashboard(@Query('period') period?: string) {
    const solarMeters = await this.prisma.meter.findMany({ where: { meterType: 'solar' } });
    const meterIds = solarMeters.map(m => m.id);
    const readings = meterIds.length > 0 ? await this.prisma.reading.findMany({
      where: { meterId: { in: meterIds } },
      orderBy: { readingAt: 'desc' },
    }) : [];
    const totalProduction = readings.reduce((s, r) => s + Number(r.readingValue), 0);
    const latestReading = readings[0] ?? null;
    return {
      totalMeters: solarMeters.length,
      totalReadings: readings.length,
      totalProduction: Number(totalProduction.toFixed(3)),
      avgProduction: readings.length > 0 ? Number((totalProduction / readings.length).toFixed(3)) : 0,
      latestReading,
    };
  }

  @Get('statement/:customerId')
  @Roles(Role.OPERATOR, Role.ADMIN, Role.SUPER_ADMIN)
  async getStatement(@Param('customerId') customerId: string) {
    const readings = await this.prisma.reading.findMany({
      where: { customerIdSnapshot: customerId },
      orderBy: { readingAt: 'desc' },
      take: 100,
    });
    const totalProduction = readings.reduce((s, r) => s + Number(r.readingValue), 0);
    const monthlyData = this.groupByMonth(readings);
    return { customerId, totalProduction, readingCount: readings.length, availableCredits: Number((totalProduction * 0.5).toFixed(2)), monthlyData };
  }

  private groupByMonth(readings: any[]) {
    const groups: Record<string, any> = {};
    for (const r of readings) {
      const key = r.readingAt.toISOString().slice(0, 7);
      if (!groups[key]) groups[key] = { month: key, readings: 0, total: 0 };
      groups[key].readings++;
      groups[key].total += Number(r.readingValue);
    }
    return Object.values(groups).map((g: any) => ({ ...g, total: Number(g.total.toFixed(3)) }));
  }
}
