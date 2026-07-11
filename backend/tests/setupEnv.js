// ============================================================================
// TEST ENVIRONMENT SETUP
// ============================================================================
// File: tests/setupEnv.js
//
// PURPOSE:
// This file runs BEFORE all tests start. We use it to set test-only environment
// variables that allow the Express app to load without connecting to real Supabase.
//
// WHY SEPARATE FILE?
// Tests should be isolated and not affect the real database. By setting test-only
// environment variables here, the app loads with dummy values instead of trying
// to connect to the production Supabase service.
//
// SECURITY NOTE:
// These are intentionally dummy values that don't connect to anything real.
// They only exist to make the Express app load successfully during tests.
// ============================================================================

/**
 * Set environment variables for testing.
 * These prevent the app from trying to connect to the real Supabase database.
 */
function setupTestEnvironment() {
  // Set test-only environment
  process.env.NODE_ENV = 'test';

  // Set basic server configuration
  process.env.PORT = '3001'; // Different port to avoid conflicts
  process.env.HOST = 'localhost';

  // Set API configuration
  process.env.API_VERSION = 'v1';

  // Set dummy Supabase credentials (not real, just harmless values)
  // These prevent the app from crashing when loading config
  // but will not connect to any real database
  process.env.SUPABASE_URL = 'https://test-supabase-url-placeholder.supabase.co';
  process.env.SUPABASE_ANON_KEY = 'test-anon-key-not-real-just-for-loading';
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key-not-real-just-for-loading';

  // Set JWT secret (any value is fine for testing)
  process.env.JWT_SECRET = 'test-jwt-secret-for-testing-only';

  // Set logging level to minimize console noise during tests
  process.env.LOG_LEVEL = 'error';

  // Set CORS origins for testing
  process.env.CORS_ORIGIN = 'http://localhost:3001';

  console.log('✅ Test environment setup complete');
}

// Execute setup
setupTestEnvironment();
