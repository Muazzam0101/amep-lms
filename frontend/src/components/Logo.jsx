import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logoImage from '../assests/logo/neurolearn-logo.svg';

const Logo = ({ size = 'medium', clickable = false, className = '' }) => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const handleClick = () => {
    if (clickable && currentUser) {
      const dashboardPath = currentUser.role === 'teacher' ? '/teacher-dashboard' : '/student-dashboard';
      navigate(dashboardPath);
    }
  };

  const sizeClasses = {
    small: 'logo-small',
    medium: 'logo-medium',
    large: 'logo-large'
  };

  return (
    <img
      src={logoImage}
      alt="NeuroLearn Logo - Adaptive Learning Platform"
      className={`logo ${sizeClasses[size]} ${clickable ? 'logo-clickable' : ''} ${className}`}
      onClick={clickable ? handleClick : undefined}
      style={{ cursor: clickable ? 'pointer' : 'default' }}
    />
  );
};

export default Logo;