const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Mock database users with designated RBAC permissions
const USERS = [
  {
    id: 1,
    name: 'Eleanor Admin',
    email: 'admin@app.com',
    password: 'password123',
    role: 'Admin',
    permissions: ['create', 'edit', 'delete', 'read']
  },
  {
    id: 2,
    name: 'Ethan Editor',
    email: 'editor@app.com',
    password: 'password123',
    role: 'Editor',
    permissions: ['create', 'edit', 'read']
  },
  {
    id: 3,
    name: 'Victor Viewer',
    email: 'viewer@app.com',
    password: 'password123',
    role: 'Viewer',
    permissions: ['read']
  }
];

// In-memory active refresh tokens store (in production, use Redis or Database with expiration)
let refreshTokens = new Set();

/**
 * Helper: Generate Access Token (Short-lived: 15s for testing refresh flow)
 */
const generateAccessToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      permissions: user.permissions
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '15s' }
  );
};

/**
 * Helper: Generate Refresh Token (Long-lived: 7d)
 */
const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY || '7d' }
  );
};

/**
 * POST /api/login
 * Public endpoint for user authentication
 */
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required.'
    });
  }

  const user = USERS.find(
    u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
  );

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password.'
    });
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  refreshTokens.add(refreshToken);

  return res.json({
    success: true,
    message: `Logged in successfully as ${user.role}`,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      permissions: user.permissions
    },
    accessToken,
    refreshToken,
    expiresIn: 15 // seconds
  });
});

/**
 * POST /api/refresh-token
 * Silent refresh endpoint: Issues a new short-lived access token using valid refresh token
 */
router.post('/refresh-token', (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({
      success: false,
      message: 'Refresh token is required.'
    });
  }

  if (!refreshTokens.has(refreshToken)) {
    return res.status(403).json({
      success: false,
      message: 'Refresh token is invalid or has been revoked.'
    });
  }

  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      refreshTokens.delete(refreshToken);
      return res.status(403).json({
        success: false,
        message: 'Refresh token expired or invalid. Please log in again.'
      });
    }

    // Locate user in database to retrieve up-to-date role and permissions
    const user = USERS.find(u => u.id === decoded.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User associated with refresh token no longer exists.'
      });
    }

    const newAccessToken = generateAccessToken(user);

    return res.json({
      success: true,
      message: 'Access token refreshed successfully.',
      accessToken: newAccessToken,
      expiresIn: 15 // seconds
    });
  });
});

/**
 * POST /api/logout
 * Invalidate the active refresh token
 */
router.post('/logout', (req, res) => {
  const { refreshToken } = req.body;
  if (refreshToken) {
    refreshTokens.delete(refreshToken);
  }
  return res.json({
    success: true,
    message: 'Logged out successfully and token invalidated.'
  });
});

/**
 * GET /api/mock-users
 * Helper endpoint to return sample credentials for UI quick-login buttons
 */
router.get('/mock-users', (req, res) => {
  const sanitized = USERS.map(u => ({
    email: u.email,
    password: u.password,
    role: u.role,
    name: u.name,
    permissions: u.permissions
  }));
  res.json({ success: true, users: sanitized });
});

module.exports = router;
