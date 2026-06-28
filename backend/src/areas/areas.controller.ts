import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { PrismaService } from '../common/database/prisma.service';
import { GlobalAuthGuard } from '../auth/global-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/types/role.enum';
import { Public } from '../auth/public.decorator';

@Controller('areas')
@UseGuards(GlobalAuthGuard, RolesGuard)
export class AreasController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @Public()
  async findAll() {
    try {
      return await this.prisma.coreArea.findMany({ orderBy: { areaName: 'asc' } });
    } catch { return []; }
  }

  @Get(':id')
  @Public()
  async findOne(@Param('id') id: string) {
    try { return await this.prisma.coreArea.findUnique({ where: { id } }); }
    catch { return { error: 'Area not found' }; }
  }

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  async create(@Body() dto: { areaCode: string; areaName: string; databaseName?: string; connectionString?: string }) {
    try {
      return await this.prisma.coreArea.create({
        data: { areaCode: dto.areaCode, areaName: dto.areaName, databaseName: dto.databaseName || '', connectionString: dto.connectionString || '', isActive: true },
      });
    } catch (e: any) {
      if (e.code === 'P2002') return { error: 'Area code already exists' };
      return { error: 'Failed to create area' };
    }
  }

  @Patch(':id')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  async update(@Param('id') id: string, @Body() dto: { areaCode?: string; areaName?: string; isActive?: boolean }) {
    try { return await this.prisma.coreArea.update({ where: { id }, data: dto }); }
    catch { return { error: 'Update failed' }; }
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN)
  async delete(@Param('id') id: string) {
    try {
      await this.prisma.coreArea.update({ where: { id }, data: { isActive: false } });
      return { success: true, message: 'Area deactivated' };
    } catch { return { error: 'Delete failed' }; }
  }
}
