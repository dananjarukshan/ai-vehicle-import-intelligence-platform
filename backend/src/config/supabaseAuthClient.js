// ============================================================================
// SUPABASE AUTHENTICATION CLIENT
// ============================================================================
// File: src/config/supabaseAuthClient.js
//
// PURPOSE:
// This creates a SEPARATE Supabase client specifically for verifying user
// identity (authentication). It is distinct from the database client.
//
// WHY A SEPARATE CLIENT?
// The database client uses the SERVICE ROLE KEY, which has full admin access
// to all tables. We never want to use that key for token verification.
// This auth client uses only the ANON KEY, which has limited public permissions.
//
// WHAT THIS CLIENT DOES:
// When a user logs in on the React frontend, Supabase gives them an "access token"
// (a JWT). When they make requests to our Express backend, they send that token.
// This client calls supabase.auth.getUser(token) to verify the token is real
// and not forged, expired, or tampered with.
//
// SESSION MANAGEMENT:
// We deliberately turn off all session management because:
// - The Express backend is STATELESS — each request is self-contained
// - The frontend manages sessions, not the backend
// - We only need to verify one token at a time, per request
// ============================================================================

// STEP 1: Import the Supabase client factory function
const { createClient } = require('@supabase/supabase-js');

// STEP 2: Read the required environment variables
// - SUPABASE_URL: the URL of your Supabase project (public, not secret)
// - SUPABASE_ANON_KEY: the public anon key (limited permissions only)
// We deliberately do NOT use SUPABASE_SERVICE_ROLE_KEY here.
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

// STEP 3: Validate that both variables are present
// If either is missing, throw an error immediately on startup
// so we know about the misconfiguration right away.
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase auth configuration. ' +
    'Make sure SUPABASE_URL and SUPABASE_ANON_KEY are set in .env file. ' +
    'See .env.example for template.'
  );
}

// STEP 4: Create the auth-only Supabase client
// auth options explained:
//   persistSession: false  — do not store session in memory or storage
//   autoRefreshToken: false — do not try to refresh expired tokens automatically
//   detectSessionInUrl: false — ignore any ?access_token= in the URL
//
// All three are disabled because this is a backend, stateless verifier.
// We only call auth.getUser(token) once per request and discard the result.
const supabaseAuthClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});

// STEP 5: Export the single shared auth client
// All files that need to verify a Supabase token import from here.
// This uses the Singleton pattern — one client instance for the whole app.
module.exports = supabaseAuthClient;
