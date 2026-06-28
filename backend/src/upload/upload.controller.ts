import { Controller, Post, Get, Param, Body, Req, Res, HttpCode, HttpStatus, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { GlobalAuthGuard } from '../auth/global-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/types/role.enum';
import { Response } from 'express';
import * as path from 'path';
import * as fs from 'fs';
import { UploadService } from './upload.service';
import { ImportService } from './import.service';

@ApiTags('Upload')
@Controller('upload')
@UseGuards(GlobalAuthGuard, RolesGuard)
export class UploadController {
  constructor(
    private readonly service: UploadService,
    private readonly importService: ImportService,
  ) {}

  @Get('history/:entityType')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get upload history' })
  getHistory(@Param('entityType') entityType: string) { return this.service.getHistory(entityType); }

  @Post('file')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload and import Excel file' })
  async uploadFile(@UploadedFile() file: any, @Body() body: { type: string; projectId?: string }, @Req() req: any) {
    try {
      if (!file) return { status: 'error', message: 'No file uploaded' };
      const projectId = body.projectId || 'default';
      const result = await this.importService.processImport(body.type, file.buffer, projectId);
      await this.service.logHistory(body.type, result.success, result.failed, req.user?.userId || 'system').catch(() => {});
      return { status: 'success', ...result };
    } catch (e: any) {
      return { status: 'error', success: 0, failed: 0, errors: [e.message || 'Import failed'] };
    }
  }

  @Get('template/:type')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Download import template Excel file' })
  async downloadTemplate(@Param('type') type: string, @Res() res: Response) {
    const templateDir = path.resolve(process.cwd(), '..', 'upload template');
    const templateMap: Record<string, string> = {
      'readings': 'readings_template.xlsx',
      'solar-readings': 'readings_template solar.xlsx',
      'meters': 'meters_template.xlsx',
      'customers': 'customers_template.xlsx',
      'payments': 'payments_template.xlsx',
      'settlements': 'meter_settlements_template.xlsx',
      'sim-cards': 'Sim Card Template.xlsx',
      'delete-readings': 'delete_readings_template.xlsx',
      'migration': 'migration_template.xlsx',
    };
    const file = templateMap[type];
    if (!file) return res.status(404).json({ error: 'Template not found' });
    let filePath = path.join(templateDir, file);
    if (!fs.existsSync(filePath)) {
      // Fallback: try absolute path
      filePath = path.join('D:\\meter\\upload template', file);
    }
    if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'File not found on server' });
    res.download(filePath, file);
  }

  @Post('customers')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Bulk import customers' })
  importCustomers(@Body() dto: { rows: any[] }, @Req() req: any) { return this.service.importCustomers(dto.rows, req.user.userId); }

  @Post('meters')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Bulk import meters' })
  importMeters(@Body() dto: { rows: any[] }, @Req() req: any) { return this.service.importMeters(dto.rows, req.user.userId); }
}
