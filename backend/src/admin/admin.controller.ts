import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/types/role.enum';
import { PrismaService } from '../common/database/prisma.service';
import { AdminService } from './admin.service';

@ApiTags('Admin')
@Controller('admin')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class AdminController {
  constructor(
    private readonly admin: AdminService,
    private readonly prisma: PrismaService,
  ) {}

  @Get('tables')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'List database tables' })
  listTables() {
    return [
      { schema: 'sim_system', name: 'Customer' }, { schema: 'sim_system', name: 'Project' },
      { schema: 'sim_system', name: 'Meter' }, { schema: 'sim_system', name: 'Reading' },
      { schema: 'sim_system', name: 'Invoice' }, { schema: 'sim_system', name: 'InvoiceLine' },
      { schema: 'sim_system', name: 'Payment' }, { schema: 'sim_system', name: 'PaymentAllocation' },
      { schema: 'sim_system', name: 'TariffPlan' }, { schema: 'sim_system', name: 'Unit' },
      { schema: 'sim_system', name: 'BillingPeriod' }, { schema: 'sim_system', name: 'CustomerLedgerEntry' },
      { schema: 'sim_system', name: 'Settlement' },
      { schema: 'core', name: 'CoreUser' }, { schema: 'core', name: 'CoreArea' },
    ];
  }

  @Get('data/:table')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Browse table data' })
  browseTable(@Param('table') table: string, @Query('limit') limit = '50', @Query('offset') offset = '0') {
    return this.admin.getTableData(table, parseInt(limit), parseInt(offset));
  }

  @Get('dependencies/:table/:id')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Check record dependencies before delete' })
  checkDependencies(@Param('table') table: string, @Param('id') id: string) {
    return this.admin.getDependencies(table, id);
  }

  @Post('data/:table')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Insert record' })
  insert(@Param('table') table: string, @Body() body: any) {
    return this.admin.insertRecord(table, body);
  }

  @Put('data/:table/:id')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update record' })
  update(@Param('table') table: string, @Param('id') id: string, @Body() body: any) {
    return this.admin.updateRecord(table, id, body);
  }

  @Delete('data/:table/:id')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Delete record with dependency check' })
  delete(@Param('table') table: string, @Param('id') id: string) {
    return this.admin.deleteRecord(table, id);
  }

  @Post('query')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Execute SQL query (SELECT/EXPLAIN only)' })
  async query(@Body() dto: { sql: string }) {
    if (!dto.sql) return { error: 'Empty query' };

    // Blocklist dangerous operations even inside SELECT/EXPLAIN
    const dangerous = /\b(DROP|TRUNCATE|ALTER|CREATE|INSERT|UPDATE|DELETE|EXEC|EXECUTE|GRANT|REVOKE|ATTACH|DETACH|REINDEX|VACUUM)\b/i;
    if (dangerous.test(dto.sql)) {
      return { error: 'Dangerous SQL keywords are not allowed. Only SELECT and EXPLAIN are permitted.' };
    }

    const upper = dto.sql.trim().toUpperCase();
    if (!upper.startsWith('SELECT') && !upper.startsWith('EXPLAIN')) {
      return { error: 'Use INSERT/UPDATE/DELETE via data endpoints' };
    }

    try {
      const r = await this.prisma.$queryRawUnsafe(dto.sql);
      return { type: 'select', data: r, count: Array.isArray(r) ? r.length : 0 };
    } catch (e: any) { return { error: e.message }; }
  }
}
