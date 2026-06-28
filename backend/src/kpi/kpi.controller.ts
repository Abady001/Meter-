import { Controller, Get, Param, Query, Req, ForbiddenException, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { GlobalAuthGuard } from '../auth/global-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/types/role.enum';
import { KpiService } from './kpi.service';

@ApiTags('KPI')
@Controller('kpi')
@UseGuards(GlobalAuthGuard, RolesGuard)
export class KpiController {
  constructor(private readonly kpi: KpiService) {}

  @Get('executive')
  @Roles(Role.OPERATOR, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Executive KPIs' })
  async getExecutive(@Query('projectId') projectId?: string, @Req() req?: any) {
    const user = req?.user;
    if (user?.role !== 'super_admin' && user?.role !== 'admin') {
      if (!projectId) throw new ForbiddenException('projectId required for non-admin users');
    }
    return this.kpi.getExecutiveKpis(projectId);
  }

  @Get('collections')
  @Roles(Role.OPERATOR, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Collection KPIs' })
  async getCollections(@Query('projectId') projectId?: string, @Req() req?: any) {
    const user = req?.user;
    if (user?.role !== 'super_admin' && user?.role !== 'admin') {
      if (!projectId) throw new ForbiddenException('projectId required for non-admin users');
    }
    return this.kpi.getCollectionKpis(projectId);
  }

  @Get('utilities')
  @Roles(Role.OPERATOR, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Utility KPIs' })
  async getUtilities(@Query('projectId') projectId?: string, @Req() req?: any) {
    const user = req?.user;
    if (user?.role !== 'super_admin' && user?.role !== 'admin') {
      if (!projectId) throw new ForbiddenException('projectId required for non-admin users');
    }
    return this.kpi.getUtilityKpis(projectId);
  }
}
