import { CorrelationMiddleware } from '../src/common/http/correlation.middleware';
import { getCorrelationId } from '../src/common/http/error-envelope';

describe('CorrelationMiddleware', () => {
  let middleware: CorrelationMiddleware;

  beforeEach(() => {
    middleware = new CorrelationMiddleware();
  });

  it('generates a correlationId when no header is present', () => {
    const req = { headers: {} } as any;
    const res = { setHeader: jest.fn() } as any;
    const next = jest.fn();

    middleware.use(req, res, next);

    expect(req.correlationId).toBeDefined();
    expect(typeof req.correlationId).toBe('string');
    expect(req.correlationId.length).toBeGreaterThan(0);
    expect(res.setHeader).toHaveBeenCalledWith('x-correlation-id', req.correlationId);
    expect(next).toHaveBeenCalled();
  });

  it('uses x-correlation-id from request headers', () => {
    const req = { headers: { 'x-correlation-id': 'incoming-id' } } as any;
    const res = { setHeader: jest.fn() } as any;
    const next = jest.fn();

    middleware.use(req, res, next);

    expect(req.correlationId).toBe('incoming-id');
    expect(res.setHeader).toHaveBeenCalledWith('x-correlation-id', 'incoming-id');
  });

  it('uses x-request-id as fallback header', () => {
    const req = { headers: { 'x-request-id': 'req-id-123' } } as any;
    const res = { setHeader: jest.fn() } as any;
    const next = jest.fn();

    middleware.use(req, res, next);

    expect(req.correlationId).toBe('req-id-123');
    expect(res.setHeader).toHaveBeenCalledWith('x-correlation-id', 'req-id-123');
  });

  it('prefers x-correlation-id over x-request-id', () => {
    const req = {
      headers: {
        'x-correlation-id': 'primary-id',
        'x-request-id': 'fallback-id',
      },
    } as any;
    const res = { setHeader: jest.fn() } as any;
    const next = jest.fn();

    middleware.use(req, res, next);

    expect(req.correlationId).toBe('primary-id');
  });

  it('calls next() exactly once', () => {
    const req = { headers: {} } as any;
    const res = { setHeader: jest.fn() } as any;
    const next = jest.fn();

    middleware.use(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
  });

  it('sets x-correlation-id response header', () => {
    const req = { headers: {} } as any;
    const res = { setHeader: jest.fn() } as any;
    const next = jest.fn();

    middleware.use(req, res, next);

    expect(res.setHeader).toHaveBeenCalledTimes(1);
    expect(res.setHeader.mock.calls[0][0]).toBe('x-correlation-id');
  });

  it('matches getCorrelationId behavior for missing header', () => {
    const req = { headers: {} } as any;
    const res = { setHeader: jest.fn() } as any;
    const next = jest.fn();

    middleware.use(req, res, next);

    const directResult = getCorrelationId({});
    expect(typeof req.correlationId).toBe(typeof directResult);
    expect(req.correlationId.length).toBe(directResult.length);
  });
});
