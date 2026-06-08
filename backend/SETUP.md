# Express.js Backend Setup Documentation

## 📋 Overview

This document explains the complete Express.js backend setup for the AI Vehicle Import Intelligence Platform. Everything is designed for scalability, maintainability, and beginner-friendly learning.

---

## 🏗️ Project Structure

```
backend/
├── .env                          # Actual environment variables (SECRET - not in git)
├── .env.example                  # Template showing what variables are needed
├── package.json                  # Project metadata and npm scripts
├── package-lock.json             # Locks dependency versions
├── README.md                      # This file
└── src/                          # All source code
    ├── server.js                 # Entry point - starts the server
    ├── app.js                    # Main Express app configuration
    ├── config/
    │   └── config.js             # Load and manage configuration
    ├── middleware/
    │   ├── errorHandler.js       # Error handling middleware
    │   └── logger.js             # Request/response logging
    ├── routes/
    │   └── health.js             # Health check endpoints
    ├── controllers/              # Business logic (to be implemented)
    ├── services/                 # Reusable service functions (to be implemented)
    └── models/                   # Database models (to be implemented)
```

### What Each Folder Does

| Folder | Purpose | Example |
|--------|---------|---------|
| `config/` | Configuration and environment variables | Database URL, API keys, ports |
| `middleware/` | Code that runs on every request | Error handling, logging, authentication |
| `routes/` | URL endpoints and routing | `/api/v1/vehicles`, `/health` |
| `controllers/` | Business logic for routes | Get vehicle, create vehicle, validate data |
| `services/` | Reusable functions used by controllers | Database queries, API calls, calculations |
| `models/` | Database schemas and models | Vehicle schema, User schema |

---

## 🚀 Getting Started

### 1. Install Dependencies

All dependencies are already installed, but to verify:

```bash
npm install
```

**Dependencies installed:**
- `express` - Web framework
- `cors` - Allow cross-origin requests
- `dotenv` - Load environment variables

**Dev dependencies:**
- `nodemon` - Restart server on file changes (development only)

### 2. Configure Environment Variables

1. Open `.env` file
2. Update values if needed (for development, defaults are fine)
3. **NEVER** commit `.env` to git (it contains secrets!)

Key variables:
- `NODE_ENV` - Determines behavior (development/production)
- `PORT` - Server port (3000)
- `DATABASE_URL` - Where to connect to database
- `JWT_SECRET` - Secret key for authentication tokens

### 3. Start the Server

**Development mode** (with auto-reload):
```bash
npm run dev
```

**Production mode** (no auto-reload):
```bash
npm start
```

You should see:
```
🎉 SERVER STARTED SUCCESSFULLY
📍 Server Address: http://localhost:3000
```

### 4. Test the Server

Open your browser and visit:
- http://localhost:3000/health
- http://localhost:3000/api/v1/health/detailed

---

## 📝 Detailed File Explanations

### **app.js** - Main Express Application

**Purpose:** Configure the entire Express server

**What it does:**
1. Imports configuration and dependencies
2. Creates Express app
3. Sets up middleware (body parser, CORS, logging)
4. Registers routes
5. Sets up error handling
6. Configures graceful shutdown

**Key concepts explained:**

#### Middleware Pipeline
```
Request → Body Parser → CORS → Logger → Routes → Response
         ↓             ↓        ↓       ↓
      Convert JSON  Allow cross- Log    Execute
      to object     origin calls request  endpoint
```

#### Middleware Functions
Each middleware is a function: `(request, response, next) => {}`
- `request` - The incoming HTTP request
- `response` - The response we send back
- `next()` - Call this to pass control to next middleware

### **config/config.js** - Configuration Management

**Purpose:** Single source of truth for all settings

**How it works:**
```javascript
1. Load .env file with dotenv.config()
2. Create config object with all settings
3. Validate that required values exist
4. Export object so other files can import it
```

**Usage in other files:**
```javascript
const config = require('./config/config');
const port = config.port;        // 3000
const isDev = config.isDevelopment; // true/false
```

**Key settings:**
- `nodeEnv` - Current environment
- `port` - Server port number
- `apiPrefix` - /api/v1 (for versioning)
- `databaseUrl` - Where to connect to database
- `jwtSecret` - For authentication tokens
- `corsOrigin` - Which domains can access API

### **middleware/errorHandler.js** - Error Handling

**Purpose:** Catch and handle errors gracefully

**What it exports:**
1. `errorHandler(error, req, res, next)` - Main error handler
2. `validationErrorHandler()` - Handle validation errors specifically
3. `notFoundHandler()` - Handle 404 (page not found)
4. `formatErrorResponse()` - Create consistent error format

