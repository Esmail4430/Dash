import React, { useState, useEffect } from "react";
import { Plus, Search } from "lucide-react";
import { Exam } from "../../types";
import { apiService } from "../../services/api";
import { Button } from "../UI/Button";
import { Input } from "../UI/Input";
import { Modal } from "../UI/Modal";
import { Table } from "../UI/Table";
import { ExamForm } from "../Forms/ExamForm";

export const ExamManagement: React.FC = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string[]>
  >({});

  const fetchExams = async () => {
    setLoading(true);
    try {
      const response = await apiService.getAll("exams");
      setExams(response.exams || []);
    } catch (error) {
      console.error("Failed to fetch exams:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const handleSave = async (examData: Exam) => {
    try {
      if (editingExam?.id) {
        await apiService.update("exams", editingExam.id, examData);
      } else {
        await apiService.create("exams", examData);
      }

      await fetchExams();
      setIsModalOpen(false);
      setEditingExam(null);
      setValidationErrors({});
    } catch (error: any) {
      console.error("Failed to save exam:", error);
      if (error.response?.status === 422) {
        setValidationErrors(error.response.data.errors || {});
      }
    }
  };

  const handleDelete = async (exam: Exam) => {
    if (window.confirm("Are you sure you want to delete this exam?")) {
      try {
        await apiService.delete("exams", exam.id!);
        await fetchExams();
      } catch (error) {
        console.error("Failed to delete exam:", error);
      }
    }
  };

  const filteredExams = exams.filter((exam) =>
    exam.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    { key: "title", label: "Title" },
    { key: "exam_date", label: "Date" },
    { key: "max_mark", label: "Max Mark" },
    { key: "passing_mark", label: "Passing Mark" },
    { key: "course_id", label: "Course ID" },
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
              placeholder="Search exams..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus size={20} className="mr-2" />
          Add Exam
        </Button>
      </div>

      <Table
        columns={columns}
        data={filteredExams}
        onEdit={(exam) => {
          setEditingExam(exam);
          setIsModalOpen(true);
        }}
        onDelete={handleDelete}
        loading={loading}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingExam(null);
        }}
        title={editingExam ? "Edit Exam" : "Add New Exam"}
        size="lg"
      >
        <ExamForm
          initialData={editingExam}
          onSave={handleSave}
          onCancel={() => {
            setIsModalOpen(false);
            setEditingExam(null);
          }}
          validationErrors={validationErrors}
        />
      </Modal>
    </div>
  );
};
