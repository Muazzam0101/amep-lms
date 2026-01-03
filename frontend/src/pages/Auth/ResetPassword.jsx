import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import InputField from '../../components/InputField';
import Button from '../../components/Button';
import Logo from '../../components/Logo';
import { validateResetToken, resetPassword } from '../../services/api';
import './Auth.css';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [validatingToken, setValidatingToken] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);

  useEffect(() => {
    const checkToken = async () => {
      if (!token) {
        setTokenValid(false);
        setValidatingToken(false);
        return;
      }

      try {
        await validateResetToken(token);
        setTokenValid(true);
      } catch (error) {
        setTokenValid(false);
        toast.error('Invalid or expired reset link');
      } finally {
        setValidatingToken(false);
      }
    };

    checkToken();
  }, [token]);

  const handleInputChange = (field) => (e) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    setLoading(true);

    try {
      await resetPassword(token, formData.password);
      toast.success('Password reset successfully!');
      
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      toast.error(error.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  if (validatingToken) {
    return (
      <div className="auth-container page-fade-in">
        <div className="auth-illustration">
          <Logo size="large" className="auth-brand-logo" />
          <div className="auth-tagline">Validating reset link...</div>
        </div>
        
        <div className="auth-form-section">
          <div className="auth-form">
            <div className="auth-loading-overlay">
              <div className="auth-loading-content">
                <div className="auth-loading-spinner-large"></div>
                <p className="auth-loading-text">Validating...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="auth-container page-fade-in">
        <Toaster position="top-right" />
        
        <div className="auth-illustration">
          <Logo size="large" className="auth-brand-logo" />
          <div className="auth-tagline">Invalid reset link</div>
        </div>
        
        <div className="auth-form-section">
          <div className="auth-form">
            <div className="auth-header">
              <Logo size="medium" />
              <h1 className="auth-title">Invalid Link</h1>
              <p className="auth-subtitle">
                This reset link is invalid or has expired.
              </p>
            </div>

            <div className="reset-error">
              <div className="reset-icon">⚠️</div>
              <p>The reset link may have expired or been used already.</p>
            </div>

            <Button onClick={() => navigate('/forgot-password')}>
              Request New Link
            </Button>
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
        <div className="auth-tagline">Create your new password</div>
      </div>
      
      <div className="auth-form-section">
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-header">
            <Logo size="medium" />
            <h1 className="auth-title">Reset Password</h1>
            <p className="auth-subtitle">Enter your new password</p>
          </div>

          <InputField
            type="password"
            label="New Password"
            placeholder="Enter new password"
            value={formData.password}
            onChange={handleInputChange('password')}
            disabled={loading}
            required
          />

          <InputField
            type="password"
            label="Confirm Password"
            placeholder="Confirm new password"
            value={formData.confirmPassword}
            onChange={handleInputChange('confirmPassword')}
            disabled={loading}
            required
          />

          <Button type="submit" loading={loading}>
            Update Password
          </Button>

          {loading && (
            <div className="auth-loading-overlay">
              <div className="auth-loading-content">
                <div className="auth-loading-spinner-large"></div>
                <p className="auth-loading-text">Updating password...</p>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;