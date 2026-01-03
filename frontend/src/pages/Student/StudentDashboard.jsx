import React, { useState, useEffect } from 'react';
import Button from '../../components/Button';
import Logo from '../../components/Logo';
import LogoutButton from '../../components/LogoutButton';
import PdfViewer from '../../components/PdfViewer';
import VideoLesson from './VideoLesson';
import StudentLearningPage from './StudentLearningPage';
import { useContent } from '../../context/ContentContext';
import { useCourse } from '../../context/CourseContext';
import { useAuth } from '../../context/AuthContext';
import './Student.css';

const StudentDashboard = () => {
  const { getValidContents } = useContent();
  const { courses, topics, hydrated } = useCourse();
  const { currentUser } = useAuth();
  const [selectedPdf, setSelectedPdf] = useState(null);
  const [showVideoLesson, setShowVideoLesson] = useState(false);
  const [showLearningPage, setShowLearningPage] = useState(false);
  const [selectedContentId, setSelectedContentId] = useState(null);
  const [studentData, setStudentData] = useState(null);
  
  // Calculate dynamic student data from backend
  useEffect(() => {
    if (!hydrated) return;
    
    const validContents = getValidContents();
    const availableCourses = courses || [];
    const availableTopics = topics || [];
    
    // Calculate mastery score (placeholder logic)
    const totalContent = validContents.length;
    const masteryScore = totalContent > 0 ? Math.min(Math.round((totalContent * 15) + 25), 100) : 0;
    
    // Get recommended topic (first available topic)
    const recommendedTopic = availableTopics.length > 0 ? {
      name: availableTopics[0].title,
      description: availableTopics[0].description || `Learn about ${availableTopics[0].title}`,
      course: availableCourses.find(c => c.course_id === availableTopics[0].course_id)?.title || 'Course'
    } : null;
    
    // Get revision topics (topics with content)
    const revisionTopics = availableTopics
      .filter(topic => validContents.some(content => content.topic_id === topic.topic_id))
      .slice(0, 3)
      .map(topic => ({
        name: topic.title,
        course: availableCourses.find(c => c.course_id === topic.course_id)?.title || 'Course',
        urgency: ['high', 'medium', 'low'][Math.floor(Math.random() * 3)],
        topic_id: topic.topic_id
      }));
    
    setStudentData({
      name: currentUser?.email?.split('@')[0] || 'Student',
      mastery_score: masteryScore,
      recommended_topic: recommendedTopic,
      revision_topics: revisionTopics,
      has_content: validContents.length > 0,
      total_courses: availableCourses.length,
      total_topics: availableTopics.length
    });
  }, [hydrated, courses, topics, getValidContents, currentUser]);

  const handleStartPractice = () => {
    if (!studentData?.recommended_topic) return;
    
    const validContents = getValidContents();
    const firstContent = validContents[0];
    
    if (firstContent) {
      setSelectedContentId(firstContent.content_id);
      setShowLearningPage(true);
    }
  };

  const handleRevisionClick = (topic) => {
    const validContents = getValidContents();
    const topicContent = validContents.find(content => content.topic_id === topic.topic_id);
    
    if (topicContent) {
      setSelectedContentId(topicContent.content_id);
      setShowLearningPage(true);
    }
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

  // Show loading state while data is being calculated
  if (!hydrated || !studentData) {
    return (
      <div className="student-container page-fade-in">
        <div className="dashboard-header">
          <Logo size="small" clickable className="header-logo" />
          <div className="student-header">
            <h1 className="student-title">Loading...</h1>
            <p className="student-subtitle">Preparing your dashboard</p>
          </div>
          <LogoutButton />
        </div>
        <div className="student-content">
          <div className="student-card glass-card">
            <div className="card-content">
              <p>Loading your learning data...</p>
            </div>
          </div>
        </div>
      </div>
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
        {/* Empty State - No Content Available */}
        {!studentData.has_content ? (
          <div className="student-card glass-card empty-state-card">
            <div className="card-content">
              <div className="empty-state">
                <div className="empty-icon">📚</div>
                <h3 className="empty-title">No Learning Content Available</h3>
                <p className="empty-message">
                  Please wait for your teacher to upload courses and learning materials.
                </p>
                <div className="empty-stats">
                  <span>Courses: {studentData.total_courses}</span>
                  <span>Topics: {studentData.total_topics}</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Recommended Topic Card */}
            {studentData.recommended_topic ? (
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
            ) : (
              <div className="student-card glass-card">
                <div className="card-header">
                  <h2 className="card-title">📚 Recommended Topic</h2>
                </div>
                <div className="card-content">
                  <p>No topics available yet. Please wait for your teacher to add content.</p>
                </div>
              </div>
            )}

            {/* Mastery Status Card */}
            <div className="student-card glass-card mastery-card">
              <div className="card-header">
                <h2 className="card-title">📊 Learning Progress</h2>
              </div>
              <div className="card-content">
                <div className="mastery-score">
                  <span className="score-number">{studentData.mastery_score}%</span>
                  <span className="score-label">Content Availability</span>
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
                  {studentData.total_courses > 0 
                    ? `You have access to ${studentData.total_courses} course(s) and ${studentData.total_topics} topic(s).` 
                    : "Waiting for your teacher to upload learning content."}
                </p>
              </div>
            </div>

            {/* Revision Topics Card */}
            <div className="student-card glass-card revision-card">
              <div className="card-header">
                <h2 className="card-title">🔄 Available Topics</h2>
              </div>
              <div className="card-content">
                {studentData.revision_topics.length === 0 ? (
                  <p className="no-revision">No topics available for review yet.</p>
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
                            Study
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Study Materials Card - Only show if content exists */}
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