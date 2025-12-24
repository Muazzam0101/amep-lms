import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import InputField from '../components/InputField';
import Button from '../components/Button';
import RoleSelector from '../components/RoleSelector';
import Logo from '../components/Logo';
import { useAuth } from '../context/AuthContext';
import './Auth/Auth.css';

const Signup = () => {
  const { signup, hydrated } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
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

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return false;
    }
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);

    try {
      const user = await signup(formData.email, formData.password, formData.role);
      
      toast.success('Account created successfully!');
      
      // Redirect to login
      setTimeout(() => {
        navigate('/login');
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
        <div className="auth-brand">NeuroLearn</div>
        <div className="auth-tagline">
          Join thousands of learners and educators
        </div>
      </div>
      
      <div className="auth-form-section">
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-header">
            <Logo size="medium" />
            <h1 className="auth-title">Create Account</h1>
            <p className="auth-subtitle">Start your learning journey today</p>
          </div>

          <InputField
            type="email"
            label="Email Address"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleInputChange('email')}
            required
          />

          <InputField
            type="password"
            label="Password"
            placeholder="Create a password"
            value={formData.password}
            onChange={handleInputChange('password')}
            required
          />

          <InputField
            type="password"
            label="Confirm Password"
            placeholder="Confirm your password"
            value={formData.confirmPassword}
            onChange={handleInputChange('confirmPassword')}
            required
          />

          <div className="form-group">
            <label className="form-label">I am a:</label>
            <RoleSelector
              selectedRole={formData.role}
              onRoleChange={handleRoleChange}
            />
          </div>

          <Button type="submit" loading={loading}>
            Create Account
          </Button>

          <div className="auth-link">
            Already have an account? <Link to="/login">Sign in</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;