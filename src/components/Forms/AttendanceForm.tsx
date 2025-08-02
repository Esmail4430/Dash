import React, { useState, useEffect } from 'react';
import { Attendance, Lesson, Student } from '../../types';
import { apiService } from '../../services/api';
import { Button } from '../UI/Button';
import { Select } from '../UI/Select';

interface AttendanceFormProps {
  initialData?: Attendance | null;
  onSave: (data: Attendance) => void;
  onCancel: () => void;
}

export const AttendanceForm: React.FC<AttendanceFormProps> = ({ initialData, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Attendance>({
    lesson_id: 0,
    student_id: 0,
    student_attendance: null,
    student_attendance_time: null,
  });
  
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
    fetchLessonsAndStudents();
  }, [initialData]);

  const fetchLessonsAndStudents = async () => {
    try {
      const [lessonsResponse, studentsResponse] = await Promise.all([
        apiService.getAll('lessons'),
        apiService.getAll('students')
      ]);
      setLessons(lessonsResponse.data || []);
      setStudents(studentsResponse.data || []);
    } catch (error) {
      console.error('Failed to fetch lessons and students:', error);
    }
  };

  const handleChange = (field: keyof Attendance, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const dataToSave = {
        ...formData,
        student_attendance_time: formData.student_attendance === 1 ? new Date().toISOString() : null
      };
      await onSave(dataToSave);
    } finally {
      setLoading(false);
    }
  };

  const lessonOptions = lessons.map(lesson => ({
    value: lesson.id!,
    label: lesson.lesson_title
  }));

  const studentOptions = students.map(student => ({
    value: student.id!,
    label: student.name
  }));

  const attendanceOptions = [
    { value: 1, label: 'Present' },
    { value: 0, label: 'Absent' }
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Select
          label="Lesson"
          value={formData.lesson_id}
          onChange={(e) => handleChange('lesson_id', parseInt(e.target.value))}
          options={lessonOptions}
          required
        />
        
        <Select
          label="Student"
          value={formData.student_id}
          onChange={(e) => handleChange('student_id', parseInt(e.target.value))}
          options={studentOptions}
          required
        />
      </div>
      
      <Select
        label="Attendance Status"
        value={formData.student_attendance ?? ''}
        onChange={(e) => handleChange('student_attendance', e.target.value === '' ? null : parseInt(e.target.value))}
        options={attendanceOptions}
      />
      
      <div className="flex justify-end space-x-3 pt-6 border-t">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          {initialData ? 'Update Attendance' : 'Create Attendance'}
        </Button>
      </div>
    </form>
  );
};