const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 8080;

// Secret keys (in a real app, these should be in environment variables)
const JWT_SECRET = 'super-secret-key-for-jwt-generation-which-should-be-long';
const JWT_REFRESH_SECRET = 'super-secret-refresh-key';
const AES_KEY = crypto.scryptSync('my-aes-password', 'salt', 32); // 256-bit key
const AES_IV = crypto.randomBytes(16);

// Mock database for users
const users = {
    'user': { password: 'password', role: 'USER' },
    'admin': { password: 'admin123', role: 'ADMIN' }
};

// 1. Health Check
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'Connected' });
});

// 2. JWT Authentication (Login)
app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    
    if (users[username] && users[username].password === password) {
        const role = users[username].role;
        // Generate Access Token (expires in 15m)
        const token = jwt.sign({ username, role }, JWT_SECRET, { expiresIn: '15m' });
        // Generate Refresh Token (expires in 7d)
        const refreshToken = jwt.sign({ username, role }, JWT_REFRESH_SECRET, { expiresIn: '7d' });
        
        return res.status(200).json({ token, refreshToken, role });
    }
    
    res.status(401).json({ error: 'Invalid credentials' });
});

// Middleware to verify JWT token
function verifyToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' });
    }
    
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // Attach user info to request
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
}

// Middleware for RBAC
function requireRole(role) {
    return (req, res, next) => {
        if (!req.user || (req.user.role !== role && req.user.role !== 'ADMIN')) {
            // ADMIN can access anything, USER can only access USER stuff
            return res.status(403).json({ error: 'Access denied: Insufficient role' });
        }
        next();
    };
}

// 3. Test Protected API
app.get('/api/test', verifyToken, (req, res) => {
    res.status(200).json({ message: `Success! You accessed a protected route as ${req.user.username}.` });
});

// 4. RBAC Endpoints
app.get('/api/user', verifyToken, requireRole('USER'), (req, res) => {
    res.status(200).json({ message: 'Welcome to the USER endpoint.' });
});

app.get('/api/admin', verifyToken, requireRole('ADMIN'), (req, res) => {
    res.status(200).json({ message: 'Welcome to the ADMIN-only endpoint.' });
});

// 5. Encryption & Decryption
app.post('/api/crypto/encrypt', verifyToken, (req, res) => {
    const { data } = req.body;
    if (!data) return res.status(400).json({ error: 'No data provided' });
    
    try {
        const cipher = crypto.createCipheriv('aes-256-cbc', AES_KEY, AES_IV);
        let encrypted = cipher.update(data, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        res.status(200).json({ encryptedData: encrypted });
    } catch (err) {
        res.status(500).json({ error: 'Encryption failed' });
    }
});

app.post('/api/crypto/decrypt', verifyToken, (req, res) => {
    const { data } = req.body;
    if (!data) return res.status(400).json({ error: 'No data provided' });
    
    try {
        const decipher = crypto.createDecipheriv('aes-256-cbc', AES_KEY, AES_IV);
        let decrypted = decipher.update(data, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        res.status(200).json({ decryptedData: decrypted });
    } catch (err) {
        res.status(500).json({ error: 'Decryption failed' });
    }
});

// 6. Token Refresh
app.post('/api/auth/refresh', (req, res) => {
    const { token } = req.body; // In this mock, we just accept the old token to keep it simple, or expect a real refresh token.
    // For simplicity, we just decode without verifying expiry strictly, and issue a new one.
    try {
        const decoded = jwt.verify(token, JWT_SECRET, { ignoreExpiration: true });
        const newToken = jwt.sign({ username: decoded.username, role: decoded.role }, JWT_SECRET, { expiresIn: '15m' });
        res.status(200).json({ token: newToken });
    } catch (err) {
        res.status(401).json({ error: 'Invalid token for refresh' });
    }
});

app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
});
