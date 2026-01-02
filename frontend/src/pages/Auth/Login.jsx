import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import InputField from '../../components/InputField';
import Button from '../../components/Button';
import RoleSelector from '../../components/RoleSelector';
import Logo from '../../components/Logo';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

const Login = () => {
  const { login, hydrated } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'student'
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (field) => (e) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  const handleRoleChange = (role) => {
    setFormData({ ...formData, role });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setLoading(true);

    try {
      const user = await login(formData.email, formData.password, formData.role);
      
      toast.success('Login successful!');
      
      // Redirect based on role
      setTimeout(() => {
        if (user.role === 'teacher') {
          navigate('/teacher-dashboard');
        } else {
          navigate('/student-dashboard');
        }
      }, 1000);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container page-fade-in">
      <Toaster position="top-right" />
      
      <div className="auth-illustration">
        <Logo size="large" className="auth-brand-logo" />
        <div className="auth-tagline">
          Adaptive Learning Platform
        </div>
      </div>
      
      <div className="auth-form-section">
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-header">
            <Logo size="medium" />
            <h1 className="auth-title">Welcome Back</h1>
            <p className="auth-subtitle">Sign in to continue your learning journey</p>
          </div>

          <InputField
            type="email"
            label="Email Address"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleInputChange('email')}
            disabled={loading}
            required
          />

          <InputField
            type="password"
            label="Password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleInputChange('password')}
            disabled={loading}
            required
          />

          <div className="form-group">
            <label className="form-label">I am a:</label>
            <RoleSelector
              selectedRole={formData.role}
              onRoleChange={handleRoleChange}
              disabled={loading}
            />
          </div>

          <Button type="submit" loading={loading}>
            Sign In
          </Button>

          {/* Loading Overlay for Extra Visibility */}
          {loading && (
            <div className="auth-loading-overlay">
              <div className="auth-loading-content">
                <div className="auth-loading-spinner-large"></div>
                <p className="auth-loading-text">Signing you in...</p>
              </div>
            </div>
          )}

          <div className="auth-link">
            Don't have an account? <Link to="/signup">Sign up</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;