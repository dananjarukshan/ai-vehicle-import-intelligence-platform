// ============================================================================
// MAIN EXPRESS APPLICATION SETUP
// ============================================================================
// PURPOSE:
// This is the main entry point for the entire Express.js backend
// Everything about the web server is configured here
// Think of this as the "blueprint" for how the server works
//
// WHAT HAPPENS HERE:
// 1. Load configuration
// 2. Import dependencies (Express, CORS, etc.)
// 3. Create Express app
// 4. Set up middleware (code that runs on every request)
// 5. Set up routes (URL endpoints)
// 6. Set up error handling
// 7. Export app so server can start it
//
// ARCHITECTURE CONCEPT:
// Requests flow through this pipeline:
// Request → Middleware 1 → Middleware 2 → Routes → Response
// ============================================================================

// ============================================================================
// STEP 1: LOAD CONFIGURATION
// ============================================================================
// Load all environment variables and configuration settings
// This must be done FIRST before anything else
// If config fails, we want to know immediately

const config = require('./config/config');

console.log('🚀 Starting AI Vehicle Price Estimation Backend');
console.log(`📦 Environment: ${config.nodeEnv}`);
console.log(`🔌 Port: ${config.port}`);

// ============================================================================
// STEP 2: IMPORT DEPENDENCIES
// ============================================================================
// Bring in all the packages we installed via npm

// Express: Framework for building web servers
// Allows us to define routes, middleware, error handling, etc.
const express = require('express');

// CORS: Cross-Origin Resource Sharing
// Allows frontend (different domain/port) to call our API
// Without CORS, browsers block cross-origin requests for security
const cors = require('cors');

// ============================================================================
// STEP 3: CREATE EXPRESS APPLICATION
// ============================================================================
// Create the main Express app object
// This is what we'll add routes and middleware to
// Later, we'll listen on a port to make it a running server

const app = express();

console.log('✅ Express app created');

// ============================================================================
// STEP 4: SET UP MIDDLEWARE
// ============================================================================
// Middleware is code that runs on every request
// They process the request before it reaches route handlers
// Think of it like a security checkpoint before entering a building

// ========================================================================
// BODY PARSER MIDDLEWARE (Built-in to Express)
// ========================================================================
// PURPOSE:
// When client sends JSON data (like form submissions), Express receives it
// as raw binary data (bytes). We need to convert it to JavaScript object.
// These middleware do that conversion.
//
// WHY IMPORTANT:
// Without this, request.body would be undefined
// Request body = the data sent in POST/PUT requests
// Common use cases: form submissions, API data, file uploads
//
// EXAMPLES:
// POST /api/v1/vehicles with body: { "brand": "Toyota", "price": 25000 }
// → Converted to request.body object
// → We can access request.body.brand, request.body.price

// Parse JSON requests
// Limit is 10kb - requests larger than this are rejected
// This prevents attacks using huge payloads
app.use(express.json({ limit: config.requestSizeLimit }));

// Parse URL-encoded form data (like HTML form submissions)
// ?name=John&age=30 gets converted to { name: 'John', age: '30' }
app.use(express.urlencoded({ 
  extended: true, 
  limit: config.requestUrlEncodedLimit 
}));

console.log('✅ Body parser middleware configured');

// ========================================================================
// CORS MIDDLEWARE
// ========================================================================
// PURPOSE:
// Cross-Origin Resource Sharing (CORS) allows websites from different
// domains/ports to communicate with our API
//
// THE PROBLEM:
// Browser security blocks requests across different origins:
// - http://localhost:3000 (backend)
// - http://localhost:5173 (frontend)
// These are different ports, so browser blocks the request
//
// THE SOLUTION:
// We explicitly tell the browser: "Yes, I allow these origins"
// Browser sees this permission and allows the request
//
// CONFIGURATION:
// - origin: Which websites can call our API
// - credentials: Allow cookies/auth headers
// - methods: Which HTTP methods are allowed (GET, POST, etc.)
// - allowedHeaders: Which headers are allowed
//
// SECURITY NOTE:
// Only allow trusted origins! Don't use '*' in production
// '*' means "anyone on the internet can call our API"

const corsOptions = {
  // origin can be:
  // - Array of allowed origins (most secure)
  // - Function that checks if origin is allowed
  // - '*' (allow everyone - only for public APIs)
  origin: Array.isArray(config.corsOrigin) 
    ? config.corsOrigin 
    : [config.corsOrigin],
  
  // Whether to allow cookies/authorization headers
  // Needed if frontend needs to send authentication
  credentials: true,
  
  // Which HTTP methods are allowed
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  
  // Which headers can be sent in requests
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  
  // Max age (how long browser caches CORS policy in seconds)
  // 86400 = 24 hours
  maxAge: 86400,
  
  // Status code for successful CORS requests
  optionsSuccessStatus: 200,
};

// Apply CORS middleware with options
app.use(cors(corsOptions));

console.log('✅ CORS middleware configured');

// ========================================================================
// LOGGING MIDDLEWARE
// ========================================================================
// PURPOSE:
// Logs information about each request and response
// Helps with debugging and monitoring
//
// WHAT IT LOGS:
// - Request method (GET, POST, etc.)
// - Request path
// - Response status
// - How long it took

const dbTestRoutes = require('./routes/dbTest');
app.use(`${config.apiPrefix}/db-test`, dbTestRoutes);
// Creates route at: /api/v1/db-test

const { requestLogger } = require('./middleware/logger');
app.use(requestLogger);

console.log('✅ Logger middleware configured');

