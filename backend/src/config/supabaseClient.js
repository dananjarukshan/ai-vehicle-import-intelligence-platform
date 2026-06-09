// ============================================================================
// SUPABASE CLIENT CONFIGURATION
// ============================================================================
// File: src/config/supabaseClient.js
//
// PURPOSE:
// This file creates and exports a reusable Supabase database client
// Think of it as a "connection bridge" between your Node.js backend
// and your Supabase PostgreSQL database in the cloud
//
// WHY THIS FILE EXISTS:
// 1. Centralizes database connection - one place to manage it
// 2. Prevents creating multiple clients - uses only one shared instance
// 3. Loads credentials safely from environment variables
// 4. Makes it easy to use Supabase throughout the app
// 5. Follows best practices for configuration management
//
// WHAT IS SUPABASE:
// Supabase = PostgreSQL database hosted in the cloud
// It provides a JavaScript library (@supabase/supabase-js) to connect
// This library handles all the complex networking for us
//
// ============================================================================

// ============================================================================
// STEP 1: IMPORT THE SUPABASE CLIENT LIBRARY
// ============================================================================
// We import createClient from @supabase/supabase-js
// createClient is a function that establishes connection to Supabase
// 
// Think of it like:
// - You want to call a pizza restaurant
// - You need the phone number (SUPABASE_URL)
// - You need proof you're allowed to order (SUPABASE_ANON_KEY)
// - createClient dials the phone and handles the call for you

const { createClient } = require('@supabase/supabase-js');

// ============================================================================
// STEP 2: LOAD ENVIRONMENT VARIABLES
// ============================================================================
// Get the configuration from environment variables
// These are loaded from .env file by dotenv in app.js
// process.env is Node.js's built-in object that stores all env variables
//
// REQUIRED ENVIRONMENT VARIABLES:
// 1. SUPABASE_URL - The internet address of your database
//    Example: https://svwfaeqfhuubxnwgbsnd.supabase.co
//    This is public (everyone can see this URL)
//
// 2. SUPABASE_ANON_KEY - Anonymous public key for client-side access
//    Example: sb_publishable_aurUYZlVfLqys-oAs-q7QA_oDJvA4nz
//    This is like a password, but restricted to public operations
//
// WHY USE ENVIRONMENT VARIABLES:
// - Never hardcode secrets in code
// - Different developers can have different databases
// - Production database different from development
// - If exposed, just change .env, don't modify code
// - Easier to change without redeploying code

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

// ============================================================================
// STEP 3: VALIDATE THAT CREDENTIALS ARE PROVIDED
// ============================================================================
// Check if both required variables are set
// If missing, throw an error immediately
// Better to crash on startup than have cryptic errors later
//
// WHY VALIDATE:
// - Catch configuration errors early
// - Show clear error message instead of confusing database errors
// - Prevents runtime failures
// - Good defensive programming practice

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase configuration. ' +
    'Make sure SUPABASE_URL and SUPABASE_ANON_KEY are set in .env file. ' +
    'See .env.example for template.'
  );
}

