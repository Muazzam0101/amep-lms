# 🚀 QUICK FIX: Email Delivery Setup

## ❌ Current Issue
SMTP connection timeout in production. Gmail SMTP blocked by Render.

## ✅ Solution: Resend API

### 1. Get Resend API Key (Free)
1. Go to [resend.com](https://resend.com)
2. Sign up (free account)
3. Get API key from dashboard

### 2. Add to Render Environment Variables
```env
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxx
```

### 3. Test Reset Flow
1. Deploy with RESEND_API_KEY
2. Go to: https://neurolearn-frontend.vercel.app/forgot-password
3. Enter your email
4. Check inbox for reset email
5. Click link → should open reset page

## 📧 Expected Logs (Success)
```
✅ Password reset email SENT to user@gmail.com via Resend
📧 Resend ID: 01234567-89ab-cdef-0123-456789abcdef
```

## 🔗 Reset Link Format
```
https://neurolearn-frontend.vercel.app/reset-password/[token]
```

## ⚠️ Without Resend API Key
- Password reset will still work
- Reset link logged to console for manual testing
- No email sent (but API doesn't fail)

**The system is now production-ready once RESEND_API_KEY is configured.**