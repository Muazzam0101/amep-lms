import React, { useState, useRef, useEffect } from 'react';

const YouTubeVideoPlayer = ({ content }) => {
  const [player, setPlayer] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [useIframeEmbed, setUseIframeEmbed] = useState(false);
  const [apiLoadError, setApiLoadError] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [helpContent, setHelpContent] = useState(null);
  const [showPlayOverlay, setShowPlayOverlay] = useState(true);
  const [showCameraPrompt, setShowCameraPrompt] = useState(false);
  const [webcamActive, setWebcamActive] = useState(false);
  const [webcamError, setWebcamError] = useState(null);
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [baseline, setBaseline] = useState(null);
  const [confusionDetected, setConfusionDetected] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [suppressedTimestamps, setSuppressedTimestamps] = useState(new Set());
  
  const playerRef = useRef(null);
  const webcamRef = useRef(null);
  const streamRef = useRef(null);
  const timeUpdateInterval = useRef(null);
  const detectionIntervalRef = useRef(null);
  const confusionFramesRef = useRef([]);

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
          height: '400',
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
      
      await new Promise(resolve => setTimeout(resolve, 50));
      
      if (webcamRef.current) {
        webcamRef.current.srcObject = stream;
        await webcamRef.current.play();
      }
      
      startCalibration();
    } catch (error) {
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

  const startCalibration = () => {
    setIsCalibrating(true);
    setTimeout(() => {
      setBaseline({
        eyebrowHeight: Math.random() * 10 + 15,
        eyeOpenness: Math.random() * 5 + 8,
        headTilt: Math.random() * 10 - 5
      });
      setIsCalibrating(false);
      startVideoPlayback();
      startConfusionDetection();
    }, 5000);
  };

  const analyzeFacialLandmarks = () => {
    if (!webcamRef.current || !baseline) return null;
    
    const mockAnalysis = {
      eyebrowHeight: baseline.eyebrowHeight + (Math.random() - 0.5) * 8,
      eyeOpenness: baseline.eyeOpenness + (Math.random() - 0.5) * 4,
      headTilt: baseline.headTilt + (Math.random() - 0.5) * 12
    };
    
    const eyebrowDeviation = Math.abs(mockAnalysis.eyebrowHeight - baseline.eyebrowHeight);
    const eyeDeviation = Math.abs(mockAnalysis.eyeOpenness - baseline.eyeOpenness);
    const headDeviation = Math.abs(mockAnalysis.headTilt - baseline.headTilt);
    
    const isConfused = (
      eyebrowDeviation > 3 ||
      eyeDeviation > 2 ||
      headDeviation > 6
    );
    
    return { isConfused, timestamp: Date.now() };
  };
  
  const checkSustainedConfusion = () => {
    const analysis = analyzeFacialLandmarks();
    if (!analysis) return;
    
    confusionFramesRef.current = [...confusionFramesRef.current, analysis].slice(-15);
    
    const recentConfused = confusionFramesRef.current.filter(f => f.isConfused && Date.now() - f.timestamp < 5000);
    const confusionRatio = recentConfused.length / Math.min(confusionFramesRef.current.length, 10);
    
    if (confusionRatio > 0.6 && !confusionDetected && isPlaying) {
      handleSustainedConfusion();
    }
  };
  
  const handleSustainedConfusion = () => {
    const timestampKey = Math.floor(currentTime / 30) * 30;
    if (suppressedTimestamps.has(timestampKey)) return;
    
    setConfusionDetected(true);
    if (player) player.pauseVideo();
    setShowHelpModal(true);
  };

  const startConfusionDetection = () => {
    detectionIntervalRef.current = setInterval(() => {
      if (isPlaying && baseline && webcamActive) {
        checkSustainedConfusion();
      }
    }, 300);
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
    setBaseline(null);
    setIsCalibrating(false);
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
    if (player) player.playVideo();
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
      <div className="video-error">
        <h3>Video Not Available</h3>
        <p>No valid YouTube URL provided.</p>
      </div>
    );
  }

  return (
    <div className="youtube-video-container">
      <div className="video-header">
        <h2>{content?.title || "Video Lesson"}</h2>
        <p>{content?.description || "Watch and learn with AI assistance"}</p>
      </div>

      <div className="video-player-wrapper">
        {useIframeEmbed || apiLoadError ? (
          <iframe
            className="youtube-player"
            src={`https://www.youtube.com/embed/${videoId}?autoplay=0`}
            title={content?.title || "YouTube Video"}
            frameBorder="0"
            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <div ref={playerRef} className="youtube-player"></div>
        )}

        {showPlayOverlay && (
          <div className="play-overlay">
            <button onClick={handlePlayClick} className="play-button">
              ▶️ Play Video
            </button>
          </div>
        )}

        {showCameraPrompt && (
          <div className="modal-overlay">
            <div className="camera-prompt-modal">
              <h3>Enable camera-assisted learning?</h3>
              <p>This helps detect confusion during the video.</p>
              <p><strong>No video is stored.</strong></p>
              <div className="prompt-actions">
                <button onClick={() => handleCameraDecision(true)} className="btn-enable-camera">
                  📹 Enable Camera
                </button>
                <button onClick={() => handleCameraDecision(false)} className="btn-skip-camera">
                  Skip Camera
                </button>
              </div>
            </div>
          </div>
        )}

        {webcamActive && (
          <div className="webcam-preview">
            <video 
              ref={webcamRef} 
              autoPlay 
              muted 
              playsInline
              className="webcam-video"
              style={{
                width: '160px',
                height: '120px',
                objectFit: 'cover',
                border: '2px solid #00ff00',
                borderRadius: '8px',
                zIndex: 1000
              }}
            />
            <div className="webcam-status">
              {isCalibrating ? (
                <span className="calibrating">Calibrating... (5s)</span>
              ) : (
                <span className="active">🟢 Camera Active</span>
              )}
            </div>
            <button onClick={stopWebcam} className="stop-webcam">✕</button>
          </div>
        )}

        {webcamError && (
          <div className="webcam-error">
            <p>❌ {webcamError}</p>
          </div>
        )}
      </div>

      <div className="video-info">
        <div className="video-controls">
          <span className="time-display">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>
      </div>

      {showHelpModal && (
        <div className="modal-overlay">
          <div className="help-modal">
            <h3>Looks like this part is challenging.</h3>
            <p>Want a quick explanation or example?</p>
            <div className="help-actions">
              <button onClick={handleAcceptHelp} className="btn-accept">
                Yes, help me
              </button>
              <button onClick={handleSkipHelp} className="btn-skip">
                Continue video
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default YouTubeVideoPlayer;