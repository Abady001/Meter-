import { Controller, Get, Param, Query, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../auth/roles.decorator';
import { Role } from '../../auth/types/role.enum';
import { WaterBalanceService } from './water-balance.service';
import { WaterBalanceResponseDto } from './dto/water-balance.dto';

@ApiTags('Readings')
@Controller('projects/:projectId/water-balance')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class WaterBalanceController {
  constructor(private readonly service: WaterBalanceService) {}

  @Get()
  @Roles(Role.OPERATOR, Role.ADMIN, Role.SUPER_ADMIN, Role.FINANCE, Role.SUPPORT)
  @ApiOperation({ summary: 'Get water balance variance for a project' })
  async getWaterBalance(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Query('from') from: string,
    @Query('to') to: string
  ): Promise<WaterBalanceResponseDto> {
    return this.service.getWaterBalance(projectId, new Date(from), new Date(to));
  }
}
