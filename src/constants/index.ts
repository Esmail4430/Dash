export const BASE_URL = 'https://0225e4cae47d.ngrok-free.app/api/v1';

export const QURAN_PARTS = Array.from({ length: 30 }, (_, i) => ({
  value: i + 1,
  label: `Part ${i + 1} (Juz ${i + 1})`
}));

export const RELIGIOUS_QUALIFICATIONS = [
  'Tajweed',
  'Fiqh',
  'Hadith',
  'Tafseer',
  'Seerah'
];

export const COURSE_TYPES = [
  { value: 'TahfeezCourse', label: 'TahfeezCourse' },
  { value: 'Other', label: 'Other' }
];

export const ENTITIES = {
  courses: 'courses',
  students: 'students',
  instructors: 'instructors',
  lessons: 'lessons',
  exams: 'exams',
  attendance: 'attn',
  studentExams: 'stdExam',
  recitation: 'recitation'
} as const;
// src/api/constants.ts


// src/api/api.ts
import axios from 'axios';

interface Instructor {
  id: number;
  name: string;
  [key: string]: any;
}

interface Student {
  id: number;
  name: string;
  [key: string]: any;
}

interface Attendance {
  [key: string]: any;
}

interface Course {
  id: number;
  name: string;
  [key: string]: any;
}

interface Recitation {
  [key: string]: any;
}

interface Exam {
  [key: string]: any;
}

const getToken = (): string | null => localStorage.getItem('authToken');

const axiosConfig = (token: string | null) => ({
  headers: {
    Authorization: token ? `Bearer ${token}` : undefined,
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  },
});

export const getInstructors = async (): Promise<Instructor[]> => {
  try {
    const token = getToken();
    const res = await axios.get(`${BASE_URL}/instructors`, axiosConfig(token));
    const data = res.data;
    return Array.isArray(data) ? data : Array.isArray(data.instructors) ? data.instructors : [];
  } catch (error) {
    console.error('Error fetching instructors:', error);
    return [];
  }
};

export const getStudents = async (): Promise<Student[]> => {
  try {
    const token = getToken();
    const res = await axios.get(`${BASE_URL}/students`, axiosConfig(token));
    const data = res.data;
    return Array.isArray(data) ? data : Array.isArray(data.students) ? data.students : [];
  } catch (err) {
    console.error('Error fetching students:', err);
    return [];
  }
};

export const getAttendance = async (): Promise<Attendance[]> => {
  try {
    const token = getToken();
    const res = await axios.get(`${BASE_URL}/atten`, axiosConfig(token));
    const data = res.data;
    return Array.isArray(data) ? data : Array.isArray(data.attendance) ? data.attendance : [];
  } catch (error) {
    console.error('Error fetching attendance:', error);
    return [];
  }
};

export const getCourses = async (): Promise<Course[]> => {
  try {
    const token = getToken();
    const res = await axios.get(`${BASE_URL}/courses`, axiosConfig(token));
    const data = res.data;
    return Array.isArray(data) ? data : Array.isArray(data.courses) ? data.courses : [];
  } catch (error) {
    console.error('Error fetching courses:', error);
    return [];
  }
};

export const getRecitations = async (): Promise<Recitation[]> => {
  try {
    const token = getToken();
    const res = await axios.get(`${BASE_URL}/recitation`, axiosConfig(token));
    const data = res.data;
    return Array.isArray(data.student_recitation) ? data.student_recitation : [];
  } catch (error) {
    console.error('Error fetching recitations:', error);
    return [];
  }
};

export const getRecitationsByCourseId = async (courseId: number | string): Promise<Recitation[]> => {
  try {
    const token = getToken();
    const res = await axios.get(`${BASE_URL}/recitation/course/${courseId}`, axiosConfig(token));
    const data = res.data;
    return Array.isArray(data) ? data : data.recitations || [];
  } catch (error) {
    console.error('Error fetching recitations by course:', error);
    return [];
  }
};

export const getExams = async (): Promise<Exam[]> => {
  try {
    const token = getToken();
    const res = await axios.get(`${BASE_URL}/stdExam`, axiosConfig(token));
    const data = res.data;
    return Array.isArray(data) ? data : Array.isArray(data.exams) ? data.exams : [];
  } catch (error) {
    console.error('Error fetching exams:', error);
    return [];
  }
};
