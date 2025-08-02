import React, { useState, useEffect } from 'react';
import { Plus, Search } from 'lucide-react';
import { StudentExam } from '../../types';
import { apiService } from '../../services/api';
import { Button } from '../UI/Button';
import { Input } from '../UI/Input';
import { Modal } from '../UI/Modal';
import { Table } from '../UI/Table';
import { StudentExamForm } from '../Forms/StudentExamForm';

export const StudentExamManagement: React.FC = () => {
  const [studentExams, setStudentExams] = useState<StudentExam[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudentExam, setEditingStudentExam] = useState<StudentExam | null>(null);
const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});
  const fetchStudentExams = async () => {
    setLoading(true);
    try {
      const response = await apiService.getAll('stdExam');
      setStudentExams(response.data || []);
    } catch (error) {
      console.error('Failed to fetch student exams:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentExams();
  }, []);


const handleSave = async (studentExamData: StudentExam) => {
  try {
    setValidationErrors({});
    if (editingStudentExam?.id) {
      await apiService.update("stdExam", editingStudentExam.id, studentExamData);
    } else {
      await apiService.create("stdExam", studentExamData);
    }
    await fetchStudentExams();
    setIsModalOpen(false);
    setEditingStudentExam(null);
  } catch (error: any) {
    console.error("Failed to save student exam:", error);
    if (error.response?.status === 422) {
      setValidationErrors(error.response.data.errors);
    }
  }
};

  const handleDelete = async (studentExam: StudentExam) => {
    if (window.confirm('Are you sure you want to delete this student exam record?')) {
      try {
        await apiService.delete('stdExam', studentExam.id!);
        await fetchStudentExams();
      } catch (error) {
        console.error('Failed to delete student exam:', error);
      }
    }
  };

  const filteredStudentExams = studentExams.filter(record =>
    record.exam_id?.toString().includes(searchTerm) ||
    record.student_id?.toString().includes(searchTerm)
  );

  const columns = [
    { key: 'exam_id', label: 'Exam ID' },
    { key: 'student_id', label: 'Student ID' },
    { 
      key: 'student_mark', 
      label: 'Mark',
      render: (value: number) => (
        <span className="font-semibold text-[#0e4d3c]">{value}</span>
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
              placeholder="Search student exams..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus size={20} className="mr-2" />
          Add Student Exam
        </Button>
      </div>

      <Table
        columns={columns}
        data={filteredStudentExams}
        onEdit={(studentExam) => {
          setEditingStudentExam(studentExam);
          setIsModalOpen(true);
        }}
        onDelete={handleDelete}
        loading={loading}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingStudentExam(null);
        }}
        title={editingStudentExam ? 'Edit Student Exam' : 'Add New Student Exam'}
        size="lg"
      >
        <StudentExamForm
          initialData={editingStudentExam}
          onSave={handleSave}
          onCancel={() => {
            setIsModalOpen(false);
            setEditingStudentExam(null);
          }}
          validationErrors={validationErrors}
        />
      </Modal>
    </div>
  );
};