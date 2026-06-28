import { Controller, Post, Get, Patch, Param, Body, Req, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { GlobalAuthGuard } from '../auth/global-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/types/role.enum';
import { Public } from '../auth/public.decorator';
import { PrismaService } from '../common/database/prisma.service';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';

@ApiTags('Registration')
@Controller()
@UseGuards(GlobalAuthGuard, RolesGuard)
export class RegistrationController {
  constructor(private readonly prisma: PrismaService) {}

  @Public()
  @Post('auth/register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Submit user registration request' })
  async register(@Body() dto: {
    firstName: string; lastName: string; phone: string; email: string;
    area: string; project: string; department: string;
    directManager?: string; areaManager?: string;
  }) {
    if (!dto.firstName || !dto.lastName || !dto.phone || !dto.email || !dto.area || !dto.project || !dto.department) {
      return { status: 'error', message: 'All required fields must be filled' };
    }
    const request = await this.prisma.coreUserRequest.create({
      data: {
        firstName: dto.firstName, lastName: dto.lastName, phone: dto.phone,
        email: dto.email, area: dto.area, project: dto.project, department: dto.department,
        directManager: dto.directManager, areaManager: dto.areaManager, status: 'pending',
      },
    });
    return { status: 'success', message: 'Registration submitted for review', requestId: request.id };
  }

  @Get('registration/requests')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'List all registration requests' })
  async listRequests(@Query('status') status?: string) {
    const where: any = {};
    if (status) where.status = status;
    return this.prisma.coreUserRequest.findMany({ where, orderBy: { createdAt: 'desc' } });
  }

  @Patch('registration/requests/:id/approve')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Approve registration and create user' })
  async approveRequest(@Param('id') id: string, @Body() dto: { role: string; groupId?: string }, @Req() req: any) {
    const request = await this.prisma.coreUserRequest.findUnique({ where: { id } });
    if (!request) return { status: 'error', message: 'Request not found' };
    if (request.status !== 'pending') return { status: 'error', message: 'Request already processed' };

    // Create user with random secure password
    const rawPassword = crypto.randomBytes(16).toString('hex');
    const hashedPassword = await bcrypt.hash(rawPassword, 12);
    const user = await this.prisma.coreUser.create({
      data: {
        username: request.email.split('@')[0],
        email: request.email,
        passwordHash: hashedPassword,
        status: 'active',
      },
    });

    // Update request
    await this.prisma.coreUserRequest.update({
      where: { id },
      data: { status: 'approved', reviewedBy: req.user?.userId || 'system', reviewedAt: new Date() },
    });

    return { status: 'success', user: { id: user.id, username: user.username, email: user.email }, temporaryPassword: rawPassword };
  }

  @Patch('registration/requests/:id/reject')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Reject registration request' })
  async rejectRequest(@Param('id') id: string, @Body() dto: { reason?: string }, @Req() req: any) {
    const request = await this.prisma.coreUserRequest.findUnique({ where: { id } });
    if (!request) return { status: 'error', message: 'Request not found' };
    await this.prisma.coreUserRequest.update({
      where: { id },
      data: { status: 'rejected', rejectionReason: dto.reason || 'No reason provided', reviewedBy: req.user?.userId || 'system', reviewedAt: new Date() },
    });
    return { status: 'success' };
  }

  @Get('user-groups')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'List user groups' })
  async listGroups() {
    return this.prisma.coreUserGroup.findMany({ orderBy: { groupName: 'asc' } });
  }

  @Post('user-groups')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create user group' })
  async createGroup(@Body() dto: { groupName: string; description?: string; permissions?: any }) {
    const existing = await this.prisma.coreUserGroup.findUnique({ where: { groupName: dto.groupName } }).catch(() => null);
    if (existing) return { status: 'error', message: 'Group already exists' };
    return this.prisma.coreUserGroup.create({
      data: { groupName: dto.groupName, description: dto.description, permissions: dto.permissions || {} },
    });
  }

  @Patch('user-groups/:id')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update user group' })
  async updateGroup(@Param('id') id: string, @Body() dto: { groupName?: string; description?: string; permissions?: any }) {
    return this.prisma.coreUserGroup.update({ where: { id }, data: dto });
  }

  @Patch('user-groups/:id/deactivate')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Deactivate user group' })
  async deactivateGroup(@Param('id') id: string) {
    return this.prisma.coreUserGroup.update({ where: { id }, data: { isActive: false } });
  }
}
