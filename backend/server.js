const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { Resend } = require('resend');
const pool = require('./db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Production Email Service with Resend + SMTP fallback
const sendPasswordResetEmail = async (email, resetLink) => {
  const emailFrom = 'NeuroLearn <noreply@neurolearn.app>';
  
  const emailContent = {
    subject: 'Reset Your NeuroLearn Password',
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #06b6d4; margin: 0;">NeuroLearn</h1>
          <p style="color: #64748b; margin: 5px 0 0 0;">Adaptive Learning Platform</p>
        </div>
        
        <h2 style="color: #1e293b; margin-bottom: 20px;">Password Reset Request</h2>
        
        <p style="color: #475569; line-height: 1.6; margin-bottom: 25px;">
          We received a request to reset your password. Click the button below to create a new password:
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" style="display: inline-block; padding: 14px 28px; background: linear-gradient(135deg, #06b6d4, #8b5cf6); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">Reset My Password</a>
        </div>
        
        <p style="color: #64748b; font-size: 14px; line-height: 1.5; margin-bottom: 20px;">
          If the button doesn't work, copy and paste this link into your browser:<br>
          <a href="${resetLink}" style="color: #06b6d4; word-break: break-all;">${resetLink}</a>
        </p>
        
        <div style="background: #f8fafc; padding: 15px; border-radius: 6px; margin: 25px 0;">
          <p style="color: #ef4444; font-weight: 600; margin: 0 0 5px 0; font-size: 14px;">⚠️ Important Security Notice</p>
          <p style="color: #64748b; margin: 0; font-size: 14px; line-height: 1.4;">
            This link expires in 30 minutes. If you didn't request this reset, please ignore this email.
          </p>
        </div>
        
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
        
        <p style="color: #94a3b8; font-size: 12px; text-align: center; margin: 0;">
          © 2024 NeuroLearn. This is an automated message, please do not reply.
        </p>
      </div>
    `
  };

  // Try Resend first (preferred for production)
  if (process.env.RESEND_API_KEY) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      
      const result = await resend.emails.send({
        from: emailFrom,
        to: email,
        subject: emailContent.subject,
        html: emailContent.html
      });
      
      console.log(`✅ Password reset email SENT to ${email} via Resend`);
      console.log(`📧 Resend ID: ${result.data?.id}`);
      return;
    } catch (error) {
      console.error('❌ Resend failed:', error.message);
    }
  }

  // Skip SMTP in production due to timeout issues
  console.error('❌ No reliable email service configured');
  console.log(`🔗 Reset link (manual): ${resetLink}`);
  console.log('📝 Configure RESEND_API_KEY for email delivery');
  
  // Don't throw error - log the link for manual testing
  return;
};

// Signup route
app.post('/api/signup', async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // Validate input
    if (!email || !password || !role) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Check if user exists
    const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert user
    const newUser = await pool.query(
      'INSERT INTO users (email, password, role) VALUES ($1, $2, $3) RETURNING id, email, role',
      [email, hashedPassword, role]
    );

    // Generate JWT
    const token = jwt.sign(
      { userId: newUser.rows[0].id, email: newUser.rows[0].email, role: newUser.rows[0].role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: newUser.rows[0]
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// Login route
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (user.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const validPassword = await bcrypt.compare(password, user.rows[0].password);
    if (!validPassword) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user.rows[0].id, email: user.rows[0].email, role: user.rows[0].role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.rows[0].id,
        email: user.rows[0].email,
        role: user.rows[0].role
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Password Reset Routes

// Request password reset
app.post('/api/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Check if user exists (but don't reveal this to client)
    const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (user.rows.length > 0) {
      // Generate secure reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
      const tokenExpiry = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

      // Store hashed token in database
      await pool.query(
        'UPDATE users SET reset_token = $1, reset_token_expiry = $2 WHERE email = $3',
        [hashedToken, tokenExpiry, email]
      );

      // Generate reset link with PRODUCTION frontend URL
      const frontendUrl = 'https://neurolearn-frontend.vercel.app';
      const resetLink = `${frontendUrl}/reset-password/${resetToken}`;
      
      console.log(`🔗 Reset link: ${resetLink}`);
      
      // Send email with reset link - Don't fail the request if email fails
      try {
        await sendPasswordResetEmail(email, resetLink);
      } catch (emailError) {
        console.error('❌ Email delivery failed, but continuing for security:', emailError.message);
        // Don't expose email failures to client for security
      }
    }

    // Always return success (security: don't reveal if email exists)
    res.json({ message: 'If this email exists, a reset link has been sent.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Validate reset token
app.post('/api/validate-reset-token', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: 'Token is required' });
    }

    // Hash the provided token (don't log the actual token)
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Check if token exists and is not expired
    const user = await pool.query(
      'SELECT * FROM users WHERE reset_token = $1 AND reset_token_expiry > $2',
      [hashedToken, new Date()]
    );

    if (user.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    res.json({ message: 'Token is valid' });
  } catch (error) {
    console.error('Validate token error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reset password
app.post('/api/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ message: 'Token and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Hash the provided token (don't log the actual token)
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Check if token exists and is not expired
    const user = await pool.query(
      'SELECT * FROM users WHERE reset_token = $1 AND reset_token_expiry > $2',
      [hashedToken, new Date()]
    );

    if (user.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    // Hash new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password and clear reset token (single-use)
    await pool.query(
      'UPDATE users SET password = $1, reset_token = NULL, reset_token_expiry = NULL WHERE id = $2',
      [hashedPassword, user.rows[0].id]
    );

    console.log(`✅ Password reset completed for user ID: ${user.rows[0].id}`);
    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});