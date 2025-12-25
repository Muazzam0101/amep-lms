import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Auth/Login';
import Signup from './pages/Signup';
import { TeacherDashboard } from './pages/Teacher';
import { StudentDashboard, QuizPage } from './pages/Student';
import ThemeToggle from './components/ThemeToggle';
import EnvTest from './components/EnvTest';
import { ContentProvider } from './context/ContentContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CourseProvider } from './context/CourseContext';
import './App.css';

const AppRoutes = () => {
  const { currentUser } = useAuth();

  return (
    <Router>
      <Routes>
        <Route path="/login" element={!currentUser ? <Login /> : <Navigate to={currentUser.role === 'teacher' ? '/teacher-dashboard' : '/student-dashboard'} />} />
        <Route path="/signup" element={!currentUser ? <Signup /> : <Navigate to={currentUser.role === 'teacher' ? '/teacher-dashboard' : '/student-dashboard'} />} />
        <Route path="/teacher-dashboard" element={currentUser?.role === 'teacher' ? <TeacherDashboard /> : <Navigate to="/login" />} />
        <Route path="/student-dashboard" element={currentUser?.role === 'student' ? <StudentDashboard /> : <Navigate to="/login" />} />
        <Route path="/quiz" element={currentUser?.role === 'student' ? <QuizPage /> : <Navigate to="/login" />} />
        <Route path="/" element={<Navigate to={currentUser ? (currentUser.role === 'teacher' ? '/teacher-dashboard' : '/student-dashboard') : '/login'} />} />
      </Routes>
    </Router>
  );
};

function App() {
  return (
    <AuthProvider>
      <CourseProvider>
        <ContentProvider>
          <div className="page-fade-in">
            <EnvTest />
            <ThemeToggle />
            <AppRoutes />
          </div>
        </ContentProvider>
      </CourseProvider>
    </AuthProvider>
  );
}

export default App;
