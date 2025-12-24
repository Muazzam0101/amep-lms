import React, { useState, useRef, useEffect } from 'react';

const YouTubeVideoPlayer = ({ content }) => {
  const [player, setPlayer] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [useIframeEmbed, setUseIframeEmbed] = useState(false);
  const [apiLoadError, setApiLoadError] = useState(false);
  const [showPlayOverlay, setShowPlayOverlay] = useState(true);
  const [showCameraPrompt, setShowCameraPrompt] = useState(false);
  const [webcamActive, setWebcamActive] = useState(false);
  const [webcamError, setWebcamError] = useState(null);
  const [confusionDetected, setConfusionDetected] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [suppressedTimestamps, setSuppressedTimestamps] = useState(new Set());
  
  const playerRef = useRef(null);
  const webcamRef = useRef(null);
  const streamRef = useRef(null);
  const timeUpdateInterval = useRef(null);
  const detectionIntervalRef = useRef(null);

  // Extract YouTube video ID
  const extractVideoId = (url) => {
    if (!url) return null;
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^#\&\?\n]*)/,
      /(?:youtube\.com\/v\/|youtube\.com\/u\/\w\/|youtube\.com\/embed\/)([^#\&\?\n]*)/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1] && match[1].length === 11) {
        return match[1];
      }
    }
    return null;
  };

  const videoId = extractVideoId(content?.youtube_url);

  // Initialize YouTube Player
  useEffect(() => {
    if (!videoId) return;

    const initializePlayer = () => {
      if (!playerRef.current || !window.YT?.Player) return;

      try {
        const newPlayer = new window.YT.Player(playerRef.current, {
          height: '100%',
          width: '100%',
          videoId: videoId,
          playerVars: {
            autoplay: 0,
            controls: 0,
            modestbranding: 1,
            rel: 0,
            enablejsapi: 1,
            origin: window.location.origin
          },
          events: {
            onReady: (event) => {
              setDuration(event.target.getDuration());
            },
            onStateChange: onPlayerStateChange,
            onError: onPlayerError
          }
        });

        setPlayer(newPlayer);
      } catch (error) {
        console.error('Error creating YouTube player:', error);
        setUseIframeEmbed(true);
      }
    };

    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      tag.async = true;
      document.head.appendChild(tag);
      window.onYouTubeIframeAPIReady = initializePlayer;
    } else {
      initializePlayer();
    }
  }, [videoId]);

  const onPlayerStateChange = (event) => {
    const playerState = event.data;
    
    if (playerState === window.YT.PlayerState.PLAYING) {
      setIsPlaying(true);
      setShowPlayOverlay(false);
      startTimeTracking();
    } else if (playerState === window.YT.PlayerState.PAUSED) {
      setIsPlaying(false);
      stopTimeTracking();
    } else if (playerState === window.YT.PlayerState.ENDED) {
      setIsPlaying(false);
      stopTimeTracking();
      stopWebcam();
    }
  };

  const onPlayerError = (event) => {
    if (event.data === 101 || event.data === 150) {
      setUseIframeEmbed(true);
    }
  };

  const handlePlayClick = () => {
    setShowCameraPrompt(true);
  };

  const handleCameraDecision = async (enableCamera) => {
    setShowCameraPrompt(false);
    if (enableCamera) {
      await requestCameraPermission();
    } else {
      startVideoPlayback();
    }
  };

  const requestCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 320 }, height: { ideal: 240 } }
      });
      
      streamRef.current = stream;
      setWebcamActive(true);
      
      setTimeout(() => {
        if (webcamRef.current && streamRef.current) {
          webcamRef.current.srcObject = streamRef.current;
          webcamRef.current.addEventListener('loadedmetadata', () => {
            webcamRef.current.play().catch(err => {
              console.error('Video play failed:', err);
            });
          }, { once: true });
        }
      }, 100);
      
      startVideoPlayback();
      startConfusionDetection();
      
    } catch (error) {
      console.error('Camera setup failed:', error);
      setWebcamError(`Camera error: ${error.message}`);
      startVideoPlayback();
    }
  };

  const startVideoPlayback = () => {
    if (player && typeof player.playVideo === 'function') {
      player.playVideo();
    } else if (useIframeEmbed) {
      setShowPlayOverlay(false);
      setIsPlaying(true);
    }
  };

  const startConfusionDetection = () => {
    // Auto-trigger modal after 10 seconds for testing
    setTimeout(() => {
      if (isPlaying && !showHelpModal) {
        handleConfusionConfirmed();
      }
    }, 10000);
    
    detectionIntervalRef.current = setInterval(() => {
      if (isPlaying && !confusionDetected) {
        // Detection logic would go here
      }
    }, 500);
  };

  const handleConfusionConfirmed = () => {
    const timestampKey = Math.floor(currentTime / 30) * 30;
    
    if (suppressedTimestamps.has(timestampKey)) {
      return;
    }
    
    setConfusionDetected(true);
    if (player) {
      player.pauseVideo();
    }
    setShowHelpModal(true);
  };

  const stopWebcam = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }
    
    setWebcamActive(false);
    setConfusionDetected(false);
  };

  const startTimeTracking = () => {
    if (timeUpdateInterval.current) clearInterval(timeUpdateInterval.current);
    timeUpdateInterval.current = setInterval(() => {
      if (player && typeof player.getCurrentTime === 'function') {
        setCurrentTime(player.getCurrentTime());
      }
    }, 1000);
  };

  const stopTimeTracking = () => {
    if (timeUpdateInterval.current) {
      clearInterval(timeUpdateInterval.current);
      timeUpdateInterval.current = null;
    }
  };

  const handleAcceptHelp = () => {
    setShowHelpModal(false);
    setConfusionDetected(false);
  };

  const handleSkipHelp = () => {
    const timestampKey = Math.floor(currentTime / 30) * 30;
    setSuppressedTimestamps(prev => new Set([...prev, timestampKey]));
    
    setShowHelpModal(false);
    setConfusionDetected(false);
    
    if (player) {
      player.playVideo();
    }
  };

  useEffect(() => {
    return () => {
      stopWebcam();
      stopTimeTracking();
    };
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  if (!videoId) {
    return (
      <div className="video-error-card">
        <h3>Video Not Available</h3>
        <p>No valid YouTube URL provided.</p>
      </div>
    );
  }

  return (
    <>
      {/* GLOBAL MODALS - App Root Level */}
      {showCameraPrompt && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <h3>Enable AI Learning Assistant?</h3>
            <p>This helps detect when you might need extra help during the lesson.</p>
            <p className="privacy-note">Your video stays private and is never stored.</p>
            <div className="modal-actions">
              <button 
                onClick={() => handleCameraDecision(true)} 
                className="btn-primary"
              >
                📹 Enable Camera
              </button>
              <button 
                onClick={() => handleCameraDecision(false)} 
                className="btn-secondary"
              >
                Skip Camera
              </button>
            </div>
          </div>
        </div>
      )}

      {showHelpModal && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <h3>Need some help with this part?</h3>
            <p>I noticed you might be having trouble. Would you like a quick explanation?</p>
            <div className="modal-actions">
              <button 
                onClick={handleAcceptHelp} 
                className="btn-primary"
              >
                Yes, help me
              </button>
              <button 
                onClick={handleSkipHelp} 
                className="btn-secondary"
              >
                Continue lesson
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIDEO CARD - Clean Structure */}
      <div className="video-card">
        <div className="video-container">
          {useIframeEmbed || apiLoadError ? (
            <iframe
              className="video-player"
              src={`https://www.youtube.com/embed/${videoId}?autoplay=0`}
              title={content?.title || "Video Lesson"}
              frameBorder="0"
              allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div ref={playerRef} className="video-player"></div>
          )}

          {showPlayOverlay && (
            <div className="play-overlay">
              <button onClick={handlePlayClick} className="play-button">
                ▶️ Start Lesson
              </button>
            </div>
          )}

          {/* Webcam PiP - Fixed Position */}
          {webcamActive && (
            <div className="webcam-pip">
              <video 
                ref={webcamRef} 
                autoPlay
                muted
                playsInline
                className="webcam-video"
              />
              <div className="webcam-indicator">
                <span>🟢 AI Assistant</span>
              </div>
              <button onClick={stopWebcam} className="webcam-close">×</button>
            </div>
          )}

          {webcamError && (
            <div className="webcam-error">
              <p>Camera unavailable: {webcamError}</p>
            </div>
          )}
        </div>

        {/* Playback Controls */}
        <div className="video-controls">
          <div className="time-info">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
          <button 
            onClick={() => setShowHelpModal(true)}
            className="help-button"
          >
            Need Help?
          </button>
        </div>
      </div>
    </>
  );
};

export default YouTubeVideoPlayer;