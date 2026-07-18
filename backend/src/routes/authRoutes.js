// ============================================================================
// AUTHENTICATION ROUTES
// ============================================================================
// File: src/routes/authRoutes.js
//
// PURPOSE:
// Defines the URL endpoints related to authentication state.
// Currently exposes one endpoint:
//
//   GET /api/v1/auth/me  →  Returns the current authenticated user
//
// HOW ROUTING WORKS HERE:
// This router is mounted at '/api/v1' in app.js.
// So router.get('/auth/me') becomes GET /api/v1/auth/me.
//
// MIDDLEWARE ORDER ON PROTECTED ROUTES:
// 1. authenticate  — verifies the token, sets req.auth
// 2. getCurrentUser — reads req.auth and builds the response
// ============================================================================

const express = require('express');
const router = express.Router();

// Import the authenticate middleware to protect this route
const authenticate = require('../middleware/authenticate');

// Import the controller function that handles the response
const { getCurrentUser } = require('../controllers/authController');

// ============================================================================
// GET /auth/me  →  Final URL: GET /api/v1/auth/me
// ============================================================================
// Protected: requires a valid Bearer token.
// Returns: { id, email, role } of the authenticated user.
router.get('/auth/me', authenticate, getCurrentUser);

module.exports = router;
