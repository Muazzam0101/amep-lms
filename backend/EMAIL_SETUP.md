# NeuroLearn Password Reset Email Setup

## 🔧 Backend Configuration

### 1. Environment Variables
Add these to your `.env` file:

```env
# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Frontend URL (update for production)
FRONTEND_URL=https://your-neurolearn-frontend.vercel.app
```

### 2. Gmail Setup (Recommended)
1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account Settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
   - Use this password as `EMAIL_PASS`

### 3. Test Email Configuration
```bash
node test-email.js
```

## 🌐 Frontend Configuration

### 1. Verify Routes
The following routes should be configured:
- `/forgot-password` - Email input form
- `/reset-password/:token` - Password reset form

### 2. Environment Variables
```env
REACT_APP_API_URL=https://your-backend-api.render.com
```

## 🔒 Security Features

✅ **Hashed Tokens**: SHA-256 hashed, never stored in plain text
✅ **Time-Limited**: 30-minute expiry
✅ **Single-Use**: Tokens invalidated after use
✅ **No User Enumeration**: Same response regardless of email existence
✅ **No Token Logging**: Tokens never appear in server logs

## 🧪 Testing Flow

1. **Request Reset**: POST to `/api/forgot-password` with email
2. **Check Email**: Look for reset email in inbox/spam
3. **Click Link**: Should open `/reset-password/:token`
4. **Reset Password**: Enter new password and confirm
5. **Login**: Test login with new password

## 🚨 Troubleshooting

### Email Not Sending
- Check EMAIL_USER and EMAIL_PASS are correct
- Verify Gmail App Password (not regular password)
- Check spam folder
- Run `node test-email.js` to test SMTP connection

### 404 on Reset Link
- Verify FRONTEND_URL points to correct domain
- Check frontend routing is configured
- Ensure ResetPassword component is imported

### Token Invalid
- Check token hasn't expired (30 minutes)
- Verify token hasn't been used already
- Check database has reset_token columns