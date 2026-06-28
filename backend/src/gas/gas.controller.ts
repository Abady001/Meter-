import { Controller, Get, Post, Param, Body, UseGuards, Query } from '@nestjs/common';
import { PrismaService } from '../common/database/prisma.service';
import { GlobalAuthGuard } from '../auth/global-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/types/role.enum';

@Controller('gas')
@UseGuards(GlobalAuthGuard, RolesGuard)
export class GasController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('meters')
  @Roles(Role.OPERATOR, Role.ADMIN, Role.SUPER_ADMIN)
  async listMeters(@Query('projectId') projectId?: string) {
    const where: any = { meterType: 'gas' };
    if (projectId) where.projectId = projectId;
    return this.prisma.meter.findMany({ where, take: 200 });
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
        enteredBy: 'system',
        status: 'valid',
      },
    });
  }

  @Get('readings/:meterId')
  @Roles(Role.OPERATOR, Role.ADMIN, Role.SUPER_ADMIN)
  async getReadings(@Param('meterId') meterId: string) {
    return this.prisma.reading.findMany({ where: { meterId }, orderBy: { readingAt: 'desc' }, take: 12 });
  }
}
