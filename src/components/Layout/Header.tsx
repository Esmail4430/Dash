import React from 'react';
import { Menu, Bell, User } from 'lucide-react';

interface HeaderProps {
  setIsSidebarOpen: (isOpen: boolean) => void;
  activeEntity: string;
}

export const Header: React.FC<HeaderProps> = ({ setIsSidebarOpen, activeEntity }) => {
  const getEntityTitle = (entity: string) => {
    const titles: Record<string, string> = {
      courses: 'Courses Management',
      students: 'Students Management',
      instructors: 'Instructors Management',
      lessons: 'Lessons Management',
      exams: 'Exams Management',
      attendance: 'Attendance Management',
      studentExams: 'Student Exams Management',
      recitation: 'Recitation Management',
      courseFiles: 'Course Files Management',
    };
    return titles[entity] || 'Dashboard';
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="lg:hidden p-2 rounded-md text-gray-600 hover:text-[#0e4d3c] hover:bg-gray-100 transition-colors"
          >
            <Menu size={24} />
          </button>
          <h2 className="text-2xl font-semibold text-[#0e4d3c] ml-2 lg:ml-0">
            {getEntityTitle(activeEntity)}
          </h2>
        </div>
        
        <div className="flex items-center space-x-4">
          <button className="p-2 rounded-full text-gray-600 hover:text-[#0e4d3c] hover:bg-gray-100 transition-colors">
            <Bell size={20} />
          </button>
          <button className="p-2 rounded-full text-gray-600 hover:text-[#0e4d3c] hover:bg-gray-100 transition-colors">
            <User size={20} />
          </button>
        </div>
      </div>
    </header>
  );
};