// ============================================================================
// DATABASE TEST ROUTE
// ============================================================================
// File: src/routes/dbTest.js
//
// PURPOSE:
// This is a test route to verify that:
// 1. Supabase client is working
// 2. Database connection is successful
// 3. We can query the vehicles table
// 4. Data can be retrieved from the database
//
// WHY THIS FILE EXISTS:
// - Verifies database connectivity without complex logic
// - Helps debug connection issues early
// - Tests the basic query pattern we'll use throughout app
// - Temporary file (can delete after testing)
// - Educational: Shows how to use Supabase client
//
// ROUTE CREATED:
// GET /api/v1/db-test
// When user visits this URL, returns first 5 vehicles from database
//
// ============================================================================

// ============================================================================
// STEP 1: IMPORT DEPENDENCIES
// ============================================================================
// Import Express for creating routes
// Import the Supabase client we created earlier
// Import config for API version (for response info)

const express = require('express');
const { supabase } = require('../config/supabaseClient');
const config = require('../config/config');

// ============================================================================
// STEP 2: CREATE ROUTER
// ============================================================================
// Create an Express router object
// Think of router as a "mini-app" that handles routes
// Later, we'll attach this router to the main app in app.js

const router = express.Router();

// ============================================================================
// STEP 3: DEFINE THE TEST ROUTE
// ============================================================================
// GET /api/v1/db-test
//
// This route handler is an async function
// async means it can use await keyword for asynchronous operations
// (request, response) are the two parameters:
// - request: the incoming HTTP request with all its data
// - response: what we send back to the client