// ========================================================================
// REQUEST ID MIDDLEWARE (Good practice for production)
// ========================================================================
// PURPOSE:
// Assigns unique ID to each request
// Helps track a request through the entire system
// Useful when looking at logs from multiple servers
//
// EXAMPLE:
// Request comes in → Assigned ID: "req_12345abc"
// All logs from that request include this ID
// Makes it easy to follow one request through logs

app.use((request, response, next) => {
  // Generate unique ID for this request
  // Date.now() = current timestamp in ms (unique enough for most cases)
  // Math.random() = additional randomness
  request.id = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Make it available in headers for debugging
  response.setHeader('X-Request-ID', request.id);
  
  // Continue to next middleware
  next();
});

console.log('✅ Request ID middleware configured');

// ========================================================================
// HEALTH CHECK ROUTES
// ========================================================================
// These routes check if the server is running and healthy
// Used by monitoring systems and load balancers
//
// WHY SEPARATE FILE:
// Health checks are simple and reusable
// Keeps app.js clean and focused
// Easy to test and modify independently

const healthRoutes = require('./routes/health');

// Register health routes at root path
// /health, /api/v1/health/detailed, etc. all work
app.use('/', healthRoutes);

console.log('✅ Health check routes registered');

// ============================================================================
// STEP 5: ADDITIONAL MIDDLEWARE FOR PRODUCTION
// ============================================================================
// These are good practices for production servers

// ========================================================================
// SECURITY HEADERS
// ========================================================================
// Set security headers to protect against common attacks
// Headers tell browser/client to behave securely

app.use((request, response, next) => {
  // X-Content-Type-Options: Prevent browser from guessing content type
  // If we say "application/json", browser must treat it as JSON
  response.setHeader('X-Content-Type-Options', 'nosniff');
  
  // X-Frame-Options: Prevent embedding our site in iframes
  // Protects against clickjacking attacks
  response.setHeader('X-Frame-Options', 'DENY');
  
  // X-XSS-Protection: Tell older browsers to enable XSS protection
  response.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Content-Security-Policy: Strict rules about what content can be loaded
  // Prevents injecting malicious scripts
  response.setHeader('Content-Security-Policy', "default-src 'self'");
  
  next();
});

console.log('✅ Security headers configured');

// ============================================================================
// STEP 6: SET UP ROUTES
// ============================================================================
// Routes define what happens when someone visits a URL
// They're the actual endpoints of our API
//
// ROUTE FORMAT:
// app.METHOD(PATH, HANDLER)
// METHOD = get, post, put, delete, patch, etc.
// PATH = URL path like /api/v1/vehicles
// HANDLER = function that processes the request and sends response
//
// EXAMPLE ROUTES:
// GET /api/v1/vehicles → Get list of vehicles
// GET /api/v1/vehicles/123 → Get vehicle with ID 123
// POST /api/v1/vehicles → Create new vehicle
// PUT /api/v1/vehicles/123 → Update vehicle with ID 123
// DELETE /api/v1/vehicles/123 → Delete vehicle with ID 123
//
// These will be added here when we build controllers

// Example route to show API is working
// In production, these would be in separate route files
app.get(`${config.apiPrefix}/`, (request, response) => {
  // Send welcome response
  response.json({
    message: 'Welcome to AI Vehicle Price Estimation API',
    version: config.apiVersion,
    environment: config.nodeEnv,
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/health',
      detailedHealth: `/api/${config.apiVersion}/health/detailed`,
      startup: `/api/${config.apiVersion}/health/startup`,
      readiness: `/api/${config.apiVersion}/health/ready`,
    },
  });
});

console.log('✅ Welcome route registered');

// ============================================================================
// STEP 7: ERROR HANDLING
// ============================================================================
// This section catches errors and sends appropriate responses

// Import error handling middleware
const { 
  errorHandler, 
  validationErrorHandler,
  notFoundHandler 
} = require('./middleware/errorHandler');

// Validation error handler (runs before general error handler)
// Catches specific validation errors
app.use(validationErrorHandler);

// 404 Not Found Handler
// This runs if no route matched the request
// IMPORTANT: Must be AFTER all other route definitions
app.use(notFoundHandler);

// General error handler
// IMPORTANT: Must be LAST middleware
// Has 4 parameters (error, req, res, next) so Express knows it's error handler
app.use(errorHandler);

console.log('✅ Error handling middleware configured');

// ============================================================================
// STEP 8: GRACEFUL SHUTDOWN
// ============================================================================
// Handle server shutdown cleanly
// Close database connections, log files, etc.
//
// WHEN DOES THIS RUN:
// - Ctrl+C in terminal
// - Docker container stopping
// - Process manager restarting
// - System shutting down
//
// WHY IMPORTANT:
// - Finish pending requests before stopping
// - Close database connections properly
// - Save any in-memory data
// - Prevent data corruption

// Handle Ctrl+C (SIGINT signal)
process.on('SIGINT', () => {
  console.log('\n⚠️  Received SIGINT, shutting down gracefully...');
  process.exit(0);
});

// Handle kill signals (SIGTERM signal)
process.on('SIGTERM', () => {
  console.log('⚠️  Received SIGTERM, shutting down gracefully...');
  process.exit(0);
});

// Handle unexpected errors
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1); // Exit with error code
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1); // Exit with error code
});

console.log('✅ Graceful shutdown handlers configured');

// ============================================================================
// STEP 9: EXPORT APPLICATION
// ============================================================================
// Export the Express app so server.js can start it
// server.js will listen on a port and make this server accessible

module.exports = app;

console.log('✅ Application setup complete, ready to start server');