**How errors flow:**
```
Error occurs → Express catches it → errorHandler middleware
            → Formats error → Sends JSON response to client
```

**Example error response:**
```json
{
  "success": false,
  "status": 400,
  "message": "Validation error: Please check your input",
  "code": "VALIDATION_ERROR"
}
```

### **middleware/logger.js** - Request Logging

**Purpose:** Log information about each request

**What it logs:**
- Request method (GET, POST, PUT, DELETE)
- Request path (/api/v1/vehicles)
- Response status (200, 404, 500)
- How long it took (in milliseconds)
- Client IP address

**Example log output:**
```
🔵 GET    /api/v1/health                │ IP: 127.0.0.1
✅ 200 | 5ms
```

### **routes/health.js** - Health Check Endpoints

**Purpose:** Provide endpoints to monitor server health

**Endpoints:**

| Endpoint | Purpose | Response |
|----------|---------|----------|
| `GET /health` | Simple health check | `{ ok: true, timestamp, uptime }` |
| `GET /api/v1/health/detailed` | Detailed info | Includes memory, CPU, versions |
| `GET /api/v1/health/startup` | Startup check | For K8s startup probe |
| `GET /api/v1/health/ready` | Readiness check | For K8s readiness probe |

**Why these endpoints?**
- Load balancers check `/health` to know if server is alive
- Kubernetes uses startup/readiness probes
- Monitoring dashboards use `/health/detailed`
- Docker can restart dead servers

### **server.js** - Server Startup

**Purpose:** Start the Express server and listen on a port

**What it does:**
1. Imports the Express app
2. Calls `app.listen(port)` to start server
3. Displays startup messages
4. Handles startup errors (port already in use, etc.)
5. Graceful shutdown handling

**Why separate from app.js?**
- Better separation of concerns
- Can test app without starting server
- Easier to manage server lifecycle
- Industry standard practice

### **.env** - Secret Configuration

**Purpose:** Store sensitive information

**What goes here:**
- API keys and tokens
- Database passwords
- JWT secrets
- Any values that change between environments

**CRITICAL:** This file is in `.gitignore` - never commit it!

### **.env.example** - Configuration Template

**Purpose:** Show what environment variables are needed

**What goes here:**
- Same variables as `.env`
- Default/example values
- Comments explaining each variable

**This IS committed to git** - so team knows what config is needed

### **package.json** - Project Metadata

**Key sections:**

```json
{
  "name": "backend",           // Project name
  "version": "1.0.0",          // Version number
  "main": "index.js",          // Entry point (not used, we use server.js)
  "scripts": {                 // npm commands
    "start": "node src/server.js",    // Production
    "dev": "nodemon src/server.js"    // Development (auto-reload)
  },
  "dependencies": {            // Required packages
    "express": "^5.2.1",       // Web framework
    "cors": "^2.8.6",          // Cross-origin requests
    "dotenv": "^17.4.2"        // Environment variables
  },
  "devDependencies": {         // Only for development
    "nodemon": "^3.1.14"       // Auto-reload on changes
  }
}
```

---

## 🔄 Request/Response Cycle

Here's what happens when you visit http://localhost:3000/api/v1/:

```
1. Browser sends HTTP request
   ↓
2. Express server receives it
   ↓
3. Middleware processes request in order:
   - Body parser (convert JSON)
   - CORS (check if allowed)
   - Logger (log the request)
   - Request ID (assign unique ID)
   ↓
4. Route handler executes:
   - app.get('/api/v1/', (req, res) => {...})
   ↓
5. Send response:
   - Status code 200
   - JSON: { message: "Welcome...", ... }
   ↓
6. Middleware processes response:
   - Logger logs the response
   - Status 200, time 5ms
   ↓
7. Browser receives response and displays it
```

---

## 🛡️ Security Features Implemented

| Feature | Purpose |
|---------|---------|
| CORS Middleware | Only allow trusted origins |
| Body Size Limits | Prevent DOS attacks with huge payloads |
| Security Headers | Prevent clickjacking, XSS, etc. |
| Environment Separation | Secrets not in code |
| Error Handling | Don't leak sensitive info in errors |
| Request Validation | Will be added with controllers |
| JWT Tokens | Will be added for authentication |

---

## 🔍 Understanding Middleware

**Middleware = Function that processes requests**

```javascript
// Middleware pattern
(request, response, next) => {
  // Do something with request
  
  // Pass to next middleware
  next();
  
  // Could also send response here
  // response.json({...});
}
```

