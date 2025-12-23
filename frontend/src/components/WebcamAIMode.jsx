import React, { useState, useRef, useEffect } from 'react';

const WebcamAIMode = ({ 
  isVideoPlaying, 
  currentTimestamp, 
  difficultSections = [], 
  onPauseVideo, 
  onResumeVideo,
  onLogEvent 
}) => {
  const [webcamActive, setWebcamActive] = useState(false);
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [baseline, setBaseline] = useState(null);
  const [confusionDetected, setConfusionDetected] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [suppressedTimestamps, setSuppressedTimestamps] = useState(new Set());
  const [webcamError, setWebcamError] = useState(null);
  const [isSecure, setIsSecure] = useState(true);
  
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const detectionIntervalRef = useRef(null);

  // Check if mobile device
  const isMobile = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  };

  // Check HTTPS security
  useEffect(() => {
    const isHttps = window.location.protocol === 'https:' || window.location.hostname === 'localhost';
    console.log('🔒 Security check - HTTPS:', isHttps, 'Protocol:', window.location.protocol);
    setIsSecure(isHttps);
  }, []);

  // DIRECT CAMERA ACCESS - User gesture bound
  const handleEnableCameraClick = async () => {
    console.log('🎯 CAMERA BUTTON CLICKED - Starting direct camera access');
    console.log('📱 Mobile device:', isMobile());
    console.log('🔒 Secure connection:', isSecure);
    
    if (!isSecure) {
      setWebcamError('Camera access requires a secure connection (HTTPS)');
      return;
    }

    setWebcamError(null);
    
    try {
      console.log('📹 REQUESTING CAMERA PERMISSION NOW...');
      
      // Mobile-specific constraints
      const constraints = {
        video: isMobile() ? {
          facingMode: 'user',
          width: { ideal: 320 },
          height: { ideal: 240 }
        } : {
          width: { ideal: 320 },
          height: { ideal: 240 }
        }
      };
      
      console.log('🎥 Camera constraints:', constraints);
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('✅ SUCCESS: Camera stream obtained:', stream);
      console.log('📊 Stream tracks:', stream.getTracks());
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        console.log('📺 Stream attached to video element');
        
        // Mobile-specific video setup
        if (isMobile()) {
          videoRef.current.setAttribute('playsinline', 'true');
          videoRef.current.setAttribute('autoplay', 'true');
          videoRef.current.setAttribute('muted', 'true');
        }
      }
      
      setWebcamActive(true);
      console.log('🚀 Camera should be ON - LED should be visible!');
      startCalibration();
      
    } catch (error) {
      console.error('❌ CAMERA ACCESS FAILED:', error);
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      setWebcamError(`Camera access failed: ${error.message}`);
    }
  };

  // Calibration phase
  const startCalibration = () => {
    console.log('⏱️ Starting 5-second calibration...');
    setIsCalibrating(true);
    
    setTimeout(() => {
      const mockBaseline = {
        eyebrowHeight: Math.random() * 10 + 15,
        eyeOpenness: Math.random() * 5 + 8,
        headTilt: Math.random() * 10 - 5,
        timestamp: Date.now()
      };
      
      setBaseline(mockBaseline);
      setIsCalibrating(false);
      console.log('✅ Calibration complete');
      startConfusionDetection();
    }, 5000);
  };

  // Start confusion detection
  const startConfusionDetection = () => {
    console.log('🧠 Starting confusion detection...');
    detectionIntervalRef.current = setInterval(() => {
      if (isVideoPlaying && baseline && webcamActive) {
        detectConfusion();
      }
    }, 3000);
  };

  // Mock confusion detection
  const detectConfusion = () => {
    if (!baseline) return;
    
    // 10% chance of confusion for demo
    const mockConfusion = Math.random() < 0.1;
    
    if (mockConfusion && !confusionDetected) {
      console.log('😕 Confusion detected at timestamp:', currentTimestamp);
      handleConfusionDetected();
    }
  };

  // Handle confusion detection
  const handleConfusionDetected = () => {
    const nearDifficultSection = difficultSections.some(
      section => Math.abs(currentTimestamp - section.timestamp) < 10
    );

    const timestampKey = Math.floor(currentTimestamp / 30) * 30;
    
    if (nearDifficultSection && !suppressedTimestamps.has(timestampKey)) {
      console.log('⏸️ Pausing video for confusion intervention');
      setConfusionDetected(true);
      onPauseVideo();
      setShowHelpModal(true);
      
      onLogEvent({
        type: 'confusion_detected',
        timestamp: currentTimestamp,
        confusion_detected: true
      });
    }
  };

  // Handle help acceptance
  const handleAcceptHelp = () => {
    setShowHelpModal(false);
    setConfusionDetected(false);
    onLogEvent({ type: 'help_accepted', timestamp: currentTimestamp });
  };

  // Handle help skip
  const handleSkipHelp = () => {
    const timestampKey = Math.floor(currentTimestamp / 30) * 30;
    setSuppressedTimestamps(prev => new Set([...prev, timestampKey]));
    
    setShowHelpModal(false);
    setConfusionDetected(false);
    onResumeVideo();
    
    onLogEvent({ type: 'help_skipped', timestamp: currentTimestamp });
  };

  // Stop webcam
  const stopWebcam = () => {
    console.log('🛑 Stopping camera...');
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
        console.log('📹 Camera track stopped:', track.kind);
      });
      streamRef.current = null;
    }
    
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }
    
    setWebcamActive(false);
    setBaseline(null);
    setConfusionDetected(false);
    setIsCalibrating(false);
    console.log('✅ Camera cleanup complete - LED should be OFF');
  };

  // Cleanup on unmount
  useEffect(() => {
    console.log('🚀 WebcamAIMode component mounted');
    return () => {
      console.log('🗑️ WebcamAIMode component unmounting');
      stopWebcam();
    };
  }, []);

  return (
    <div className="webcam-ai-mode">
      {/* Security Warning */}
      {!isSecure && (
        <div className="security-warning">
          <p>⚠️ Camera access requires a secure connection (HTTPS)</p>
        </div>
      )}

      {/* Camera Controls */}
      {!webcamActive && isSecure && (
        <button 
          onClick={handleEnableCameraClick}
          className="ai-mode-toggle"
        >
          📹 Enable AI Learning Mode
        </button>
      )}

      {/* Camera Preview */}
      {webcamActive && (
        <div className="webcam-preview">
          <video 
            ref={videoRef} 
            autoPlay 
            muted 
            playsInline
            className="webcam-video"
          />
          <div className="webcam-status">
            {isCalibrating ? (
              <span className="calibrating">Calibrating... (5s)</span>
            ) : (
              <span className="active">🟢 Camera Active</span>
            )}
          </div>
          <button onClick={stopWebcam} className="stop-webcam">
            ✕
          </button>
        </div>
      )}

      {/* Camera Error */}
      {webcamError && (
        <div className="webcam-error">
          <p>❌ {webcamError}</p>
          <button onClick={() => setWebcamError(null)} className="retry-webcam">
            Try Again
          </button>
        </div>
      )}

      {/* Help Modal */}
      {showHelpModal && (
        <div className="modal-overlay">
          <div className="help-modal">
            <h3>This part can be tricky. Want help?</h3>
            <div className="help-actions">
              <button onClick={handleAcceptHelp} className="btn-accept">
                Yes, Help Me
              </button>
              <button onClick={handleSkipHelp} className="btn-skip">
                Skip and Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WebcamAIMode;