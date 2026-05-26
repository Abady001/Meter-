import { HttpException, HttpStatus } from '@nestjs/common';
import {
  ErrorEnvelope,
  toErrorEnvelope,
  statusFromException,
} from '../src/common/http/error-envelope';

describe('toErrorEnvelope', () => {
  const correlationId = 'test-correlation-id';

  it('serializes HttpException correctly', () => {
    const exception = new HttpException('Not Found', HttpStatus.NOT_FOUND);
    const envelope = toErrorEnvelope(exception, correlationId);

    expect(envelope).toMatchObject({
      code: 'HttpException',
      message: 'Not Found',
      correlationId,
    });
    expect(envelope.code).toBe('HttpException');
    expect(envelope.message).toBe('Not Found');
    expect(envelope.correlationId).toBe(correlationId);
    expect(envelope).toHaveProperty('details');
  });

  it('includes correlationId in envelope', () => {
    const exception = new HttpException('Bad Request', HttpStatus.BAD_REQUEST);
    const envelope = toErrorEnvelope(exception, correlationId);

    expect(envelope.correlationId).toBe(correlationId);
  });

  it('serializes unknown errors safely', () => {
    const exception = new Error('internal');
    const envelope = toErrorEnvelope(exception, correlationId);

    expect(envelope).toMatchObject({
      code: 'InternalServerError',
      message: 'An unexpected error occurred',
      correlationId,
    });
  });

  it('serializes thrown strings safely', () => {
    const exception = 'some string error';
    const envelope = toErrorEnvelope(exception, correlationId);

    expect(envelope).toMatchObject({
      code: 'InternalServerError',
      message: 'An unexpected error occurred',
      correlationId,
    });
  });

  it('serializes thrown objects safely', () => {
    const exception = { foo: 'bar' };
    const envelope = toErrorEnvelope(exception, correlationId);

    expect(envelope).toMatchObject({
      code: 'InternalServerError',
      message: 'An unexpected error occurred',
      correlationId,
    });
  });

  it('preserves exact envelope shape', () => {
    const exception = new HttpException('Test', HttpStatus.I_AM_A_TEAPOT);
    const envelope = toErrorEnvelope(exception, correlationId);

    const keys = Object.keys(envelope).sort();
    expect(keys).toEqual(['code', 'correlationId', 'details', 'message']);
  });

  it('code is non-empty string', () => {
    const exception = new HttpException('Test', HttpStatus.BAD_REQUEST);
    const envelope = toErrorEnvelope(exception, correlationId);

    expect(typeof envelope.code).toBe('string');
    expect(envelope.code.length).toBeGreaterThan(0);
  });

  it('message is non-empty string', () => {
    const exception = new HttpException('Test', HttpStatus.BAD_REQUEST);
    const envelope = toErrorEnvelope(exception, correlationId);

    expect(typeof envelope.message).toBe('string');
    expect(envelope.message.length).toBeGreaterThan(0);
  });
});

describe('statusFromException', () => {
  it('returns HTTP status from HttpException', () => {
    const exception = new HttpException('Not Found', HttpStatus.NOT_FOUND);
    expect(statusFromException(exception)).toBe(404);
  });

  it('returns 500 for unknown exceptions', () => {
    expect(statusFromException(new Error())).toBe(500);
    expect(statusFromException('string')).toBe(500);
    expect(statusFromException(null)).toBe(500);
  });
});
