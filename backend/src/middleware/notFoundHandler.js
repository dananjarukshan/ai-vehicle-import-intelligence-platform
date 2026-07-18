// ============================================================================
// 404 NOT FOUND MIDDLEWARE
// ============================================================================
// File: src/middleware/notFoundHandler.js
//
// PURPOSE:
// Catches requests that don't match any registered route, creating a 404
// AppError and forwarding it to the centralized error handler.
// ============================================================================

const AppError = require('../errors/AppError');

/**
 * Express middleware to handle unmatched routes.
 * 
 * @param {express.Request} req - The Express HTTP Request object.
 * @param {express.Response} res - The Express HTTP Response object.
 * @param {express.NextFunction} next - The Express Next callback.
 */
function notFoundHandler(req, res, next) {
  const message = `Route ${req.method} ${req.originalUrl || req.path} was not found.`;
  
  // Forward a ROUTE_NOT_FOUND error to the centralized error handler
  next(new AppError(message, 404, 'ROUTE_NOT_FOUND'));
}

module.exports = notFoundHandler;
