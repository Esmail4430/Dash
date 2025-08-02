import React, { useState, useEffect } from "react";
import { Lesson, Course, Instructor } from "../../types";
import { apiService } from "../../services/api";
import { Button } from "../UI/Button";
import { Input } from "../UI/Input";
import { Select } from "../UI/Select";
import { MultiSelect } from "../UI/MultiSelect";

interface LessonFormProps {
  initialData?: Lesson | null;
  onSave: (data: Lesson) => void; // ✅ تم التعديل هون
  onCancel: () => void;
  validationErrors?: Record<string, string[]>;
}


export const LessonForm: React.FC<LessonFormProps> = ({
  initialData = null,
  onSave,
  onCancel,
  validationErrors = {},
}) => {
  const [formData, setFormData] = useState<Lesson>({
    lesson_title: "",
    lesson_date: "",
    instructor_id: 0,
    course_id: [],
  });

  const [courses, setCourses] = useState<Course[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [loading, setLoading] = useState(false);

  // عند تغيير initialData فقط، نحدث formData
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      // لو جديد، نفرغ البيانات
      setFormData({
        lesson_title: "",
        lesson_date: "",
        instructor_id: 0,
        course_id: [],
      });
    }
  }, [initialData]);

  useEffect(() => {
    const fetchCoursesAndInstructors = async () => {
      try {
        const [coursesResponse, instructorsResponse] = await Promise.all([
          apiService.getAll("courses"),
          apiService.getAll("instructors"),
        ]);

        setCourses(coursesResponse.courses || []);
        setInstructors(instructorsResponse.instructors || []);
      } catch (error) {
        console.error("Failed to fetch courses and instructors:", error);
      }
    };
    fetchCoursesAndInstructors();
  }, []);

  const handleChange = (field: keyof Lesson, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  try {
    console.log("Sending Lesson data to onSave:");
    console.log(formData); // راقب شو عم تبعت
    await onSave(formData); // أرسل lessonData وليس FormData
  } finally {
    setLoading(false);
  }
};


  const instructorOptions = Array.isArray(instructors)
    ? instructors.map((instructor) => ({
        value: instructor.id!,
        label: instructor.name,
      }))
    : [];

  const courseOptions = Array.isArray(courses)
    ? courses.map((course) => ({
        value: course.id!,
        label: course.title,
      }))
    : [];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Lesson Title"
          value={formData.lesson_title}
          onChange={(e) => handleChange("lesson_title", e.target.value)}
          error={validationErrors.lesson_title?.[0]}
          required
        />

        <Input
          label="Lesson Date"
          type="date"
          value={formData.lesson_date}
          onChange={(e) => handleChange("lesson_date", e.target.value)}
          error={validationErrors.lesson_date?.[0]}
          required
        />
      </div>

      <Select
        label="Instructor"
        value={formData.instructor_id}
        onChange={(e) =>
          handleChange("instructor_id", parseInt(e.target.value))
        }
        options={instructorOptions}
        error={validationErrors.instructor_id?.[0]}
        required
      />

      <MultiSelect
        label="Courses"
        options={courseOptions}
        value={formData.course_id}
        onChange={(value) => handleChange("course_id", value)}
        placeholder="Select courses"
        error={validationErrors.course_id?.[0]}
      />

      {(courses ?? []).length > 0 && (formData.course_id ?? []).length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {(courses ?? [])
            .filter((course) => formData.course_id.includes(course.id!))
            .map((course) => (
              <span
                key={course.id}
                className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs"
              >
                {course.title}
              </span>
            ))}
        </div>
      )}

      <div className="flex justify-end space-x-3 pt-6 border-t">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          {initialData ? "Update Lesson" : "Create Lesson"}
        </Button>
      </div>
    </form>
  );
};
