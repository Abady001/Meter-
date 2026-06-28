import 'reflect-metadata';
import helmet from 'helmet';
import { ValidationPipe, Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/http/all-exceptions.filter';
import { CsrfGuard } from './common/http/csrf.guard';
import { setupOpenApi } from './common/openapi/openapi.setup';
import * as cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger:
      process.env.NODE_ENV === 'production'
        ? ['log', 'error', 'warn']
        : ['log', 'error', 'warn', 'debug', 'verbose']
  });

  app.setGlobalPrefix('api/v1');

  app.use(helmet());
  app.use(cookieParser());

  // Global rate limiter: 100 requests per minute
  app.use(rateLimit({
    windowMs: 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { statusCode: 429, message: 'Too many requests, please try again later.' },
  }));

  // Stricter rate limiter for login endpoint: 5 requests per minute
  app.use('/api/v1/auth/login', rateLimit({
    windowMs: 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: { statusCode: 429, message: 'Too many login attempts, please try again later.' },
  }));

  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(',') ?? ['http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Idempotency-Key', 'x-correlation-id', 'x-request-id', 'x-csrf-token', 'x-area-id', 'x-project-id']
  });

  app.useBodyParser('json', { limit: '1mb' });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true
    })
  );

  app.useGlobalFilters(new AllExceptionsFilter());

  // Global CSRF guard for state-changing requests
  app.useGlobalGuards(new CsrfGuard());

  setupOpenApi(app);

  const port = Number(process.env.PORT ?? 3001);
  Logger.log(`Starting on port ${port}`, 'Bootstrap');
  await app.listen(port);
}

void bootstrap();
