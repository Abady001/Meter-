import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';
import { getCorrelationId } from './error-envelope';

@Injectable()
export class CorrelationMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: () => void): void {
    const correlationId = getCorrelationId(req.headers ?? {});
    req.correlationId = correlationId;
    res.setHeader('x-correlation-id', correlationId);
    next();
  }
}
