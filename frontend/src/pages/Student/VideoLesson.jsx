import React, { useState, useRef, useEffect } from 'react';
import AILearningMode from '../../components/AILearningMode';

const VideoLesson = ({ lesson }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [showHelp, setShowHelp] = useState(false);
  const [helpContent, setHelpContent] = useState(null);
  
  const videoRef = useRef(null);

  // Mock difficult sections - in real app, this comes from teacher data
  const difficultSections = [
    { timestamp: 45, title: "Complex Equation Introduction", helpText: "Remember: isolate the variable step by step" },
    { timestamp: 120, title: "Fraction Operations", helpText: "Find common denominators first" },
    { timestamp: 180, title: "Word Problem Setup", helpText: "Identify what the question is asking for" }
  ];

  // Handle video time updates
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  // Handle play/pause
  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // AI Learning Mode handlers
  const handlePauseVideo = () => {
    if (videoRef.current && isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleResumeVideo = () => {
    if (videoRef.current && !isPlaying) {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleShowHelp = () => {
    const nearbySection = difficultSections.find(
      section => Math.abs(currentTime - section.timestamp) < 15
    );
    
    if (nearbySection) {
      setHelpContent(nearbySection);
      setShowHelp(true);
    }
  };

  const handleCloseHelp = () => {
    setShowHelp(false);
    setHelpContent(null);
    handleResumeVideo();
  };

  const handleLogEvent = (event) => {
    console.log('AI Learning Event:', event);
    // In real app, send to analytics service
  };

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.addEventListener('timeupdate', handleTimeUpdate);
      video.addEventListener('play', () => setIsPlaying(true));
      video.addEventListener('pause', () => setIsPlaying(false));
      
      return () => {
        video.removeEventListener('timeupdate', handleTimeUpdate);
        video.removeEventListener('play', () => setIsPlaying(true));
        video.removeEventListener('pause', () => setIsPlaying(false));
      };
    }
  }, []);

  return (
    <div className="video-lesson-container">
      <div className="video-header">
        <h2>{lesson?.title || "Linear Equations - Introduction"}</h2>
        <p>{lesson?.description || "Learn the fundamentals of solving linear equations"}</p>
      </div>

      <div className="video-player-wrapper">
        <video
          ref={videoRef}
          className="video-player"
          controls
          width="100%"
          height="400"
        >
          <source src={lesson?.videoUrl || "/api/placeholder/video"} type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        {/* AI Learning Mode Integration */}
        <AILearningMode
          isVideoPlaying={isPlaying}
          currentTimestamp={currentTime}
          difficultSections={difficultSections}
          onPauseVideo={handlePauseVideo}
          onResumeVideo={handleResumeVideo}
          onLogEvent={handleLogEvent}
        />
      </div>

      {/* Video Controls */}
      <div className="video-controls">
        <button onClick={handlePlayPause} className="play-pause-btn">
          {isPlaying ? '⏸️' : '▶️'}
        </button>
        <span className="time-display">
          {Math.floor(currentTime / 60)}:{String(Math.floor(currentTime % 60)).padStart(2, '0')}
        </span>
        <button onClick={handleShowHelp} className="manual-help-btn">
          💡 Need Help?
        </button>
      </div>

      {/* Difficult Sections Timeline */}
      <div className="timeline-markers">
        <h4>Key Sections:</h4>
        <div className="markers">
          {difficultSections.map((section, index) => (
            <div 
              key={index} 
              className="timeline-marker"
              onClick={() => {
                if (videoRef.current) {
                  videoRef.current.currentTime = section.timestamp;
                }
              }}
            >
              <span className="marker-time">{Math.floor(section.timestamp / 60)}:{String(Math.floor(section.timestamp % 60)).padStart(2, '0')}</span>
              <span className="marker-title">{section.title}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Help Modal */}
      {showHelp && helpContent && (
        <div className="modal-overlay">
          <div className="help-content-modal">
            <h3>{helpContent.title}</h3>
            <p>{helpContent.helpText}</p>
            <div className="help-actions">
              <button onClick={handleCloseHelp} className="btn-continue">
                Got it, Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoLesson;