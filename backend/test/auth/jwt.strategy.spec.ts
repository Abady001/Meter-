import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from '../../src/auth/jwt.strategy';
import { Role } from '../../src/auth/types';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(() => {
    configService = {
      get: jest.fn().mockReturnValue('test-secret'),
    } as unknown as jest.Mocked<ConfigService>;

    strategy = new JwtStrategy(configService);
  });

  describe('validate', () => {
    it('should return a valid payload when sub and role are present', async () => {
      const payload = {
        sub: 'user-1',
        userId: 'user-1',
        role: Role.OPERATOR,
        projectScope: 'proj-1',
      };

      const result = await strategy.validate(payload);
      expect(result).toEqual({
        sub: 'user-1',
        userId: 'user-1',
        role: Role.OPERATOR,
        projectScope: 'proj-1',
      });
    });

    it('should use sub as userId when userId is not provided', async () => {
      const payload = {
        sub: 'user-1',
        role: Role.OPERATOR,
      };

      const result = await strategy.validate(payload);
      expect(result.userId).toBe('user-1');
    });

    it('should reject a payload without sub', async () => {
      const payload = {
        sub: undefined as unknown as string,
        role: Role.OPERATOR,
      };

      await expect(strategy.validate(payload)).rejects.toThrow(UnauthorizedException);
    });

    it('should reject a payload without role', async () => {
      const payload = {
        sub: 'user-1',
        role: undefined as unknown as Role,
      };

      await expect(strategy.validate(payload)).rejects.toThrow(UnauthorizedException);
    });

    it('should reject a payload with an invalid role', async () => {
      const payload = {
        sub: 'user-1',
        role: 'hacker' as Role,
      };

      await expect(strategy.validate(payload)).rejects.toThrow('Invalid role in token');
    });

    it('should reject a payload with an unknown role string', async () => {
      const payload = {
        sub: 'user-1',
        role: 'admin' as Role,
      };

      await expect(strategy.validate(payload)).rejects.toThrow(UnauthorizedException);
    });

    it('should preserve projectScope in the returned payload', async () => {
      const payload = {
        sub: 'user-1',
        userId: 'user-1',
        role: Role.OPERATOR,
        projectScope: 'project-alpha',
      };

      const result = await strategy.validate(payload);
      expect(result.projectScope).toBe('project-alpha');
    });

    it('should handle projectScope being undefined', async () => {
      const payload = {
        sub: 'user-1',
        userId: 'user-1',
        role: Role.OPERATOR,
      };

      const result = await strategy.validate(payload);
      expect(result.projectScope).toBeUndefined();
    });

    it('should accept all valid Role enum values', async () => {
      for (const role of Object.values(Role)) {
        const payload = { sub: 'user-1', role };
        const result = await strategy.validate(payload);
        expect(result.role).toBe(role);
      }
    });
  });
});
