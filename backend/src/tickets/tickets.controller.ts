import { Controller, Get, Post, Patch, Delete, Param, Body, ParseUUIDPipe, Req, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { GlobalAuthGuard } from '../auth/global-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/types/role.enum';
import { TicketsService } from './tickets.service';

@ApiTags('Tickets')
@Controller('tickets')
@UseGuards(GlobalAuthGuard, RolesGuard)
export class TicketsController {
  constructor(private readonly service: TicketsService) {}

  @Get() @Roles(Role.OPERATOR, Role.ADMIN, Role.SUPER_ADMIN, Role.SUPPORT)
  findAll() { return this.service.findAll(); }

  @Get(':id') @Roles(Role.OPERATOR, Role.ADMIN, Role.SUPER_ADMIN, Role.SUPPORT)
  findOne(@Param('id', ParseUUIDPipe) id: string) { return this.service.findOne(id); }

  @Get(':id/comments') @Roles(Role.OPERATOR, Role.ADMIN, Role.SUPER_ADMIN, Role.SUPPORT)
  getComments(@Param('id', ParseUUIDPipe) id: string) { return this.service.getComments(id); }

  @Post() @Roles(Role.OPERATOR, Role.ADMIN, Role.SUPER_ADMIN, Role.SUPPORT)
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: { title: string; description?: string; priority?: string; category?: string }, @Req() req: any) {
    return this.service.create({ ...dto, createdBy: req.user.userId });
  }

  @Post(':id/comment') @Roles(Role.OPERATOR, Role.ADMIN, Role.SUPER_ADMIN, Role.SUPPORT)
  @HttpCode(HttpStatus.CREATED)
  addComment(@Param('id', ParseUUIDPipe) id: string, @Body() dto: { body: string }, @Req() req: any) {
    return this.service.addComment(id, dto.body, req.user.userId);
  }

  @Post(':id/status') @Roles(Role.OPERATOR, Role.ADMIN, Role.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  updateStatus(@Param('id', ParseUUIDPipe) id: string, @Body() dto: { status: string }) {
    return this.service.update(id, { status: dto.status });
  }

  @Patch(':id') @Roles(Role.OPERATOR, Role.ADMIN, Role.SUPER_ADMIN)
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: any) { return this.service.update(id, dto); }

  @Delete(':id') @Roles(Role.SUPER_ADMIN)
  remove(@Param('id', ParseUUIDPipe) id: string) { return this.service.remove(id); }
}
