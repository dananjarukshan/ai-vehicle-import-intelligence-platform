// ============================================================================
// UNIT TESTS: authorizeRoles middleware factory
// ============================================================================
// File: tests/unit/authorizeRoles.test.js
//
// PURPOSE:
// Tests the authorizeRoles factory middleware in isolation.
// No network calls, no database — pure function behavior only.
// ============================================================================

const authorizeRoles = require('../../src/middleware/authorizeRoles');
const AppError = require('../../src/errors/AppError');

// Helper: build a minimal mock request with req.auth
function makeReq({ auth = undefined, body = {}, query = {}, headers = {} } = {}) {
  return { auth, body, query, headers };
}

function makeNext() {
  return jest.fn();
}

describe('authorizeRoles middleware factory', () => {
  // ==========================================================================
  // ALLOWED ROLE TESTS
  // ==========================================================================

  it('1. Allowed viewer role calls next() with no error', () => {
    const middleware = authorizeRoles('viewer', 'analyst', 'admin');
    const req = makeReq({ auth: { userId: 'u1', email: 'v@e.com', role: 'viewer' } });
    const next = makeNext();

    middleware(req, {}, next);

    expect(next).toHaveBeenCalledWith(); // no arguments = success
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('2. Allowed analyst role calls next() with no error', () => {
    const middleware = authorizeRoles('analyst', 'admin');
    const req = makeReq({ auth: { userId: 'u2', email: 'a@e.com', role: 'analyst' } });
    const next = makeNext();

    middleware(req, {}, next);

    expect(next).toHaveBeenCalledWith();
  });

  it('3. Allowed admin role calls next() with no error', () => {
    const middleware = authorizeRoles('admin');
    const req = makeReq({ auth: { userId: 'u3', email: 'ad@e.com', role: 'admin' } });
    const next = makeNext();

    middleware(req, {}, next);

    expect(next).toHaveBeenCalledWith();
  });

  // ==========================================================================
  // DISALLOWED ROLE TESTS
  // ==========================================================================

  it('4. Disallowed viewer role passes 403 FORBIDDEN AppError to next', () => {
    const middleware = authorizeRoles('analyst', 'admin'); // viewer not in list
    const req = makeReq({ auth: { userId: 'u1', email: 'v@e.com', role: 'viewer' } });
    const next = makeNext();

    middleware(req, {}, next);

    expect(next).toHaveBeenCalledTimes(1);
    const err = next.mock.calls[0][0];
    expect(err).toBeInstanceOf(AppError);
    expect(err.statusCode).toBe(403);
    expect(err.code).toBe('FORBIDDEN');
    expect(err.message).toBe('You do not have permission to perform this action.');
  });

  // ==========================================================================
  // MISSING req.auth TESTS
  // ==========================================================================

  it('5. Missing req.auth passes 401 AUTHENTICATION_REQUIRED to next', () => {
    const middleware = authorizeRoles('viewer', 'analyst', 'admin');
    const req = makeReq({ auth: undefined }); // authenticate never ran
    const next = makeNext();

    middleware(req, {}, next);

    const err = next.mock.calls[0][0];
    expect(err).toBeInstanceOf(AppError);
    expect(err.statusCode).toBe(401);
    expect(err.code).toBe('AUTHENTICATION_REQUIRED');
  });

  // ==========================================================================
  // SECURITY: Role injection tests
  // ==========================================================================

  it('6. req.body.role = "admin" does not grant access when role is not in req.auth', () => {
    const middleware = authorizeRoles('admin');
    const req = makeReq({
      auth: { userId: 'u1', email: 'v@e.com', role: 'viewer' }, // real role
      body: { role: 'admin' }, // injected in body — ignored
    });
    const next = makeNext();

    middleware(req, {}, next);

    // Should still be denied because req.auth.role is 'viewer'
    const err = next.mock.calls[0][0];
    expect(err).toBeInstanceOf(AppError);
    expect(err.statusCode).toBe(403);
    expect(err.code).toBe('FORBIDDEN');
  });

  it('7. x-user-role: admin header does not grant access when role is not in req.auth', () => {
    const middleware = authorizeRoles('admin');
    const req = makeReq({
      auth: { userId: 'u1', email: 'v@e.com', role: 'viewer' },
      headers: { 'x-user-role': 'admin' }, // injected in header — ignored
    });
    const next = makeNext();

    middleware(req, {}, next);

    const err = next.mock.calls[0][0];
    expect(err.statusCode).toBe(403);
    expect(err.code).toBe('FORBIDDEN');
  });

  it('8. Middleware reads only req.auth.role, not body/query/headers', () => {
    const middleware = authorizeRoles('analyst', 'admin');
    const req = makeReq({
      auth: { userId: 'u2', email: 'a@e.com', role: 'analyst' }, // actual role
      body: { role: 'viewer' },    // different body role — ignored
      query: { role: 'viewer' },   // different query role — ignored
      headers: { 'x-user-role': 'viewer' }, // different header role — ignored
    });
    const next = makeNext();

    middleware(req, {}, next);

    // analyst is in the allowed list → next() called with no error
    expect(next).toHaveBeenCalledWith();
  });
});
