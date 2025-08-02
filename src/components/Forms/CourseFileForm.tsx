import React, { useState, useEffect } from 'react';
import { CourseFile, Course } from '../../types';
import { Button } from '../UI/Button';
import { Input } from '../UI/Input';
import { Select } from '../UI/Select';
import { FileUpload } from '../UI/FileUpload';

interface CourseFileFormProps {
  initialData?: CourseFile | null;
  courses: Course[];
  onSave: (formData: FormData) => void;
  onCancel: () => void;
}

export const CourseFileForm: React.FC<CourseFileFormProps> = ({
  initialData,
  courses,
  onSave,
  onCancel,
}) => {
  const [formData, setFormData] = useState<CourseFile>({
    course_id: 0,
    file_name: '',
    file_path: '',
  });

  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleChange = (field: keyof CourseFile, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('course_id', formData.course_id.toString());
      formDataToSend.append('file_name', formData.file_name);
      
      if (file) {
        formDataToSend.append('file_path', file);
      }

      await onSave(formDataToSend);
    } finally {
      setLoading(false);
    }
  };

  const courseOptions = courses.map(course => ({
    value: course.id!,
    label: course.title
  }));

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Select
          label="Course"
          value={formData.course_id}
          onChange={(e) => handleChange('course_id', parseInt(e.target.value))}
          options={courseOptions}
          required
        />

        <Input
          label="File Name"
          value={formData.file_name}
          onChange={(e) => handleChange('file_name', e.target.value)}
          required
        />
      </div>

      <FileUpload
        label="Course File"
        value={file}
        onChange={setFile}
        helperText="Upload a document file (PDF, DOC, etc.)"
        accept=".pdf,.doc,.docx,.txt,.ppt,.pptx"
        preview={false}
      />

      <div className="flex justify-end space-x-3 pt-6 border-t">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          {initialData ? 'Update Course File' : 'Create Course File'}
        </Button>
      </div>
    </form>
  );
};