// ============================================================================
// LOGGER MIDDLEWARE
// ============================================================================
// PURPOSE:
// Logs information about every HTTP request and response
// Helps with debugging and monitoring what's happening in the app
//
// WHAT IT LOGS:
// - Request method (GET, POST, PUT, DELETE)
// - Request path (/api/v1/vehicles, etc.)
// - Response status code (200, 404, 500, etc.)
// - How long the request took (in milliseconds)
// - Client IP address (where request came from)
//
// WHY IT'S USEFUL:
// - See traffic patterns
// - Identify slow requests
// - Track which endpoints are used most
// - Debug issues by reviewing request history
// ============================================================================

const config = require('../config/config');

// ============================================================================
// REQUEST LOGGER MIDDLEWARE
// ============================================================================
// This runs on EVERY request to log information about it

function requestLogger(request, response, next) {
  // Record when request started (we'll use this to calculate duration)
  // Date.now() returns milliseconds since Jan 1, 1970
  const startTime = Date.now();
  
  // Get client's IP address
  // request.ip contains the IP of the requester
  const clientIp = request.ip || request.connection.remoteAddress;
  
  // Create a beautiful log message
  const logMessage = `
    🔵 ${request.method.padEnd(6)} ${request.path.padEnd(30)} | 
    IP: ${clientIp}
  `;
  
  // We need to know the response status code
  // But response hasn't been sent yet!
  // Solution: Hook into the response "finish" event
  // This runs AFTER response is sent to client
  
  response.on('finish', () => {
    // Calculate how long the request took
    const duration = Date.now() - startTime;
    
    // Choose emoji and color based on status code
    let statusEmoji = '✅'; // Default: success
    if (response.statusCode >= 400 && response.statusCode < 500) {
      statusEmoji = '⚠️ '; // Client error (user's fault)
    } else if (response.statusCode >= 500) {
      statusEmoji = '❌'; // Server error (our fault)
    }
    
    // Create response log with duration
    const responseLog = `
      ${statusEmoji} ${response.statusCode} | ${duration}ms
    `;
    
    // Only log in development to avoid cluttering production logs
    if (config.isDevelopment) {
      console.log(logMessage, responseLog);
    }
  });
  
  // Call next() to pass control to next middleware
  // If we don't call this, the request hangs and never gets processed
  next();
}

// ============================================================================
// EXPORT
// ============================================================================

module.exports = {
  requestLogger,
};
