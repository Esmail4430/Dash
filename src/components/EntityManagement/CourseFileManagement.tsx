import React, { useState, useEffect } from 'react';
import { Plus, Search, FileText, Download } from 'lucide-react';
import { CourseFile, Course } from '../../types';
import { apiService } from '../../services/api';
import { Button } from '../UI/Button';
import { Input } from '../UI/Input';
import { Modal } from '../UI/Modal';
import { Table } from '../UI/Table';
import { CourseFileForm } from '../Forms/CourseFileForm';

export const CourseFileManagement: React.FC = () => {
  const [courseFiles, setCourseFiles] = useState<CourseFile[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourseFile, setEditingCourseFile] = useState<CourseFile | null>(null);

  const fetchCourseFiles = async () => {
    setLoading(true);
    try {
      const [courseFilesResponse, coursesResponse] = await Promise.all([
        apiService.getAll('courseFiles'),
        apiService.getAll('courses')
      ]);
      
      setCourseFiles(courseFilesResponse.courseFiles || courseFilesResponse.data || []);
      setCourses(coursesResponse.courses || coursesResponse.data || []);
    } catch (error) {
      console.error('Failed to fetch course files:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseFiles();
  }, []);

  const handleSave = async (formData: FormData) => {
    try {
      if (editingCourseFile?.id) {
        await apiService.update('courseFiles', editingCourseFile.id, formData);
      } else {
        await apiService.create('courseFiles', formData);
      }
      await fetchCourseFiles();
      setIsModalOpen(false);
      setEditingCourseFile(null);
    } catch (error) {
      console.error('Failed to save course file:', error);
    }
  };

  const handleDelete = async (courseFile: CourseFile) => {
    if (window.confirm('Are you sure you want to delete this course file?')) {
      try {
        await apiService.delete('courseFiles', courseFile.id!);
        await fetchCourseFiles();
      } catch (error) {
        console.error('Failed to delete course file:', error);
      }
    }
  };

  const getCourseTitle = (courseId: number) => {
    const course = courses.find(c => c.id === courseId);
    return course?.title || `Course ${courseId}`;
  };

  const filteredCourseFiles = courseFiles.filter(file =>
    file.file_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getCourseTitle(file.course_id).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    { 
      key: 'course_id', 
      label: 'Course',
      render: (courseId: number) => (
        <span className="font-medium text-[#0e4d3c]">
          {getCourseTitle(courseId)}
        </span>
      )
    },
    { 
      key: 'file_name', 
      label: 'File Name',
      render: (fileName: string) => (
        <div className="flex items-center space-x-2">
          <FileText className="w-4 h-4 text-gray-500" />
          <span>{fileName}</span>
        </div>
      )
    },
    { 
      key: 'file_path', 
      label: 'Actions',
      render: (filePath: string, row: CourseFile) => (
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              // In a real implementation, this would download the file
              window.open(filePath, '_blank');
            }}
          >
            <Download size={16} className="mr-1" />
            Download
          </Button>
        </div>
      )
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <Input
              placeholder="Search course files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus size={20} className="mr-2" />
          Add Course File
        </Button>
      </div>

      <Table
        columns={columns}
        data={filteredCourseFiles}
        onEdit={(courseFile) => {
          setEditingCourseFile(courseFile);
          setIsModalOpen(true);
        }}
        onDelete={handleDelete}
        loading={loading}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCourseFile(null);
        }}
        title={editingCourseFile ? 'Edit Course File' : 'Add New Course File'}
        size="lg"
      >
        <CourseFileForm
          initialData={editingCourseFile}
          courses={courses}
          onSave={handleSave}
          onCancel={() => {
            setIsModalOpen(false);
            setEditingCourseFile(null);
          }}
        />
      </Modal>
    </div>
  );
};