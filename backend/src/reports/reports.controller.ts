import { Controller, Get, Post, Patch, Delete, Param, Body, Query, ParseUUIDPipe, Req, HttpCode, HttpStatus, UseGuards, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { GlobalAuthGuard } from '../auth/global-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/types/role.enum';
import { UserAccessService } from '../auth/user-access.service';
import { ReportsService } from './reports.service';
import { ReportGenerationService } from './report-generation.service';

@ApiTags('Reports')
@Controller('reports')
@UseGuards(GlobalAuthGuard, RolesGuard)
export class ReportsController {
  constructor(
    private readonly service: ReportsService,
    private readonly generator: ReportGenerationService,
    private readonly userAccess: UserAccessService,
  ) {}

  private async validateProject(projectId: string, req: any): Promise<void> {
    if (req.user?.role !== 'super_admin') {
      try { await this.userAccess.requireProjectAccess(req.user?.userId, req.user?.role, projectId); }
      catch { throw new ForbiddenException('Access denied for this project'); }
    }
  }

  @Get() @Roles(Role.OPERATOR, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'List report templates' })
  findAll() { return this.service.findAll(); }

  @Get('generate/:type')
  @Roles(Role.OPERATOR, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Generate report data' })
  async generate(@Param('type') type: string, @Query() query: any, @Req() req: any) {
    if (query.projectId) {
      await this.validateProject(query.projectId, req);
    }
    return this.generator.generate(type, query);
  }

  @Get(':id') @Roles(Role.OPERATOR, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get report template' })
  findOne(@Param('id', ParseUUIDPipe) id: string) { return this.service.findOne(id); }

  @Post() @Roles(Role.OPERATOR, Role.ADMIN, Role.SUPER_ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create report template' })
  create(@Body() dto: { name: string; category: string; description?: string; config?: string }, @Req() req: any) {
    return this.service.create({ ...dto, createdBy: req.user.userId });
  }

  @Patch(':id') @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update report template' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: { name?: string; category?: string; description?: string; config?: string }) {
    return this.service.update(id, dto);
  }

  @Delete(':id') @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Delete report template' })
  remove(@Param('id', ParseUUIDPipe) id: string) { return this.service.remove(id); }
}
