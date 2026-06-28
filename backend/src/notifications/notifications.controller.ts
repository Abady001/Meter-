import { Controller, Get, Patch, Delete, Param, Query, Req, ParseUUIDPipe, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { GlobalAuthGuard } from '../auth/global-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/types/role.enum';
import { NotificationsService } from './notifications.service';

@ApiTags('Notifications')
@Controller('notifications')
@UseGuards(GlobalAuthGuard, RolesGuard)
export class NotificationsController {
  constructor(private readonly service: NotificationsService) {}

  @Get()
  @Roles(Role.SUPER_ADMIN, Role.SYSTEM_ADMIN, Role.ADMIN, Role.OPERATOR)
  @ApiOperation({ summary: 'List notifications with filters' })
  async findAll(
    @Req() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('unreadOnly') unreadOnly?: string,
    @Query('category') category?: string,
    @Query('areaId') areaId?: string,
  ) {
    const userId = req.user.userId;
    return this.service.findAll(userId, {
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      unreadOnly: unreadOnly === 'true',
      category,
      areaId,
    });
  }

  @Get('categories')
  @Roles(Role.SUPER_ADMIN, Role.SYSTEM_ADMIN, Role.ADMIN, Role.OPERATOR)
  @ApiOperation({ summary: 'Get notification categories with counts' })
  async getCategories(@Req() req: any) {
    return this.service.getCategories(req.user.userId);
  }

  @Get('unread-count')
  @Roles(Role.SUPER_ADMIN, Role.SYSTEM_ADMIN, Role.ADMIN, Role.OPERATOR)
  @ApiOperation({ summary: 'Get unread notification count' })
  async getUnreadCount(@Req() req: any) {
    const count = await this.service.getUnreadCount(req.user.userId);
    return { count };
  }

  @Patch(':id/read')
  @Roles(Role.SUPER_ADMIN, Role.SYSTEM_ADMIN, Role.ADMIN, Role.OPERATOR)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark notification as read' })
  async markRead(@Param('id', ParseUUIDPipe) id: string, @Req() req: any) {
    await this.service.markRead(id, req.user.userId);
    return { ok: true };
  }

  @Patch('read-all')
  @Roles(Role.SUPER_ADMIN, Role.SYSTEM_ADMIN, Role.ADMIN, Role.OPERATOR)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark all notifications as read' })
  async markAllRead(@Req() req: any) {
    await this.service.markAllRead(req.user.userId);
    return { ok: true };
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN, Role.SYSTEM_ADMIN, Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a notification' })
  async remove(@Param('id', ParseUUIDPipe) id: string, @Req() req: any) {
    await this.service.remove(id, req.user.userId);
    return { ok: true };
  }
}
