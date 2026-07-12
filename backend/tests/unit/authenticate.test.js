// ============================================================================
// UNIT TESTS: authenticate middleware
// ============================================================================
// File: tests/unit/authenticate.test.js
//
// PURPOSE:
// Tests the authenticate middleware in complete isolation.
// We mock both supabaseAuthClient and userProfileService so no real
// network calls or database queries ever occur.
// ============================================================================

// IMPORTANT: Mock modules BEFORE requiring the file under test
jest.mock('../../src/config/supabaseAuthClient');
jest.mock('../../src/services/userProfileService');

const authenticate = require('../../src/middleware/authenticate');
const supabaseAuthClient = require('../../src/config/supabaseAuthClient');
const { getUserProfileById } = require('../../src/services/userProfileService');
const AppError = require('../../src/errors/AppError');

// Helper: build a minimal mock request
function makeReq(authHeader) {
  return {
    headers: {
      authorization: authHeader,
    },
  };
}

// Helper: build a mock response (not used by authenticate directly)
function makeRes() {
  return {};
}

// Helper: capture what next() was called with
function makeNext() {
  return jest.fn();
}

// Shared mock data
const MOCK_USER = {
  id: 'user-uuid-1234',
  email: 'user@example.com',
};

const MOCK_PROFILE = {
  id: 'user-uuid-1234',
  email: 'user@example.com',
  role: 'analyst',
};

