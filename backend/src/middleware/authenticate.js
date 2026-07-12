// ============================================================================
// AUTHENTICATION MIDDLEWARE
// ============================================================================
// File: src/middleware/authenticate.js
//
// PURPOSE:
// This middleware runs on every protected route BEFORE the controller.
// It verifies the caller's Supabase access token and loads their role
// from the database. If everything checks out, it attaches a safe
// identity object (req.auth) and calls next() to proceed.
//
// FLOW:
//   1. Read Authorization header
//   2. Parse "Bearer <token>"
//   3. Verify token with Supabase Auth (supabaseAuthClient.auth.getUser)
//   4. Load user profile from database (getUserProfileById)
//   5. Attach req.auth = { userId, email, role }
//   6. Call next()
//
// WHY NOT JUST DECODE THE JWT?
// A decoded JWT shows who claims to be the user, but we cannot trust it
// without verifying the signature against Supabase's secrets.
// auth.getUser() does the cryptographic verification for us.
//
// WHY NOT USE USER_METADATA?
// Supabase stores user_metadata inside the JWT itself. A user could
// theoretically craft a token with any metadata they want. Our user_profiles
// table is the authoritative, server-controlled source for roles.
//
// EXPRESS 5 NOTE:
// Express 5 automatically catches errors thrown inside async functions
// and forwards them to the error handler. No asyncHandler wrapper needed.
// ============================================================================

// The auth-only Supabase client (uses anon key, verifies tokens)
const supabaseAuthClient = require('../config/supabaseAuthClient');

// The profile service that reads role from our database
const {
  getUserProfileById
} = require('../services/userProfileService');

// Our custom error class
const AppError = require('../errors/AppError');

/**
 * Express middleware that authenticates incoming requests.
 *
 * On success: attaches req.auth = { userId, email, role } and calls next().
 * On failure: throws an AppError which propagates to the centralized errorHandler.
 *
 * @param {express.Request} req - Express request object.
 * @param {express.Response} res - Express response object.
 * @param {express.NextFunction} next - Express next callback.
 */
async function authenticate(req, res, next) {
  try {
    // ========================================================================
    // STEP 1: Read the Authorization header
    // ========================================================================
    // The header must be present and have the exact format:
    //   Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
    const authorizationHeader = req.headers.authorization;

    // If the header is completely missing, the request is unauthenticated.
    if (!authorizationHeader) {
      throw new AppError(
        'Authentication is required.',
        401,
        'AUTHENTICATION_REQUIRED'
      );
    }

    // ========================================================================
    // STEP 2: Parse "Bearer <token>" format
    // ========================================================================
    // Split on the first space: ['Bearer', 'eyJhb...']
    const parts = authorizationHeader.split(' ');
    const scheme = parts[0];        // e.g. "Bearer"
    const accessToken = parts[1];   // e.g. "eyJhb..."

    // Reject if the scheme is not "Bearer" or the token part is missing/empty
    if (scheme !== 'Bearer' || !accessToken || accessToken.trim() === '') {
      throw new AppError(
        'A valid Bearer access token is required.',
        401,
        'INVALID_AUTHORIZATION_HEADER'
      );
    }

    // ========================================================================
    // STEP 3: Verify the token with Supabase Auth
    // ========================================================================
    // This makes a network call to Supabase to cryptographically verify
    // the token. It returns the verified user object if the token is valid.
    //
    // We intentionally do NOT attempt to decode the JWT ourselves.
    // Only Supabase knows if this token is valid, unexpired, and untampered.
    let user;
    try {
      const { data, error } = await supabaseAuthClient.auth.getUser(accessToken);

      // If Supabase returns an error or no user, the token is invalid/expired
      if (error || !data.user) {
        throw new AppError(
          'The access token is invalid or expired.',
          401,
          'INVALID_ACCESS_TOKEN'
        );
      }

      user = data.user;
    } catch (supabaseError) {
      // If the error is already an AppError we created above, re-throw it
      if (supabaseError instanceof AppError) {
        throw supabaseError;
      }
      // Otherwise this is an unexpected Supabase network/service error.
      // We do NOT expose the raw Supabase error message to the client.
      throw new AppError(
        'The access token is invalid or expired.',
        401,
        'INVALID_ACCESS_TOKEN'
      );
    }

    // ========================================================================
    // STEP 4: Load the user's profile from our database
    // ========================================================================
    // The profile contains the user's role (e.g. 'viewer', 'analyst', 'admin')
    // which is the ONLY source of truth for authorization decisions.
    const profile = await getUserProfileById(user.id);

    // If no profile exists, the user is authenticated with Supabase but
    // has not been provisioned in our system — deny access.
    if (!profile) {
      throw new AppError(
        'An authorized user profile was not found.',
        403,
        'USER_PROFILE_NOT_FOUND'
      );
    }

    // ========================================================================
    // STEP 5: Attach safe identity to req.auth
    // ========================================================================
    // We attach ONLY the fields needed by the application.
    // NEVER attach the access token, refresh token, raw JWT, or password.
    // The role comes from our database, not from the JWT payload.
    req.auth = {
      userId: user.id,
      email: user.email,
      role: profile.role,
    };

    // Optionally attach the verified Supabase user object for reference
    // (contains Supabase-specific metadata, NOT used for authorization)
    req.user = user;

    // ========================================================================
    // STEP 6: Authentication successful — continue to next middleware
    // ========================================================================
    next();

  } catch (error) {
    // Forward all errors (AppError or unexpected) to the centralized errorHandler
    next(error);
  }
}

module.exports = authenticate;
