// ============================================================================
// HEALTH CHECK ROUTES
// ============================================================================
// PURPOSE:
// Provides endpoints to check if the API is running and healthy
// 
// WHY WE NEED THIS:
// - Load balancers need to know if server is alive
// - Monitoring tools check this endpoint periodically
// - Helps with debugging "is the server running?"
// - Docker/Kubernetes use this to restart dead servers
//
// WHAT WE CHECK:
// - Is the server responding?
// - Is the server still handling requests?
// - Timestamp (when was server started?)
//
// EXAMPLE RESPONSES:
// GET /health → { ok: true, timestamp: "2024-01-15T10:30:00.000Z" }
// GET /api/v1/health/detailed → { ok: true, uptime: 3600000, ... }
// ============================================================================

const express = require('express');
const router = express.Router();
const config = require('../config/config');

// Track when the application started
// We use this to calculate uptime
const serverStartTime = Date.now();

// ============================================================================
// SIMPLE HEALTH CHECK ENDPOINT
// ============================================================================
// GET /health
// 
// Returns:
// - A simple JSON response indicating the server is alive
// - Fast response with minimal data
// - Used by load balancers and monitoring
//
// TYPICAL USE CASE:
// Kubernetes or Docker container orchestration
// These systems make requests to /health every few seconds
// If no response, they kill the container and start a new one
//
// EXAMPLE REQUEST:
// GET http://localhost:3000/health
//
// EXAMPLE RESPONSE:
// {
//   "ok": true,
//   "timestamp": "2024-01-15T10:30:45.123Z",
//   "uptime": 34500000
// }

router.get('/health', (request, response) => {
  // Calculate uptime in milliseconds
  // Date.now() = current time, serverStartTime = when app started
  // Subtract to get how long app has been running
  const uptime = Date.now() - serverStartTime;
  
  // Send response
  // Status 200 = "OK, everything is fine"
  // json() automatically converts object to JSON and sets Content-Type header
  response.status(200).json({
    ok: true,                          // Simple indicator: yes, I'm healthy
    timestamp: new Date().toISOString(), // ISO 8601 format timestamp
    uptime: uptime,                     // How many milliseconds server has been running
    environment: config.nodeEnv,        // development, testing, or production
  });
});

// ============================================================================
// DETAILED HEALTH CHECK ENDPOINT
// ============================================================================
// GET /api/v1/health/detailed
//
// Returns:
// - Comprehensive health information
// - Includes environment details
// - Used for detailed monitoring dashboards
// - More data than simple /health
//
// TYPICAL USE CASE:
// Admin dashboard or detailed monitoring systems
// Developers checking server status in detail
//
// EXAMPLE REQUEST:
// GET http://localhost:3000/api/v1/health/detailed
//
// EXAMPLE RESPONSE:
// {
//   "status": "healthy",
//   "timestamp": "2024-01-15T10:30:45.123Z",
//   "server": {
//     "uptime": 34500000,
//     "port": 3000,
//     "environment": "development"
//   },
//   "nodeVersion": "v18.14.0",
//   "memory": {...}
// }

router.get('/api/:version/health/detailed', (request, response) => {
  // Get the API version from the URL (:version is a parameter)
  const version = request.params.version;
  
  // Calculate uptime
  const uptime = Date.now() - serverStartTime;
  
  // Convert uptime to human-readable format
  // Example: 3600000 ms = 1 hour
  const uptimeSeconds = Math.floor(uptime / 1000);
  const uptimeMinutes = Math.floor(uptimeSeconds / 60);
  const uptimeHours = Math.floor(uptimeMinutes / 60);
  
  // Get memory usage information
  // process.memoryUsage() returns memory stats in bytes
  const memoryUsage = process.memoryUsage();
  
  // Convert bytes to megabytes (1 MB = 1,048,576 bytes)
  const formatBytes = (bytes) => {
    return (bytes / 1024 / 1024).toFixed(2); // toFixed(2) = 2 decimal places
  };
  
  // Send detailed response
  response.status(200).json({
    // Overall health status
    status: 'healthy',
    
    // Current timestamp
    timestamp: new Date().toISOString(),
    
    // Server information
    server: {
      uptime: uptime,                    // In milliseconds
      uptimeFormatted: `${uptimeHours}h ${uptimeMinutes % 60}m ${uptimeSeconds % 60}s`,
      port: config.port,                 // What port server listens on
      environment: config.nodeEnv,       // development, testing, production
      apiVersion: version,               // Which API version was requested
    },
    
    // Node.js and system information
    system: {
      nodeVersion: process.version,      // Node.js version (v18.14.0, etc.)
      platform: process.platform,        // Windows, Linux, Darwin (Mac)
      arch: process.arch,                // x64, arm64, etc.
    },
    
    // Memory usage (important for monitoring)
    memory: {
      rss: `${formatBytes(memoryUsage.rss)} MB`,        // Total memory allocated
      heapTotal: `${formatBytes(memoryUsage.heapTotal)} MB`, // Total heap space
      heapUsed: `${formatBytes(memoryUsage.heapUsed)} MB`,   // Used heap space
      external: `${formatBytes(memoryUsage.external)} MB`,   // C++ objects memory
    },
    
    // CPU usage (rough estimate)
    cpu: {
      count: require('os').cpus().length,    // How many CPU cores
      usage: process.cpuUsage(),             // CPU time spent in user and system code
    },
  });
});

// ============================================================================
// STARTUP TEST ENDPOINT
// ============================================================================
// GET /api/v1/health/startup
//
// Returns:
// - Status indicating if server is fully started and ready
// - Used by Kubernetes "startup probe"
// - Takes longer than readiness probe
// - Waits for initial setup to complete
//
// TYPICAL USE CASE:
// Kubernetes "startup probe" for applications that need time to initialize
// Database migrations, cache warming, etc.

router.get('/api/:version/health/startup', (request, response) => {
  // In a real app, you'd check:
  // - Is database connected?
  // - Are cache systems ready?
  // - Are external APIs reachable?
  // For now, we just check if we're running
  
  response.status(200).json({
    status: 'started',
    timestamp: new Date().toISOString(),
    message: 'Application has completed startup sequence',
  });
});

// ============================================================================
// READINESS CHECK ENDPOINT
// ============================================================================
// GET /api/v1/health/ready
//
// Returns:
// - Status indicating if server is ready to accept requests
// - Used by Kubernetes "readiness probe"
// - Faster than startup probe
// - Checks if server can actually handle requests right now
//
// TYPICAL USE CASE:
// Kubernetes checks this during normal operation
// If returns error, Kubernetes removes server from load balancer
// This prevents sending requests to servers that are overloaded or failing

router.get('/api/:version/health/ready', (request, response) => {
  // Check if server is ready
  // In production, you'd check:
  // - Is database responding?
  // - Are we getting too many errors?
  // - Is memory usage reasonable?
  
  const isReady = true; // For now, always ready
  
  if (!isReady) {
    return response.status(503).json({
      status: 'not-ready',
      message: 'Server is not ready to accept requests',
    });
  }
  
  response.status(200).json({
    status: 'ready',
    timestamp: new Date().toISOString(),
  });
});

// ============================================================================
// EXPORT
// ============================================================================
// Other files import this router and attach it to Express

module.exports = router;
