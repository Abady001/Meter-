import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  Req,
  HttpCode,
  HttpStatus,
  UseGuards,
  ParseUUIDPipe,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/types/role.enum';
import { Audit } from '../audit/audit.decorator';
import { UserAccessService } from '../auth/user-access.service';
import { ReadingsService } from './readings.service';
import { ReadingValidationService } from './reading-validation.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateReadingDto } from './dto/create-reading.dto';
import { PrismaService } from '../common/database/prisma.service';

@ApiTags('Readings')
@Controller('readings')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class ReadingsController {
  constructor(
    private readonly readingsService: ReadingsService,
    private readonly notificationsService: NotificationsService,
    private readonly prisma: PrismaService,
    private readonly userAccess: UserAccessService,
    private readonly readingValidation: ReadingValidationService,
  ) {}

  private async validateProject(projectId: string, req: any): Promise<void> {
    if (req.user?.role !== 'super_admin') {
      try { await this.userAccess.requireProjectAccess(req.user?.userId, req.user?.role, projectId); }
      catch { throw new ForbiddenException('Access denied for this project'); }
    }
  }

  @Post()
  @Roles(Role.OPERATOR, Role.TECHNICIAN, Role.ADMIN, Role.SUPER_ADMIN)
  @Audit('reading', 'create')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateReadingDto, @Req() req: { user: { userId: string } }) {
    const reading = await this.readingsService.createReading(dto, req.user.userId);
    this.notificationsService.create({ userId: req.user.userId, title: `Reading submitted: ${reading.meterSerial}`, body: `${reading.consumption} units`, type: 'reading', referenceType: 'reading', referenceId: reading.id }).catch(() => {});
    return reading;
  }

  @Get()
  @Roles(Role.OPERATOR, Role.TECHNICIAN, Role.ADMIN, Role.SUPER_ADMIN, Role.FINANCE, Role.SUPPORT)
  @HttpCode(HttpStatus.OK)
  async findAll(@Query('projectId') projectId?: string, @Req() req?: any) {
    if (projectId) {
      await this.validateProject(projectId, req);
      if (req?.areaId && req?.userAccess?.projectIds?.length && !req.userAccess.projectIds.includes(projectId)) {
        throw new ForbiddenException('Access denied for this project in the current area');
      }
      return this.readingsService.findAll(projectId);
    }
    if (req.user?.role !== 'super_admin') {
      const access = await this.userAccess.resolveAccess(req.user?.userId, req.user?.role);
      const projects: string[] = req?.areaId && req?.userAccess?.projectIds?.length ? req.userAccess.projectIds : access.projects;
      if (projects.length === 0) return [];
      const results = await Promise.all(
        projects.map((p: string) => this.readingsService.findAll(p))
      );
      return results.flat();
    }
    if (req?.areaId && req?.userAccess?.projectIds?.length) {
      const results = await Promise.all(
        (req.userAccess.projectIds as string[]).map((p: string) => this.readingsService.findAll(p))
      );
      return results.flat();
    }
    return this.readingsService.findAll();
  }

  @Get('review-queue')
  @Roles(Role.OPERATOR, Role.TECHNICIAN, Role.ADMIN, Role.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  async listReviewQueue(@Query('projectId') projectId?: string, @Query('status') status?: string, @Req() req?: any) {
    if (projectId) {
      await this.validateProject(projectId, req);
      if (req?.areaId && req?.userAccess?.projectIds?.length && !req.userAccess.projectIds.includes(projectId)) {
        throw new ForbiddenException('Access denied for this project in the current area');
      }
      return this.readingsService.listReviewQueue({ projectId, status });
    }
    if (req.user?.role !== 'super_admin') {
      const access = await this.userAccess.resolveAccess(req.user?.userId, req.user?.role);
      const projects: string[] = req?.areaId && req?.userAccess?.projectIds?.length ? req.userAccess.projectIds : access.projects;
      if (projects.length === 0) return { items: [] };
      const results = await Promise.all(
        projects.map((p: string) => this.readingsService.listReviewQueue({ projectId: p, status }))
      );
      return { items: results.flatMap(r => r.items) };
    }
    if (req?.areaId && req?.userAccess?.projectIds?.length) {
      const results = await Promise.all(
        (req.userAccess.projectIds as string[]).map((p: string) => this.readingsService.listReviewQueue({ projectId: p, status }))
      );
      return { items: results.flatMap(r => r.items) };
    }
    return this.readingsService.listReviewQueue({ projectId, status });
  }

  @Get(':id')
  @Roles(Role.OPERATOR, Role.TECHNICIAN, Role.ADMIN, Role.SUPER_ADMIN, Role.FINANCE, Role.SUPPORT)
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id', ParseUUIDPipe) id: string, @Req() req: any) {
    const reading = await this.readingsService.findOne(id);
    if (reading.projectId) await this.validateProject(reading.projectId, req);
    return reading;
  }

  @Patch(':id')
  @Roles(Role.OPERATOR, Role.ADMIN, Role.SUPER_ADMIN)
  @Audit('reading', 'update')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update a reading' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: { currentReading?: number; notes?: string },
    @Req() req: any
  ) {
    const reading = await this.prisma.reading.findUnique({ where: { id } });
    if (!reading) throw new NotFoundException();
    await this.validateProject(reading.projectId, req);
    const data: any = {};
    if (dto.currentReading !== undefined) data.currentReading = dto.currentReading;
    if (dto.notes !== undefined) data.notes = dto.notes;
    return this.prisma.reading.update({ where: { id }, data });
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Audit('reading', 'delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a reading' })
  async remove(@Param('id', ParseUUIDPipe) id: string, @Req() req: any) {
    const reading = await this.prisma.reading.findUnique({ where: { id } });
    if (!reading) throw new NotFoundException();
    await this.validateProject(reading.projectId, req);
    await this.prisma.readingReview.deleteMany({ where: { readingId: id } });
    await this.prisma.reading.delete({ where: { id } });
    return { status: 'deleted' };
  }

  @Post(':id/approve')
  @Roles(Role.OPERATOR, Role.ADMIN, Role.SUPER_ADMIN)
  @Audit('reading', 'approve')
  @HttpCode(HttpStatus.OK)
  async approveReading(@Param('id', ParseUUIDPipe) id: string, @Body() dto: { reason?: string }, @Req() req: any) {
    const reading = await this.prisma.reading.findUnique({ where: { id } });
    if (!reading) return { status: 'not_found' };
    await this.validateProject(reading.projectId, req);
    await this.prisma.reading.update({ where: { id }, data: { status: 'valid' } });
    await this.prisma.readingReview.create({
      data: { readingId: id, reviewAction: 'approve', reviewedBy: req.user.userId, reviewedAt: new Date(), reason: dto.reason ?? '' }
    });
    this.notificationsService.create({ userId: req.user.userId, title: 'Reading approved', referenceType: 'reading', referenceId: id }).catch(() => {});
    return { status: 'approved' };
  }

  @Post(':id/reject')
  @Roles(Role.OPERATOR, Role.ADMIN, Role.SUPER_ADMIN)
  @Audit('reading', 'reject')
  @HttpCode(HttpStatus.OK)
  async rejectReading(@Param('id', ParseUUIDPipe) id: string, @Body() dto: { reason: string }, @Req() req: any) {
    if (!dto.reason) return { status: 'reason_required' };
    const reading = await this.prisma.reading.findUnique({ where: { id } });
    if (!reading) return { status: 'not_found' };
    await this.validateProject(reading.projectId, req);
    await this.prisma.reading.update({ where: { id }, data: { status: 'rejected' } });
    await this.prisma.readingReview.create({
      data: { readingId: id, reviewAction: 'reject', reviewedBy: req.user.userId, reviewedAt: new Date(), reason: dto.reason }
    });
    this.notificationsService.create({ userId: req.user.userId, title: 'Reading rejected', referenceType: 'reading', referenceId: id }).catch(() => {});
    return { status: 'rejected' };
  }

  // Validate a reading against business rules without importing
  @Post('validate')
  @Roles(Role.OPERATOR, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Validate reading against business rules' })
  async validateReading(@Body() dto: { meterId: string; readingDate: string; readingValue: number }) {
    return this.readingValidation.validateReading(
      dto.meterId,
      new Date(dto.readingDate),
      dto.readingValue,
    );
  }

  // Check if a meter can sync readings
  @Get('can-sync/:meterId')
  @Roles(Role.OPERATOR, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Check if meter can receive synced readings' })
  async canSyncReading(@Param('meterId') meterId: string) {
    return this.readingValidation.getMeterStatus(meterId);
  }

  // Manual reading upload with template validation
  @Post('manual-upload')
  @Roles(Role.OPERATOR, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Upload manual readings with template validation' })
  async manualUpload(
    @Body() dto: { readings: Array<{ meterId: string; readingValue: number; readingDate: string; meterType?: string }> },
    @Req() req: any,
  ) {
    const results = [];
    for (const r of dto.readings) {
      const validation = await this.readingValidation.validateReading(r.meterId, new Date(r.readingDate), r.readingValue);
      if (validation.valid) {
        try {
          const meter = await this.prisma.meter.findUnique({ where: { id: r.meterId } });
          if (!meter) { results.push({ meterId: r.meterId, status: 'error', error: 'Meter not found' }); continue; }
          const reading = await this.readingsService.createReading({
            projectId: meter.projectId,
            meterId: r.meterId,
            readingValue: r.readingValue,
            readingAt: r.readingDate,
            source: 'manual',
          }, req.user.userId);
          results.push({ meterId: r.meterId, status: 'imported', readingId: reading.id });
        } catch (e: any) {
          results.push({ meterId: r.meterId, status: 'error', error: e.message });
        }
      } else {
        results.push({ meterId: r.meterId, status: 'rejected', errors: validation.errors });
      }
    }
    return { total: dto.readings.length, imported: results.filter(r => r.status === 'imported').length, rejected: results.filter(r => r.status === 'rejected').length, results };
  }

  // Reading exceptions management
  @Get('exceptions')
  @Roles(Role.OPERATOR, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get reading exceptions (early, missing, duplicates)' })
  async getExceptions(@Query('meterId') meterId?: string) {
    const where: any = { status: 'pending_review' };
    if (meterId) where.meterId = meterId;
    const readings = await this.prisma.reading.findMany({ where, orderBy: { readingAt: 'desc' }, take: 100 });
    const exceptions = readings.map(r => ({
      id: r.id,
      meterId: r.meterId,
      readingDate: r.readingAt,
      readingValue: r.readingValue,
      status: r.status,
      reason: r.status === 'pending_review' ? 'Pending review' : 'Exception',
    }));
    return { total: exceptions.length, exceptions };
  }

  // Batch approve exceptions
  @Post('exceptions/approve')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Approve reading exceptions in batch' })
  async approveExceptions(@Body() dto: { ids: string[] }, @Req() req: any) {
    let count = 0;
    for (const id of dto.ids) {
      await this.prisma.reading.update({ where: { id }, data: { status: 'valid' } });
      await this.prisma.readingReview.create({
        data: { readingId: id, reviewAction: 'approve', reviewedBy: req.user.userId, reviewedAt: new Date(), reason: 'Batch approved' },
      });
      count++;
    }
    return { approved: count };
  }
}
