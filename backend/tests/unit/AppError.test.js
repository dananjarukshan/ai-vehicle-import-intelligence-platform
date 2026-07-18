// ============================================================================
// APP ERROR UNIT TESTS
// ============================================================================
// File: backend/tests/unit/AppError.test.js
//
// PURPOSE:
// Verifies that AppError extends Error, stores statusCode, code, sub-errors,
// operational flag, cause, and captures a stack trace.
// ============================================================================

const AppError = require('../../src/errors/AppError');

describe('AppError Unit Tests', () => {
  it('1. It extends Error', () => {
    const error = new AppError('Test error message');
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(AppError);
  });

  it('2. It stores statusCode', () => {
    const error = new AppError('Not Found', 404);
    expect(error.statusCode).toBe(404);
  });

  it('3. It stores code', () => {
    const error = new AppError('Conflict', 409, 'CONFLICT_ERROR');
    expect(error.code).toBe('CONFLICT_ERROR');
  });

  it('4. It stores errors (sub-errors)', () => {
    const subErrors = ['Invalid email', 'Password too short'];
    const error = new AppError('Validation failed', 400, 'VALIDATION_ERROR', subErrors);
    expect(error.errors).toEqual(subErrors);
  });

  it('5. It marks isOperational true', () => {
    const error = new AppError('Operational issue');
    expect(error.isOperational).toBe(true);
  });

  it('6. It preserves cause', () => {
    const originalError = new Error('Root cause error');
    const error = new AppError('Failure due to cause', 500, 'INTERNAL_ERROR', null, originalError);
    expect(error.cause).toBe(originalError);
  });

  it('7. It contains a stack trace referencing the source file', () => {
    const error = new AppError('Something went wrong');
    expect(error.stack).toBeDefined();
    expect(typeof error.stack).toBe('string');
    // The stack must reference the AppError class or the test caller file
    expect(error.stack).toContain('AppError');
  });
});
