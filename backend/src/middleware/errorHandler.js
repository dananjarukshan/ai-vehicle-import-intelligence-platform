// ============================================================================
// ERROR HANDLING MIDDLEWARE
// ============================================================================
// File: src/middleware/errorHandler.js
//
// PURPOSE:
// The centralized error handler for the Express application.
// Catches and logs all errors, hides raw details (like Supabase details) from
// clients in production, and sends a standard response shape.
// ============================================================================

/**
 * Centralized error handler middleware.
 * Signature: function errorHandler(err, req, res, next)
 * 
 * @param {Error} err - The error object.
 * @param {express.Request} req - The Express request object.
 * @param {express.Response} res - The Express response object.
 * @param {express.NextFunction} next - The next middleware callback.
 */
function errorHandler(err, req, res, next) {
  // 1. If headers have already been sent to the client, delegate to the default Express error handler
  if (res.headersSent) {
    return next(err);
  }

  // 2. Determine default values for HTTP status, message, and error code
  let statusCode = err.statusCode || err.status || 500;
  let safeMessage = 'An unexpected error occurred.';
  let safeCode = 'INTERNAL_SERVER_ERROR';
  let validationErrors = null;

  // 3. Handle known operational AppError instances
  if (err.name === 'AppError' || err.isOperational) {
    statusCode = err.statusCode;
    safeMessage = err.message;
    safeCode = err.code || 'INTERNAL_SERVER_ERROR';
    validationErrors = err.errors || null;
  }
  // 5. Handle malformed JSON body-parser errors
  else if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    statusCode = 400;
    safeMessage = 'Request body contains invalid JSON.';
    safeCode = 'INVALID_JSON';
  }

  // 6. Get request ID if available from the request object
  const requestId = req.id || null;

  // 7. Log full internal error details on the server console
  console.error('❌ ERROR:', {
    requestId,
    method: req.method,
    path: req.path,
    statusCode,
    message: err.message, // internal raw error message
    stack: err.stack,
    cause: err.cause || null
  });

  // 9 & 10. Stripping debug details in non-development environments (production and test)
  const isDev = process.env.NODE_ENV === 'development';

  // 11. Build standard response shape
  const responseBody = {
    success: false,
    message: safeMessage,
    code: safeCode
  };

  if (validationErrors !== null) {
    responseBody.errors = validationErrors;
  }

  if (requestId !== null) {
    responseBody.requestId = requestId;
  }

  // In development, append debug info
  if (isDev) {
    responseBody.stack = err.stack;
    if (err.cause) {
      responseBody.cause = err.cause.message || err.cause;
    }
  }

  return res.status(statusCode).json(responseBody);
}

/**
 * Validation error handler kept for backwards compatibility but not registered in app.js
 */
function validationErrorHandler(err, req, res, next) {
  next(err);
}

module.exports = {
  errorHandler,
  validationErrorHandler
};
