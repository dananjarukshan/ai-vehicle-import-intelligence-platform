// ============================================================================
// ROLE-BASED AUTHORIZATION MIDDLEWARE FACTORY
// ============================================================================
// File: src/middleware/authorizeRoles.js
//
// PURPOSE:
// This middleware FACTORY returns a middleware function that checks
// whether the authenticated user has one of the allowed roles.
//
// IMPORTANT: authenticate middleware MUST run before this middleware.
// It is authenticate that populates req.auth (including req.auth.role).
// This middleware only reads from req.auth — it never reads from:
//   - req.body       (user-controlled request data)
//   - req.query      (user-controlled URL parameters)
//   - req.headers    (user-controlled HTTP headers)
//
// HOW A FACTORY WORKS:
// Instead of a single middleware function, authorizeRoles is a function
// that RETURNS a middleware function. This lets us specify different
// allowed roles for different routes:
//
//   router.get('/vehicles', authenticate, authorizeRoles('viewer', 'analyst', 'admin'), handler)
//   router.delete('/vehicles/:id', authenticate, authorizeRoles('admin'), handler)
//
// EXPRESS 5 NOTE:
// Express 5 does NOT auto-catch errors from synchronous middleware unless
// you throw inside an async function. Since this middleware is synchronous,
// we use next(error) instead of throw for proper forwarding.
// ============================================================================

const AppError = require('../errors/AppError');

/**
 * Creates an Express middleware that allows only specific roles.
 *
 * USAGE:
 *   authorizeRoles('admin')                    // admin only
 *   authorizeRoles('analyst', 'admin')         // analyst or admin
 *   authorizeRoles('viewer', 'analyst', 'admin') // all roles
 *
 * @param {...string} allowedRoles - The roles permitted to access the route.
 * @returns {function} Express middleware function (req, res, next)
 */
function authorizeRoles(...allowedRoles) {
  // Return the actual Express middleware function
  return function (req, res, next) {
    // ========================================================================
    // GUARD: Check that authenticate has already run
    // ========================================================================
    // If req.auth is missing, the authenticate middleware did not run first.
    // This is a programming error in route setup, but we handle it safely.
    if (!req.auth) {
      return next(new AppError(
        'Authentication is required.',
        401,
        'AUTHENTICATION_REQUIRED'
      ));
    }

    // ========================================================================
    // CHECK: Is the user's role in the list of allowed roles?
    // ========================================================================
    // req.auth.role was set by authenticate middleware from our database.
    // It is the ONLY source we trust for the role value.
    const userRole = req.auth.role;

    if (!allowedRoles.includes(userRole)) {
      // The user is authenticated but does not have permission for this action.
      return next(new AppError(
        'You do not have permission to perform this action.',
        403,
        'FORBIDDEN'
      ));
    }

    // ========================================================================
    // SUCCESS: Role is allowed — proceed to the next middleware/controller
    // ========================================================================
    next();
  };
}

module.exports = authorizeRoles;
