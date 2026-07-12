// ============================================================================
// APP ERROR CLASS
// ============================================================================
// File: src/errors/AppError.js
//
// PURPOSE:
// A custom operational error class that extends the built-in Error class.
// It stores HTTP status codes, validation error lists, stable error codes,
// and preserves an optional internal cause.
// ============================================================================

class AppError extends Error {
  /**
   * Create an AppError.
   * @param {string} message - Human-readable error message.
   * @param {number} statusCode - HTTP status code (default: 500).
   * @param {string} code - Stable error code string (default: 'INTERNAL_SERVER_ERROR').
   * @param {Array|Object} [errors=null] - Optional detailed validation error info.
   * @param {Error} [cause=null] - Optional internal cause of the error.
   */
  constructor(message, statusCode = 500, code = 'INTERNAL_SERVER_ERROR', errors = null, cause = null) {
    super(message);
    
    // Set the error name to AppError for identifying operational errors
    this.name = 'AppError';
    
    // HTTP Status Code
    this.statusCode = statusCode;
    
    // Stable Error Code (e.g. VALIDATION_ERROR)
    this.code = code;
    
    // Optional array or object of sub-errors
    this.errors = errors;
    
    // Indicates this is a known, expected operational error
    this.isOperational = true;
    
    // Preserve the original internal cause (not exposed to clients)
    this.cause = cause;
    
    // Capture the stack trace, excluding the constructor call itself
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
