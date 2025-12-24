#!/usr/bin/env node

// CORS Verification Script for NeuroLearn Backend
const https = require('https');

const BACKEND_URL = 'https://neurolearn-backend.onrender.com';
const FRONTEND_ORIGIN = 'https://neurolearn-amep.vercel.app';

console.log('🔍 Testing CORS Configuration...\n');

// Test 1: Basic server health
console.log('1️⃣ Testing server health...');
https.get(`${BACKEND_URL}/health`, (res) => {
  console.log(`✅ Server responding: ${res.statusCode}`);
  
  // Test 2: CORS headers on GET request
  console.log('\n2️⃣ Checking CORS headers...');
  console.log(`Access-Control-Allow-Origin: ${res.headers['access-control-allow-origin']}`);
  console.log(`Access-Control-Allow-Methods: ${res.headers['access-control-allow-methods']}`);
  console.log(`Access-Control-Allow-Headers: ${res.headers['access-control-allow-headers']}`);
  
}).on('error', (err) => {
  console.log('❌ Server not responding:', err.message);
});

console.log('\n3️⃣ Manual CORS Test:');
console.log(`Try: curl -X OPTIONS ${BACKEND_URL}/api/signup -H "Origin: ${FRONTEND_ORIGIN}" -v`);
console.log('\n4️⃣ Expected Response:');
console.log('- Status: 200 OK');
console.log('- Access-Control-Allow-Origin: https://neurolearn-amep.vercel.app');
console.log('- Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
console.log('- Access-Control-Allow-Headers: Content-Type, Authorization');