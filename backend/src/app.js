const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const ratelimit = require("express-rate-limit");
const { swaggerUi, specs } = require('./config/swagger');

const authRoutes = require("./routes/v1/auth"); 
const taskRoutes = require("./routes/v1/task"); 

const app = express();

// Security Headers & Middleware
app.use(helmet({
  contentSecurityPolicy: false // Allows Swagger UI assets to load without CSP issues locally
}));
app.use(cors());
app.use(express.json());

// Swagger Documentation Route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Rate Limiter to prevent brute force
const limiter = ratelimit({
    windowMs: 15 * 60 * 1000, // 15 mins
    max : 100 // max 100 request per IP per WindowMs
});
app.use('/api', limiter);

// API Versioned Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/task', taskRoutes);

// Redirect root to api docs for convenience
app.get('/', (req, res) => {
  res.redirect('/api-docs');
});

// Global Error Handler Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        success: false, 
        message: err.message || 'Internal Server Error'
    });
});

module.exports = app;
