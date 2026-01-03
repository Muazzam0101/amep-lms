const { Pool } = require('pg');
require('dotenv').config();

// 4️⃣ FAIL FAST IF DATABASE_URL IS MISSING
if (!process.env.DATABASE_URL) {
  console.error('FATAL ERROR: DATABASE_URL environment variable is required');
  console.error('This backend requires Render PostgreSQL connection string');
  process.exit(1);
}

console.log('Using DATABASE_URL:', process.env.DATABASE_URL.replace(/\/\/.*@/, '//***:***@'));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Test database connection
pool.connect((err, client, release) => {
  if (err) {
    console.error('Error connecting to database:', err.stack);
    console.error('DATABASE_URL format should be: postgresql://user:pass@host:port/dbname');
    process.exit(1);
  } else {
    console.log('Database connected successfully');
    console.log('Connected to:', client.host || 'Render PostgreSQL');
    release();
  }
});

// Create users table
const createUsersTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL CHECK (role IN ('student', 'teacher')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Users table created successfully');
    
    // Add reset token columns if they don't exist
    await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS reset_token VARCHAR(255),
      ADD COLUMN IF NOT EXISTS reset_token_expiry TIMESTAMP
    `);
    console.log('Reset token columns ensured');
  } catch (error) {
    console.error('Error creating users table:', error);
    process.exit(1);
  }
};

createUsersTable();

module.exports = pool;