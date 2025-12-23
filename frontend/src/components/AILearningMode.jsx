import React, { useState, useRef, useEffect } from 'react';

const AILearningMode = ({ 
  isVideoPlaying, 
  currentTimestamp, 
  difficultSections = [], 
  onPauseVideo, 
  onResumeVideo,
  onLogEvent 
}) => {
  const [hasConsent, setHasConsent] = useState(false);
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [webcamActive, setWebcamActive] = useState(false);
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [baseline, setBaseline] = useState(null);
  const [confusionDetected, setConfusionDetected] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [suppressedTimestamps, setSuppressedTimestamps] = useState(new Set());
  
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const detectionIntervalRef = useRef(null);

  // Initialize webcam after consent
  const initializeWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 320, height: 240 } 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setWebcamActive(true);
      startCalibration();
    } catch (error) {
      console.error('Webcam access denied:', error);
      setHasConsent(false);
    }
  };

  // Calibration phase
  const startCalibration = () => {
    setIsCalibrating(true);
    setTimeout(() => {
      // Mock baseline - in real implementation, capture facial landmarks
      setBaseline({
        eyebrowHeight: Math.random() * 10 + 15,
        eyeOpenness: Math.random() * 5 + 8,
        headTilt: Math.random() * 10 - 5
      });
      setIsCalibrating(false);
      startConfusionDetection();
    }, 5000);
  };

  // Start confusion detection
  const startConfusionDetection = () => {
    detectionIntervalRef.current = setInterval(() => {
      if (isVideoPlaying && baseline) {
        detectConfusion();
      }
    }, 1000);
  };

  // Mock confusion detection - replace with real facial landmark analysis
  const detectConfusion = () => {
    // Mock signals relative to baseline
    const currentSignals = {
      eyebrowHeight: baseline.eyebrowHeight + (Math.random() * 6 - 3),
      eyeOpenness: baseline.eyeOpenness + (Math.random() * 4 - 2),
      headTilt: baseline.headTilt + (Math.random() * 8 - 4)
    };

    // Simple rule-based detection
    const eyebrowContraction = baseline.eyebrowHeight - currentSignals.eyebrowHeight > 2;
    const reducedEyeOpenness = baseline.eyeOpenness - currentSignals.eyeOpenness > 1.5;
    const increasedHeadTilt = Math.abs(currentSignals.headTilt - baseline.headTilt) > 3;

    const confusionSignals = [eyebrowContraction, reducedEyeOpenness, increasedHeadTilt];
    const confusionScore = confusionSignals.filter(Boolean).length;

    // Mock: 20% chance of confusion for demo purposes (reduced from 30%)
    const mockConfusion = Math.random() < 0.2;
    
    if ((confusionScore >= 2 || mockConfusion) && !confusionDetected) {
      handleConfusionDetected();
    }
  };

  // Handle confusion detection
  const handleConfusionDetected = () => {
    const nearDifficultSection = difficultSections.some(
      section => Math.abs(currentTimestamp - section.timestamp) < 10
    );

    const timestampKey = Math.floor(currentTimestamp / 30) * 30; // Group by 30-second intervals
    
    if (nearDifficultSection && !suppressedTimestamps.has(timestampKey)) {
      setConfusionDetected(true);
      onPauseVideo();
      setShowHelpModal(true);
      
      onLogEvent({
        type: 'confusion_detected',
        timestamp: currentTimestamp,
        nearDifficultSection: true,
        confusion_detected: true
      });
    }
  };

  // Handle help acceptance
  const handleAcceptHelp = () => {
    setShowHelpModal(false);
    setConfusionDetected(false);
    
    onLogEvent({
      type: 'help_accepted',
      timestamp: currentTimestamp,
      action_taken: 'accepted'
    });
  };

  // Handle help skip
  const handleSkipHelp = () => {
    const timestampKey = Math.floor(currentTimestamp / 30) * 30;
    setSuppressedTimestamps(prev => new Set([...prev, timestampKey]));
    
    setShowHelpModal(false);
    setConfusionDetected(false);
    onResumeVideo();
    
    onLogEvent({
      type: 'help_skipped',
      timestamp: currentTimestamp,
      action_taken: 'skipped'
    });
  };

  // Cleanup webcam
  const stopWebcam = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
    }
    setWebcamActive(false);
    setBaseline(null);
    setConfusionDetected(false);
  };

  // Handle consent
  const handleConsent = (accepted) => {
    setShowConsentModal(false);
    if (accepted) {
      setHasConsent(true);
      initializeWebcam();
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopWebcam();
    };
  }, []);

  return (
    <div className="ai-learning-mode">
      {/* Consent Modal */}
      {showConsentModal && (
        <div className="modal-overlay">
          <div className="consent-modal">
            <h3>Enable AI Learning Mode?</h3>
            <p>This uses your webcam to detect confusion and offer help.</p>
            <p><strong>No video is stored.</strong></p>
            <div className="consent-actions">
              <button onClick={() => handleConsent(true)} className="btn-accept">
                Enable
              </button>
              <button onClick={() => handleConsent(false)} className="btn-decline">
                Continue Without
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Mode Toggle */}
      {!hasConsent && (
        <button 
          onClick={() => setShowConsentModal(true)}
          className="ai-mode-toggle"
        >
          🤖 Enable AI Learning Mode
        </button>
      )}

      {/* Webcam Preview */}
      {webcamActive && (
        <div className="webcam-preview">
          <video 
            ref={videoRef} 
            autoPlay 
            muted 
            className="webcam-video"
          />
          <div className="webcam-status">
            {isCalibrating ? (
              <span className="calibrating">Calibrating... (5s)</span>
            ) : (
              <span className="active">AI Mode Active</span>
            )}
          </div>
          <button onClick={stopWebcam} className="stop-webcam">
            ✕
          </button>
        </div>
      )}

      {/* Help Modal */}
      {showHelpModal && (
        <div className="modal-overlay">
          <div className="help-modal">
            <h3>This part of the video can be tricky. Want a quick explanation?</h3>
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

export default AILearningMode;