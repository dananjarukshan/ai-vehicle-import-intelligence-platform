// ============================================================================
// HOW TO ADD NEW ROUTES - Step-by-Step Tutorial
// ============================================================================
// This file teaches you how to add new endpoints to your API
// Follow this pattern to add vehicle routes, user routes, etc.
// ============================================================================

/*

═══════════════════════════════════════════════════════════════════════════════
                    HOW TO ADD A NEW ROUTE
═══════════════════════════════════════════════════════════════════════════════

This tutorial shows you how to add a new route to your Express API
We'll create a simple "/api/v1/example" endpoint as an example

EXAMPLE: Create a vehicle listing endpoint
  Endpoint: GET /api/v1/vehicles
  Response: List of all vehicles


═══════════════════════════════════════════════════════════════════════════════
                        STEP 1: CREATE ROUTE FILE
═══════════════════════════════════════════════════════════════════════════════

Create file: src/routes/vehicles.js

Code:

  const express = require('express');
  const router = express.Router();
  
  // GET /api/v1/vehicles - Get list of vehicles
  router.get('/', (request, response) => {
    // Return list of vehicles
    response.json({
      success: true,
      data: [
        { id: 1, brand: 'Toyota', price: 25000 },
        { id: 2, brand: 'Honda', price: 22000 }
      ]
    });
  });
  
  module.exports = router;

═══════════════════════════════════════════════════════════════════════════════
                      STEP 2: IMPORT ROUTE IN APP.JS
═══════════════════════════════════════════════════════════════════════════════

Edit file: src/app.js

Find this section (around line 150):

  // Routes
  const healthRoutes = require('./routes/health');
  app.use('/', healthRoutes);

Add after it:

  const vehicleRoutes = require('./routes/vehicles');
  app.use(`${config.apiPrefix}/vehicles`, vehicleRoutes);

Now your route will be at: /api/v1/vehicles


═══════════════════════════════════════════════════════════════════════════════
                      STEP 3: RESTART SERVER
═══════════════════════════════════════════════════════════════════════════════

Stop current server:
  Press Ctrl+C

Start server again:
  npm run dev


═══════════════════════════════════════════════════════════════════════════════
                      STEP 4: TEST THE ROUTE
═══════════════════════════════════════════════════════════════════════════════

Option 1: Browser
  Visit: http://localhost:3000/api/v1/vehicles
  You should see the JSON response

Option 2: curl
  curl http://localhost:3000/api/v1/vehicles

Option 3: Postman
  1. Create new request
  2. GET http://localhost:3000/api/v1/vehicles
  3. Click Send


═══════════════════════════════════════════════════════════════════════════════
                    PATTERN: Creating Different Routes
═══════════════════════════════════════════════════════════════════════════════

GET (Retrieve data)
  router.get('/', (req, res) => {
    res.json({ data: [...] });
  });
  
  router.get('/:id', (req, res) => {
    const id = req.params.id;
    res.json({ data: { id, ...} });
  });

POST (Create data)
  router.post('/', (req, res) => {
    const data = req.body;  // { brand: 'Toyota', price: 25000 }
    res.status(201).json({ data: data });
  });

PUT (Update data)
  router.put('/:id', (req, res) => {
    const id = req.params.id;
    const data = req.body;
    res.json({ data: { id, ...data } });
  });

DELETE (Remove data)
  router.delete('/:id', (req, res) => {
    const id = req.params.id;
    res.json({ message: 'Deleted', id });
  });


═══════════════════════════════════════════════════════════════════════════════
                    UNDERSTANDING ROUTE PARAMETERS
═══════════════════════════════════════════════════════════════════════════════

Path Parameter (in URL)
  router.get('/:id', (req, res) => {
    const id = req.params.id;  // GET /api/v1/vehicles/123 → id = '123'
  });

Query Parameter (in URL after ?)
  // GET /api/v1/vehicles?sort=price&limit=10
  router.get('/', (req, res) => {
    const sort = req.query.sort;     // 'price'
    const limit = req.query.limit;   // '10'
  });

Body Parameter (in request body)
  router.post('/', (req, res) => {
    const brand = req.body.brand;    // From JSON body
    const price = req.body.price;
  });


═══════════════════════════════════════════════════════════════════════════════
                  EXAMPLE: Complete Vehicle Route File
═══════════════════════════════════════════════════════════════════════════════

File: src/routes/vehicles.js

  const express = require('express');
  const router = express.Router();

  // In-memory storage (will be database later)
  let vehicles = [
    { id: 1, brand: 'Toyota', price: 25000 },
    { id: 2, brand: 'Honda', price: 22000 }
  ];

  // GET /api/v1/vehicles - Get all vehicles
  router.get('/', (request, response) => {
    response.json({
      success: true,
      count: vehicles.length,
      data: vehicles
    });
  });

  // GET /api/v1/vehicles/:id - Get one vehicle
  router.get('/:id', (request, response) => {
    const id = parseInt(request.params.id);
    const vehicle = vehicles.find(v => v.id === id);
    
    if (!vehicle) {
      return response.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }
    
    response.json({
      success: true,
      data: vehicle
    });
  });

  // POST /api/v1/vehicles - Create new vehicle
  router.post('/', (request, response) => {
    const { brand, price } = request.body;
    
    if (!brand || !price) {
      return response.status(400).json({
        success: false,
        message: 'Brand and price are required'
      });
    }
    
    const newVehicle = {
      id: vehicles.length + 1,
      brand,
      price
    };
    
    vehicles.push(newVehicle);
    
    response.status(201).json({
      success: true,
      message: 'Vehicle created',
      data: newVehicle
    });
  });

  // PUT /api/v1/vehicles/:id - Update vehicle
  router.put('/:id', (request, response) => {
    const id = parseInt(request.params.id);
    const vehicle = vehicles.find(v => v.id === id);
    
    if (!vehicle) {
      return response.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }
    
    if (request.body.brand) vehicle.brand = request.body.brand;
    if (request.body.price) vehicle.price = request.body.price;
    
    response.json({
      success: true,
      message: 'Vehicle updated',
      data: vehicle
    });
  });

  // DELETE /api/v1/vehicles/:id - Delete vehicle
  router.delete('/:id', (request, response) => {
    const id = parseInt(request.params.id);
    const index = vehicles.findIndex(v => v.id === id);
    
    if (index === -1) {
      return response.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }
    
    const deleted = vehicles.splice(index, 1);
    
    response.json({
      success: true,
      message: 'Vehicle deleted',
      data: deleted[0]
    });
  });

  module.exports = router;


═══════════════════════════════════════════════════════════════════════════════
              NEXT STEP: REFACTOR INTO CONTROLLERS
═══════════════════════════════════════════════════════════════════════════════

As your code grows, move logic to controllers:

File: src/controllers/vehicleController.js

  const getVehicles = (request, response) => {
    // List logic here
  };

  const getVehicleById = (request, response) => {
    // Get one logic here
  };

  const createVehicle = (request, response) => {
    // Create logic here
  };

  module.exports = {
    getVehicles,
    getVehicleById,
    createVehicle
  };

File: src/routes/vehicles.js (refactored)

  const express = require('express');
  const router = express.Router();
  const controller = require('../controllers/vehicleController');

  router.get('/', controller.getVehicles);
  router.get('/:id', controller.getVehicleById);
  router.post('/', controller.createVehicle);

  module.exports = router;


═══════════════════════════════════════════════════════════════════════════════
                    HTTP STATUS CODES TO USE
═══════════════════════════════════════════════════════════════════════════════

200 OK - Request succeeded
  response.status(200).json({...}) or response.json({...})

201 Created - Resource was created
  response.status(201).json({...})

400 Bad Request - Client sent bad data
  response.status(400).json({...})

401 Unauthorized - User not logged in
  response.status(401).json({...})

403 Forbidden - User doesn't have permission
  response.status(403).json({...})

404 Not Found - Resource doesn't exist
  response.status(404).json({...})

500 Internal Server Error - Server error
  response.status(500).json({...})


═══════════════════════════════════════════════════════════════════════════════
                    TESTING YOUR ROUTE WITH POSTMAN
═══════════════════════════════════════════════════════════════════════════════

Test GET /api/v1/vehicles
  Method: GET
  URL: http://localhost:3000/api/v1/vehicles
  Click Send

Test GET /api/v1/vehicles/1
  Method: GET
  URL: http://localhost:3000/api/v1/vehicles/1
  Click Send

Test POST /api/v1/vehicles
  Method: POST
  URL: http://localhost:3000/api/v1/vehicles
  Body: (select JSON)
  {
    "brand": "BMW",
    "price": 50000
  }
  Click Send

Test PUT /api/v1/vehicles/1
  Method: PUT
  URL: http://localhost:3000/api/v1/vehicles/1
  Body: (select JSON)
  {
    "price": 26000
  }
  Click Send

Test DELETE /api/v1/vehicles/1
  Method: DELETE
  URL: http://localhost:3000/api/v1/vehicles/1
  Click Send


═══════════════════════════════════════════════════════════════════════════════
                    COMMON MISTAKES & HOW TO FIX
═══════════════════════════════════════════════════════════════════════════════

Mistake 1: Forgot to import route in app.js
  Error: Route not found (404)
  Fix: Add import and app.use() in app.js

Mistake 2: Incorrect URL in app.use()
  Error: Route at wrong path
  Fix: Check config.apiPrefix, check route path

Mistake 3: Forgot to restart server
  Error: Route still not found
  Fix: Press Ctrl+C, then npm run dev

Mistake 4: Wrong HTTP method
  Error: 404 or Method Not Allowed
  Fix: Check if using correct GET, POST, PUT, DELETE

Mistake 5: Forgot to call response.json() or response.send()
  Error: Request hangs forever
  Fix: Always send a response

Mistake 6: Trying to send response twice
  Error: "Cannot set headers after they are sent"
  Fix: Only call response.json() or response.send() once


═══════════════════════════════════════════════════════════════════════════════
                    FILE ORGANIZATION CHECKLIST
═══════════════════════════════════════════════════════════════════════════════

When creating new routes, follow this:

  ✓ Create route file in src/routes/
  ✓ Use express.Router()
  ✓ Define routes (GET, POST, etc.)
  ✓ Export router
  ✓ Import in src/app.js
  ✓ Register with app.use()
  ✓ Restart server
  ✓ Test in browser or Postman
  ✓ Later: Move logic to controller
  ✓ Later: Move database logic to service


═══════════════════════════════════════════════════════════════════════════════
                    SUMMARY
═══════════════════════════════════════════════════════════════════════════════

1. Create route file: src/routes/yourroute.js
2. Import in app.js
3. Register with app.use()
4. Restart server
5. Test endpoint
6. Later: Refactor into controller/service

That's it! You're ready to add new routes!

*/

module.exports = {
  lesson: 'How to add new routes - see comments above'
};