describe('authenticate middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==========================================================================
  // MISSING / MALFORMED HEADER TESTS
  // ==========================================================================

  it('1. Missing Authorization header passes 401 AUTHENTICATION_REQUIRED to next', async () => {
    const req = makeReq(undefined);
    const res = makeRes();
    const next = makeNext();

    await authenticate(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    const err = next.mock.calls[0][0];
    expect(err).toBeInstanceOf(AppError);
    expect(err.statusCode).toBe(401);
    expect(err.code).toBe('AUTHENTICATION_REQUIRED');
  });

  it('2. Empty Bearer token passes 401 INVALID_AUTHORIZATION_HEADER to next', async () => {
    const req = makeReq('Bearer ');
    const res = makeRes();
    const next = makeNext();

    await authenticate(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    const err = next.mock.calls[0][0];
    expect(err).toBeInstanceOf(AppError);
    expect(err.statusCode).toBe(401);
    expect(err.code).toBe('INVALID_AUTHORIZATION_HEADER');
  });

  it('3. Basic authentication scheme is rejected with 401 INVALID_AUTHORIZATION_HEADER', async () => {
    const req = makeReq('Basic dXNlcjpwYXNz');
    const res = makeRes();
    const next = makeNext();

    await authenticate(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    const err = next.mock.calls[0][0];
    expect(err).toBeInstanceOf(AppError);
    expect(err.statusCode).toBe(401);
    expect(err.code).toBe('INVALID_AUTHORIZATION_HEADER');
  });

  // ==========================================================================
  // INVALID TOKEN TESTS
  // ==========================================================================

  it('4. Invalid token from Supabase passes 401 INVALID_ACCESS_TOKEN to next', async () => {
    supabaseAuthClient.auth = {
      getUser: jest.fn().mockResolvedValue({
        data: { user: null },
        error: { message: 'invalid JWT' },
      }),
    };

    const req = makeReq('Bearer bad-token-value');
    const res = makeRes();
    const next = makeNext();

    await authenticate(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    const err = next.mock.calls[0][0];
    expect(err).toBeInstanceOf(AppError);
    expect(err.statusCode).toBe(401);
    expect(err.code).toBe('INVALID_ACCESS_TOKEN');
  });

  it('5. Expired token (auth error returned) passes 401 INVALID_ACCESS_TOKEN', async () => {
    supabaseAuthClient.auth = {
      getUser: jest.fn().mockResolvedValue({
        data: { user: null },
        error: { message: 'JWT expired' },
      }),
    };

    const req = makeReq('Bearer expired-token');
    const res = makeRes();
    const next = makeNext();

    await authenticate(req, res, next);

    const err = next.mock.calls[0][0];
    expect(err.statusCode).toBe(401);
    expect(err.code).toBe('INVALID_ACCESS_TOKEN');
  });

  // ==========================================================================
  // VALID TOKEN FLOW TESTS
  // ==========================================================================

  it('6. Valid token calls auth.getUser with the exact token string', async () => {
    const getUser = jest.fn().mockResolvedValue({
      data: { user: MOCK_USER },
      error: null,
    });
    supabaseAuthClient.auth = { getUser };
    getUserProfileById.mockResolvedValue(MOCK_PROFILE);

    const req = makeReq('Bearer valid-token-abc');
    await authenticate(req, makeRes(), makeNext());

    expect(getUser).toHaveBeenCalledWith('valid-token-abc');
  });

  it('7. Valid token loads profile using verified user ID', async () => {
    supabaseAuthClient.auth = {
      getUser: jest.fn().mockResolvedValue({
        data: { user: MOCK_USER },
        error: null,
      }),
    };
    getUserProfileById.mockResolvedValue(MOCK_PROFILE);

    const req = makeReq('Bearer valid-token-abc');
    await authenticate(req, makeRes(), makeNext());

    expect(getUserProfileById).toHaveBeenCalledWith(MOCK_USER.id);
  });

  it('8. Valid token attaches req.auth on success', async () => {
    supabaseAuthClient.auth = {
      getUser: jest.fn().mockResolvedValue({
        data: { user: MOCK_USER },
        error: null,
      }),
    };
    getUserProfileById.mockResolvedValue(MOCK_PROFILE);

    const req = makeReq('Bearer valid-token-abc');
    const next = makeNext();
    await authenticate(req, makeRes(), next);

    expect(req.auth).toBeDefined();
  });

  it('9. req.auth contains userId, email, and role only (no token)', async () => {
    supabaseAuthClient.auth = {
      getUser: jest.fn().mockResolvedValue({
        data: { user: MOCK_USER },
        error: null,
      }),
    };
    getUserProfileById.mockResolvedValue(MOCK_PROFILE);

    const req = makeReq('Bearer valid-token-abc');
    await authenticate(req, makeRes(), makeNext());

    expect(req.auth).toEqual({
      userId: MOCK_USER.id,
      email: MOCK_USER.email,
      role: MOCK_PROFILE.role,
    });
  });

  it('10. Access token is not attached to req.auth', async () => {
    supabaseAuthClient.auth = {
      getUser: jest.fn().mockResolvedValue({
        data: { user: MOCK_USER },
        error: null,
      }),
    };
    getUserProfileById.mockResolvedValue(MOCK_PROFILE);

    const req = makeReq('Bearer valid-token-abc');
    await authenticate(req, makeRes(), makeNext());

    expect(req.auth.token).toBeUndefined();
    expect(req.auth.accessToken).toBeUndefined();
    expect(req.auth.access_token).toBeUndefined();
  });

  // ==========================================================================
  // MISSING PROFILE TESTS
  // ==========================================================================

  it('11. Missing user profile passes 403 USER_PROFILE_NOT_FOUND to next', async () => {
    supabaseAuthClient.auth = {
      getUser: jest.fn().mockResolvedValue({
        data: { user: MOCK_USER },
        error: null,
      }),
    };
    getUserProfileById.mockResolvedValue(null); // no profile in DB

    const req = makeReq('Bearer valid-token-abc');
    const next = makeNext();
    await authenticate(req, makeRes(), next);

    const err = next.mock.calls[0][0];
    expect(err).toBeInstanceOf(AppError);
    expect(err.statusCode).toBe(403);
    expect(err.code).toBe('USER_PROFILE_NOT_FOUND');
  });

  // ==========================================================================
  // UNEXPECTED ERROR TESTS
  // ==========================================================================

  it('12. Unexpected profile service error is forwarded to next', async () => {
    supabaseAuthClient.auth = {
      getUser: jest.fn().mockResolvedValue({
        data: { user: MOCK_USER },
        error: null,
      }),
    };
    const dbError = new Error('Unexpected DB connection error');
    getUserProfileById.mockRejectedValue(dbError);

    const req = makeReq('Bearer valid-token-abc');
    const next = makeNext();
    await authenticate(req, makeRes(), next);

    expect(next).toHaveBeenCalledWith(dbError);
  });

  it('13. Raw Supabase error details are NOT placed in the AppError public message', async () => {
    supabaseAuthClient.auth = {
      getUser: jest.fn().mockResolvedValue({
        data: { user: null },
        error: { message: 'secret_supabase_internal_error_ABC123' },
      }),
    };

    const req = makeReq('Bearer some-token');
    const next = makeNext();
    await authenticate(req, makeRes(), next);

    const err = next.mock.calls[0][0];
    expect(err.message).not.toContain('secret_supabase_internal_error_ABC123');
    expect(err.message).not.toContain('ABC123');
  });

  it('14. next() is called (with no error) on successful authentication', async () => {
    supabaseAuthClient.auth = {
      getUser: jest.fn().mockResolvedValue({
        data: { user: MOCK_USER },
        error: null,
      }),
    };
    getUserProfileById.mockResolvedValue(MOCK_PROFILE);

    const req = makeReq('Bearer valid-token-abc');
    const next = makeNext();
    await authenticate(req, makeRes(), next);

    expect(next).toHaveBeenCalledWith(); // called with no arguments
    expect(next).toHaveBeenCalledTimes(1);
  });
});
