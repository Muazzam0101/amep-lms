const express = require('express');
const cors = require('cors');
require('./db-sqlite'); // Initialize database
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// 1️⃣ GLOBAL CORS MIDDLEWARE - MUST BE FIRST
app.use(cors({
  origin: 'https://neurolearn-amep.vercel.app', // 2️⃣ EXPLICIT ORIGIN - NO WILDCARDS
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // 4️⃣ REQUIRED METHODS
  allowedHeaders: ['Content-Type', 'Authorization'], // 5️⃣ REQUIRED HEADERS
  credentials: true,
  optionsSuccessStatus: 200 // 3️⃣ PREFLIGHT SUCCESS STATUS
}));

// 3️⃣ EXPLICIT PREFLIGHT HANDLER (CRITICAL)
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', 'https://neurolearn-amep.vercel.app');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(200); // HTTP 200 for OPTIONS
});

app.use(express.json());

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'NeuroLearn API is running', 
    status: 'OK',
    endpoints: ['/health', '/api/login', '/api/signup']
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api', require('./routes/auth'));

// Test route for CORS debugging
app.get('/test-cors', (req, res) => {
  res.json({ 
    message: 'CORS test successful',
    origin: req.headers.origin,
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Using SQLite database');
  console.log('CORS enabled for: https://neurolearn-amep.vercel.app');
}).on('error', (err) => {
  console.error('Server failed to start:', err);
});