import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { PrismaService } from '../common/database/prisma.service';
import { GlobalAuthGuard } from '../auth/global-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/types/role.enum';

@Controller('unit-types')
@UseGuards(GlobalAuthGuard, RolesGuard)
export class UnitTypesController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @Roles(Role.OPERATOR, Role.ADMIN, Role.SUPER_ADMIN)
  async findAll() {
    try { return await this.prisma.coreUnitType.findMany({ orderBy: { typeName: 'asc' } }); }
    catch { return []; }
  }

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  async create(@Body() dto: { typeCode: string; typeName: string; meterTypeDefault?: string }) {
    try {
      return await this.prisma.coreUnitType.create({ data: { typeCode: dto.typeCode, typeName: dto.typeName, meterTypeDefault: dto.meterTypeDefault } });
    } catch (e: any) {
      if (e.code === 'P2002') return { error: 'Type code already exists' };
      return { error: 'Failed to create unit type' };
    }
  }

  @Patch(':id')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  async update(@Param('id') id: string, @Body() dto: { typeCode?: string; typeName?: string; meterTypeDefault?: string }) {
    try { return await this.prisma.coreUnitType.update({ where: { id }, data: dto }); }
    catch { return { error: 'Update failed' }; }
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN)
  async delete(@Param('id') id: string) {
    try {
      await this.prisma.coreUnitType.delete({ where: { id } });
      return { success: true };
    } catch { return { error: 'Delete failed' }; }
  }
}
