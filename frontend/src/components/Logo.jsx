import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
// import logoImage from '../assets/edtechlogo.jpg';

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

  // Temporary placeholder until actual logo is added
  return (
    <div
      className={`logo-placeholder ${sizeClasses[size]} ${clickable ? 'logo-clickable' : ''} ${className}`}
      onClick={clickable ? handleClick : undefined}
      style={{ cursor: clickable ? 'pointer' : 'default' }}
    >
      NeuroLearn
    </div>
  );

  // Uncomment when actual logo is available:
  // return (
  //   <img
  //     src={logoImage}
  //     alt="NeuroLearn - Adaptive Learning Platform"
  //     className={`logo ${sizeClasses[size]} ${clickable ? 'logo-clickable' : ''} ${className}`}
  //     onClick={clickable ? handleClick : undefined}
  //     style={{ cursor: clickable ? 'pointer' : 'default' }}
  //   />
  // );
};

export default Logo;