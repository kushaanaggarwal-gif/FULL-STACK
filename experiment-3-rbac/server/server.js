require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const contentRoutes = require('./routes/content');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());

// Request logging middleware for debugging token and endpoint calls
app.use((req, res, next) => {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  next();
});

// API Routes
app.use('/api', authRoutes);
app.use('/api', contentRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    serverTime: new Date().toISOString(),
    service: 'RBAC Authentication & Route Protection API'
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

app.listen(PORT, () => {
  console.log(`🚀 RBAC Auth Server running on http://localhost:${PORT}`);
  console.log(`⏱️ Access Token Expiry: ${process.env.ACCESS_TOKEN_EXPIRY || '15s'}`);
  console.log(`⏱️ Refresh Token Expiry: ${process.env.REFRESH_TOKEN_EXPIRY || '7d'}`);
});
