// ============================================================================
// CONFIGURATION FILE - Config Module
// ============================================================================
// PURPOSE: 
// This file is a single source of truth for all configuration values
// Instead of hardcoding values throughout the app, we load them here
// This makes it easy to change settings without modifying code
//
// BENEFITS:
// - Change environment without editing code
// - Sensitive values (passwords, API keys) are separated from code
// - Different teams can use different configs without conflicts
// - Easy to spot all configuration in one place
//
// HOW IT WORKS:
// 1. First line loads .env file variables into process.env
// 2. Then we export an object with all our config values
// 3. Other files import this and use the values
// ============================================================================

// Load environment variables from .env file into process.env
// This must be FIRST before anything else!
// process.env is Node.js's built-in object that stores environment variables
require('dotenv').config();

// ============================================================================
// CONFIGURATION OBJECT
// ============================================================================
// This object groups all configuration values by category
// We use process.env to get values, with sensible defaults if not set

const config = {
  // ========================================================================
  // ENVIRONMENT SETTINGS
  // ========================================================================
  // These determine how the app behaves overall
  
  // NODE_ENV tells the app whether it's in development, testing, or production
  // Different behaviors trigger based on this value
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Is this production environment? (returns true/false)
  // Used for decisions like: show detailed errors? use compression?
  isProduction: process.env.NODE_ENV === 'production',
  
  // Is this development environment?
  isDevelopment: process.env.NODE_ENV === 'development',

  // ========================================================================
  // SERVER SETTINGS
  // ========================================================================
  // These control how Express server runs
  
  // The port number that Express listens on
  // 3000 is common for development, 80/443 for production
  // process.env.PORT comes from either:
  // - .env file
  // - Command line (npm start -- --port 5000)
  // - System environment variable
  port: process.env.PORT || 3000,
  
  // The host the server listens on
  // 'localhost' = only accessible from this computer
  // '0.0.0.0' = accessible from any network address
  host: process.env.HOST || 'localhost',

  // ========================================================================
  // API SETTINGS
  // ========================================================================
  // These control API-specific behavior
  
  // API version (used in URL routes like /api/v1/)
  apiVersion: process.env.API_VERSION || 'v1',
  
  // Complete API prefix that will be used for routes
  // Example: /api/v1
  apiPrefix: `/api/${process.env.API_VERSION || 'v1'}`,

  // ========================================================================
  // DATABASE SETTINGS
  // ========================================================================
  // These control how we connect to the database
  
  // The complete URL to connect to database
  // Format: mongodb://host:port/database or postgresql://...
  // This is needed when we create database connections
  databaseUrl: process.env.DATABASE_URL || 'mongodb://localhost:27017/ai-vehicle',
  
  // Database name (extracted from URL for some use cases)
  databaseName: process.env.DATABASE_NAME || 'ai-vehicle',

  // ========================================================================
  // SECURITY SETTINGS
  // ============================================================================
  // These are critical for protecting user data and authentication
  
  // JWT_SECRET is used to sign and verify authentication tokens
  // When a user logs in, we create a token signed with this secret
  // When they send requests, we verify the token using this same secret
  // If someone changes the token, the secret won't match and it fails
  // CRITICAL: Change this in production! Never use the default
  jwtSecret: process.env.JWT_SECRET || 'change-me-in-production-with-a-long-random-string',
  
  // How long JWT tokens remain valid (in hours)
  // After this time, user must login again
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',

  // ========================================================================
  // LOGGING SETTINGS
  // ========================================================================
  // These control what information gets logged (printed out)
  
  // Log level determines verbosity: debug > info > warn > error
  // debug: prints everything (too much for production)
  // info: prints important events (good for production)
  // warn: only warnings and errors
  // error: only critical errors
  logLevel: process.env.LOG_LEVEL || 'info',

  // ========================================================================
  // CORS SETTINGS (Cross-Origin Resource Sharing)
  // ========================================================================
  // These control which websites can make requests to our API
  // A website at https://example.com cannot normally call our API
  // We must explicitly allow it (for security)
  
  // List of allowed origins (websites that can call our API)
  // In development: allow localhost and testing URLs
  // In production: only allow your actual frontend domain
  corsOrigin: process.env.CORS_ORIGIN || [
    'http://localhost:3000',      // Frontend during development
    'http://localhost:5173',      // Vite dev server
    'http://127.0.0.1:3000',      // Alternative localhost
  ],

  // ========================================================================
  // REQUEST SETTINGS
  // ========================================================================
  // These control how Express handles incoming requests
  
  // Maximum JSON request size (prevents huge uploads from crashing server)
  // Format: '10kb', '5mb', etc.
  // If someone sends more data than this, we reject the request
  requestSizeLimit: process.env.REQUEST_SIZE_LIMIT || '10kb',
  
  // Maximum URL-encoded form size
  requestUrlEncodedLimit: process.env.REQUEST_URLENCODED_LIMIT || '10kb',
};

// ============================================================================
// VALIDATION
// ============================================================================
// Check that critical values are set and sensible
// This prevents hard-to-debug issues from bad configuration

function validateConfig() {
  // These values MUST be set
  const requiredValues = ['nodeEnv', 'port', 'databaseUrl', 'jwtSecret'];
  
  const missingValues = requiredValues.filter(key => !config[key]);
  
  if (missingValues.length > 0) {
    console.error('❌ CONFIGURATION ERROR: Missing required values:', missingValues);
    console.error('Make sure .env file has all required variables');
    process.exit(1); // Stop the application
  }
  
  // Warn if using default JWT secret in production (security risk!)
  if (config.isProduction && config.jwtSecret === 'change-me-in-production-with-a-long-random-string') {
    console.warn('⚠️  WARNING: Using default JWT secret in production!');
    console.warn('Set JWT_SECRET environment variable to a long random string');
  }
  
  console.log('✅ Configuration validated successfully');
}

// Run validation when this file is loaded
validateConfig();

// ============================================================================
// EXPORT
// ============================================================================
// Other files import this to get configuration values
// Example in app.js:
// const config = require('./config/config');
// const port = config.port;

module.exports = config;
