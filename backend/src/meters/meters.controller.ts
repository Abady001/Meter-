import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  ParseUUIDPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
  Req,
  ForbiddenException
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/types/role.enum';
import { Audit } from '../audit/audit.decorator';
import { UserAccessService } from '../auth/user-access.service';
import { PrismaService } from '../common/database/prisma.service';
import { MetersService } from './meters.service';
import { NotificationsService } from '../notifications/notifications.service';
import { AssignMeterDto } from './dto/assign-meter.dto';
import { TerminateMeterDto } from './dto/terminate-meter.dto';
import { CreateMeterDto } from './dto/create-meter.dto';
import { UpdateMeterDto } from './dto/update-meter.dto';
import { QueryMeterDto } from './dto/query-meter.dto';

@Controller('meters')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class MetersController {
  constructor(
    private readonly metersService: MetersService,
    private readonly notificationsService: NotificationsService,
    private readonly userAccess: UserAccessService,
    private readonly prisma: PrismaService,
  ) {}

  private async validateProject(projectId: string, req: any): Promise<void> {
    if (req.user?.role !== 'super_admin') {
      try { await this.userAccess.requireProjectAccess(req.user?.userId, req.user?.role, projectId); }
      catch { throw new ForbiddenException('Access denied for this project'); }
    }
  }

  @Post()
  @Roles(Role.OPERATOR, Role.ADMIN, Role.SUPER_ADMIN)
  @Audit('meter', 'create')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateMeterDto, @Req() req: { user: { userId: string } }) {
    return this.metersService.create(dto, req.user.userId);
  }

  @Get()
  @Roles(
    Role.OPERATOR,
    Role.ADMIN,
    Role.SUPER_ADMIN,
    Role.TECHNICIAN,
    Role.FINANCE,
    Role.SUPPORT
  )
  async findAll(@Query() query: QueryMeterDto, @Req() req: any) {
    if (!query.projectId) {
      const headerProjectId = req.headers['x-project-id'] as string | undefined;
      if (headerProjectId) query.projectId = headerProjectId;
    }
    if (query.projectId) {
      await this.validateProject(query.projectId, req);
      if (req.areaId && req.userAccess?.projectIds?.length && !req.userAccess.projectIds.includes(query.projectId)) {
        throw new ForbiddenException('Access denied for this project in the current area');
      }
      return this.metersService.findAll(query);
    }
    if (req.user?.role !== 'super_admin') {
      const access = await this.userAccess.resolveAccess(req.user?.userId, req.user?.role);
      const projects: string[] = req.areaId && req.userAccess?.projectIds?.length ? req.userAccess.projectIds : access.projects;
      if (projects.length === 0) return [];
      const results = await Promise.all(
        projects.map((p: string) => this.metersService.findAll({ ...query, projectId: p }))
      );
      return results.flat();
    }
    if (req.areaId) {
      const areaProjects = await this.prisma.coreProject.findMany({
        where: { areaId: req.areaId, isActive: true },
        select: { id: true }
      });
      const projectIds = areaProjects.map(p => p.id);
      if (projectIds.length === 0) return [];
      const results = await Promise.all(
        projectIds.map((p: string) => this.metersService.findAll({ ...query, projectId: p }))
      );
      return results.flat();
    }
    return this.metersService.findAll(query);
  }

  @Get(':id')
  @Roles(
    Role.OPERATOR,
    Role.ADMIN,
    Role.SUPER_ADMIN,
    Role.TECHNICIAN,
    Role.FINANCE,
    Role.SUPPORT
  )
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.metersService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.OPERATOR, Role.ADMIN, Role.SUPER_ADMIN)
  @Audit('meter', 'update')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateMeterDto,
    @Req() req: { user: { userId: string } }
  ) {
    return this.metersService.update(id, dto, req.user.userId);
  }

  @Post(':id/transition')
  @Roles(Role.OPERATOR, Role.ADMIN, Role.SUPER_ADMIN)
  @Audit('meter', 'state_transition')
  async transitionState(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: { newStatus: string },
    @Req() req: { user: { userId: string } }
  ) {
    return this.metersService.transitionState(id, dto.newStatus, req.user.userId);
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN)
  @Audit('meter', 'deactivate')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string, @Req() req: { user: { userId: string } }) {
    await this.metersService.remove(id, req.user.userId);
  }

  @Post(':meterId/assign')
  @Roles(Role.OPERATOR, Role.ADMIN)
  @Audit('meter_assignment', 'assign')
  @HttpCode(HttpStatus.OK)
  async assignMeter(
    @Param('meterId', ParseUUIDPipe) meterId: string,
    @Body() dto: AssignMeterDto,
    @Req() req: { user: { userId: string } }
  ) {
    const result = await this.metersService.assignMeter(meterId, dto, req.user.userId);
    this.notificationsService.create({ userId: req.user.userId, title: `Meter assigned: ${meterId.substring(0,8)}`, type: 'meter', referenceType: 'assignment', referenceId: meterId }).catch(() => {});
    return result;
  }

  @Post(':meterId/terminate')
  @Roles(Role.OPERATOR, Role.ADMIN)
  @Audit('meter_assignment', 'terminate')
  @HttpCode(HttpStatus.OK)
  async terminateMeter(
    @Param('meterId', ParseUUIDPipe) meterId: string,
    @Body() dto: TerminateMeterDto,
    @Req() req: { user: { userId: string } }
  ) {
    return this.metersService.terminateMeter(meterId, dto, req.user.userId);
  }
}
