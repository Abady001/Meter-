import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { PrismaService } from '../common/database/prisma.service';
import { GlobalAuthGuard } from '../auth/global-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/types/role.enum';
import * as bcrypt from 'bcryptjs';

@Controller('users')
@UseGuards(GlobalAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.OPERATOR)
  async findAll() {
    try {
      const users = await this.prisma.coreUser.findMany({
        select: { id: true, username: true, email: true, status: true },
        take: 50,
      });
      return users.map((u) => ({ id: u.id, name: u.username, email: u.email, role: u.status }));
    } catch {
      return [];
    }
  }

  @Get(':id')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  async findOne(@Param('id') id: string) {
    try {
      const user = await this.prisma.coreUser.findUnique({ where: { id }, select: { id: true, username: true, email: true, status: true } });
      if (!user) return { error: 'User not found' };
      return { id: user.id, name: user.username, email: user.email, role: user.status };
    } catch { return { error: 'User not found' }; }
  }

  @Post()
  @Roles(Role.SUPER_ADMIN)
  async create(@Body() dto: { username: string; email?: string; password: string; role?: string }) {
    const passwordHash = await bcrypt.hash(dto.password, 10);
    try {
      const user = await this.prisma.coreUser.create({
        data: { username: dto.username, email: dto.email || dto.username + '@meter-verse.local', passwordHash, status: 'active' },
        select: { id: true, username: true, email: true, status: true },
      });
      return { id: user.id, name: user.username, email: user.email, role: user.status };
    } catch (e: any) {
      if (e.code === 'P2002') return { error: 'Username already exists' };
      return { error: 'Failed to create user' };
    }
  }

  @Patch(':id')
  @Roles(Role.SUPER_ADMIN)
  async update(@Param('id') id: string, @Body() dto: { username?: string; email?: string; password?: string; status?: string }) {
    const data: any = {};
    if (dto.username) data.username = dto.username;
    if (dto.email) data.email = dto.email;
    if (dto.status) data.status = dto.status;
    if (dto.password) data.passwordHash = await bcrypt.hash(dto.password, 10);
    try {
      const user = await this.prisma.coreUser.update({ where: { id }, data, select: { id: true, username: true, email: true, status: true } });
      return { id: user.id, name: user.username, email: user.email, role: user.status };
    } catch { return { error: 'Update failed' }; }
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN)
  async delete(@Param('id') id: string) {
    try {
      await this.prisma.coreUser.update({ where: { id }, data: { status: 'inactive' } });
      return { success: true, message: 'User deactivated' };
    } catch { return { error: 'Delete failed' }; }
  }

  @Post(':id/password')
  @Roles(Role.SUPER_ADMIN)
  async resetPassword(@Param('id') id: string, @Body() dto: { password: string }) {
    const passwordHash = await bcrypt.hash(dto.password, 10);
    try {
      await this.prisma.coreUser.update({ where: { id }, data: { passwordHash } });
      return { success: true, message: 'Password reset' };
    } catch { return { error: 'Password reset failed' }; }
  }
}
