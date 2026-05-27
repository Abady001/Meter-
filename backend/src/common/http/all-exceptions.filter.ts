import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
} from '@nestjs/common';
import { Response } from 'express';
import {
  getCorrelationId,
  toErrorEnvelope,
  statusFromException,
} from './error-envelope';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();
    const correlationId = request.correlationId ?? getCorrelationId(request.headers ?? {});
    const status = statusFromException(exception);
    const envelope = toErrorEnvelope(exception, correlationId);

    response.setHeader('x-correlation-id', correlationId);
    response.status(status).json(envelope);
  }
}
