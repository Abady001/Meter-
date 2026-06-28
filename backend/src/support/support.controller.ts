import { Controller, Get, Post, Patch, Delete, Param, Body, ParseUUIDPipe, Req, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { GlobalAuthGuard } from '../auth/global-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/types/role.enum';
import { SupportService } from './support.service';

@ApiTags('Support')
@Controller('support')
@UseGuards(GlobalAuthGuard, RolesGuard)
export class SupportController {
  constructor(private readonly service: SupportService) {}

  @Get() @Roles(Role.OPERATOR, Role.ADMIN, Role.SUPER_ADMIN, Role.SUPPORT)
  findAll() { return this.service.findAll(); }

  @Get(':id') @Roles(Role.OPERATOR, Role.ADMIN, Role.SUPER_ADMIN, Role.SUPPORT)
  findOne(@Param('id', ParseUUIDPipe) id: string) { return this.service.findOne(id); }

  @Post() @Roles(Role.OPERATOR, Role.ADMIN, Role.SUPER_ADMIN)
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: { subject: string; description?: string; priority?: string; customerId?: string }, @Req() req: any) {
    return this.service.create({ ...dto, createdBy: req.user.userId });
  }

  @Patch(':id') @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: any) { return this.service.update(id, dto); }

  @Post(':id/escalate') @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  escalate(@Param('id', ParseUUIDPipe) id: string, @Body() dto: { assignedTo: string }) {
    return this.service.update(id, { assignedTo: dto.assignedTo, priority: 'high' });
  }

  @Delete(':id') @Roles(Role.SUPER_ADMIN)
  remove(@Param('id', ParseUUIDPipe) id: string) { return this.service.remove(id); }
}