router.get('/', async (request, response) => {
  try {
    // ========================================================================
    // WHAT HAPPENS HERE:
    // We query the vehicles table from Supabase
    // This is the key line - everything else is explanation
    // ========================================================================

    // ========================================================================
    // STEP 3A: QUERY THE DATABASE
    // ========================================================================
    // const { data, error } = await supabase
    //   .from('vehicles')
    //   .select('*')
    //   .limit(5);
    //
    // Let me break this down into parts:
    //
    // supabase
    //   ↓ This is the client we created in supabaseClient.js
    //   ↓ It's our connection to the database
    //
    // .from('vehicles')
    //   ↓ Tells Supabase: "I want to query the 'vehicles' table"
    //   ↓ Think of it like: "Which table do you want?"
    //   ↓ Response: "The vehicles table"
    //
    // .select('*')
    //   ↓ The asterisk (*) is a wildcard meaning "all columns"
    //   ↓ This says: "Get all columns from the vehicles table"
    //   ↓ If we wanted specific columns: .select('id, brand, price')
    //   ↓ Examples of what select('*') returns:
    //   ↓   id, brand, model, year, price, imageUrl, createdAt, etc.
    //   ↓ (all columns that exist in vehicles table)
    //
    // .limit(5)
    //   ↓ Return maximum 5 records
    //   ↓ If table has 1000 vehicles, only return first 5
    //   ↓ Useful for: not overwhelming the response, testing
    //
    // await
    //   ↓ Wait for the query to complete
    //   ↓ Don't continue until we get the response
    //   ↓ More on this below
    //
    // const { data, error } =
    //   ↓ Destructure the response into two variables:
    //   ↓ data: the actual records from the database
    //   ↓ error: any error that occurred
    //   ↓ More on this below

    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .limit(5);

    // ========================================================================
    // STEP 3B: WHAT IS async/await?
    // ========================================================================
    // async/await is JavaScript syntax for handling asynchronous operations
    //
    // WHAT IS ASYNCHRONOUS?
    // Async = Something that takes time and doesn't happen immediately
    //
    // REAL-WORLD EXAMPLE:
    // You order food at a restaurant:
    // 1. You give order to waiter (send request)
    // 2. Waiter goes to kitchen (request is processing)
    // 3. You wait (blocking code)
    // 4. Chef cooks food (time passes)
    // 5. Waiter brings food back (response arrives)
    // 6. You eat (use the data)
    //
    // DATABASE EXAMPLE:
    // 1. You ask database: "Get me vehicles" (send request)
    // 2. Database processes (time passes, could be seconds)
    // 3. You wait (using await)
    // 4. Database returns data (response arrives)
    // 5. You use the data (process it)
    //
    // WITHOUT await (WRONG):
    //   const { data, error } = supabase.from('vehicles').select('*');
    //   console.log(data);  // ❌ WRONG! data is undefined
    //   // Why? Because query hasn't finished yet!
    //
    // WITH await (CORRECT):
    //   const { data, error } = await supabase.from('vehicles').select('*');
    //   console.log(data);  // ✅ CORRECT! data has the vehicles
    //   // Why? Because await made us wait for the response
    //
    // WHAT async KEYWORD DOES:
    // The word "async" before (request, response) => tells JavaScript:
    // "This function is asynchronous and uses await inside"
    //
    // You can only use await inside async functions!
    //
    // SYNTAX RULE:
    // async function functionName() {
    //   await somethingThatTakesTime();
    // }
    //
    // Or in arrow function form (what we use):
    // async (parameter) => {
    //   await somethingThatTakesTime();
    // }

    // ========================================================================
    // STEP 3C: WHAT DO data AND error MEAN?
    // ========================================================================
    // When Supabase query completes, it returns an object with two properties:
    //
    // const { data, error } = await supabase...
    //
    // SCENARIO 1: Query succeeds
    // data = [                          // Array of records
    //   {
    //     id: 1,
    //     brand: 'Toyota',
    //     model: 'Camry',
    //     price: 25000,
    //     createdAt: '2024-01-15T10:30:00'
    //   },
    //   {
    //     id: 2,
    //     brand: 'Honda',
    //     model: 'Accord',
    //     price: 22000,
    //     createdAt: '2024-01-14T09:15:00'
    //   }
    //   // ... more records up to 5 total
    // ]
    // error = null                      // No error occurred
    //
    // SCENARIO 2: Query fails (table doesn't exist, no permission, etc.)
    // data = null                       // No data returned
    // error = {                         // Error object with details
    //   message: 'relation "vehicles" does not exist',
    //   code: '42P01',
    //   details: '...'
    // }
    //
    // HOW TO RESPOND:
    // Check if error exists
    // - If error exists: something went wrong, handle it
    // - If error is null: query succeeded, use data

    // ========================================================================
    // STEP 3D: ERROR HANDLING
    // ========================================================================
    // Check if an error occurred during the query
    // If error exists (truthy), throw it
    // throw error will jump to the catch block below

    if (error) {
      // An error occurred while querying the database
      // Examples of errors:
      // - Table doesn't exist
      // - No permission to access table
      // - Database connection failed
      // - Invalid query syntax
      // - Network error

      throw error;
      // throw stops execution and jumps to catch block
      // This is better than letting the error silently pass
    }

    // ========================================================================
    // STEP 3E: RETURN SUCCESS RESPONSE
    // ========================================================================
    // If we get here, the query succeeded and data contains results
    // Send a response to the client

    response.status(200).json({
      // 200 = OK, request succeeded
      // .json() converts JavaScript object to JSON and sends it

      // HTTP status code for reference
      status: 200,

      // Human-readable message
      message: 'Database connection successful! Vehicles retrieved.',

      // The actual data from database
      // data is an array of vehicle records
      data: data,

      // How many records were returned
      count: data ? data.length : 0,
      // data.length = number of items in array
      // If data is null, length would fail, so we check: data ? ... : 0

      // API version for debugging
      apiVersion: config.apiVersion,

      // Timestamp when response was generated
      timestamp: new Date().toISOString(),

      // Development helper: connection status
      databaseConnection: {
        status: 'connected',
        message: 'Successfully queried vehicles table',
      },
    });

    // ========================================================================
    // WHAT WE SENT:
    // The client (browser/Postman) receives this JSON:
    // {
    //   "status": 200,
    //   "message": "Database connection successful!...",
    //   "data": [
    //     { id: 1, brand: "Toyota", ... },
    //     { id: 2, brand: "Honda", ... }
    //   ],
    //   "count": 2,
    //   "apiVersion": "v1",
    //   "timestamp": "2024-01-15T10:30:45.123Z",
    //   "databaseConnection": { "status": "connected", ... }
    // }
    // ========================================================================

  } catch (error) {
    // ========================================================================
    // ERROR HANDLING BLOCK
    // ========================================================================
    // If anything goes wrong (error during query, network issue, etc.)
    // we jump here automatically due to throw error
    //
    // The error variable contains details about what went wrong
    // Example error:
    // {
    //   message: 'relation "vehicles" does not exist',
    //   code: 'PGRST',
    //   details: 'Relation "public.vehicles" does not exist'
    // }

    // Log the error to server console
    // This helps developers see what went wrong
    console.error('Database test error:', error);

    // Send error response to client
    response.status(500).json({
      // 500 = Internal Server Error
      // Means something went wrong on our server

      status: 500,

      // Error message
      message: 'Database connection failed',

      // The actual error details
      error: error.message || 'Unknown database error',

      // In development, include full error for debugging
      // In production, don't expose error details for security
      ...(config.isDevelopment && {
        details: error,
      }),

      // Debugging info
      timestamp: new Date().toISOString(),
    });

    // ========================================================================
    // WHAT WE SENT ON ERROR:
    // The client receives:
    // {
    //   "status": 500,
    //   "message": "Database connection failed",
    //   "error": "relation 'vehicles' does not exist",
    //   "details": { ... full error object in development only ... },
    //   "timestamp": "2024-01-15T10:30:45.123Z"
    // }
    // ========================================================================
  }
});

