import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../common/database/prisma.service';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class RefreshTokenService {
  private readonly logger = new Logger(RefreshTokenService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly jwtService: JwtService
  ) {}

  async generate(userId: string, role?: string): Promise<string> {
    const token = crypto.randomBytes(64).toString('hex');
    const expiresInMs = Number(this.config.get<string>('REFRESH_TOKEN_EXPIRES_IN_MS', '604800000'));
    await this.prisma.refreshToken.create({
      data: {
        token: this.hashToken(token),
        userId,
        role: role ?? 'customer',
        expiresAt: new Date(Date.now() + expiresInMs)
      }
    });
    return token;
  }

  async validate(token: string): Promise<{ userId: string; tokenId: string; role: string }> {
    const hashed = this.hashToken(token);
    const record = await this.prisma.refreshToken.findUnique({ where: { token: hashed } });
    if (!record) throw new UnauthorizedException('Refresh token not found');
    if (record.revokedAt) throw new UnauthorizedException('Refresh token revoked');
    if (record.expiresAt < new Date()) throw new UnauthorizedException('Refresh token expired');
    return { userId: record.userId, tokenId: record.id, role: record.role ?? 'customer' };
  }

  async revoke(token: string): Promise<void> {
    const hashed = this.hashToken(token);
    await this.prisma.refreshToken.updateMany({
      where: { token: hashed, revokedAt: null },
      data: { revokedAt: new Date() }
    });
  }

  async revokeAllForUser(userId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() }
    });
  }

  async rotate(oldToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    const { userId, role } = await this.validate(oldToken);
    await this.revoke(oldToken);
    const newRefreshToken = await this.generate(userId, role);
    const accessToken = this.generateAccessToken(userId, role);
    return { accessToken, refreshToken: newRefreshToken };
  }

  private generateAccessToken(userId: string, role = 'customer'): string {
    return this.jwtService.sign({ sub: userId, userId, role });
  }

  async store(userId: string, token: string, role = 'customer'): Promise<void> {
    const expiresInMs = Number(this.config.get<string>('REFRESH_TOKEN_EXPIRES_IN_MS', '604800000'));
    await this.prisma.refreshToken.create({
      data: { token: this.hashToken(token), userId, role, expiresAt: new Date(Date.now() + expiresInMs) }
    });
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }
}
