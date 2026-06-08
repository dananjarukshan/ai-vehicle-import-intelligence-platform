// ============================================================================
// SERVER STARTUP FILE
// ============================================================================
// PURPOSE:
// This file starts the Express server and makes it listen on a port
// Separate from app.js for good separation of concerns:
// - app.js = Configure Express and routes (what the app does)
// - server.js = Start the server (making it accessible)
//
// WHY SEPARATE?
// - Easier to test (can test app without starting server)
// - Cleaner code organization
// - Can start same app multiple times on different ports
// - Industry standard practice
//
// WHAT HAPPENS:
// 1. Import the Express app from app.js
// 2. Import configuration
// 3. Start the server listening on a port
// 4. Display startup message
// 5. Handle startup errors
// ============================================================================

// Import the Express app we configured
// app.js exported the app object, we're importing it here
const app = require('./app');

// Import configuration
const config = require('./config/config');

// ============================================================================
// START SERVER
// ============================================================================
// The server variable will hold information about the running server
// app.listen() starts the server and returns a server object

const server = app.listen(config.port, config.host, () => {
  // This callback runs AFTER server successfully starts
  
  console.log('\n' + '='.repeat(60));
  console.log('🎉 SERVER STARTED SUCCESSFULLY');
  console.log('='.repeat(60));
  
  // Display server information
  console.log(`
📍 Server Address: http://${config.host}:${config.port}
🌍 API URL: http://localhost:${config.port}${config.apiPrefix}
📦 Environment: ${config.nodeEnv}
⚙️  Node Version: ${process.version}
🕐 Started at: ${new Date().toISOString()}
  `);
  
  // Display available endpoints
  console.log('📚 Available Endpoints:');
  console.log(`   ✓ Health Check: http://localhost:${config.port}/health`);
  console.log(`   ✓ Detailed Health: http://localhost:${config.port}/api/${config.apiVersion}/health/detailed`);
  console.log(`   ✓ API Root: http://localhost:${config.port}${config.apiPrefix}/`);
  
  // Next steps message
  if (config.isDevelopment) {
    console.log('\n💡 Next Steps:');
    console.log('   1. Open your browser to http://localhost:' + config.port + '/health');
    console.log('   2. Check the health endpoint response');
    console.log('   3. Use Postman or REST Client to test endpoints');
    console.log('   4. Add more routes as you build features');
  }
  
  console.log('\n' + '='.repeat(60) + '\n');
});

// ============================================================================
// ERROR HANDLING
// ============================================================================
// Handle errors that occur when starting the server

// Listen for "error" events from the server
server.on('error', (error) => {
  // Check if it's a port already in use error
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ ERROR: Port ${config.port} is already in use`);
    console.error(`Try one of these solutions:`);
    console.error(`  1. Stop other application using port ${config.port}`);
    console.error(`  2. Use different port: PORT=5000 npm start`);
    console.error(`  3. Find which process uses this port:`);
    console.error(`     Windows: netstat -ano | findstr :${config.port}`);
    console.error(`     Mac/Linux: lsof -i :${config.port}`);
  } else if (error.code === 'EACCES') {
    console.error(`❌ ERROR: Permission denied to use port ${config.port}`);
    console.error(`Ports below 1024 need special permissions`);
    console.error(`Try using a port above 1024, like 3000`);
  } else {
    console.error('❌ Server error:', error);
  }
  
  process.exit(1); // Exit the process
});

// ============================================================================
// GRACEFUL SHUTDOWN
// ============================================================================
// When server receives shutdown signal, close connections properly

process.on('SIGTERM', () => {
  console.log('⚠️  SIGTERM signal received: closing HTTP server');
  
  // Stop accepting new connections
  // Finish processing current requests, then exit
  server.close(() => {
    console.log('✅ HTTP server closed');
    process.exit(0); // Exit cleanly
  });
  
  // If server doesn't close after 30 seconds, force exit
  setTimeout(() => {
    console.error('❌ Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 30000);
});

// ============================================================================
// EXPORT
// ============================================================================
// Export server for testing or other uses
module.exports = server;
