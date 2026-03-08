/**
 * Express Application Configuration
 * Sets up Express app with middleware, routes, and error handling
 * 
 * Requirements:
 * - 13.1: Express app setup
 * - 13.4: JSON middleware
 * - 13.5: Route mounting
 * - 14.1: CORS configuration with allowed origins
 * - 14.2: CORS headers in responses
 * - 14.3: Origin validation
 * - 14.4: Preflight OPTIONS support
 */

const express = require('express');
const cors = require('cors');
const errorHandler = require('./middlewares/errorHandler');

// Import route modules
const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');
const regRoutes = require('./routes/regRoutes');
const teamRoutes = require('./routes/teamRoutes');
const annRoutes = require('./routes/annRoutes');
const statsRoutes = require('./routes/statsRoutes');
const userRoutes = require('./routes/userRoutes');

// Create Express application
const app = express();

// CORS Configuration
// Requirements: 14.1, 14.2, 14.3, 14.4
const allowedOriginsEnv = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
  : [
      'http://localhost:3000',
      'http://localhost:5173', // Vite default
    ];

const corsOptions = {
  origin(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      return callback(null, true);
    }

    // In development, allow all origins
    if (process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }

    // Check if request origin is in allowed list
    if (allowedOriginsEnv.includes(origin)) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      console.log('Allowed origins:', allowedOriginsEnv);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,          // Allow cookies and authorization headers
  optionsSuccessStatus: 200,  // Some legacy browsers (IE11) choke on 204
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Body parser middleware - parse JSON request bodies
// Requirement: 13.4
app.use(express.json());

// Mount API routes
// Requirement: 13.5
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/registrations', regRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/announcements', annRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/users', userRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'EventNexus API is running',
    timestamp: new Date().toISOString(),
  });
});

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
  });
});

// Error handler middleware (must be last)
// Requirement: 12.1, 12.2, 12.3, 12.4, 12.5
app.use(errorHandler);

// Export app for testing
module.exports = app;
