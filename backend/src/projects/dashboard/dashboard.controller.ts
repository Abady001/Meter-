import { Controller, Get, Param, ParseUUIDPipe, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../auth/roles.decorator';
import { Role } from '../../auth/types/role.enum';
import { DashboardService } from './dashboard.service';

@Controller('projects/:projectId/dashboard')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('kpis')
  @Roles(Role.OPERATOR, Role.ADMIN, Role.SUPER_ADMIN, Role.FINANCE, Role.SUPPORT)
  async getKpis(@Param('projectId', ParseUUIDPipe) projectId: string) {
    return this.dashboardService.getKpis(projectId);
  }

  @Get('consumption')
  @Roles(Role.OPERATOR, Role.ADMIN, Role.SUPER_ADMIN, Role.FINANCE, Role.SUPPORT)
  async getConsumption(@Param('projectId', ParseUUIDPipe) projectId: string) {
    return this.dashboardService.getConsumptionTrend(projectId);
  }

  @Get('activity')
  @Roles(Role.OPERATOR, Role.ADMIN, Role.SUPER_ADMIN, Role.SUPPORT)
  async getActivity(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Query('limit') limit?: string
  ) {
    return this.dashboardService.getRecentActivity(projectId, limit ? parseInt(limit, 10) : 10);
  }
}
