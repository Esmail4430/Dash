import React, { useState, useEffect } from "react";
import { Course, Student, Instructor } from "../../types";
import { apiService } from "../../services/api";
import { COURSE_TYPES } from "../../constants";
import { Button } from "../UI/Button";
import { Input } from "../UI/Input";
import { Select } from "../UI/Select";
import { FileUpload } from "../UI/FileUpload";

interface CourseFormProps {
  initialData?: Course | null;
  onSave: (formData: FormData) => void;
  onCancel: () => void;
}

export const CourseForm: React.FC<CourseFormProps> = ({
  initialData,
  onSave,
  onCancel,
}) => {
  const [formData, setFormData] = useState<Course>({
    type: "TahfeezCourse",
    title: "",
    description: "",
    start_date: "",
    expected_end_date: "",
    course_start_time: "",
    level: "",
    file_name:"",
    students: [],
    instructors: [],
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>(""); // 🆕
  const [students, setStudents] = useState<Student[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  useEffect(() => {
    if (initialData) {
      const instructorList = Array.isArray((initialData as any).instructor)
        ? (initialData as any).instructor
        : [];

      setFormData({
        ...initialData,
        instructors: instructorList.map((inst: any) =>
          typeof inst === "object" && inst.id ? inst.id : Number(inst)
        ),
        students: (initialData.students || []).map((stud: any) =>
          typeof stud === "object" && stud.id ? stud.id : Number(stud)
        ),
      });
    }

    fetchStudentsAndInstructors();
  }, [initialData]);

  // useEffect(() => {
  //   if (pdfFile?.name) {
  //     setFileName(pdfFile.name);
  //   }
  // }, [pdfFile]);

  const fetchStudentsAndInstructors = async () => {
    try {
      const [studentsResponse, instructorsResponse] = await Promise.all([
        apiService.getAll("students"),
        apiService.getAll("instructors"),
      ]);

      setStudents(
        studentsResponse.data?.students ||
          studentsResponse.students ||
          studentsResponse ||
          []
      );
      setInstructors(
        instructorsResponse.data?.instructors ||
          instructorsResponse.instructors ||
          instructorsResponse ||
          []
      );
    } catch (error) {
      console.error("❌ Failed to fetch students and instructors:", error);
    }
  };

  const handleChange = (field: keyof Course, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleSelection = (type: "students" | "instructors", id: number) => {
    const currentSelection = formData[type] as number[];
    const newSelection = currentSelection.includes(id)
      ? currentSelection.filter((selectedId) => selectedId !== id)
      : [...currentSelection, id];

    handleChange(type, newSelection);
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setErrors({});

  try {
    const formDataToSend = new FormData();
    formDataToSend.append("type", formData.type);
    formDataToSend.append("title", formData.title);
    formDataToSend.append("description", formData.description);
    formDataToSend.append("start_date", formData.start_date);
    formDataToSend.append("expected_end_date", formData.expected_end_date);
    formDataToSend.append("course_start_time", formData.course_start_time);
    formDataToSend.append("level", formData.level);

    // إضافة اسم الملف كحقل منفصل
    formDataToSend.append("file_name", fileName.trim());

    if (imageFile) {
      formDataToSend.append("image", imageFile);
    }

    if (pdfFile) {
      formDataToSend.append("file_path", pdfFile);
    }

    formData.students.forEach((id) =>
      formDataToSend.append("course_student_id[]", id.toString())
    );
    formData.instructors.forEach((id) =>
      formDataToSend.append("course_instructor_id[]", id.toString())
    );

    await onSave(formDataToSend);
  } catch (validationErrors: any) {
    if (validationErrors && typeof validationErrors === "object") {
      setErrors(validationErrors);
    }
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="px-8 py-6 border-b border-gray-100">
        <h3 className="text-xl font-semibold text-gray-900">
          {initialData ? 'Edit Course' : 'Create New Course'}
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          {initialData ? 'Update the course details below' : 'Fill in the details to create a new course'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-8">
        {/* Basic Information */}
        <div className="space-y-6">
          <h4 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
            Basic Information
          </h4>
          
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Course Type */}
        <div>
          <Select
            label="Course Type"
            value={formData.type}
            onChange={(e) =>
              handleChange("type", e.target.value as "TahfeezCourse" | "Other")
            }
            options={COURSE_TYPES}
            required
          />
          {errors.type && (
            <p className="text-red-600 text-sm mt-1">{errors.type[0]}</p>
          )}
        </div>

        {/* Course Title */}
        <div>
          <Input
            label="Course Title"
            value={formData.title}
            onChange={(e) => handleChange("title", e.target.value)}
            required
          />
          {errors.title && (
            <p className="text-red-600 text-sm mt-1">{errors.title[0]}</p>
          )}
        </div>

        {/* Level */}
        <div>
          <Input
            label="Level"
            value={formData.level}
            onChange={(e) => handleChange("level", e.target.value)}
            required
          />
          {errors.level && (
            <p className="text-red-600 text-sm mt-1">{errors.level[0]}</p>
          )}
        </div>

        {/* Start Time */}
        <div>
          <Input
            label="Course Start Time"
            type="time"
            value={formData.course_start_time}
            onChange={(e) => handleChange("course_start_time", e.target.value)}
            required
          />
          {errors.course_start_time && (
            <p className="text-red-600 text-sm mt-1">
              {errors.course_start_time[0]}
            </p>
          )}
        </div>

        {/* Start Date */}
        <div>
          <Input
            label="Start Date"
            type="date"
            value={formData.start_date}
            onChange={(e) => handleChange("start_date", e.target.value)}
            required
          />
          {errors.start_date && (
            <p className="text-red-600 text-sm mt-1">{errors.start_date[0]}</p>
          )}
        </div>

        {/* End Date */}
        <div>
          <Input
            label="Expected End Date"
            type="date"
            value={formData.expected_end_date}
            onChange={(e) => handleChange("expected_end_date", e.target.value)}
            required
          />
          {errors.expected_end_date && (
            <p className="text-red-600 text-sm mt-1">
              {errors.expected_end_date[0]}
            </p>
          )}
        </div>
      </div>
          </div>
        </div>
        </div>

        {/* Schedule & Duration */}
        <div className="space-y-6">
          <h4 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
            Schedule & Duration
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Description */}
        <div className="space-y-6">
          <h4 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
            Course Details
          </h4>
          
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => handleChange("description", e.target.value)}
          rows={4}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0e4d3c] focus:border-transparent transition-all duration-200 resize-none"
          placeholder="Provide a detailed description of the course content, objectives, and expectations..."
          required
        />
        {errors.description && (
          <p className="text-red-600 text-sm mt-1">{errors.description[0]}</p>
        )}
      </div>
        </div>

        {/* Media & Files */}
        <div className="space-y-6">
          <h4 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
            Media & Files
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Image */}
      <div>
        <FileUpload
          label="Course Image"
          value={imageFile}
          onChange={setImageFile}
          helperText="Upload an image for the course"
          accept="image/*"
        />
        {errors.image && (
          <p className="text-red-600 text-sm mt-1">{errors.image[0]}</p>
        )}
      </div>

      {/* PDF */}
      <div>
        <FileUpload
          label="Course File (PDF)"
          value={pdfFile}
          onChange={setPdfFile}
          helperText="Upload a file for the course (PDF)"
          accept=".pdf"
        />
        {errors.file_path && (
          <p className="text-red-600 text-sm mt-1">{errors.file_path[0]}</p>
        )}
      </div>

      {/* File Name input */}
      <div>
        <Input
          label="File Name"
          value={fileName}
          onChange={(e) => setFileName(e.target.value)}
          placeholder="example.pdf"
          required
        />
        {errors.file_name && (
          <p className="text-red-600 text-sm mt-1">{errors.file_name[0]}</p>
        )}
      </div>
          </div>
        </div>

        {/* Participants */}
        <div className="space-y-6">
          <h4 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
            Course Participants
          </h4>
          
      {/* Instructors */}
      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-4">
          Select Instructors
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-4 bg-gray-50">
          {instructors.map((instructor) => (
            <div
              key={instructor.id}
              className={`p-3 border rounded-lg cursor-pointer transition-all ${
                formData.instructors.includes(instructor.id!)
                  ? "border-[#0e4d3c] bg-green-50 shadow-md"
                  : "border-gray-200 hover:border-gray-300 bg-white hover:shadow-sm"
              }`}
              onClick={() => toggleSelection("instructors", instructor.id!)}
            >
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={formData.instructors.includes(instructor.id!)}
                  onChange={() => {}}
                  className="text-[#0e4d3c] focus:ring-[#0e4d3c]"
                />
                {instructor.image && (
                  <img
                    src={instructor.image}
                    alt={instructor.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                )}
                <span className="text-sm font-medium">{instructor.name}</span>
              </div>
            </div>
          ))}
        </div>
        {errors.course_instructor_id && (
          <p className="text-red-600 text-sm mt-2">
            {errors.course_instructor_id[0]}
          </p>
        )}
      </div>

      {/* Students */}
      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-4">
          Select Students
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-4 bg-gray-50">
          {students.map((student) => (
            <div
              key={student.id}
              className={`p-3 border rounded-lg cursor-pointer transition-all ${
                formData.students.includes(student.id!)
                  ? "border-[#0e4d3c] bg-green-50 shadow-md"
                  : "border-gray-200 hover:border-gray-300 bg-white hover:shadow-sm"
              }`}
              onClick={() => toggleSelection("students", student.id!)}
            >
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={formData.students.includes(student.id!)}
                  onChange={() => {}}
                  className="text-[#0e4d3c] focus:ring-[#0e4d3c]"
                />
                {student.image && (
                  <img
                    src={student.image}
                    alt={student.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                )}
                <span className="text-sm font-medium">{student.name}</span>
              </div>
            </div>
          ))}
        </div>
        {errors.course_student_id && (
          <p className="text-red-600 text-sm mt-2">
            {errors.course_student_id[0]}
          </p>
        )}
      </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={loading} size="lg">
          {initialData ? "Update Course" : "Create Course"}
        </Button>
      </div>
      </form>
    </div>
  );
};
