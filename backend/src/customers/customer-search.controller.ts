import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/types/role.enum';
import { PrismaService } from '../common/database/prisma.service';

@Controller('customers')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class CustomerSearchController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('search')
  @Roles(Role.OPERATOR, Role.ADMIN, Role.SUPER_ADMIN, Role.FINANCE, Role.SUPPORT)
  async search(
    @Query('name') name?: string,
    @Query('phone') phone?: string,
    @Query('email') email?: string,
    @Query('meterSerial') meterSerial?: string,
    @Query('unitNo') unitNo?: string,
  ) {
    const where: any = {};
    const orConditions: any[] = [];
    if (name) orConditions.push({ name: { contains: name, mode: 'insensitive' } });
    if (phone) orConditions.push({ phone: { contains: phone } });
    if (email) orConditions.push({ email: { contains: email, mode: 'insensitive' } });
    if (orConditions.length > 0) where.OR = orConditions;

    return this.prisma.customer.findMany({ where, take: 20 });
  }
}
