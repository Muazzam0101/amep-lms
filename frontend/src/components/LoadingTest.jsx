// Test file to verify loading indicator implementation
import React, { useState } from 'react';
import Button from '../components/Button';

const LoadingTest = () => {
  const [loading, setLoading] = useState(false);

  const testLoading = () => {
    console.log('AUTH LOADING ACTIVE - Test Started');
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      console.log('AUTH LOADING COMPLETE - Test Finished');
    }, 3000);
  };

  return (
    <div style={{ padding: '20px', background: '#0a0a0f', minHeight: '100vh' }}>
      <h1 style={{ color: 'white' }}>Loading Indicator Test</h1>
      
      <div style={{ 
        background: 'rgba(255, 255, 255, 0.05)', 
        padding: '20px', 
        borderRadius: '12px',
        position: 'relative',
        maxWidth: '400px'
      }}>
        <Button loading={loading} onClick={testLoading}>
          Test Loading
        </Button>
        
        {/* Test overlay */}
        {loading && (
          <div className="auth-loading-overlay">
            <div className="auth-loading-content">
              <div className="auth-loading-spinner-large"></div>
              <p className="auth-loading-text">Testing loading...</p>
            </div>
          </div>
        )}
      </div>
      
      <p style={{ color: 'white', marginTop: '20px' }}>
        Status: {loading ? 'LOADING ACTIVE' : 'Ready'}
      </p>
    </div>
  );
};

export default LoadingTest;