import React, { useState, useEffect } from 'react';
import { Instructor } from '../../types';
import { RELIGIOUS_QUALIFICATIONS, QURAN_PARTS } from '../../constants';
import { Button } from '../UI/Button';
import { Input } from '../UI/Input';
import { MultiSelect } from '../UI/MultiSelect';
import { FileUpload } from '../UI/FileUpload';

interface InstructorFormProps {
  initialData?: Instructor | null;
  onSave: (data: FormData) => void;  // استقبل FormData بدل object عادي
  onCancel: () => void;
  validationErrors?: Record<string, string[]>;
}

export const InstructorForm: React.FC<InstructorFormProps> = ({
  initialData,
  onSave,
  onCancel,
  validationErrors = {},
}) => {
  const [formData, setFormData] = useState<Instructor>({
    name: '',
    email: '',
    password: '',
    certificate: '',
    instructor_img: '',
    birth_date: '',
    phone_number: '',
    address: '',
    quran_memorized_parts: [],
    quran_passed_parts: [],
    religious_qualifications: [],
    password_confirmation: '',
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  // حالة للتحكم بعرض/إخفاء كلمة السر
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        password_confirmation: '',
        quran_memorized_parts: initialData.quran_memorized_parts || [],
        quran_passed_parts: initialData.quran_passed_parts || [],
      });
    }
  }, [initialData]);

  const handleChange = (field: keyof Instructor, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password && formData.password !== formData.password_confirmation) {
      alert('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const form = new FormData();
      form.append('name', formData.name);
      form.append('email', formData.email);
      form.append('password', formData.password);
      form.append('password_confirmation', formData.password_confirmation);
      form.append('certificate', formData.certificate || '');
      form.append('birth_date', formData.birth_date);
      form.append('phone_number', formData.phone_number);
      form.append('address', formData.address);

      // إرسال المصفوفات بشكل منفصل وليس كـ JSON string
      formData.religious_qualifications.forEach(q => form.append('religious_qualifications[]', q));
      formData.quran_memorized_parts.forEach(p => form.append('quran_memorized_parts[]', p));
      formData.quran_passed_parts.forEach(p => form.append('quran_passed_parts[]', p));

      if (imageFile) {
        form.append('instructor_img', imageFile);
      }

      await onSave(form);
    } finally {
      setLoading(false);
    }
  };

  const religiousQualificationOptions = RELIGIOUS_QUALIFICATIONS.map(qual => ({
    value: qual,
    label: qual,
  }));

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="px-8 py-6 border-b border-gray-100">
        <h3 className="text-xl font-semibold text-gray-900">
          {initialData ? 'Edit Instructor' : 'Add New Instructor'}
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          {initialData ? 'Update the instructor details below' : 'Fill in the details to register a new instructor'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-8">
        {/* Personal Information */}
        <div className="space-y-6">
          <h4 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
            Personal Information
          </h4>
          
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Full Name"
          value={formData.name}
          onChange={e => handleChange('name', e.target.value)}
          required
          error={validationErrors.name?.[0]}
        />

        <Input
          label="Email"
          type="email"
          value={formData.email}
          onChange={e => handleChange('email', e.target.value)}
          required
          error={validationErrors.email?.[0]}
        />

        <div className="relative">
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={e => handleChange('password', e.target.value)}
            required={!initialData}
            error={validationErrors.password?.[0]}
          />
          <button
            type="button"
            onClick={() => setShowPassword(prev => !prev)}
            className="absolute top-9 right-3 text-sm text-gray-600"
            tabIndex={-1}
          >
            {showPassword ? 'Hide' : 'Show'}
          </button>
        </div>

        <div className="relative">
          <Input
            label="Confirm Password"
            type={showConfirmPassword ? 'text' : 'password'}
            value={formData.password_confirmation}
            onChange={e => handleChange('password_confirmation', e.target.value)}
            required={!initialData}
            error={validationErrors.password_confirmation?.[0]}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(prev => !prev)}
            className="absolute top-9 right-3 text-sm text-gray-600"
            tabIndex={-1}
          >
            {showConfirmPassword ? 'Hide' : 'Show'}
          </button>
        </div>

        <Input
          label="Phone Number"
          value={formData.phone_number}
          onChange={e => handleChange('phone_number', e.target.value)}
          required
          error={validationErrors.phone_number?.[0]}
        />

        <Input
          label="Birth Date"
          type="date"
          value={formData.birth_date}
          onChange={e => handleChange('birth_date', e.target.value)}
          required
          error={validationErrors.birth_date?.[0]}
        />

        <Input
          label="Certificate"
          value={formData.certificate}
          onChange={e => handleChange('certificate', e.target.value)}
          error={validationErrors.certificate?.[0]}
        />
      </div>
        </div>

        {/* Contact Information */}
        <div className="space-y-6">
          <h4 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
            Contact & Address
          </h4>
          
      <Input
        label="Address"
        value={formData.address}
        onChange={e => handleChange('address', e.target.value)}
        required
        error={validationErrors.address?.[0]}
      />
        </div>

        {/* Qualifications */}
        <div className="space-y-6">
          <h4 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
            Qualifications & Expertise
          </h4>
          
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FileUpload
          label="Profile Image"
          value={imageFile}
          onChange={setImageFile}
          helperText="Upload a profile image"
          error={validationErrors.instructor_img?.[0]}
        />

        <MultiSelect
          label="Religious Qualifications"
          options={religiousQualificationOptions}
          value={formData.religious_qualifications}
          onChange={value => handleChange('religious_qualifications', value)}
          placeholder="Select qualifications"
          error={validationErrors.religious_qualifications?.[0]}
        />
      </div>
        </div>

        {/* Quran Knowledge */}
        <div className="space-y-6">
          <h4 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
            Quran Knowledge & Certification
          </h4>
          
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <MultiSelect
          label="Quran Memorized Parts"
          options={QURAN_PARTS}
          value={formData.quran_memorized_parts}
          onChange={value => handleChange('quran_memorized_parts', value)}
          placeholder="Select memorized parts"
          error={validationErrors.quran_memorized_parts?.[0]}
        />

        <MultiSelect
          label="Quran Passed Parts"
          options={QURAN_PARTS}
          value={formData.quran_passed_parts}
          onChange={value => handleChange('quran_passed_parts', value)}
          placeholder="Select passed parts"
          error={validationErrors.quran_passed_parts?.[0]}
        />
      </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={loading} size="lg">
          {initialData ? 'Update Instructor' : 'Create Instructor'}
        </Button>
      </div>
      </form>
    </div>
  );
};
