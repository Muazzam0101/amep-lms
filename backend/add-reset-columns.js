const pool = require('./db');

async function addResetTokenColumns() {
  try {
    console.log('Adding reset token columns to users table...');
    
    await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS reset_token VARCHAR(255),
      ADD COLUMN IF NOT EXISTS reset_token_expiry TIMESTAMP
    `);
    
    console.log('✅ Reset token columns added successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

addResetTokenColumns();