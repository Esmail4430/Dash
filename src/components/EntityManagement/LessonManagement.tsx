import React, { useState, useEffect } from "react";
import { Plus, Search } from "lucide-react";
import { Lesson, Course, Instructor } from "../../types";
import { apiService } from "../../services/api";
import { Button } from "../UI/Button";
import { Input } from "../UI/Input";
import { Modal } from "../UI/Modal";
import { Table } from "../UI/Table";
import { LessonForm } from "../Forms/LessonForm";

export const LessonManagement: React.FC = () => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string[]>
  >({});

  const fetchCourses = async () => {
    try {
      const response = await apiService.getAll("courses");
      setCourses(response.data || response || []);
    } catch (error) {
      console.error("Failed to fetch courses:", error);
    }
  };

  const fetchLessons = async () => {
    setLoading(true);
    try {
      const response = await apiService.getAll("lessons");
      console.log("✅ lessons response:", response);

      setLessons(response.lessons || response || []);
    } catch (error) {
      console.error("Failed to fetch lessons:", error);
    } finally {    
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
    fetchLessons();
  }, []);

  // الدالة لتحويل Lesson إلى FormData لإرسالها بنفس أسلوب StudentManagement
const createFormDataFromLesson = (lesson: Lesson): FormData => {
  const formData = new FormData();
  formData.append("lesson_title", lesson.lesson_title);
  formData.append("lesson_date", lesson.lesson_date);
  formData.append(
    "instructor_id",
    lesson.instructor_id !== undefined && lesson.instructor_id !== null
      ? lesson.instructor_id.toString()
      : ""
  );

  if (Array.isArray(lesson.course_id)) {
    lesson.course_id.forEach((courseId) => {
      formData.append("course_id[]", courseId.toString());
    });
  }

  return formData;
};


  const handleSave = async (lessonData: Lesson) => {
    try {
      setValidationErrors({});
      const formData = createFormDataFromLesson(lessonData);

      if (editingLesson?.id) {
        await apiService.update("lessons", editingLesson.id, formData, true);
        // true لإضافة هيدر FormData تلقائيًا
      } else {
        await apiService.create("lessons", formData, true);
      }

      await fetchLessons();
      setIsModalOpen(false);
      setEditingLesson(null);
    } catch (error: any) {
      console.error("Failed to save lesson:", error);
      if (error.response?.status === 422) {
        setValidationErrors(error.response.data.errors);
      }
    }
  };

  const handleDelete = async (lesson: Lesson) => {
    if (window.confirm("Are you sure you want to delete this lesson?")) {
      try {
        await apiService.delete("lessons", lesson.id!);
        await fetchLessons();
      } catch (error) {
        console.error("Failed to delete lesson:", error);
      }
    }
  };

  const filteredLessons = lessons.filter((lesson) =>
    lesson.lesson_title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      key: "lesson_title",
      label: "Lesson Title",
      render: (_: any, row: Lesson) => (
        <span className="text-sm text-gray-800">{row.lesson_title}</span>
      ),
    },
    {
      key: "lesson_date",
      label: "Date",
    },
    {
      key: "instructors",
      label: "Instructor",
      render: (_: any, row: Lesson) => (
        <span className="text-sm text-gray-700">
          {row.instructors?.name || "—"}
        </span>
      ),
    },
    {
      key: "courses",
      label: "Courses",
      render: (_: any, row: Lesson) => (
        <div className="flex flex-col gap-1">
          {row.courses?.length > 0 ? (
            row.courses.map((course, index) => (
              <span key={index} className="text-sm text-gray-700">
                {course.title}
              </span>
            ))
          ) : (
            <span className="text-gray-400">—</span>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <Input
              placeholder="Search lessons..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus size={20} className="mr-2" />
          Add Lesson
        </Button>
      </div>

      <Table
        columns={columns}
        data={filteredLessons}
        onEdit={(lesson) => {
          setEditingLesson(lesson);
          setIsModalOpen(true);
        }}
        onDelete={handleDelete}
        loading={loading}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingLesson(null);
        }}
        title={editingLesson ? "Edit Lesson" : "Add New Lesson"}
        size="lg"
      >
        <LessonForm
          initialData={editingLesson}
          onSave={handleSave}
          onCancel={() => {
            setIsModalOpen(false);
            setEditingLesson(null);
          }}
          validationErrors={validationErrors}
        />
      </Modal>
    </div>
  );
};