// ============================================================================
// STEP 4: CREATE THE SUPABASE CLIENT
// ============================================================================
// Call createClient function with our credentials
// This establishes the connection to Supabase
// The client object is stored in the "supabase" constant
//
// WHAT createClient DOES:
// 1. Takes your credentials
// 2. Validates them
// 3. Sets up the connection to Supabase
// 4. Returns a client object you can use
// 5. The client handles all networking automatically
//
// WHAT'S IN THE RETURNED OBJECT:
// The client object has methods like:
// - client.from('table_name').select() - Query data
// - client.from('table_name').insert(data) - Add data
// - client.from('table_name').update(data) - Change data
// - client.from('table_name').delete() - Remove data
// - client.auth.signUp() - Create user account
// - client.auth.signIn() - User login
//
// EXAMPLE USAGE (you'll see this in routes/controllers):
// const vehicles = await supabase
//   .from('vehicles')
//   .select('*')
//   .limit(10);
//
// This reads as: "From the vehicles table, select everything, limit to 10 rows"

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ============================================================================
// IMPORTANT CONCEPT: SINGLETON PATTERN (Single Instance)
// ============================================================================
// WHY DO WE CREATE THE CLIENT ONLY ONCE?
//
// Option 1: Bad - Create new client for each request
//   File: vehicleController.js
//   const client1 = createClient(...);  // Connection 1
//   
//   File: userController.js
//   const client2 = createClient(...);  // Connection 2
//   
//   PROBLEMS:
//   - Wastes memory (multiple connections)
//   - Slower performance
//   - Hard to manage
//   - Connection pooling doesn't work
//
// Option 2: Good - Create client once, reuse everywhere (SINGLETON)
//   File: config/supabaseClient.js
//   const supabase = createClient(...);  // One connection
//   
//   File: vehicleController.js
//   const { supabase } = require('../config/supabaseClient');
//   
//   File: userController.js
//   const { supabase } = require('../config/supabaseClient');
//   
//   BENEFITS:
//   - Only one connection
//   - Better performance
//   - Easier to manage
//   - Connection pooling works
//   - All parts of app use same instance
//
// TECHNICAL TERM: This is called the "Singleton Pattern"
// One instance of something exists throughout the entire application

// ============================================================================
// STEP 5: EXPORT THE CLIENT
// ============================================================================
// Make the client available to other files
//
// HOW OTHER FILES USE IT:
//
// File: src/controllers/vehicleController.js
// const { supabase } = require('../config/supabaseClient');
//
// async function getVehicles() {
//   const { data, error } = await supabase
//     .from('vehicles')
//     .select('*');
//   
//   if (error) throw error;
//   return data;
// }
//
// EXPORT OBJECT:
// We export an object with the supabase client
// This makes it consistent with other config exports

module.exports = {
  // The Supabase client instance
  // Use this to query the database
  supabase,
};

// ============================================================================
// WHAT HAPPENS WHEN THIS FILE IS IMPORTED
// ============================================================================
// JavaScript execution flow:
//
// 1. File is imported: const { supabase } = require('./config/supabaseClient');
// 2. Node.js executes this entire file from top to bottom
// 3. Imports createClient from package
// 4. Reads SUPABASE_URL from process.env
// 5. Reads SUPABASE_ANON_KEY from process.env
// 6. Validates they exist
// 7. Calls createClient() with credentials
// 8. Stores result in const supabase
// 9. Exports the supabase object
// 10. Importing file gets the exported object
//
// RESULT: The importing file can now use supabase

// ============================================================================
// WHY THIS FILE BELONGS IN src/config/
// ============================================================================
//
// FOLDER PURPOSE EXPLANATION:
//
// src/config/
//   Purpose: Store all configuration and setup code
//   Contents:
//   - config.js (environment variables)
//   - supabaseClient.js (database connection)
//   - Future: redisClient.js, mongoClient.js, etc.
//
// src/routes/
//   Purpose: Define URL endpoints
//   Don't put database connections here
//
// src/controllers/
//   Purpose: Handle business logic
//   Don't create connections here
//
// src/middleware/
//   Purpose: Process requests
//   Don't create connections here
//
// src/services/
//   Purpose: Reusable functions
//   Don't create connections here
//
// WHY SEPARATE CONFIG FROM OTHER CODE?
// - Easy to find configuration
// - Easy to change without modifying business logic
// - Can reuse same configuration across entire app
// - Better organization and maintainability
// - Follows industry best practices
// - Makes testing easier

// ============================================================================
// ENVIRONMENT VARIABLES REFERENCE
// ============================================================================
// In your .env file, you need:
//
// SUPABASE_URL=https://your-project.supabase.co
// SUPABASE_ANON_KEY=your_anonymous_key_here
//
// WHERE TO FIND THESE:
// 1. Go to https://supabase.com
// 2. Sign in to your account
// 3. Click your project
// 4. Go to Settings → API
// 5. Copy Project URL → SUPABASE_URL
// 6. Copy anon public key → SUPABASE_ANON_KEY
// 7. Add to .env file
//
// KEEP THESE SECRET:
// - Never share these values
// - Never commit .env to git
// - .gitignore already prevents this

