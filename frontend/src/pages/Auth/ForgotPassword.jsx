import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import InputField from '../../components/InputField';
import Button from '../../components/Button';
import Logo from '../../components/Logo';
import { requestPasswordReset } from '../../services/api';
import './Auth.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    setLoading(true);

    try {
      await requestPasswordReset(email);
      setSubmitted(true);
    } catch (error) {
      // Always show success message for security
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="auth-container page-fade-in">
        <Toaster position="top-right" />
        
        <div className="auth-illustration">
          <Logo size="large" className="auth-brand-logo" />
          <div className="auth-tagline">
            Check your email for reset instructions
          </div>
        </div>
        
        <div className="auth-form-section">
          <div className="auth-form">
            <div className="auth-header">
              <Logo size="medium" />
              <h1 className="auth-title">Check Your Email</h1>
              <p className="auth-subtitle">
                If this email exists, a reset link has been sent.
              </p>
            </div>

            <div className="reset-success">
              <div className="reset-icon">📧</div>
              <p>Please check your email and click the reset link to continue.</p>
            </div>

            <Link to="/login" className="btn glass-button primary">
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container page-fade-in">
      <Toaster position="top-right" />
      
      <div className="auth-illustration">
        <Logo size="large" className="auth-brand-logo" />
        <div className="auth-tagline">
          Reset your password securely
        </div>
      </div>
      
      <div className="auth-form-section">
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-header">
            <Logo size="medium" />
            <h1 className="auth-title">Forgot Password?</h1>
            <p className="auth-subtitle">
              Enter your email to receive a reset link
            </p>
          </div>

          <InputField
            type="email"
            label="Email Address"
            placeholder="Enter your registered email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            required
          />

          <Button type="submit" loading={loading}>
            Send Reset Link
          </Button>

          {loading && (
            <div className="auth-loading-overlay">
              <div className="auth-loading-content">
                <div className="auth-loading-spinner-large"></div>
                <p className="auth-loading-text">Sending reset link...</p>
              </div>
            </div>
          )}

          <div className="auth-link">
            Remember your password? <Link to="/login">Sign in</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;