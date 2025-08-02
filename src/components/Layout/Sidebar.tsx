import React from 'react';
import { 
  BookOpen, 
  Users, 
  GraduationCap, 
  Calendar,
  FileText,
  CheckSquare,
  Award,
  Mic,
  FolderOpen,
  Menu,
  X
} from 'lucide-react';

interface SidebarProps {
  activeEntity: string;
  setActiveEntity: (entity: string) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const navigationItems = [
  { id: 'courses', label: 'Courses', icon: BookOpen },
  { id: 'students', label: 'Students', icon: Users },
  { id: 'instructors', label: 'Instructors', icon: GraduationCap },
  { id: 'lessons', label: 'Lessons', icon: Calendar },
  { id: 'exams', label: 'Exams', icon: FileText },
  { id: 'attendance', label: 'Attendance', icon: CheckSquare },
  { id: 'studentExams', label: 'Student Exams', icon: Award },
  { id: 'recitation', label: 'Recitation', icon: Mic },
  { id: 'courseFiles', label: 'Course Files', icon: FolderOpen },
];

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeEntity, 
  setActiveEntity, 
  isOpen, 
  setIsOpen 
}) => {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed left-0 top-0 h-full w-64 bg-[#0e4d3c] transform transition-transform duration-300 ease-in-out z-50
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
      `}>
        <div className="flex items-center justify-between p-6 border-b border-green-600">
          <h1 className="text-xl font-bold text-white">Yakhtimoon</h1>
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden text-white hover:text-[#C6953E] transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        
        <nav className="mt-8">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeEntity === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveEntity(item.id);
                  setIsOpen(false);
                }}
                className={`
                  w-full flex items-center px-6 py-3 text-left transition-all duration-200
                  ${isActive 
                    ? 'bg-[#C6953E] text-white shadow-lg' 
                    : 'text-green-100 hover:bg-green-700 hover:text-white'
                  }
                `}
              >
                <Icon size={20} className="mr-3" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </>
  );
};