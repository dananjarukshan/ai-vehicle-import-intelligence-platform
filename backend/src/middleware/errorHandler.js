// ============================================================================
// ERROR HANDLING MIDDLEWARE
// ============================================================================
// PURPOSE:
// Middleware is code that runs during request/response processing
// This middleware catches errors from anywhere in the app and handles them
// Prevents crashing and ensures clients get meaningful error responses
//
// HOW MIDDLEWARE WORKS:
// Requests flow through middleware in order (like a pipeline):
// Request → Middleware 1 → Middleware 2 → Routes → Response
// This error handler catches exceptions anywhere and responds with error info
//
// WHY SEPARATE FILE:
// Keeps error handling logic organized and reusable
// Can be used in multiple Express apps
// Easy to modify error handling without touching main app file
// ============================================================================

const config = require('../config/config');

// ============================================================================
// ERROR RESPONSE FORMATTER
// ============================================================================
// Helper function to create consistent error response format
// All errors should look the same so frontend can handle them uniformly

function formatErrorResponse(error, request, statusCode) {
  return {
    // Whether the request succeeded (always false for error)
    success: false,
    
    // HTTP status code (400, 404, 500, etc.)
    status: statusCode,
    
    // Human-readable error message for the client
    message: error.message || 'An unexpected error occurred',
    
    // Error code (helps frontend handle specific errors)
    // Example: 'VALIDATION_ERROR', 'NOT_FOUND', etc.
    code: error.code || 'INTERNAL_ERROR',
    
    // Request details (helps debugging)
    request: {
      method: request.method,        // GET, POST, PUT, DELETE, etc.
      path: request.path,            // /api/v1/vehicles, etc.
      timestamp: new Date().toISOString(), // When error happened
    },
    
    // ONLY in development: include stack trace
    // Stack trace shows exactly which line caused error (very helpful for debugging)
    // We DON'T send this in production (security: don't reveal code structure)
    ...(config.isDevelopment && { stack: error.stack }),
  };
}

// ============================================================================
// MAIN ERROR HANDLER MIDDLEWARE
// ============================================================================
// This is the master error catching middleware
// Express automatically calls this when errors occur anywhere in the app
//
// NOTE: Must have exactly 4 parameters (error, req, res, next)
// If missing a parameter, Express won't recognize it as error handler!

function errorHandler(error, request, response, next) {
  
  // Determine HTTP status code based on error type
  // Default to 500 (Internal Server Error) if not specified
  const statusCode = error.statusCode || error.status || 500;
  
  // Log error details (helpful for debugging)
  // In production, these logs go to a logging service
  // In development, they appear in terminal
  if (config.isDevelopment) {
    // Development: Show full error for debugging
    console.error('❌ ERROR:', {
      message: error.message,
      status: statusCode,
      stack: error.stack,
      path: request.path,
      method: request.method,
      timestamp: new Date().toISOString(),
    });
  } else {
    // Production: Log less detail for security
    console.error('❌ ERROR:', {
      message: error.message,
      status: statusCode,
      path: request.path,
      method: request.method,
    });
  }
  
  // Create the error response object using our formatter
  const errorResponse = formatErrorResponse(error, request, statusCode);
  
  // Send the error response to client
  response.status(statusCode).json(errorResponse);
}

// ============================================================================
// VALIDATION ERROR HANDLER
// ============================================================================
// Specific middleware for handling validation errors
// Called when user sends bad data (invalid email, negative price, etc.)

function validationErrorHandler(error, request, response, next) {
  // Check if this is a validation error
  if (error.name === 'ValidationError' || error.isValidationError) {
    // Format validation errors nicely
    const errorResponse = {
      success: false,
      status: 400, // 400 = Bad Request
      message: 'Validation error: Please check your input',
      code: 'VALIDATION_ERROR',
      
      // Include specific field errors
      errors: error.errors || {
        [error.field]: error.message,
      },
      
      request: {
        method: request.method,
        path: request.path,
        timestamp: new Date().toISOString(),
      },
    };
    
    return response.status(400).json(errorResponse);
  }
  
  // If not a validation error, pass to next middleware
  // next() means "continue processing with other middleware"
  next(error);
}

// ============================================================================
// 404 NOT FOUND HANDLER
// ============================================================================
// Runs if a request reaches here without matching any route
// This should be added LAST in Express app (after all routes)
// If we reach this, no route matched the request

function notFoundHandler(request, response) {
  const errorResponse = {
    success: false,
    status: 404,
    message: `The requested endpoint ${request.method} ${request.path} was not found`,
    code: 'NOT_FOUND',
    request: {
      method: request.method,
      path: request.path,
      timestamp: new Date().toISOString(),
    },
  };
  
  response.status(404).json(errorResponse);
}

// ============================================================================
// EXPORT MIDDLEWARE FUNCTIONS
// ============================================================================
// Other files import these to use them in the Express app

module.exports = {
  // Main error handler (catches all errors)
  errorHandler,
  
  // Specific validation error handler
  validationErrorHandler,
  
  // 404 handler
  notFoundHandler,
  
  // Helper function (exported in case routes need it)
  formatErrorResponse,
};
