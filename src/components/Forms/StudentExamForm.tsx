import React, { useState, useEffect } from 'react';
import { StudentExam, Exam, Student } from '../../types';
import { apiService } from '../../services/api';
import { Button } from '../UI/Button';
import { Input } from '../UI/Input';
import { Select } from '../UI/Select';

interface StudentExamFormProps {
  initialData?: StudentExam | null;
  onSave: (data: StudentExam) => void;
  onCancel: () => void;
  validationErrors?: Record<string, string[]>;
}

export const StudentExamForm: React.FC<StudentExamFormProps> = ({
  initialData,
  onSave,
  onCancel,
  validationErrors = {},
}) => {
  const [formData, setFormData] = useState<StudentExam>({
    exam_id: 0,
    student_id: 0,
    student_mark: 0,
  });

  const [exams, setExams] = useState<Exam[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
    fetchExamsAndStudents();
  }, [initialData]);

  const fetchExamsAndStudents = async () => {
    try {
      const [examsResponse, studentsResponse] = await Promise.all([
        apiService.getAll('exams'),
        apiService.getAll('students'),
      ]);
      setExams(examsResponse.data || []);
      setStudents(studentsResponse.data || []);
    } catch (error) {
      console.error('Failed to fetch exams and students:', error);
    }
  };

  const handleChange = (field: keyof StudentExam, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(formData);
    } finally {
      setLoading(false);
    }
  };

  const examOptions = exams.map((exam) => ({
    value: exam.id!,
    label: exam.title,
  }));

  const studentOptions = students.map((student) => ({
    value: student.id!,
    label: student.name,
  }));

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Select
          label="Exam"
          value={formData.exam_id}
          onChange={(e) => handleChange('exam_id', parseInt(e.target.value))}
          options={examOptions}
          error={validationErrors.exam_id?.[0]}
          required
        />

        <Select
          label="Student"
          value={formData.student_id}
          onChange={(e) => handleChange('student_id', parseInt(e.target.value))}
          options={studentOptions}
          error={validationErrors.student_id?.[0]}
          required
        />
      </div>

      <Input
        label="Student Mark"
        type="number"
        value={formData.student_mark}
        onChange={(e) => handleChange('student_mark', parseInt(e.target.value))}
        error={validationErrors.student_mark?.[0]}
        required
      />

      <div className="flex justify-end space-x-3 pt-6 border-t">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          {initialData ? 'Update Student Exam' : 'Create Student Exam'}
        </Button>
      </div>
    </form>
  );
};
