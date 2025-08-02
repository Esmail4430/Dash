import React, { useState, useEffect } from "react";
import { Plus, Search } from "lucide-react";
import { Recitation, Course } from "../../types";
import { apiService } from "../../services/api";
import { Button } from "../UI/Button";
import { Input } from "../UI/Input";
import { Select } from "../UI/Select";
import { Modal } from "../UI/Modal";
import { Table } from "../UI/Table";
import { RecitationForm } from "../Forms/RecitationForm";

interface RecitationResponse {
  course_id: string;
  course_title: string;
  recitations_by_lesson: {
    lesson_id: number;
    lesson_title: string;
    lesson_date: string;
    recitations: {
      student_id: number;
      student_name: string;
      recitation_per_page: number[];
      recitation_evaluation: string;
      current_juz: string;
      current_juz_page: string;
      recitation_notes: string;
      homework: number[];
    }[];
  }[];
}

export const RecitationManagement: React.FC = () => {
  const [recitations, setRecitations] = useState<Recitation[]>([]);
  const [tahfeezCourses, setTahfeezCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const [selectedCourseTitle, setSelectedCourseTitle] = useState<string>("");
  const [courseRecitations, setCourseRecitations] = useState<RecitationResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecitation, setEditingRecitation] = useState<Recitation | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});

  const fetchTahfeezCourses = async () => {
    try {
      const response = await apiService.getAll("courses");
      const allCourses = response.courses || [];
      const tahfeezOnly = allCourses.filter((course: Course) => course.type === "TahfeezCourse");
      setTahfeezCourses(tahfeezOnly);
    } catch (error) {
      console.error("Failed to fetch Tahfeez courses:", error);
    }
  };

  const fetchRecitationsByCourse = async (courseId: number) => {
    setLoading(true);
    try {
      const data: RecitationResponse = await apiService.getRecitationsByCourse(courseId);
      setCourseRecitations(data);
      setSelectedCourseTitle(data.course_title);

      const flatRecitations: Recitation[] = [];
      data.recitations_by_lesson.forEach(lesson => {
        lesson.recitations.forEach(recitation => {
          flatRecitations.push({
            id: `${lesson.lesson_id}-${recitation.student_id}`,
            student_id: recitation.student_id,
            course_id: parseInt(data.course_id),
            lesson_id: lesson.lesson_id,
            recitation_per_page: recitation.recitation_per_page,
            recitation_evaluation: recitation.recitation_evaluation,
            current_juz: parseInt(recitation.current_juz.replace('Juz ', '')) || 1,
            current_juz_page: parseInt(recitation.current_juz_page) || 1,
            student_name: recitation.student_name,
            lesson_title: lesson.lesson_title,
            lesson_date: lesson.lesson_date,
            recitation_notes: recitation.recitation_notes,
            homework: recitation.homework
          });
        });
      });
      setRecitations(flatRecitations);
    } catch (error) {
      console.error("Failed to fetch recitations by course:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllRecitations = async () => {
    setLoading(true);
    try {
      const response = await apiService.getAll("recitation");
      setRecitations(response.student_recitation || []);
    } catch (error) {
      console.error("Failed to fetch recitations:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTahfeezCourses();
    fetchAllRecitations();
  }, []);

  const handleCourseChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const courseId = parseInt(e.target.value);
    if (!courseId) {
      setSelectedCourse(null);
      setSelectedCourseTitle("");
      setCourseRecitations(null);
      fetchAllRecitations();
      return;
    }

    setSelectedCourse(courseId);
    await fetchRecitationsByCourse(courseId);
  };

  const handleSave = async (recitationData: Recitation) => {
    try {
      setValidationErrors({});
      if (editingRecitation?.id) {
        await apiService.update("recitation", editingRecitation.id, recitationData);
      } else {
        await apiService.create("recitation", recitationData);
      }

      if (selectedCourse) {
        await fetchRecitationsByCourse(selectedCourse);
      } else {
        await fetchAllRecitations();
      }

      setIsModalOpen(false);
      setEditingRecitation(null);
    } catch (error: any) {
      console.error("Failed to save recitation:", error);
      if (error.response?.status === 422) {
        setValidationErrors(error.response.data.errors);
      }
    }
  };

  const handleDelete = async (recitation: Recitation) => {
    if (window.confirm("Are you sure you want to delete this recitation record?")) {
      try {
        await apiService.delete("recitation", recitation.id!);
        if (selectedCourse) {
          await fetchRecitationsByCourse(selectedCourse);
        } else {
          await fetchAllRecitations();
        }
      } catch (error) {
        console.error("Failed to delete recitation:", error);
      }
    }
  };

  const filteredRecitations = recitations.filter((record) =>
    record.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.lesson_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.recitation_evaluation?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const courseOptions = tahfeezCourses.map(course => ({
    value: course.id!,
    label: course.title
  }));

  const columns = [
    { 
      key: "student_name", 
      label: "Student Name",
      render: (value: string) => (
        <span className="font-medium text-gray-900">{value || "N/A"}</span>
      )
    },
    { 
      key: "lesson_title", 
      label: "Lesson",
      render: (value: string, row: Recitation) => (
        <div>
          <div className="font-medium">{value || "N/A"}</div>
          <div className="text-sm text-gray-500">{row.lesson_date}</div>
        </div>
      )
    },
    { 
      key: "current_juz", 
      label: "Current Juz",
      render: (value: number, row: Recitation) => (
        <span className="text-sm">
          Juz {value}, Page {row.current_juz_page}
        </span>
      )
    },
    {
      key: "recitation_evaluation",
      label: "Evaluation",
      render: (value: string) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            value === "Excellent"
              ? "bg-green-100 text-green-800"
              : value === "Good"
              ? "bg-blue-100 text-blue-800"
              : value === "Fair"
              ? "bg-yellow-100 text-yellow-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {value}
        </span>
      ),
    },
    {
      key: "recitation_per_page",
      label: "Pages Recited",
      render: (value: number[]) => (
        <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded text-xs">
          {value?.length || 0} pages
        </span>
      ),
    },
    {
      key: "homework",
      label: "Homework",
      render: (value: number[]) => (
        <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">
          {value?.length || 0} assignments
        </span>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Select
            label="Select Tahfeez Course"
            value={selectedCourse || ""}
            onChange={handleCourseChange}
            options={courseOptions}
          />
          
          {selectedCourse && (
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <Input
                placeholder="Search recitations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          )}
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus size={16} className="mr-2" />
          Add Recitation
        </Button>
      </div>

      <div className="overflow-x-auto">
        <Table
          data={filteredRecitations}
          columns={columns}
          isLoading={loading}
          onEdit={(recitation) => {
            setEditingRecitation(recitation);
            setIsModalOpen(true);
          }}
          onDelete={handleDelete}
        />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingRecitation(null);
          setValidationErrors({});
        }}
        title={editingRecitation ? "Edit Recitation" : "Add Recitation"}
      >
        <RecitationForm
          recitation={editingRecitation}
          onSave={handleSave}
          onCancel={() => {
            setIsModalOpen(false);
            setEditingRecitation(null);
            setValidationErrors({});
          }}
          validationErrors={validationErrors}
        />
      </Modal>
    </div>
  );
};
