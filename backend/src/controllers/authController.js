// ============================================================================
// AUTHENTICATION CONTROLLER
// ============================================================================
// File: src/controllers/authController.js
//
// PURPOSE:
// Handles HTTP requests related to authentication state.
// Currently provides one endpoint: GET /api/v1/auth/me
// which returns the currently authenticated user's identity.
//
// NOTE ON SECURITY:
// This controller reads ONLY from req.auth, which was populated
// by the authenticate middleware using verified data.
// It NEVER returns:
//   - access tokens or refresh tokens
//   - passwords or password hashes
//   - raw Supabase user metadata
//   - the service-role key or any secret
// ============================================================================

// Import the standardised success response helper
const { sendSuccess } = require('../utils/apiResponse');

/**
 * GET /api/v1/auth/me
 *
 * Returns the authenticated user's identity: id, email, and role.
 *
 * This endpoint is protected by the authenticate middleware (applied in authRoutes.js).
 * By the time this function runs, req.auth is guaranteed to be populated.
 *
 * @param {express.Request} req - Express request (req.auth already set by authenticate).
 * @param {express.Response} res - Express response object.
 */
function getCurrentUser(req, res) {
  // req.auth was set by the authenticate middleware.
  // It contains: { userId, email, role }
  // We map userId → id for a cleaner public API response.
  const userData = {
    id: req.auth.userId,
    email: req.auth.email,
    role: req.auth.role,
  };

  return sendSuccess(res, 200, 'Authenticated user fetched successfully.', userData);
}

// Export the controller handler function
module.exports = {
  getCurrentUser,
};
