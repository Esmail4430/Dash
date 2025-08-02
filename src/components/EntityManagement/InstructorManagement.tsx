import React, { useState, useEffect } from "react";
import { Plus, Search } from "lucide-react";
import { Instructor } from "../../types";
import { apiService } from "../../services/api";
import { Button } from "../UI/Button";
import { Input } from "../UI/Input";
import { Modal } from "../UI/Modal";
import { Table } from "../UI/Table";
import { InstructorForm } from "../Forms/InstructorForm";

export const InstructorManagement: React.FC = () => {
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInstructor, setEditingInstructor] = useState<Instructor | null>(
    null
  );
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string[]>
  >({});

  const fetchInstructors = async () => {
    setLoading(true);
    try {
      const response = await apiService.getAll("instructors");
      console.log("✅ instructors response:", response);
      setInstructors(response?.instructors ?? []);
    } catch (error) {
      console.error("Failed to fetch instructors:", error);
      setInstructors([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstructors();
  }, []);

  const handleSave = async (instructorData: FormData) => {
    try {
      setValidationErrors({});
      if (editingInstructor?.id) {
        await apiService.update(
          "instructors",
          editingInstructor.id,
          instructorData,
          true // true عشان يضيف هيدر FormData
        );
      } else {
        await apiService.create("instructors", instructorData, true); // نفس الشيء
      }
      await fetchInstructors();
      setIsModalOpen(false);
      setEditingInstructor(null);
    } catch (error: any) {
      console.error("Failed to save instructor:", error);
      if (error.response?.status === 422) {
        setValidationErrors(error.response.data.errors);
      }
    }
  };

  const handleDelete = async (instructor: Instructor) => {
    if (window.confirm("Are you sure you want to delete this instructor?")) {
      try {
        await apiService.delete("instructors", instructor.id!);
        await fetchInstructors();
      } catch (error) {
        console.error("Failed to delete instructor:", error);
      }
    }
  };

  // حماية من null/undefined في الفلترة:
  const filteredInstructors = (instructors ?? []).filter(
    (instructor) =>
      (instructor.name ?? "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (instructor.email ?? "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      key: "name",
      label: "Name",
      render: (value: string, row: Instructor) => (
        <div className="flex items-center space-x-3">
          {row.instructor_img ? (
            <img
              src={row.instructor_img}
              alt={value || "Instructor"}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gray-200" /> // بديل لو ما في صورة
          )}
          <span className="font-medium">{value || "-"}</span>
        </div>
      ),
    },
    { key: "email", label: "Email" },
    { key: "phone_number", label: "Phone" },
    {
      key: "religious_qualifications",
      label: "Qualifications",
      render: (value: string[] | undefined) => {
        const quals = value ?? [];
        return (
          <div className="flex flex-wrap gap-1">
            {quals.slice(0, 2).map((qual, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-[#C6953E] bg-opacity-10 text-[#C6953E] rounded text-xs"
              >
                {qual}
              </span>
            ))}
            {quals.length > 2 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                +{quals.length - 2} more
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: "quran_memorized_parts",
      label: "Memorized Parts",
      render: (value: number[] | undefined) => {
        const parts = value ?? [];
        return (
          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
            {parts.length} parts
          </span>
        );
      },
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
              placeholder="Search instructors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus size={20} className="mr-2" />
          Add Instructor
        </Button>
      </div>

      <Table
        columns={columns}
        data={filteredInstructors}
        onEdit={(instructor) => {
          setEditingInstructor(instructor);
          setIsModalOpen(true);
        }}
        onDelete={handleDelete}
        loading={loading}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingInstructor(null);
        }}
        title={editingInstructor ? "Edit Instructor" : "Add New Instructor"}
        size="lg"
      >
        <InstructorForm
          initialData={editingInstructor}
          onSave={handleSave}
          onCancel={() => {
            setIsModalOpen(false);
            setEditingInstructor(null);
          }}
          validationErrors={validationErrors}
        />
      </Modal>
    </div>
  );
};
