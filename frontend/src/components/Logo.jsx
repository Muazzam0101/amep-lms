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
      const isLight = document.body.classList.contains('light-theme');
      setIsLightTheme(isLight);
      
      // DEBUG: Log theme and logo asset
      console.log(`Theme: ${isLight ? 'light' : 'dark'} | Logo: ${isLight ? 'edtechlogosolid.png' : 'edtechlogo.png'}`);
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

  // FORCE correct logo asset by theme
  const logoSrc = isLightTheme ? lightLogo : darkLogo;
  
  // Light mode: larger size + contrast container
  const lightModeStyles = isLightTheme ? {
    padding: '8px 12px',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: '8px',
    border: '1px solid rgba(148, 163, 184, 0.2)'
  } : {};

  const logoElement = (
    <img
      src={logoSrc}
      alt="NeuroLearn Logo - Adaptive Learning Platform"
      className={`logo ${sizeClasses[size]} ${clickable ? 'logo-clickable' : ''} ${className}`}
      onClick={clickable ? handleClick : undefined}
      style={{ 
        cursor: clickable ? 'pointer' : 'default',
        opacity: 1,
        filter: 'none',
        transform: isLightTheme && size === 'medium' ? 'scale(1.1)' : 'none'
      }}
    />
  );

  // Wrap in contrast container for light mode only
  return isLightTheme ? (
    <div style={lightModeStyles}>
      {logoElement}
    </div>
  ) : logoElement;
};

export default Logo;