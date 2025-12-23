import React, { useState, useEffect } from 'react';
import YouTubeVideoPlayer from '../../components/YouTubeVideoPlayer';
import VideoLesson from './VideoLesson';
import PdfViewer from '../../components/PdfViewer';
import Button from '../../components/Button';
import './Student.css';

const StudentLearningPage = ({ contentId, onBack }) => {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPdf, setSelectedPdf] = useState(null);

  // Mock content data - in real app, fetch from API
  useEffect(() => {
    console.log('Loading content for ID:', contentId);
    
    // Simulate API call with different content based on contentId
    setTimeout(() => {
      // Mock content database
      const contentDatabase = {
        "content_001": {
          content_id: "content_001",
          title: "Linear Equations - Complete Guide",
          description: "Master linear equations with step-by-step video explanations and practice materials",
          youtube_url: "https://www.youtube.com/watch?v=WUvTyaaNkzM", // Khan Academy - embeddable
          pdf_data: "/api/placeholder/pdf",
          difficulty: "Medium",
          estimated_time: 25,
          course: "Algebra Fundamentals",
          teacher_notes: "Pay special attention to the solving techniques demonstrated in the video"
        },
        "content_002": {
          content_id: "content_002",
          title: "Quadratic Functions",
          description: "Learn about parabolas, vertex form, and solving quadratic equations",
          youtube_url: "https://www.youtube.com/watch?v=9vNhP6MBnig", // Khan Academy - embeddable
          pdf_data: "/api/placeholder/pdf",
          difficulty: "Hard",
          estimated_time: 30,
          course: "Algebra Fundamentals",
          teacher_notes: "Focus on the vertex form and graphing techniques"
        },
        "content_003": {
          content_id: "content_003",
          title: "Basic HTML Structure",
          description: "Introduction to HTML tags and document structure",
          youtube_url: "https://www.youtube.com/watch?v=UB1O30fR-EE", // freeCodeCamp - embeddable
          pdf_data: "/api/placeholder/pdf",
          difficulty: "Easy",
          estimated_time: 20,
          course: "Web Development",
          teacher_notes: "Practice creating your first HTML page"
        }
      };
      
      const selectedContent = contentDatabase[contentId] || contentDatabase["content_001"];
      console.log('Selected content:', selectedContent);
      console.log('YouTube URL:', selectedContent.youtube_url);
      
      setContent(selectedContent);
      setLoading(false);
    }, 1000);
  }, [contentId]);

  const handleOpenPdf = () => {
    if (content?.pdf_data) {
      setSelectedPdf(content);
    }
  };

  const handleClosePdf = () => {
    setSelectedPdf(null);
  };

  if (loading) {
    return (
      <div className="learning-page-loading">
        <div className="loading-spinner"></div>
        <p>Loading learning content...</p>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="learning-page-error">
        <h3>Content Not Found</h3>
        <p>The requested learning content could not be loaded.</p>
        <Button onClick={onBack} className="glass-button primary">
          Back to Dashboard
        </Button>
      </div>
    );
  }

  const hasYouTubeVideo = content.youtube_url && content.youtube_url.includes('youtube.com');

  return (
    <div className="student-learning-page">
      {/* Header */}
      <div className="learning-header">
        <button onClick={onBack} className="back-btn">
          ← Back to Dashboard
        </button>
        <div className="content-info">
          <h1>{content.title}</h1>
          <p>{content.description}</p>
          <div className="content-meta">
            <span className={`difficulty-badge difficulty-${content.difficulty.toLowerCase()}`}>
              {content.difficulty}
            </span>
            <span className="time-estimate">⏱️ {content.estimated_time} min</span>
            <span className="course-name">📚 {content.course}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="learning-content">
        {/* Video Section */}
        {hasYouTubeVideo ? (
          <div className="video-section">
            <YouTubeVideoPlayer content={content} />
          </div>
        ) : (
          <div className="video-section">
            <VideoLesson 
              lesson={{
                title: content.title,
                description: content.description,
                videoUrl: "/api/placeholder/video" // Fallback video
              }}
            />
          </div>
        )}

        {/* Additional Resources */}
        <div className="resources-section">
          <h3>Additional Resources</h3>
          
          {/* PDF Materials */}
          {content.pdf_data && (
            <div className="resource-card">
              <div className="resource-info">
                <h4>📄 Study Materials</h4>
                <p>Comprehensive notes and examples for this topic</p>
              </div>
              <Button onClick={handleOpenPdf} className="glass-button primary">
                Open PDF
              </Button>
            </div>
          )}

          {/* Teacher Notes */}
          {content.teacher_notes && (
            <div className="resource-card teacher-notes">
              <div className="resource-info">
                <h4>👨‍🏫 Teacher Notes</h4>
                <p>{content.teacher_notes}</p>
              </div>
            </div>
          )}

          {/* Practice Section */}
          <div className="resource-card">
            <div className="resource-info">
              <h4>🎯 Practice Quiz</h4>
              <p>Test your understanding with interactive questions</p>
            </div>
            <Button className="glass-button secondary">
              Start Quiz
            </Button>
          </div>
        </div>
      </div>

      {/* PDF Viewer Modal */}
      {selectedPdf && (
        <PdfViewer
          pdfUrl={selectedPdf.pdf_data}
          title={selectedPdf.title}
          onClose={handleClosePdf}
        />
      )}
    </div>
  );
};

export default StudentLearningPage;