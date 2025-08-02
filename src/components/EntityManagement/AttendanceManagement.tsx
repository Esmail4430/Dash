import React, { useState, useEffect } from "react";
import { Search, QrCode, CheckCircle, AlertTriangle } from "lucide-react";
import axios from "axios";
import { Attendance, Lesson, Student } from "../../types";
import { apiService } from "../../services/api";
import { Button } from "../UI/Button";
import { Input } from "../UI/Input";
import { Modal } from "../UI/Modal";
import { Table } from "../UI/Table";
import { Select } from "../UI/Select";
import { QRScanner } from "../UI/QRScanner";
import { BASE_URL } from "../../constants";

export const AttendanceManagement: React.FC = () => {
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [lessonsWithoutAttendance, setLessonsWithoutAttendance] = useState<Lesson[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLesson, setSelectedLesson] = useState<number | null>(null);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [currentStudentId, setCurrentStudentId] = useState<number | null>(null);
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [sessionMessage, setSessionMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [lessonsResponse, studentsResponse] = await Promise.all([
        apiService.getAll("lessons"),
        apiService.getAll("students"),
      ]);
      const allLessons = lessonsResponse.lessons || [];
      setLessons(allLessons);
      setStudents(studentsResponse.students || []);
      
      // Filter lessons without attendance
      await filterLessonsWithoutAttendance(allLessons);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      setErrorMessage("Failed to fetch data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const filterLessonsWithoutAttendance = async (allLessons: Lesson[]) => {
    try {
      const lessonsWithoutAttendance: Lesson[] = [];
      
      for (const lesson of allLessons) {
        try {
          const attendanceData = await apiService.getById("atten", lesson.id!);
          // If no attendance records exist for this lesson, add it to the list
          if (!attendanceData.attendances || attendanceData.attendances.length === 0) {
            lessonsWithoutAttendance.push(lesson);
          }
        } catch (error) {
          // If there's an error fetching attendance (likely means no records exist), include the lesson
          lessonsWithoutAttendance.push(lesson);
        }
      }
      
      setLessonsWithoutAttendance(lessonsWithoutAttendance);
    } catch (error) {
      console.error("Failed to filter lessons:", error);
      // If filtering fails, show all lessons
      setLessonsWithoutAttendance(allLessons);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchAttendanceByLesson = async (lessonId: number) => {
    try {
      const data = await apiService.getById("atten", lessonId);
      if (data && Array.isArray(data.attendances)) {
        return data.attendances;
      }
      return [];
    } catch (error) {
      console.error("❌ Failed to fetch attendance:", error);
      return [];
    }
  };

  const validateQRCode = (qrCode: string): boolean => {
    try {
      // Basic validation - check if it's a valid base64 encoded JSON
      if (!qrCode || typeof qrCode !== 'string') {
        return false;
      }
      
      // Try to decode and parse the QR code
      const decoded = atob(qrCode.split('.')[1] || qrCode);
      JSON.parse(decoded);
      return true;
    } catch (error) {
      console.warn("Invalid QR code detected:", error);
      return false;
    }
  };

  const createAttendanceSession = async (lessonId: number) => {
  try {
    setLoading(true);
    setErrorMessage("");
    
    const url = `${BASE_URL}/atten/store/${lessonId}`;
    const token = localStorage.getItem('authToken');
    
    const res = await axios.get(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'ngrok-skip-browser-warning': 'true',
      }
    });

    console.log("🔍 Response:", res.data);

    if (res.data.attendance && Array.isArray(res.data.attendance)) {
      // Validate QR codes
      const validAttendance = res.data.attendance.filter((record: any) => {
        if (record.student?.qr_code) {
          const isValid = validateQRCode(record.student.qr_code);
          if (!isValid) {
            console.warn(`Invalid QR code for student ${record.student.name}`);
          }
          return isValid;
        }
        return true; // include if no QR code
      });

      // ✅ Add lesson_id & student_id so filters work
      const normalizedAttendance = validAttendance.map((record: any) => ({
        ...record,
        lesson_id: record.lesson?.id || lessonId,
        student_id: record.student?.id || null
      }));

      setAttendance(normalizedAttendance);
      
      // Success message
      setSessionMessage(
        `${res.data.message} (${res.data.count || 0} students enrolled)`
      );
      
      // Remove from dropdown
      setLessonsWithoutAttendance(prev => 
        prev.filter(lesson => lesson.id !== lessonId)
      );
      
      // Warning for invalid QR codes
      const invalidCount = res.data.attendance.length - validAttendance.length;
      if (invalidCount > 0) {
        setErrorMessage(`Warning: ${invalidCount} student(s) have invalid QR codes and may not be able to scan attendance.`);
      }
    }

    setTimeout(() => {
      setSessionMessage("");
      setErrorMessage("");
    }, 5000);
  } catch (error: any) {
    console.error("Failed to create attendance session:", error);
    setErrorMessage("Failed to create attendance session. Please try again.");
    
    if (error.response) {
      console.error("🔴 Server responded with:", error.response.data);
    } else if (error.request) {
      console.error("🔴 No response from server:", error.request);
    } else {
      console.error("🔴 Error setting up request:", error.message);
    }
  } finally {
    setLoading(false);
  }
};


  const handleLessonChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const lessonId = parseInt(e.target.value);
    if (!lessonId) {
      setSelectedLesson(null);
      setAttendance([]);
      return;
    }

    setSelectedLesson(lessonId);

    // First check if attendance already exists
    let existingAttendance = await fetchAttendanceByLesson(lessonId);

    if (existingAttendance.length === 0) {
      // Create new attendance session
      await createAttendanceSession(lessonId);
    } else {
      // Use existing attendance
      setAttendance(existingAttendance);
    }
  };

  const handleQRScan = async (qrData: string) => {
    if (!currentStudentId || !selectedLesson) return;

    try {
      const attendanceRecord = attendance.find(
        (a) =>
          a.student_id === currentStudentId && a.lesson_id === selectedLesson
      );

      if (attendanceRecord) {
        await apiService.update("atten", attendanceRecord.id!, {
          ...attendanceRecord,
          student_attendance: 1,
          student_attendance_time: new Date().toISOString(),
        });

        setAttendance((prev) =>
          prev.map((a) =>
            a.id === attendanceRecord.id
              ? {
                  ...a,
                  student_attendance: 1,
                  student_attendance_time: new Date().toISOString(),
                }
              : a
          )
        );

        setSuccessMessage("Attendance updated ✅");
        setTimeout(() => setSuccessMessage(""), 3000);
      }
    } catch (error) {
      console.error("Failed to update attendance:", error);
      setErrorMessage("Failed to update attendance. Please try again.");
    } finally {
      setIsQRModalOpen(false);
      setCurrentStudentId(null);
    }
  };

  const openQRScanner = (studentId: number) => {
    setCurrentStudentId(studentId);
    setIsQRModalOpen(true);
  };

  const lessonAttendance = selectedLesson
    ? attendance.filter((a) => a.lesson_id === selectedLesson)
    : [];

  const filteredAttendance = lessonAttendance.filter(
    (record) =>
      record.lesson?.id?.toString().includes(searchTerm) ||
      record.student?.id?.toString().includes(searchTerm) ||
      record.student?.name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      key: "student_name",
      label: "Student Name",
      render: (_value: any, record: Attendance) =>
        record.student?.name ?? "N/A",
    },
    {
      key: "student_email",
      label: "Email",
      render: (_value: any, record: Attendance) =>
        record.student?.email ?? "N/A",
    },
    {
      key: "student_attendance",
      label: "Status",
      render: (value: 0 | 1 | null) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            value === 1
              ? "bg-green-100 text-green-800"
              : value === 0
              ? "bg-red-100 text-red-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {value === 1 ? "Present" : value === 0 ? "Absent" : "Not Set"}
        </span>
      ),
    },
    {
      key: "student_attendance_time",
      label: "Time",
      render: (value: string | null) =>
        value ? new Date(value).toLocaleTimeString() : "N/A",
    },
    {
      key: "qr_status",
      label: "QR Status",
      render: (_value: any, record: Attendance) => {
        const hasValidQR = record.student?.qr_code && validateQRCode(record.student.qr_code);
        return (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              hasValidQR
                ? "bg-green-100 text-green-800"
                : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {hasValidQR ? "Valid QR" : "No/Invalid QR"}
          </span>
        );
      },
    },
    {
      key: "actions",
      label: "Actions",
      render: (_value: any, record: Attendance) => (
        <Button
          size="sm"
          onClick={() => openQRScanner(record.student_id)}
          disabled={record.student_attendance === 1}
        >
          <QrCode size={16} className="mr-1" />
          {record.student_attendance === 1 ? "Marked" : "Scan QR"}
        </Button>
      ),
    },
  ];

  const lessonOptions = lessonsWithoutAttendance.map((lesson) => ({
    value: lesson.id!,
    label: `${lesson.lesson_title} - ${lesson.lesson_date}`,
  }));

  return (
    <div className="p-6 space-y-6">
      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <span className="text-green-800 font-medium">{successMessage}</span>
        </div>
      )}

      {/* Session Message */}
      {sessionMessage && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center space-x-2">
          <CheckCircle className="w-5 h-5 text-blue-600" />
          <span className="text-blue-800 font-medium">{sessionMessage}</span>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center space-x-2">
          <AlertTriangle className="w-5 h-5 text-yellow-600" />
          <span className="text-yellow-800 font-medium">{errorMessage}</span>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Select
            label="Select Lesson (No Attendance Yet)"
            value={selectedLesson || ""}
            onChange={handleLessonChange}
            options={lessonOptions}
          />

          {selectedLesson && (
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <Input
                placeholder="Search attendance..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          )}
        </div>
      </div>

      {/* Show lesson info if selected */}
      {selectedLesson && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Lesson Details
          </h3>
          {(() => {
            const lesson = lessons.find(l => l.id === selectedLesson);
            return lesson ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-600">Title:</span>
                  <p className="text-gray-800">{lesson.lesson_title}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Date:</span>
                  <p className="text-gray-800">{lesson.lesson_date}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Students Enrolled:</span>
                  <p className="text-gray-800">{filteredAttendance.length}</p>
                </div>
              </div>
            ) : null;
          })()}
        </div>
      )}

      {selectedLesson && (
        <Table columns={columns} data={filteredAttendance} loading={loading} />
      )}

      {/* Show message when no lessons available */}
      {!loading && lessonsWithoutAttendance.length === 0 && (
        <div className="text-center py-12">
          <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            All Lessons Have Attendance Records
          </h3>
          <p className="text-gray-500">
            All available lessons already have attendance records created.
          </p>
        </div>
      )}

      <Modal
        isOpen={isQRModalOpen}
        onClose={() => {
          setIsQRModalOpen(false);
          setCurrentStudentId(null);
        }}
        title="Scan QR Code for Attendance"
        size="md"
      >
        <QRScanner onScan={handleQRScan} />
      </Modal>
    </div>
  );
};