// ============================================================================
// SECURITY NOTES
// ============================================================================
// ANON KEY vs SERVICE ROLE KEY:
//
// ANON KEY (what we use here):
// - Publicly visible
// - Limited permissions
// - Used by frontend/client
// - Can't do admin operations
// - Good for public read/write
//
// SERVICE ROLE KEY:
// - Secret, never expose
// - Full permissions
// - Used only on backend
// - Can do admin operations
// - Never share or commit
//
// FOR THIS PROJECT:
// We use ANON_KEY because:
// - This is a backend service
// - We control the security in code
// - Users don't directly access database
// - Table policies control data access

// ============================================================================
// NEXT STEPS: HOW TO USE THIS FILE
// ============================================================================
//
// Step 1: Create database tables in Supabase
//   Table: vehicles
//   Table: users
//   Table: quotations
//
// Step 2: Create controllers that use this client
//   File: src/controllers/vehicleController.js
//   Import: const { supabase } = require('../config/supabaseClient');
//   Query: await supabase.from('vehicles').select('*');
//
// Step 3: Create services for reusable logic
//   File: src/services/vehicleService.js
//   Import: const { supabase } = require('../config/supabaseClient');
//   Function: async function getAllVehicles() {...}
//
// Step 4: Use in routes
//   File: src/routes/vehicles.js
//   Import: const controller = require('../controllers/vehicleController');
//   Route: router.get('/', controller.getVehicles);

// ============================================================================
// EXAMPLE: HOW TO USE SUPABASE CLIENT IN OTHER FILES
// ============================================================================
//
// EXAMPLE 1: Query data (SELECT)
// File: src/controllers/vehicleController.js
//
//   const { supabase } = require('../config/supabaseClient');
//
//   async function getAllVehicles() {
//     try {
//       const { data, error } = await supabase
//         .from('vehicles')
//         .select('*');
//
//       if (error) throw error;
//       return data;
//     } catch (error) {
//       console.error('Error fetching vehicles:', error);
//       throw error;
//     }
//   }
//
//
// EXAMPLE 2: Insert data (CREATE)
// File: src/controllers/vehicleController.js
//
//   async function createVehicle(vehicleData) {
//     const { data, error } = await supabase
//       .from('vehicles')
//       .insert([vehicleData])
//       .select();
//
//     if (error) throw error;
//     return data[0];
//   }
//
//
// EXAMPLE 3: Update data (UPDATE)
// File: src/controllers/vehicleController.js
//
//   async function updateVehicle(id, updates) {
//     const { data, error } = await supabase
//       .from('vehicles')
//       .update(updates)
//       .eq('id', id)
//       .select();
//
//     if (error) throw error;
//     return data[0];
//   }
//
//
// EXAMPLE 4: Delete data (DELETE)
// File: src/controllers/vehicleController.js
//
//   async function deleteVehicle(id) {
//     const { error } = await supabase
//       .from('vehicles')
//       .delete()
//       .eq('id', id);
//
//     if (error) throw error;
//   }

// ============================================================================
// TROUBLESHOOTING
// ============================================================================
// Problem: "SUPABASE_URL is not defined"
// Solution: Add SUPABASE_URL to .env file
//
// Problem: "SUPABASE_ANON_KEY is not defined"
// Solution: Add SUPABASE_ANON_KEY to .env file
//
// Problem: "Cannot connect to Supabase"
// Solution: Check internet connection and URL is correct
//
// Problem: "Permission denied when querying table"
// Solution: Check table RLS (Row Level Security) policies in Supabase
//
// Problem: "Module not found @supabase/supabase-js"
// Solution: Run: npm install @supabase/supabase-js
