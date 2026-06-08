#!/usr/bin/env node

// ============================================================================
// ARCHITECTURE GUIDE - Visual Reference
// ============================================================================
// This file shows how all components connect together
// Run this with: node src/ARCHITECTURE.js
// ============================================================================

console.log(`
╔════════════════════════════════════════════════════════════════════════════╗
║                  AI VEHICLE PRICE ESTIMATION BACKEND                        ║
║                         ARCHITECTURE OVERVIEW                               ║
╚════════════════════════════════════════════════════════════════════════════╝

┌─────────────────────────────────────────────────────────────────────────────┐
│                         INCOMING HTTP REQUEST                               │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
    ┌─────────────────────────────────────────────────────────┐
    │              MIDDLEWARE PROCESSING PIPELINE              │
    ├─────────────────────────────────────────────────────────┤
    │  1. Body Parser       → Parse JSON body to object        │
    │  2. CORS              → Check if origin is allowed       │
    │  3. Logger            → Log request details              │
    │  4. Request ID        → Assign unique request ID         │
    │  5. Security Headers  → Add security headers             │
    └─────────────────────────────────────────────────────────┘
                                      │
                                      ▼
    ┌─────────────────────────────────────────────────────────┐
    │                    ROUTE MATCHING                        │
    ├─────────────────────────────────────────────────────────┤
    │  Does this URL match any defined routes?                │
    │                                                          │
    │  Examples:                                               │
    │  GET /health                    → health.js route       │
    │  GET /api/v1/health/detailed    → health.js route       │
    │  POST /api/v1/vehicles          → vehicles.js route     │
    │  GET /api/v1/vehicles/:id       → vehicles.js route     │
    └─────────────────────────────────────────────────────────┘
                                      │
                      ┌───────────────┴───────────────┐
                      │                               │
                  Route Found                   No Route Found
                      │                               │
                      ▼                               ▼
    ┌─────────────────────────────────┐  ┌─────────────────────────────────┐
    │     ROUTE HANDLER EXECUTES      │  │    404 NOT FOUND HANDLER        │
    ├─────────────────────────────────┤  ├─────────────────────────────────┤
    │  1. Validate input              │  │  Send 404 error response        │
    │  2. Call controller             │  │  with message                   │
    │  3. Controller calls service    │  └─────────────────────────────────┘
    │  4. Service queries database    │
    │  5. Return results              │
    └─────────────────────────────────┘
                      │
                      ▼
    ┌─────────────────────────────────────────────────────────┐
    │                  SEND RESPONSE                           │
    ├─────────────────────────────────────────────────────────┤
    │  • Status code (200, 400, 404, 500, etc.)               │
    │  • Headers (Content-Type, etc.)                         │
    │  • Body (JSON data)                                     │
    │  • Logger middleware logs the response                  │
    └─────────────────────────────────────────────────────────┘
                                      │
                                      ▼
    ┌─────────────────────────────────────────────────────────┐
    │                   ERROR HANDLING                         │
    ├─────────────────────────────────────────────────────────┤
    │  If error occurs anywhere:                              │
    │  1. Error Middleware catches it                         │
    │  2. Formats error response                              │
    │  3. Sends status 400, 404, 500, etc.                    │
    │  4. Includes error message and details                  │
    │  5. Shows stack trace (only in development)             │
    └─────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    RESPONSE SENT TO CLIENT                                  │
└─────────────────────────────────────────────────────────────────────────────┘


═════════════════════════════════════════════════════════════════════════════════
                              FILE STRUCTURE
═════════════════════════════════════════════════════════════════════════════════

src/
├── app.js                    ← Configure Express (middleware, routes, errors)
├── server.js                 ← Start the server (listen on port)
│
├── config/
│   └── config.js             ← Load and manage all configuration
│
├── middleware/
│   ├── errorHandler.js       ← Catch and format errors
│   └── logger.js             ← Log requests and responses
│
├── routes/
│   ├── health.js             ← Health check endpoints
│   └── vehicles.js (TODO)    ← Vehicle endpoints
│
├── controllers/              ← Business logic for routes
│   ├── healthController.js (TODO)
│   └── vehicleController.js (TODO)
│
├── services/                 ← Reusable functions
│   ├── vehicleService.js (TODO)
│   └── priceEstimationService.js (TODO)
│
└── models/                   ← Database models
    ├── Vehicle.js (TODO)
    └── User.js (TODO)


═════════════════════════════════════════════════════════════════════════════════
                          DEPENDENCY FLOW
═════════════════════════════════════════════════════════════════════════════════

server.js
  ↓ imports
app.js
  ├─ imports config/config.js (settings)
  ├─ imports middleware/errorHandler.js (error handling)
  ├─ imports middleware/logger.js (logging)
  ├─ imports routes/health.js (health endpoints)
  └─ exports Express app to server.js


═════════════════════════════════════════════════════════════════════════════════
                         REQUEST FLOW EXAMPLE
═════════════════════════════════════════════════════════════════════════════════

CLIENT REQUESTS: GET http://localhost:3000/api/v1/health/detailed

  ↓

server.js listens on port 3000, receives request

  ↓

app.js middleware pipeline:
  • Body Parser ✓ (no body to parse for GET)
  • CORS ✓ (checks origin)
  • Logger ✓ (logs request)
  • Security Headers ✓ (adds headers)

  ↓

Route Matching in app.js:
  Finds route: router.get('/api/:version/health/detailed', ...)

  ↓

Route Handler in routes/health.js executes:
  • Gets current time: new Date()
  • Calculates uptime
  • Gathers system info
  • Creates response object

  ↓

response.status(200).json({...}) sends:
  • Status: 200 (OK)
  • Body: JSON with health data

  ↓

Logger middleware logs response:
  ✅ 200 | 5ms

  ↓

RESPONSE SENT TO CLIENT:
  {
    "status": "healthy",
    "timestamp": "2024-01-15T10:30:45.123Z",
    "server": {...},
    "system": {...}
  }


═════════════════════════════════════════════════════════════════════════════════
                        FUTURE ARCHITECTURE
═════════════════════════════════════════════════════════════════════════════════

When you add vehicle endpoints:

CLIENT: POST /api/v1/vehicles (with JSON body)

  ↓

Middleware processes request

  ↓

Route matches, calls controller

  ↓

vehicleController.createVehicle(request, response):
  1. Validate request body (brand, price, etc.)
  2. Call vehicleService.createVehicle(data)

  ↓

vehicleService.createVehicle(data):
  1. Check if vehicle exists
  2. Call database to save
  3. Return created vehicle

  ↓

Controller gets result, sends response

  ↓

RESPONSE: { success: true, vehicle: {...} }


═════════════════════════════════════════════════════════════════════════════════
                       SECURITY FLOW
═════════════════════════════════════════════════════════════════════════════════

Request → CORS check (allowed origin?) 
       → Body size limit (not too large?)
       → Security headers (added to response)
       → Request validation (data correct format?)
       → Authentication check (future: JWT token)
       → Authorization check (future: user has permission?)
       → Business logic executes
       → Response sent

Error anywhere → Error middleware → Formatted error response


═════════════════════════════════════════════════════════════════════════════════
                    CONFIGURATION FLOW
═════════════════════════════════════════════════════════════════════════════════

.env file
  (PORT=3000, NODE_ENV=development, DATABASE_URL=..., etc.)
  
  ↓
  
  dotenv.config() in config.js
  (loads variables into process.env)
  
  ↓
  
  config.js exports config object
  { port: 3000, nodeEnv: 'development', ... }
  
  ↓
  
  Other files import config
  const config = require('./config/config');
  const port = config.port; // 3000


═════════════════════════════════════════════════════════════════════════════════
                         ERROR HANDLING FLOW
═════════════════════════════════════════════════════════════════════════════════

Error occurs (validation, database, etc.)
  ↓
throw new Error('Something went wrong')
  ↓
Express catches it
  ↓
errorHandler middleware processes it
  ↓
formatErrorResponse() creates:
  {
    "success": false,
    "status": 400,
    "message": "Something went wrong",
    "code": "ERROR_CODE"
  }
  ↓
Send response with appropriate status code
  ↓
Client receives error JSON


═════════════════════════════════════════════════════════════════════════════════
                        LOGGING FLOW
═════════════════════════════════════════════════════════════════════════════════

Request arrives
  ↓
Logger middleware:
  • Records start time
  • Extracts method, path, IP
  
  ↓
  
Route executes
  
  ↓
  
Response sent
  
  ↓
  
Logger middleware logs:
  🔵 GET /api/v1/health
  ✅ 200 | 5ms
  
(helps debugging and monitoring)


═════════════════════════════════════════════════════════════════════════════════

That's how the Express backend works!

Key takeaways:
1. Requests flow through middleware pipeline
2. Each middleware does one specific job
3. Routes map URLs to handlers
4. Controllers contain business logic
5. Services handle reusable operations
6. Errors are caught and formatted nicely
7. Everything is configurable via .env
8. Logging helps with debugging

Start by understanding:
✓ How middleware pipeline works
✓ How routes are matched
✓ How errors are handled
✓ How configuration is loaded

Then add features one by one:
→ Vehicle routes
→ User routes
→ Database connection
→ Validation
→ Authentication
→ Tests

`);
