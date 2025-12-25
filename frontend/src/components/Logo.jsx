import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import darkLogo from '../assests/logo/edtechlogo.png';
import lightLogo from '../assests/edtechlogosolid.png';

const Logo = ({ size = 'medium', clickable = false, className = '' }) => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [isLightTheme, setIsLightTheme] = useState(false);

  useEffect(() => {
    const checkTheme = () => {
      setIsLightTheme(document.body.classList.contains('light-theme'));
    };
    
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    
    return () => observer.disconnect();
  }, []);

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
      src={isLightTheme ? lightLogo : darkLogo}
      alt="NeuroLearn Logo - Adaptive Learning Platform"
      className={`logo ${sizeClasses[size]} ${clickable ? 'logo-clickable' : ''} ${className}`}
      onClick={clickable ? handleClick : undefined}
      style={{ cursor: clickable ? 'pointer' : 'default' }}
    />
  );
};

export default Logo;