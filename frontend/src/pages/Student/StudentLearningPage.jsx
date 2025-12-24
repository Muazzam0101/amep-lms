import React, { useState, useEffect } from 'react';
import YouTubeVideoPlayer from '../../components/YouTubeVideoPlayer';
import VideoLesson from './VideoLesson';
import PdfViewer from '../../components/PdfViewer';
import Button from '../../components/Button';
import ThemeToggle from '../../components/ThemeToggle';
import './Student.css';

const StudentLearningPage = ({ contentId, onBack }) => {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPdf, setSelectedPdf] = useState(null);

  // Mock content data
  useEffect(() => {
    setTimeout(() => {
      const contentDatabase = {
        "content_001": {
          content_id: "content_001",
          title: "Linear Equations - Complete Guide",
          description: "Master linear equations with step-by-step video explanations and practice materials",
          youtube_url: "https://www.youtube.com/watch?v=WUvTyaaNkzM",
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
          youtube_url: "https://www.youtube.com/watch?v=9vNhP6MBnig",
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
          youtube_url: "https://www.youtube.com/watch?v=UB1O30fR-EE",
          pdf_data: "/api/placeholder/pdf",
          difficulty: "Easy",
          estimated_time: 20,
          course: "Web Development",
          teacher_notes: "Practice creating your first HTML page"
        }
      };
      
      const selectedContent = contentDatabase[contentId] || contentDatabase["content_001"];
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
      <div className="loading-state">
        <div className="loading-spinner"></div>
        <p>Loading lesson...</p>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="error-state">
        <h3>Lesson Not Found</h3>
        <p>The requested lesson could not be loaded.</p>
        <Button onClick={onBack} className="btn-primary">
          Back to Dashboard
        </Button>
      </div>
    );
  }

  const hasYouTubeVideo = content.youtube_url && content.youtube_url.includes('youtube.com');

  return (
    <div className="lesson-page">
      {/* Navigation */}
      <div className="lesson-nav">
        <button onClick={onBack} className="back-button">
          ← Back to Dashboard
        </button>
        <ThemeToggle />
      </div>

      {/* 12-Column Grid Layout */}
      <div className="lesson-grid">
        {/* Main Content Area - 8 Columns */}
        <main className="lesson-main">
          {/* Lesson Header */}
          <header className="lesson-header">
            <h1 className="lesson-title">{content.title}</h1>
            <p className="lesson-subtitle">{content.description}</p>
            <div className="lesson-meta">
              <span className={`difficulty-chip difficulty-${content.difficulty.toLowerCase()}`}>
                {content.difficulty}
              </span>
              <span className="duration-chip">
                ⏱️ {content.estimated_time} min
              </span>
            </div>
          </header>

          {/* Video Card */}
          <section className="video-section">
            {hasYouTubeVideo ? (
              <YouTubeVideoPlayer content={content} />
            ) : (
              <VideoLesson 
                lesson={{
                  title: content.title,
                  description: content.description,
                  videoUrl: "/api/placeholder/video"
                }}
              />
            )}
          </section>
        </main>

        {/* Right Sidebar - 4 Columns */}
        <aside className="lesson-sidebar">
          <div className="sidebar-content">
            <h2 className="sidebar-title">Study Resources</h2>
            
            {/* Study Materials Card */}
            {content.pdf_data && (
              <div className="resource-card">
                <div className="resource-header">
                  <div className="resource-icon">📄</div>
                  <h3>Study Materials</h3>
                </div>
                <p className="resource-description">
                  Comprehensive notes and practice problems for this lesson.
                </p>
                <Button onClick={handleOpenPdf} className="resource-cta">
                  Open Materials
                </Button>
              </div>
            )}

            {/* Teacher Notes Card */}
            {content.teacher_notes && (
              <div className="resource-card teacher-notes">
                <div className="resource-header">
                  <div className="resource-icon">👨‍🏫</div>
                  <h3>Teacher Notes</h3>
                </div>
                <p className="resource-description">
                  {content.teacher_notes}
                </p>
              </div>
            )}

            {/* Practice Quiz Card */}
            <div className="resource-card">
              <div className="resource-header">
                <div className="resource-icon">🎯</div>
                <h3>Practice Quiz</h3>
              </div>
              <p className="resource-description">
                Test your understanding with interactive questions.
              </p>
              <Button className="resource-cta secondary">
                Start Quiz
              </Button>
            </div>
          </div>
        </aside>
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