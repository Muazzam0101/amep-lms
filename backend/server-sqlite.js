const express = require('express');
const cors = require('cors');
require('./db-sqlite'); // Initialize database
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration for production
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://neurolearn.vercel.app', 'https://amep-frontend.vercel.app', 'https://neurolearn-amep.vercel.app']
    : ['http://localhost:3000'],
  credentials: true
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