**Common middleware in Express:**

| Middleware | Purpose |
|-----------|---------|
| Body Parser | Convert JSON body to object |
| CORS | Allow cross-origin requests |
| Logger | Log requests |
| Error Handler | Catch and handle errors |
| Authentication | Verify JWT tokens |
| Validation | Validate request data |

---

## 🚦 API Versioning

The API uses versioning through the path: `/api/v1/`

**Why version your API?**
- Old clients still work with old version
- New clients can use new version
- Allows breaking changes gradually

**Adding v2 later:**
```javascript
app.use('/api/v1/', v1Routes);
app.use('/api/v2/', v2Routes);
```

---

## 📊 Monitoring and Debugging

### See what's happening:

1. **Check logs in terminal** - Running `npm run dev` shows all requests

2. **Use browser DevTools:**
   - F12 → Network tab
   - See all requests/responses
   - Check headers and body

3. **Use Postman:**
   - Desktop app for testing API
   - Test GET, POST, PUT, DELETE
   - See responses formatted nicely

4. **Check health endpoint:**
   - http://localhost:3000/health
   - See uptime, memory usage, CPU

---

## 🚀 Next Steps

### Phase 1: Complete This Setup
- ✅ Express.js configured
- ✅ Middleware set up
- ✅ Health checks working
- ✅ Error handling in place

### Phase 2: Add User Routes
- Create controllers for user operations
- Add authentication middleware
- Implement JWT token generation

### Phase 3: Add Vehicle Routes
- Create vehicle controller
- Add vehicle service for database queries
- Implement price estimation logic

### Phase 4: Add Database
- Set up MongoDB or PostgreSQL
- Create data models/schemas
- Add database service layer

### Phase 5: Add Validation
- Validate request data
- Return validation errors
- Sanitize inputs for security

### Phase 6: Add Testing
- Unit tests for functions
- Integration tests for API routes
- Test error scenarios

---

## 🧪 Testing the API

### Test with curl (command line):

```bash
# Test health check
curl http://localhost:3000/health

# Test API root
curl http://localhost:3000/api/v1/

# Test detailed health
curl http://localhost:3000/api/v1/health/detailed
```

### Test with Postman:

1. Open Postman
2. Create new request
3. Set method to GET
4. Enter URL: http://localhost:3000/health
5. Click Send
6. See response

---

## 🐛 Common Issues and Solutions

### Issue: "Port 3000 is already in use"

**Solution 1:** Stop other app using port 3000

**Solution 2:** Use different port
```bash
PORT=5000 npm run dev
```

**Solution 3:** Find what's using the port
```bash
# Windows
netstat -ano | findstr :3000

# Mac/Linux
lsof -i :3000
```

### Issue: "Cannot find module 'express'"

**Solution:**
```bash
npm install
```

### Issue: Nodemon not reloading

**Solution:**
```bash
npm install -g nodemon
npm run dev
```

### Issue: CORS errors in browser

**Solution:** Check `.corsOrigin` in config.js
- Make sure your frontend URL is in the list
- Restart server after changing

---

## 📚 Learning Resources

### Understanding HTTP
- **Requests:** GET, POST, PUT, DELETE, PATCH
- **Status Codes:** 200 (OK), 400 (Bad Request), 404 (Not Found), 500 (Server Error)
- **Headers:** Metadata about request/response
- **Body:** Data being sent

### Understanding Express
- **Routes:** Map URLs to functions
- **Middleware:** Process requests in pipeline
- **Controllers:** Handle route logic
- **Services:** Reusable business logic

### Best Practices
- Keep middleware focused on one thing
- Keep routes in separate files
- Keep business logic in controllers
- Keep database logic in services
- Use environment variables for configuration
- Log important events
- Handle errors gracefully
- Validate all inputs

---

## 📖 Code Comments

Every file includes extensive comments explaining:
- What the code does
- Why it's needed
- How it works
- What will be added next

**Reading the code:**
1. Read file from top to bottom
2. Pay attention to comments (they teach concepts)
3. Understand each section's purpose
4. See how it connects to other files

---

## 🎯 Summary

You now have a professional-grade Express.js backend setup with:

✅ Scalable folder structure
✅ Configuration management
✅ Error handling
✅ Request logging
✅ CORS support
✅ Health checks
✅ Security headers
✅ Graceful shutdown
✅ Environment-based settings
✅ Extensive comments and documentation

This is production-ready code that follows industry best practices and is optimized for learning.

---

**Happy coding! 🚀**
