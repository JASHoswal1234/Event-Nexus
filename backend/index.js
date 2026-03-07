/**
 * Application Entry Point
 * Connects to database and starts the Express server
 * 
 * Requirements:
 * - 13.1: Database connection before server start
 * - 13.4: Server startup on configured PORT
 * - 13.5: Graceful shutdown handlers
 */

require('dotenv').config();
const app = require('./server');
const connectDB = require('./config/db');

// Validate required environment variables
const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET', 'PORT'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error('Error: Missing required environment variables:', missingEnvVars.join(', '));
  console.error('Please check your .env file');
  process.exit(1);
}

// Server instance
let server;

/**
 * Start the application
 * Connects to database first, then starts the Express server
 */
const startServer = async () => {
  try {
    // Connect to MongoDB
    // Requirement: 13.1
    await connectDB();
    console.log('Database connection established');

    // Start Express server
    // Requirement: 13.4
    const PORT = process.env.PORT || 5000;
    server = app.listen(PORT, () => {
      console.log(`EventNexus API server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`CORS enabled for: ${process.env.CORS_ORIGIN || 'http://localhost:3000'}`);
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

/**
 * Graceful shutdown handler
 * Closes server and database connections cleanly
 * Requirement: 13.5
 */
const gracefulShutdown = async (signal) => {
  console.log(`\n${signal} received. Starting graceful shutdown...`);

  // Close server to stop accepting new connections
  if (server) {
    server.close(() => {
      console.log('HTTP server closed');
    });
  }

  // Database connection is closed by the handler in config/db.js
  // The process.exit() there will terminate the application
};

// Register shutdown handlers
// Requirement: 13.5
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start the server
startServer();
