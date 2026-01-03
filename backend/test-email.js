const nodemailer = require('nodemailer');
require('dotenv').config();

async function testEmailConfig() {
  console.log('🧪 Testing Email Configuration...');
  
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('❌ Email credentials not found in environment variables');
    console.log('Please set EMAIL_USER and EMAIL_PASS in .env file');
    return;
  }
  
  try {
    const transporter = nodemailer.createTransporter({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: process.env.EMAIL_PORT || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
    
    // Verify connection
    await transporter.verify();
    console.log('✅ SMTP connection successful');
    
    // Send test email
    const testEmail = {
      from: `"NeuroLearn Test" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER, // Send to self for testing
      subject: 'NeuroLearn Email Test',
      html: `
        <h2>Email Configuration Test</h2>
        <p>If you receive this email, your SMTP configuration is working correctly!</p>
        <p>Timestamp: ${new Date().toISOString()}</p>
      `
    };
    
    await transporter.sendMail(testEmail);
    console.log('✅ Test email sent successfully');
    
  } catch (error) {
    console.log('❌ Email test failed:', error.message);
    console.log('Common issues:');
    console.log('- Check EMAIL_USER and EMAIL_PASS are correct');
    console.log('- For Gmail, use App Password instead of regular password');
    console.log('- Enable 2-factor authentication and generate App Password');
  }
}

testEmailConfig();