// ============================================================================
// STEP 4: EXPORT THE ROUTER
// ============================================================================
// Make this router available to app.js
// Other files will import this and attach it to Express

module.exports = router;

// ============================================================================
// HOW TO USE THIS ROUTE IN app.js
// ============================================================================
// In src/app.js, add these lines (around routes section):
//
// const dbTestRoutes = require('./routes/dbTest');
// app.use(`${config.apiPrefix}/db-test`, dbTestRoutes);
//
// This creates the route at: /api/v1/db-test
// When user visits that URL, the router above handles it

// ============================================================================
// HOW TO TEST THIS ROUTE
// ============================================================================
//
// AFTER ADDING TO app.js, start the server:
// npm run dev
//
// Then test one of these ways:
//
// OPTION 1: Browser
// Visit: http://localhost:3000/api/v1/db-test
// You'll see JSON response in browser
//
// OPTION 2: curl command
// curl http://localhost:3000/api/v1/db-test
//
// OPTION 3: Postman
// 1. Open Postman
// 2. Create new request
// 3. Method: GET
// 4. URL: http://localhost:3000/api/v1/db-test
// 5. Click Send
// 6. See response in Response panel
//
// OPTION 4: Visual Studio Code REST Client
// Create file: test.http
// Content:
// GET http://localhost:3000/api/v1/db-test
//
// Click "Send Request" above the GET line

// ============================================================================
// EXPECTED RESPONSES
// ============================================================================
//
// SUCCESS RESPONSE (200):
// {
//   "status": 200,
//   "message": "Database connection successful! Vehicles retrieved.",
//   "data": [
//     {
//       "id": 1,
//       "brand": "Toyota",
//       "model": "Camry",
//       "price": 25000,
//       "createdAt": "2024-01-15T10:30:00.000Z"
//     },
//     {
//       "id": 2,
//       "brand": "Honda",
//       "model": "Accord",
//       "price": 22000,
//       "createdAt": "2024-01-14T09:15:00.000Z"
//     }
//   ],
//   "count": 2,
//   "apiVersion": "v1",
//   "timestamp": "2024-01-15T10:35:22.456Z",
//   "databaseConnection": {
//     "status": "connected",
//     "message": "Successfully queried vehicles table"
//   }
// }
//
// ERROR RESPONSE (500):
// {
//   "status": 500,
//   "message": "Database connection failed",
//   "error": "relation \"vehicles\" does not exist",
//   "details": { ... full error in development ... },
//   "timestamp": "2024-01-15T10:35:22.456Z"
// }

// ============================================================================
// TROUBLESHOOTING
// ============================================================================
//
// PROBLEM: GET http://localhost:3000/api/v1/db-test returns 404
// SOLUTION: You forgot to add route to app.js
// Add in app.js:
//   const dbTestRoutes = require('./routes/dbTest');
//   app.use(`${config.apiPrefix}/db-test`, dbTestRoutes);
//
// PROBLEM: Response shows error "relation vehicles does not exist"
// SOLUTION: You haven't created the vehicles table in Supabase yet
// Go to Supabase dashboard and create vehicles table
// Required columns: id (primary key), brand, model, price, createdAt, etc.
//
// PROBLEM: Response shows error about connection
// SOLUTION: Check SUPABASE_URL and SUPABASE_ANON_KEY in .env file
// Make sure they're correct
//
// PROBLEM: Response takes very long time
// SOLUTION: Could be network issue or Supabase slow
// Check Supabase status at status.supabase.com
//
// PROBLEM: Vehicles table is empty
// SOLUTION: Add test data to vehicles table in Supabase dashboard
// Or create another route to insert test data

// ============================================================================
// NEXT STEPS AFTER TESTING
// ============================================================================
// Once you verify this route works:
//
// 1. Delete this file (it's just for testing)
// 2. Remove route from app.js
// 3. Create proper vehicle routes:
//    - src/routes/vehicles.js
//    - src/controllers/vehicleController.js
//    - src/services/vehicleService.js
// 4. Add real endpoints:
//    - GET /api/v1/vehicles (list all)
//    - GET /api/v1/vehicles/:id (get one)
//    - POST /api/v1/vehicles (create)
//    - PUT /api/v1/vehicles/:id (update)
//    - DELETE /api/v1/vehicles/:id (delete)

// ============================================================================
// LEARNING POINTS
// ============================================================================
// This route teaches you:
// ✅ How to use Supabase client
// ✅ async/await pattern
// ✅ How Supabase returns data and errors
// ✅ Error handling with try/catch
// ✅ How to send JSON responses
// ✅ RESTful API patterns
// ✅ How routes connect to controllers
// ✅ Best practices for database queries
