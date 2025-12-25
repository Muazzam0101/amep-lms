import React, { useState } from 'react';
import Button from '../../components/Button';
import Logo from '../../components/Logo';
import LogoutButton from '../../components/LogoutButton';
import PdfViewer from '../../components/PdfViewer';
import VideoLesson from './VideoLesson';
import StudentLearningPage from './StudentLearningPage';
import { useContent } from '../../context/ContentContext';
import { useCourse } from '../../context/CourseContext';
import './Student.css';

const StudentDashboard = () => {
  const { getValidContents } = useContent();
  const { courses } = useCourse();
  const [selectedPdf, setSelectedPdf] = useState(null);
  const [showVideoLesson, setShowVideoLesson] = useState(false);
  const [showLearningPage, setShowLearningPage] = useState(false);
  const [selectedContentId, setSelectedContentId] = useState(null);
  
  // Mock data for student learning status
  const studentData = {
    student_id: "student_001",
    name: "Alex Johnson",
    mastery_score: 72,
    recommended_topic: {
      name: "Linear Equations",
      description: "Learn to solve equations with one variable and understand the relationship between variables.",
      course: "Algebra Fundamentals"
    },
    revision_topics: [
      { name: "Quadratic Functions", course: "Algebra Fundamentals", urgency: "high" },
      { name: "Probability Basics", course: "Statistics", urgency: "medium" },
      { name: "Geometric Proofs", course: "Geometry", urgency: "low" }
    ]
  };

  const handleStartPractice = () => {
    console.log("Starting practice for:", studentData.recommended_topic.name);
    setSelectedContentId("content_001");
    setShowLearningPage(true);
  };

  const handleRevisionClick = (topic) => {
    console.log("Starting revision for:", topic.name);
    
    // Map topics to content IDs
    const topicContentMap = {
      "Quadratic Functions": "content_002",
      "Probability Basics": "content_001", // Fallback to Linear Equations
      "Geometric Proofs": "content_001" // Fallback to Linear Equations
    };
    
    const contentId = topicContentMap[topic.name] || "content_001";
    console.log('Opening content ID:', contentId, 'for topic:', topic.name);
    
    setSelectedContentId(contentId);
    setShowLearningPage(true);
  };

  const handleBackToDashboard = () => {
    setShowLearningPage(false);
    setShowVideoLesson(false);
    setSelectedContentId(null);
  };

  const handleCloseVideoLesson = () => {
    setShowVideoLesson(false);
  };

  const handleOpenPdf = (content) => {
    setSelectedPdf(content);
  };

  const handleClosePdf = () => {
    setSelectedPdf(null);
  };

  // Get available PDFs for recommended topic
  const getAvailablePdfs = () => {
    const validContents = getValidContents();
    return validContents.filter(content => content.pdf_data);
  };

  const getMasteryColor = (score) => {
    if (score >= 80) return 'mastery-excellent';
    if (score >= 60) return 'mastery-good';
    return 'mastery-needs-work';
  };

  const getUrgencyClass = (urgency) => {
    return `revision-urgency-${urgency}`;
  };

  // Show learning page if selected
  if (showLearningPage) {
    return (
      <StudentLearningPage 
        contentId={selectedContentId}
        onBack={handleBackToDashboard}
      />
    );
  }

  return (
    <div className="student-container page-fade-in">
      <div className="dashboard-header">
        <Logo size="small" clickable className="header-logo" />
        <div className="student-header">
          <h1 className="student-title">Welcome back, {studentData.name}</h1>
          <p className="student-subtitle">Here's your learning overview for today</p>
        </div>
        <LogoutButton />
      </div>

      <div className="student-content">
        {/* Recommended Topic Card */}
        <div className="student-card glass-card recommended-card accent-glow">
          <div className="card-header">
            <h2 className="card-title">📚 Recommended Topic</h2>
          </div>
          <div className="card-content">
            <h3 className="topic-name">{studentData.recommended_topic.name}</h3>
            <p className="topic-course">{studentData.recommended_topic.course}</p>
            <p className="topic-description">{studentData.recommended_topic.description}</p>
            <Button onClick={handleStartPractice} className="practice-btn glass-button primary">
              Start Practice
            </Button>
          </div>
        </div>

        {/* Mastery Status Card */}
        <div className="student-card glass-card mastery-card">
          <div className="card-header">
            <h2 className="card-title">📊 Mastery Status</h2>
          </div>
          <div className="card-content">
            <div className="mastery-score">
              <span className="score-number">{studentData.mastery_score}%</span>
              <span className="score-label">Overall Mastery</span>
            </div>
            <div className="progress-container">
              <div className="progress-bar">
                <div 
                  className={`progress-fill ${getMasteryColor(studentData.mastery_score)}`}
                  style={{ width: `${studentData.mastery_score}%` }}
                ></div>
              </div>
            </div>
            <p className="mastery-message">
              {studentData.mastery_score >= 80 
                ? "Excellent progress! Keep up the great work." 
                : studentData.mastery_score >= 60 
                ? "Good progress! Focus on revision topics to improve." 
                : "Let's work together to strengthen your foundation."}
            </p>
          </div>
        </div>

        {/* Revision Alerts Card */}
        <div className="student-card glass-card revision-card">
          <div className="card-header">
            <h2 className="card-title">🔄 Revision Needed</h2>
          </div>
          <div className="card-content">
            {studentData.revision_topics.length === 0 ? (
              <p className="no-revision">Great! No topics need revision right now.</p>
            ) : (
              <div className="revision-list">
                {studentData.revision_topics.map((topic, index) => (
                  <div key={index} className="revision-item">
                    <div className="revision-info">
                      <h4 className="revision-topic">{topic.name}</h4>
                      <p className="revision-course">{topic.course}</p>
                    </div>
                    <div className="revision-actions">
                      <span className={`urgency-badge ${getUrgencyClass(topic.urgency)}`}>
                        {topic.urgency}
                      </span>
                      <button 
                        className="revision-btn"
                        onClick={() => handleRevisionClick(topic)}
                      >
                        Review
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Available PDFs Card */}
        {getAvailablePdfs().length > 0 && (
          <div className="student-card glass-card pdfs-card">
            <div className="card-header">
              <h2 className="card-title">📄 Study Materials</h2>
            </div>
            <div className="card-content">
              <div className="pdfs-list">
                {getAvailablePdfs().map(content => (
                  <div key={content.content_id} className="pdf-item">
                    <div className="pdf-info">
                      <h4 className="pdf-title">{content.title}</h4>
                      <div className="pdf-meta">
                        <span className={`pdf-difficulty difficulty-${content.difficulty.toLowerCase()}`}>
                          {content.difficulty}
                        </span>
                        <span className="pdf-time">{content.estimated_time} min</span>
                      </div>
                    </div>
                    <button 
                      className="glass-button primary pdf-open-btn"
                      onClick={() => handleOpenPdf(content)}
                    >
                      📄 Study
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Video Lesson Modal */}
      {showVideoLesson && (
        <div className="modal-overlay">
          <div className="video-lesson-modal">
            <div className="video-lesson-header">
              <h3>Video Lesson: {studentData.recommended_topic.name}</h3>
              <button onClick={handleCloseVideoLesson} className="close-btn">
                ✕
              </button>
            </div>
            <VideoLesson 
              lesson={{
                title: studentData.recommended_topic.name,
                description: studentData.recommended_topic.description,
                videoUrl: "/api/placeholder/video" // Mock video URL
              }}
            />
          </div>
        </div>
      )}

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

export default StudentDashboard;