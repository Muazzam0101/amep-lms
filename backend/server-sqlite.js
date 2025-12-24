const express = require('express');
const cors = require('cors');
require('./db-sqlite'); // Initialize database
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Secure CORS configuration
app.use(cors({
  origin: [
    'https://neurolearn-amep.vercel.app',
    'http://localhost:3000' // For development
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  preflightContinue: false,
  optionsSuccessStatus: 200
}));

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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Using SQLite database');
});