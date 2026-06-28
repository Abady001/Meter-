import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { GlobalAuthGuard } from '../auth/global-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/types/role.enum';
import { SearchService } from './search.service';
import { UserAccessService } from '../auth/user-access.service';

@ApiTags('Search')
@Controller('search')
@UseGuards(GlobalAuthGuard, RolesGuard)
export class SearchController {
  constructor(
    private readonly service: SearchService,
    private readonly userAccess: UserAccessService,
  ) {}

  @Get()
  @Roles(Role.OPERATOR, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Global search across all entities' })
  async search(@Query('q') q: string, @Query('limit') limit?: string, @Req() req?: any) {
    const user = req?.user;
    let allowedProjectIds: string[] | undefined;
    if (user && user.role !== 'super_admin') {
      const access = await this.userAccess.resolveAccess(user.userId, user.role);
      allowedProjectIds = access.projects;
      if (allowedProjectIds.length === 0) return { results: [], groups: {} };
    }
    return this.service.search(q, limit ? parseInt(limit) : 10, allowedProjectIds);
  }
}
