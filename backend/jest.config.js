// ============================================================================
// JEST CONFIGURATION
// ============================================================================
// File: jest.config.js
//
// PURPOSE:
// This file configures Jest, the testing framework used in this project.
// Jest is a powerful testing library that makes it easy to write and run tests.
//
// WHY THIS CONFIGURATION?
// - testEnvironment: "node" = runs tests in Node.js (not browser)
// - roots: ["<rootDir>/tests"] = Jest looks for tests in the tests/ folder
// - testMatch: ["**/*.test.js"] = Jest finds all files ending in .test.js
// - clearMocks: true = clears mock history between tests (keeps tests isolated)
// - restoreMocks: true = restores original functions between tests
// - setupFiles: runs setup code before tests start (like setting env vars)
// ============================================================================

module.exports = {
  // Run tests in a Node.js environment (not jsdom which is for browsers)
  testEnvironment: 'node',

  // Jest will look for tests in the tests folder
  roots: ['<rootDir>/tests'],

  // Jest finds test files by this pattern (files ending in .test.js)
  testMatch: ['**/*.test.js'],

  // Automatically clear mock call history between tests
  // This prevents one test from affecting another
  clearMocks: true,

  // Automatically restore mock implementations between tests
  restoreMocks: true,

  // Run setup file before all tests
  // This is where we set test-only environment variables
  setupFiles: ['<rootDir>/tests/setupEnv.js'],

  // Where to generate code coverage reports
  coverageDirectory: 'coverage',

  // Which files to collect coverage from
  collectCoverageFrom: [
    'src/controllers/**/*.js',
    'src/services/**/*.js',
    'src/validators/**/*.js',
    'src/routes/**/*.js',
    'src/utils/**/*.js',
  ],
};
