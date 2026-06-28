import { Controller, Get, Post, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/types/role.enum';
import { SyncOrchestratorService } from './sync-orchestrator.service';

@ApiTags('Sync')
@Controller('sync')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class SyncController {
  constructor(private readonly sync: SyncOrchestratorService) {}

  @Post('meters/:areaCode')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Sync meter master data from Symbiot for an area' })
  async syncMeters(@Param('areaCode') areaCode: string) {
    const result = await this.sync.syncMeterMaster(areaCode);
    // Log for debugging
    console.log(`SYNC [${areaCode}]: synced=${result.synced} total=${result.total} errors=${result.errors?.length || 0}`);
    if (result.errors?.length > 0) {
      console.log(`SYNC ERRORS: ${result.errors.slice(0, 5).join('; ')}`);
    }
    return result;
  }

  @Post('meters/all')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Sync meter master data for ALL areas' })
  async syncAllMeters() {
    return this.sync.syncAllAreas();
  }

  @Get('status/:areaCode')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Check sync status for an area (Symbiot SQL connectivity)' })
  async syncStatus(@Param('areaCode') areaCode: string) {
    try {
      const pool = await (this.sync as any).getSymbiotPool(areaCode);
      const r = await pool.request().query('SELECT COUNT(*) as cnt FROM Device');
      await pool.close();
      return { area: areaCode, online: true, source: 'Symbiot SQL', devices: r.recordset[0].cnt };
    } catch {
      return { area: areaCode, online: false, source: 'Symbiot SQL' };
    }
  }
}
