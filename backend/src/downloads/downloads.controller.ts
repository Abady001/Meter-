import { Controller, Get, Post, Param, Body, Query, ParseUUIDPipe, Res, HttpException, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Response } from 'express';
import { GlobalAuthGuard } from '../auth/global-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/types/role.enum';
import { PrismaService } from '../common/database/prisma.service';
import { DownloadsService } from './downloads.service';

@ApiTags('Downloads')
@Controller('downloads')
@UseGuards(GlobalAuthGuard, RolesGuard)
export class DownloadsController {
  constructor(
    private readonly downloadsService: DownloadsService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('table/csv')
  @Roles(Role.OPERATOR, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Export table data as CSV' })
  async exportCsv(@Body() dto: { columns: string[]; rows: any[][]; filename?: string }, @Res() res: Response) {
    await this.downloadsService.generateCsv(dto.columns, dto.rows, dto.filename ?? 'export', res);
  }

  @Post('table/pdf')
  @Roles(Role.OPERATOR, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Export table data as PDF' })
  async exportPdf(@Body() dto: { title: string; columns: string[]; rows: any[][]; filename?: string }, @Res() res: Response) {
    await this.downloadsService.generateTablePdf(dto.title, dto.columns, dto.rows, res, dto.filename);
  }

  @Get('invoices/:id/pdf')
  @Roles(Role.OPERATOR, Role.ADMIN, Role.SUPER_ADMIN, Role.FINANCE)
  @ApiOperation({ summary: 'Download invoice as PDF' })
  async downloadInvoicePdf(@Param('id', ParseUUIDPipe) id: string, @Res() res: Response) {
    const invoice = await this.prisma.invoice.findUnique({ where: { id } });
    if (!invoice) throw new HttpException('Invoice not found', 404);
    const lines = await this.prisma.invoiceLine.findMany({ where: { invoiceId: id } });
    await this.downloadsService.generateInvoicePdf(invoice, lines, res);
  }

  @Get('invoices/:id/csv')
  @Roles(Role.OPERATOR, Role.ADMIN, Role.SUPER_ADMIN, Role.FINANCE)
  @ApiOperation({ summary: 'Download invoice as CSV' })
  async downloadInvoiceCsv(@Param('id', ParseUUIDPipe) id: string, @Res() res: Response) {
    const invoice = await this.prisma.invoice.findUnique({ where: { id } });
    if (!invoice) throw new HttpException('Invoice not found', 404);
    const lines = await this.prisma.invoiceLine.findMany({ where: { invoiceId: id } });
    const headers = ['description', 'quantity', 'unitPrice', 'lineAmount'];
    const rows = lines.map((l: any) => [l.description, l.quantity, l.unitPrice, l.lineAmount]);
    const filename = `invoice-${invoice.invoiceNumber}`;
    await this.downloadsService.generateCsv(headers, rows, filename, res);
  }
}
