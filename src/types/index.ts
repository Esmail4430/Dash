export interface Course {
  id?: number;
  type: "TahfeezCourse" | "Other";
  title: string;
  description: string;
  start_date: string;
  expected_end_date: string;
  course_start_time: string;
  level: string;
  image?: string;
  file_path?: string;
  file_name?: string; // ✅ أضفنا هذا
  students: (number | Student)[];
  instructors: (number | Instructor)[];
}


export interface CourseFile {
  id?: number;
  course_id: number;
  file_name: string;
  file_path: string;
}

export interface Student {
  id?: number;
  name: string;
  email: string;
  password: string;
  password_confirmation?: string;
  certificate: string;
  student_img: string;
  birth_date: string;
  phone_number: string;
  address: string;
  enroll_date: string;
    notes?: string;
  quran_memorized_parts: number[];
  quran_passed_parts: number[];
}

export interface Instructor {
  id?: number;
  name: string;
  email: string;
  password: string;
  password_confirmation?: string;
  certificate: string;
  instructor_img: string;
  birth_date: string;
  phone_number: string;
  address: string;
  quran_memorized_parts: number[];
  quran_passed_parts: number[];
  religious_qualifications: string[];
}

export interface Lesson {
  id?: number;
  lesson_title: string;
  lesson_date: string;
  instructor_id: number;
  course_id: number[];
}

export interface Exam {
  id?: number;
  title: string;
  exam_date: string;
  max_mark: number;
  passing_mark: number;
  course_id: number;
}

export interface StudentExam {
  id?: number;
  exam_id: number;
  student_id: number;
  student_mark: number;
}

export interface Attendance {
  id?: number;
  lesson_id: number;
  student_id: number;
  student_attendance: 0 | 1 | null;
  student_attendance_time: string | null;
  lesson?: Lesson;
  student?: Student;
}

export interface Recitation {
  id?: number;
  student_id: number;
  course_id: number;
  lesson_id: number;
  recitation_per_page: number[];
  recitation_evaluation: string;
  current_juz: number;
  current_juz_page: number;
  student_name?: string;
  lesson_title?: string;
  lesson_date?: string;
  recitation_notes?: string;
  homework?: number[];
}

export type EntityType =
  | "courses"
  | "students"
  | "instructors"
  | "lessons"
  | "exams"
  | "atten"
  | "stdExam"
  | "recitation"
  | "courseFiles";