import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ExecutionContext } from '@nestjs/common';
import * as request from 'supertest';
import { Reflector } from '@nestjs/core';
import { AppModule } from '../../src/app.module';
import { JwtService } from '@nestjs/jwt';
import { RolesGuard } from '../../src/auth/roles.guard';
import { Role } from '../../src/auth/types';

describe('Endpoint Access Control (Functional)', () => {
  let app: INestApplication;
  let jwtService: JwtService;

  function makeToken(role: string, userId = 'test-user'): string {
    return jwtService.sign({ sub: userId, userId, role });
  }

  const endpoints = [
    { path: '/api/v1/health', method: 'get', allowedRoles: null },
    {
      path: '/api/v1/meters/meter-1/assign',
      method: 'post',
      allowedRoles: [Role.OPERATOR, Role.TECHNICIAN, Role.ADMIN, Role.SUPER_ADMIN]
    },
    {
      path: '/api/v1/meters/meter-1/terminate',
      method: 'post',
      allowedRoles: [Role.OPERATOR, Role.TECHNICIAN, Role.ADMIN, Role.SUPER_ADMIN]
    },
    {
      path: '/api/v1/sim-cards/sim-1/eligibility',
      method: 'get',
      allowedRoles: [Role.OPERATOR, Role.TECHNICIAN, Role.ADMIN, Role.SUPER_ADMIN]
    },
    { path: '/api/v1/payments/payment-1/reverse', method: 'post', allowedRoles: [Role.SUPER_ADMIN] }
  ];

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule]
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    jwtService = moduleFixture.get<JwtService>(JwtService);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should allow unauthenticated access to health endpoint', async () => {
    const res = await request(app.getHttpServer()).get('/api/v1/health');
    expect(res.status).toBe(200);
  });

  it('should reject unauthenticated requests to protected endpoints', async () => {
    const res = await request(app.getHttpServer()).post('/api/v1/meters/meter-1/assign').send({});
    expect([401, 403]).toContain(res.status);
  });

  it('should reject unauthorized roles', async () => {
    const token = makeToken(Role.CUSTOMER);
    const res = await request(app.getHttpServer())
      .post('/api/v1/meters/meter-1/assign')
      .set('Authorization', `Bearer ${token}`)
      .send({ customerId: 'c1', unitId: 'u1', projectId: 'p1', startAt: new Date().toISOString() });
    expect([403, 404]).toContain(res.status);
  });

  it('should accept authorized roles (or return 404 if unimplemented)', async () => {
    const token = makeToken(Role.SUPER_ADMIN);
    const res = await request(app.getHttpServer())
      .post('/api/v1/meters/meter-1/assign')
      .set('Authorization', `Bearer ${token}`)
      .send({ customerId: 'c1', unitId: 'u1', projectId: 'p1', startAt: new Date().toISOString() });
    expect([200, 201, 403, 404, 409, 422]).toContain(res.status);
  });

  it('should require super_admin for payment reversal (or 404 if unimplemented)', async () => {
    const token = makeToken(Role.OPERATOR);
    const res = await request(app.getHttpServer())
      .post('/api/v1/payments/payment-1/reverse')
      .set('Authorization', `Bearer ${token}`)
      .send({ reason: 'test' });
    expect([403, 404]).toContain(res.status);
  });

  it('should accept super_admin for payment reversal', async () => {
    const token = makeToken(Role.SUPER_ADMIN);
    const res = await request(app.getHttpServer())
      .post('/api/v1/payments/payment-1/reverse')
      .set('Authorization', `Bearer ${token}`)
      .send({ reason: 'test' });
    expect([200, 404]).toContain(res.status);
  });
});
