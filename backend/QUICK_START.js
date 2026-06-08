// ============================================================================
// QUICK START GUIDE
// ============================================================================
// Read this first to understand the backend setup quickly
// ============================================================================

/*
╔════════════════════════════════════════════════════════════════════════════╗
║                          QUICK START GUIDE                                 ║
║                Express.js Backend Setup - 5 Minute Overview                ║
╚════════════════════════════════════════════════════════════════════════════╝

┌─────────────────────────────────────────────────────────────────────────────┐
│ SECTION 1: INSTALLATION (One time)
└─────────────────────────────────────────────────────────────────────────────┘

STEP 1: Copy .env.example to .env
  Command: cp .env.example .env
  Why: Create your local configuration file

STEP 2: Install dependencies
  Command: npm install
  Why: Download required packages
  What happens: Creates node_modules folder with 100+ packages

STEP 3: Verify installation
  Command: npm run dev
  Expected: See "🎉 SERVER STARTED SUCCESSFULLY"


┌─────────────────────────────────────────────────────────────────────────────┐
│ SECTION 2: RUNNING THE SERVER
└─────────────────────────────────────────────────────────────────────────────┘

DEVELOPMENT MODE (with auto-reload):
  Command: npm run dev
  Use this while coding - server restarts when you save files
  Stop: Press Ctrl+C

PRODUCTION MODE (no auto-reload):
  Command: npm start
  Use this when deploying to production
  Better performance, no overhead of file watching

CUSTOM PORT:
  Command: PORT=5000 npm run dev
  Use this if port 3000 is already in use


┌─────────────────────────────────────────────────────────────────────────────┐
│ SECTION 3: TESTING THE API
└─────────────────────────────────────────────────────────────────────────────┘

In your browser:
  http://localhost:3000/health
  http://localhost:3000/api/v1/
  http://localhost:3000/api/v1/health/detailed

With curl:
  curl http://localhost:3000/health

With Postman:
  1. Open Postman
  2. New → Request
  3. GET → http://localhost:3000/health
  4. Send


┌─────────────────────────────────────────────────────────────────────────────┐
│ SECTION 4: FOLDER STRUCTURE EXPLAINED
└─────────────────────────────────────────────────────────────────────────────┘

backend/
├── src/app.js                 ← Configure server
├── src/server.js              ← Start server
├── src/config/config.js       ← Load environment variables
├── src/middleware/            ← Code that runs on every request
├── src/routes/                ← URL endpoints
├── src/controllers/           ← Business logic (to add)
├── src/services/              ← Reusable functions (to add)
├── .env                       ← Secret settings (don't commit!)
├── .env.example               ← Template (do commit)
└── package.json               ← Project config


┌─────────────────────────────────────────────────────────────────────────────┐
│ SECTION 5: WHAT EACH FILE DOES
└─────────────────────────────────────────────────────────────────────────────┘

app.js
  ├─ Configure Express
  ├─ Set up middleware (body parser, CORS, logger)
  ├─ Register routes
  ├─ Set up error handling
  └─ Export app

server.js
  ├─ Import app from app.js
  ├─ Call app.listen(3000)
  ├─ Show startup messages
  └─ Handle errors

config.js
  ├─ Load .env file
  ├─ Create config object with all settings
  ├─ Validate configuration
  └─ Export config

middleware/errorHandler.js
  ├─ Catch errors from anywhere in app
  ├─ Format them as JSON responses
  └─ Send back to client

middleware/logger.js
  ├─ Log each request method and path
  ├─ Log response status and time
  └─ Help with debugging

routes/health.js
  ├─ GET /health → Simple health check
  ├─ GET /api/v1/health/detailed → Full details
  ├─ GET /api/v1/health/startup → Startup check
  └─ GET /api/v1/health/ready → Readiness check


┌─────────────────────────────────────────────────────────────────────────────┐
│ SECTION 6: KEY CONCEPTS
└─────────────────────────────────────────────────────────────────────────────┘

MIDDLEWARE
  What: Functions that process requests
  How: Request → Middleware 1 → Middleware 2 → Route → Response
  Example: body parser converts JSON, CORS checks origin

ROUTES
  What: Map URLs to handlers (functions)
  How: GET /health → handler function → response
  Example: app.get('/health', (req, res) => {...})

ENVIRONMENT VARIABLES
  What: Settings that change by environment
  Where: Stored in .env file
  Examples: DATABASE_URL, JWT_SECRET, NODE_ENV

ERROR HANDLING
  What: Catch and respond to errors gracefully
  Where: errorHandler middleware
  Result: Client gets JSON error response instead of crash


┌─────────────────────────────────────────────────────────────────────────────┐
│ SECTION 7: COMMON TASKS
└─────────────────────────────────────────────────────────────────────────────┘

CHANGE SERVER PORT
  1. Open .env
  2. Change PORT=3000 to PORT=5000
  3. Restart server
  4. Visit http://localhost:5000

CHANGE DATABASE URL
  1. Open .env
  2. Change DATABASE_URL=...
  3. Restart server

CHANGE ALLOWED ORIGINS (for CORS)
  1. Open src/config/config.js
  2. Find corsOrigin setting
  3. Add your frontend URL
  4. Restart server

ADD NEW ROUTE
  1. Create file in src/routes/
  2. Create route with app.get(), app.post(), etc.
  3. Import in app.js: const routes = require('./routes/myroute');
  4. Register: app.use(routes);
  5. Restart server and test


┌─────────────────────────────────────────────────────────────────────────────┐
│ SECTION 8: DEBUGGING
└─────────────────────────────────────────────────────────────────────────────┘

See what's happening:
  1. Run: npm run dev
  2. Watch terminal for logs
  3. Each request shows: METHOD PATH TIME

Test endpoint:
  1. Open browser
  2. Go to: http://localhost:3000/health
  3. See JSON response with server status

Check logs:
  1. Terminal shows all requests
  2. Look for ❌ symbols for errors
  3. Check status codes: 200 (ok), 404 (not found), 500 (error)

Use Postman:
  1. Download Postman
  2. Create request
  3. Set method, URL, body
  4. See response in real-time


┌─────────────────────────────────────────────────────────────────────────────┐
│ SECTION 9: SECURITY NOTES
└─────────────────────────────────────────────────────────────────────────────┘

✅ DO:
  • Store secrets in .env
  • Use strong JWT_SECRET
  • Validate all inputs
  • Use HTTPS in production
  • Limit request size

❌ DON'T:
  • Commit .env to git
  • Use default passwords
  • Trust user input
  • Log passwords/tokens
  • Use weak JWT secrets


┌─────────────────────────────────────────────────────────────────────────────┐
│ SECTION 10: NEXT STEPS
└─────────────────────────────────────────────────────────────────────────────┘

PHASE 1 (DONE)
  ✅ Express setup
  ✅ Middleware
  ✅ Configuration
  ✅ Health checks
  ✅ Error handling

PHASE 2 (NEXT)
  → Create vehicle routes
  → Create controllers
  → Add validation

PHASE 3 (AFTER)
  → Connect to database
  → Create models
  → Add authentication

PHASE 4 (LATER)
  → Price estimation logic
  → User routes
  → Testing

PHASE 5 (PRODUCTION)
  → Deployment
  → Monitoring
  → Performance tuning


┌─────────────────────────────────────────────────────────────────────────────┐
│ SECTION 11: FILE EXPLANATIONS
└─────────────────────────────────────────────────────────────────────────────┘

.env - SECRET FILE (Don't commit!)
  NODE_ENV=development        # Environment type
  PORT=3000                   # Server port
  DATABASE_URL=...            # Database connection
  JWT_SECRET=...              # Auth token secret

.env.example - TEMPLATE (Do commit)
  Shows what variables are needed
  Other developers copy it to .env
  Add explanatory comments

package.json - PROJECT METADATA
  "scripts": What npm commands do
    npm run dev     → Start with auto-reload
    npm start       → Start for production
    npm test        → Run tests
  "dependencies": Required packages (installed)
  "devDependencies": Only for development (nodemon)

.gitignore - What NOT to commit
  .env           ← Never commit secrets!
  node_modules/  ← Huge folder, auto-generated
  .vscode/       ← Editor-specific
  *.log          ← Log files
  dist/          ← Build output


┌─────────────────────────────────────────────────────────────────────────────┐
│ SECTION 12: REQUEST FLOW DIAGRAM
└─────────────────────────────────────────────────────────────────────────────┘

Browser sends GET http://localhost:3000/health

↓ request arrives at server

↓ server.js listens and receives it

↓ app.js processes with middleware:
  1. Body Parser (convert JSON)
  2. CORS (check allowed origin)
  3. Logger (log request)
  4. Security headers (add protection)

↓ route matching:
  GET /health matches app.get('/health', ...)

↓ route handler executes:
  returns { ok: true, timestamp: ... }

↓ response sent:
  200 OK, JSON body

↓ logger logs:
  ✅ 200 | 5ms

↓ browser receives and displays JSON


┌─────────────────────────────────────────────────────────────────────────────┐
│ SECTION 13: TROUBLESHOOTING
└─────────────────────────────────────────────────────────────────────────────┘

ERROR: "Port 3000 is already in use"
  FIX: Use different port: PORT=5000 npm run dev

ERROR: "Cannot find module 'express'"
  FIX: npm install

ERROR: CORS error in browser
  FIX: Add frontend URL to corsOrigin in config.js

ERROR: Server not reloading when files change
  FIX: npm install -g nodemon

ERROR: response.json is not a function
  FIX: Make sure you're using response, not response

ERROR: Cannot read property 'port' of undefined
  FIX: Check config.js is imported correctly


┌─────────────────────────────────────────────────────────────────────────────┐
│ SECTION 14: READING THE CODE
└─────────────────────────────────────────────────────────────────────────────┘

Start here:
  1. server.js (simplest, just starts server)
  2. app.js (configure Express)
  3. routes/health.js (simple routes)
  4. middleware/logger.js (simple middleware)
  5. middleware/errorHandler.js (error handling)
  6. config/config.js (configuration loading)

Each file has extensive comments explaining:
  • What it does
  • Why it's needed
  • How it works
  • What will be added next

Read top to bottom, pay attention to comments!


═════════════════════════════════════════════════════════════════════════════════

SUMMARY:
✓ Backend is fully configured and running
✓ Health endpoints working
✓ Error handling in place
✓ Logging working
✓ Next step: Add vehicle routes and controllers

REMEMBER:
• Run: npm run dev
• Test: http://localhost:3000/health
• Change config in .env
• Never commit .env
• Read code comments for understanding

Happy coding! 🚀

═════════════════════════════════════════════════════════════════════════════════
*/

module.exports = {
  info: 'This is a quick reference guide. Read the comments above.'
};
