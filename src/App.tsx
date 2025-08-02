import React, { useState, useEffect } from 'react';
import { LoginPage } from './components/Auth/LoginPage';
import { Header } from './components/Layout/Header';
import { Sidebar } from './components/Layout/Sidebar';
import { CourseManagement } from './components/EntityManagement/CourseManagement';
import { StudentManagement } from './components/EntityManagement/StudentManagement';
import { InstructorManagement } from './components/EntityManagement/InstructorManagement';
import { LessonManagement } from './components/EntityManagement/LessonManagement';
import { ExamManagement } from './components/EntityManagement/ExamManagement';
import { AttendanceManagement } from './components/EntityManagement/AttendanceManagement';
import { StudentExamManagement } from './components/EntityManagement/StudentExamManagement';
import { RecitationManagement } from './components/EntityManagement/RecitationManagement';
import { CourseFileManagement } from './components/EntityManagement/CourseFileManagement';

function App() {
  const [activeEntity, setActiveEntity] = useState('courses');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check for existing authentication token on app load
  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('authToken');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  const renderEntityManagement = () => {
    switch (activeEntity) {
      case 'courses':
        return <CourseManagement />;
      case 'students':
        return <StudentManagement />;
      case 'instructors':
        return <InstructorManagement />;
      case 'lessons':
        return <LessonManagement />;
      case 'exams':
        return <ExamManagement />;
      case 'attendance':
        return <AttendanceManagement />;
      case 'studentExams':
        return <StudentExamManagement />;
      case 'recitation':
        return <RecitationManagement />;
      case 'courseFiles':
        return <CourseFileManagement />;
      default:
        return <CourseManagement />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar
        activeEntity={activeEntity}
        setActiveEntity={setActiveEntity}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />

      <div className="flex-1 lg:ml-0">
        <Header
          setIsSidebarOpen={setIsSidebarOpen}
          activeEntity={activeEntity}
        />

        <main className="flex-1">
          {renderEntityManagement()}
        </main>
      </div>
    </div>
  );
}

export default App;
