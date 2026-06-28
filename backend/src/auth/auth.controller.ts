import { Controller, Post, Get, Body, HttpCode, HttpStatus, ForbiddenException, UnauthorizedException, Req, Res, Headers } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { RefreshTokenService } from './refresh-token.service';
import { PrismaService } from '../common/database/prisma.service';
import { Role } from './types';
import { Public } from './public.decorator';
import { Response, Request } from 'express';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

class LoginDto {
  @IsString() username!: string;
  @IsString() password!: string;
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly refreshTokenService: RefreshTokenService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    // Find user in DB
    const user = await this.prisma.coreUser.findFirst({ where: { username: dto.username } }).catch(() => null);
    if (!user) throw new UnauthorizedException('بيانات الدخول غير صحيحة');

    // Check if permanently terminated
    if (user.status === 'inactive') {
      throw new UnauthorizedException('الحساب مقفل نهائياً. تواصل مع المشرف');
    }

    // Check if suspended (1-day lock)
    if (user.status === 'suspended') {
      throw new UnauthorizedException('الحساب مقفل لمدة 24 ساعة. حاول لاحقاً');
    }

    // Check if temporarily locked (5-min)
    if (user.status === 'locked') {
      throw new UnauthorizedException('الحساب مقفل مؤقتاً. انتظر 5 دقائق');
    }

    // Verify password
    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      // Progressive lockout: 3 → 5min, next 3 → 1day, next 3 → permanent
      const newCount = user.failedLoginAttempts + 1;
      await this.prisma.coreUser.update({ where: { id: user.id }, data: { failedLoginAttempts: newCount } });

      if (newCount >= 9) {
        await this.prisma.coreUser.update({ where: { id: user.id }, data: { status: 'inactive', failedLoginAttempts: 0 } });
        throw new UnauthorizedException('تم قفل الحساب نهائياً. تواصل مع المشرف لإعادة التنشيط');
      } else if (newCount >= 6) {
        await this.prisma.coreUser.update({ where: { id: user.id }, data: { status: 'suspended', failedLoginAttempts: newCount } });
        // Schedule automatic unlock after 24h via setTimeout
        setTimeout(async () => {
          try { await this.prisma.coreUser.update({ where: { id: user.id, status: 'suspended' }, data: { status: 'active' } }); } catch {}
        }, 86400000);
        throw new UnauthorizedException('تم قفل الحساب لمدة 24 ساعة');
      } else if (newCount >= 3) {
        await this.prisma.coreUser.update({ where: { id: user.id }, data: { status: 'locked', failedLoginAttempts: newCount } });
        // Auto-unlock after 5 minutes
        setTimeout(async () => {
          try { await this.prisma.coreUser.update({ where: { id: user.id, status: 'locked' }, data: { status: 'active' } }); } catch {}
        }, 300000);
        throw new UnauthorizedException('تم قفل الحساب لمدة 5 دقائق');
      }
      throw new UnauthorizedException('بيانات الدخول غير صحيحة');
    }

    // Success — reset failed attempts and update last login
    await this.prisma.coreUser.update({
      where: { id: user.id },
      data: { failedLoginAttempts: 0, status: 'active', lastLoginAt: new Date() },
    });

    // Get actual role + areas from CoreUserRoleAssignment (fix: was using user.status instead of real role)
    const assignments = await this.prisma.coreUserRoleAssignment.findMany({
      where: { userId: user.id },
      include: { role: true }
    }).catch(() => []);
    let roleCode = 'viewer';
    const areaSet = new Set<string>();
    if (assignments.length > 0) {
      roleCode = assignments[0].role.roleCode;
      assignments.forEach(a => { if (a.areaId) areaSet.add(a.areaId); });
    }
    // Super_admin sees all areas
    const userAreas = roleCode === 'super_admin'
      ? (await this.prisma.coreArea.findMany({ select: { id: true } })).map(a => a.id)
      : Array.from(areaSet);

    const payload = { sub: user.id, userId: user.id, username: user.username, role: roleCode, areas: userAreas };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '1h' });
    const refreshToken = uuidv4();
    await this.refreshTokenService.store(user.id, refreshToken);

    res.cookie('access_token', accessToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: 3600000, path: '/' });
    res.cookie('refresh_token', refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: 7 * 86400000, path: '/api/v1/auth' });

    return { user: { id: user.id, name: user.username, role: roleCode }, accessToken };
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() dto: { refreshToken?: string }, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const token = dto.refreshToken || req.cookies?.refresh_token;
    if (!token) throw new UnauthorizedException('Refresh token required');
    const result = await this.refreshTokenService.rotate(token);
    res.cookie('access_token', result.accessToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: 3600000, path: '/' });
    if (result.refreshToken) {
      res.cookie('refresh_token', result.refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: 7 * 86400000, path: '/api/v1/auth' });
    }
    return result;
  }

  @Public()
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token', { path: '/' });
    res.clearCookie('refresh_token', { path: '/api/v1/auth' });
    return { success: true };
  }

  @Public()
  @Post('dev-login')
  @HttpCode(HttpStatus.OK)
  async devLogin(@Body() dto: { userId: string; role?: string; name?: string; areaId?: string }) {
    if (process.env.NODE_ENV === 'production' && process.env.DEV_LOGIN_ENABLED !== 'true') {
      throw new ForbiddenException('Dev login disabled');
    }
    // If areaId is provided, resolve it to include in JWT for area middleware
    let areas: string[] | undefined;
    if (dto.areaId) {
      areas = [dto.areaId];
    }
    const payload = { sub: dto.userId, userId: dto.userId, role: dto.role || 'super_admin', areas };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '1h' });
    return { accessToken, user: { id: dto.userId, name: dto.name || dto.userId, role: dto.role || 'super_admin' } };
  }

  @Get('me')
  @HttpCode(HttpStatus.OK)
  async getProfile(@Req() req: Request) {
    const auth = req.headers.authorization;
    if (!auth) throw new UnauthorizedException('No token');
    try {
      const payload = this.jwtService.verify(auth.replace('Bearer ', ''));
      // Try DB first, fall back to JWT payload (dev-login compatibility)
      const user = await this.prisma.coreUser.findUnique({ where: { id: payload.userId } }).catch(() => null);
      if (user) {
        const assignments = await this.prisma.coreUserRoleAssignment.findMany({
          where: { userId: user.id },
          include: { role: true }
        }).catch(() => []);
        const actualRole = assignments.length > 0 ? assignments[0].role.roleCode : 'viewer';
        return { valid: true, user: { id: user.id, username: user.username, role: actualRole } };
      }
      return { valid: true, user: { id: payload.userId, username: payload.username || payload.userId, role: payload.role || 'viewer' } };
    } catch { throw new UnauthorizedException('Invalid token'); }
  }

  @Public()
  @Get('csrf-token')
  @HttpCode(HttpStatus.OK)
  async getCsrfToken(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const token = uuidv4() + '-' + Date.now();
    res.cookie('csrf-token', token, { httpOnly: false, secure: false, sameSite: 'lax', maxAge: 3600000, path: '/' });
    return { csrfToken: token };
  }
}
