import React from 'react';

const Button = ({ children, onClick, type = "button", className = "", loading = false, disabled = false }) => {
  // DEBUG: Log when loading is active
  if (loading) {
    console.log('AUTH LOADING ACTIVE');
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`btn card-hover ${className} ${loading ? 'btn-loading' : ''}`}
    >
      {loading ? (
        <>
          <div className="auth-loading-spinner"></div>
          <span style={{ opacity: 0.7, marginLeft: '8px' }}>Processing...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;