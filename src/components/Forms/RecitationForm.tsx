import React, { useState, useEffect } from 'react';
import { Recitation, Course, Lesson, Student } from '../../types';
import { apiService } from '../../services/api';
import { Button } from '../UI/Button';
import { Input } from '../UI/Input';
import { Select } from '../UI/Select';
import { MultiSelect } from '../UI/MultiSelect';

interface RecitationFormProps {
  recitation?: Recitation | null;
  onSave: (data: Recitation) => void;
  onCancel: () => void;
  validationErrors?: Record<string, string[]>;
}

export const RecitationForm: React.FC<RecitationFormProps> = ({
  recitation,
  onSave,
  onCancel,
  validationErrors = {},
}) => {
  const [formData, setFormData] = useState<Recitation>({
    student_id: 0,
    course_id: 0,
    lesson_id: 0,
    recitation_per_page: [],
    recitation_evaluation: '',
    current_juz: 1,
    current_juz_page: 1,
    recitation_notes: '',
    homework: [],
  });

  const [courses, setCourses] = useState<Course[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    if (recitation) {
      setFormData({
        ...recitation,
        recitation_per_page: recitation.recitation_per_page || [],
        recitation_notes: recitation.recitation_notes || '',
        homework: recitation.homework || [],
      });
      setIsEditMode(true);
    } else {
      setIsEditMode(false);
      setFormData({
        student_id: 0,
        course_id: 0,
        lesson_id: 0,
        recitation_per_page: [],
        recitation_evaluation: '',
        current_juz: 1,
        current_juz_page: 1,
        recitation_notes: '',
        homework: [],
      });
    }
    fetchData();
  }, [recitation]);

  const fetchData = async () => {
    try {
      const [coursesResponse, lessonsResponse, studentsResponse] = await Promise.all([
        apiService.getAll('courses'),
        apiService.getAll('lessons'),
        apiService.getAll('students'),
      ]);
      setCourses(coursesResponse.courses || coursesResponse.data || []);
      setLessons(lessonsResponse.lessons || lessonsResponse.data || []);
      setStudents(studentsResponse.students || studentsResponse.data || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  const handleChange = (field: keyof Recitation, value: any) => {
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

  const courseOptions = courses.map((course) => ({
    value: course.id!,
    label: course.title,
  }));

  const lessonOptions = lessons.map((lesson) => ({
    value: lesson.id!,
    label: lesson.lesson_title,
  }));

  const studentOptions = students.map((student) => ({
    value: student.id!,
    label: student.name,
  }));

  const evaluationOptions = [
    { value: 'Excellent', label: 'Excellent' },
    { value: 'Good', label: 'Good' },
    { value: 'Fair', label: 'Fair' },
    { value: 'Poor', label: 'Poor' },
    { value: 'So Bad', label: 'So Bad' },
  ];

  const recitationPageOptions = Array.from({ length: 20 }, (_, i) => ({
    value: (i + 1).toString(),
    label: `Page ${i + 1}`,
  }));

  const homeworkOptions = Array.from({ length: 20 }, (_, i) => ({
    value: (i + 1).toString(),
    label: `Assignment ${i + 1}`,
  }));

  const selectedStudent = students.find(s => s.id === formData.student_id);
  const selectedCourse = courses.find(c => c.id === formData.course_id);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="px-8 py-6 border-b border-gray-100">
        <h3 className="text-xl font-semibold text-gray-900">
          {isEditMode ? 'Edit Recitation Record' : 'Add New Recitation'}
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          {isEditMode ? 'Update the recitation details below' : 'Fill in the details to create a new recitation record'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-8">
        {/* Student and Course Selection */}
        <div className="space-y-6">
          <h4 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
            Student & Course Information
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {isEditMode ? (
              <>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Student</label>
                  <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <div className="flex items-center space-x-3">
                      {selectedStudent?.student_img && (
                        <img
                          src={selectedStudent.student_img}
                          alt={selectedStudent.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      )}
                      <div>
                        <p className="font-medium text-gray-900">{selectedStudent?.name || "N/A"}</p>
                        <p className="text-sm text-gray-500">{selectedStudent?.email}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Course</label>
                  <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <div>
                      <p className="font-medium text-gray-900">{selectedCourse?.title || "N/A"}</p>
                      <p className="text-sm text-gray-500">{selectedCourse?.type}</p>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Select
                  label="Course"
                  value={formData.course_id}
                  onChange={(e) => handleChange('course_id', parseInt(e.target.value))}
                  options={courseOptions}
                  error={validationErrors.course_id?.[0]}
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
              </>
            )}
          </div>
        </div>

        {/* Lesson Selection */}
        <div className="space-y-6">
          <h4 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
            Session Details
          </h4>
          
          <Select
            label="Lesson"
            value={formData.lesson_id}
            onChange={(e) => handleChange('lesson_id', parseInt(e.target.value))}
            options={lessonOptions}
            error={validationErrors.lesson_id?.[0]}
            required
          />
        </div>

        {/* Recitation Progress */}
        <div className="space-y-6">
          <h4 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
            Recitation Progress
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Current Juz"
              type="number"
              min="1"
              max="30"
              value={formData.current_juz}
              onChange={(e) => handleChange('current_juz', parseInt(e.target.value))}
              error={validationErrors.current_juz?.[0]}
              required
            />

            <Input
              label="Current Juz Page"
              type="number"
              min="1"
              max="20"
              value={formData.current_juz_page}
              onChange={(e) => handleChange('current_juz_page', parseInt(e.target.value))}
              error={validationErrors.current_juz_page?.[0]}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <MultiSelect
              label="Recitation Per Page"
              options={recitationPageOptions}
              value={formData.recitation_per_page.map((p) => p.toString())}
              onChange={(selected) => {
                const pages = selected.map((p) => parseInt(p));
                handleChange('recitation_per_page', pages);
              }}
              error={validationErrors.recitation_per_page?.[0]}
            />

            <MultiSelect
              label="Homework"
              options={homeworkOptions}
              value={(formData.homework || []).map((h) => h.toString())}
              onChange={(selected) => {
                const homework = selected.map((h) => parseInt(h));
                handleChange('homework', homework);
              }}
              error={validationErrors.homework?.[0]}
            />
          </div>
        </div>

        {/* Evaluation */}
        <div className="space-y-6">
          <h4 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
            Evaluation & Notes
          </h4>
          
          <Select
            label="Evaluation"
            value={formData.recitation_evaluation}
            onChange={(e) => handleChange('recitation_evaluation', e.target.value)}
            options={evaluationOptions}
            error={validationErrors.recitation_evaluation?.[0]}
            required
          />

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Recitation Notes
            </label>
            <textarea
              value={formData.recitation_notes || ''}
              onChange={(e) => handleChange('recitation_notes', e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0e4d3c] focus:border-transparent transition-all duration-200 resize-none"
              placeholder="Add any notes about the recitation performance, areas for improvement, or other observations..."
            />
            {validationErrors.recitation_notes && (
              <p className="text-red-600 text-sm mt-1">{validationErrors.recitation_notes[0]}</p>
            )}
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
          <Button type="button" variant="secondary" onClick={onCancel} size="lg">
            Cancel
          </Button>
          <Button type="submit" loading={loading} size="lg">
            {isEditMode ? 'Update Recitation' : 'Create Recitation'}
          </Button>
        </div>
      </form>
    </div>
  );
};