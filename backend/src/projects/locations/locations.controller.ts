import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  ParseUUIDPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
  Req
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../auth/roles.decorator';
import { Role } from '../../auth/types/role.enum';
import { Audit } from '../../audit/audit.decorator';
import { LocationsService } from './locations.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';

@Controller('projects/:projectId/locations')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Post()
  @Roles(Role.OPERATOR, Role.ADMIN, Role.SUPER_ADMIN)
  @Audit('location', 'create')
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Body() dto: CreateLocationDto,
    @Req() req: { user: { userId: string } }
  ) {
    return this.locationsService.create(projectId, dto, req.user.userId);
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
  async findAll(@Param('projectId', ParseUUIDPipe) projectId: string) {
    return this.locationsService.findAll(projectId);
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
  async findOne(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.locationsService.findOne(projectId, id);
  }

  @Patch(':id')
  @Roles(Role.OPERATOR, Role.ADMIN, Role.SUPER_ADMIN)
  @Audit('location', 'update')
  async update(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateLocationDto,
    @Req() req: { user: { userId: string } }
  ) {
    return this.locationsService.update(projectId, id, dto, req.user.userId);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Audit('location', 'deactivate')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: { user: { userId: string } }
  ) {
    await this.locationsService.remove(projectId, id, req.user.userId);
  }

  // Unit lifecycle: assign meter
  @Post(':id/assign-meter')
  @Roles(Role.OPERATOR, Role.ADMIN, Role.SUPER_ADMIN)
  @Audit('location', 'assign_meter')
  async assignMeter(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: { meterId: string },
    @Req() req: any
  ) {
    return this.locationsService.assignMeter(projectId, id, dto.meterId, req.user.userId);
  }

  // Unit lifecycle: replace meter
  @Post(':id/replace-meter')
  @Roles(Role.OPERATOR, Role.ADMIN, Role.SUPER_ADMIN)
  @Audit('location', 'replace_meter')
  async replaceMeter(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: { oldMeterId: string; newMeterId: string; reason?: string },
    @Req() req: any
  ) {
    return this.locationsService.replaceMeter(projectId, id, dto.oldMeterId, dto.newMeterId, dto.reason, req.user.userId);
  }

  // Unit lifecycle: disconnect meter
  @Post(':id/disconnect-meter')
  @Roles(Role.OPERATOR, Role.ADMIN, Role.SUPER_ADMIN)
  @Audit('location', 'disconnect_meter')
  async disconnectMeter(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: { meterId: string; reason?: string },
    @Req() req: any
  ) {
    return this.locationsService.disconnectMeter(projectId, id, dto.meterId, dto.reason, req.user.userId);
  }

  // Unit lifecycle: change customer
  @Post(':id/change-customer')
  @Roles(Role.OPERATOR, Role.ADMIN, Role.SUPER_ADMIN)
  @Audit('location', 'change_customer')
  async changeCustomer(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: { customerId: string; reason?: string },
    @Req() req: any
  ) {
    return this.locationsService.changeCustomer(projectId, id, dto.customerId, dto.reason, req.user.userId);
  }

  // Unit lifecycle: close unit
  @Post(':id/close')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Audit('location', 'close')
  async closeUnit(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: { reason?: string },
    @Req() req: any
  ) {
    return this.locationsService.closeUnit(projectId, id, dto.reason, req.user.userId);
  }
}
