const API_BASE = 'http://192.168.0.195:8080/api';

export const api = {
  login: async (studentId) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Login failed');
    return data;
  },

  register: async (id, name, branchName, semester) => {
    const res = await fetch(`${API_BASE}/students`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, name, branchName, semester: semester.toString() })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Registration failed');
    return data;
  },

  addCourse: async (courseId, title, deptName, credits, semesterType, prereqId) => {
    const res = await fetch(`${API_BASE}/courses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ courseId, title, deptName, credits: credits.toString(), semesterType, prereqId: prereqId || '' })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Add Course failed');
    return data;
  },

  getCourses: async (term = 'Odd') => {
    const res = await fetch(`${API_BASE}/courses?term=${term}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch courses');
    return data;
  },

  getHistory: async (studentId) => {
    const res = await fetch(`${API_BASE}/students/${studentId}/history`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch history');
    return data;
  },
  getAllAdminCourses: async () => {
    const res = await fetch(`${API_BASE}/admin/courses`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch admin courses');
    return data;
  },

  getAllStudentEnrollments: async () => {
    const res = await fetch(`${API_BASE}/admin/students`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch student enrollments');
    return data;
  },
  enroll: async (studentId, courseId, secId, semester) => {
    const res = await fetch(`${API_BASE}/students/${studentId}/enroll`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ courseId, secId, semester })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Enrollment failed');
    return data;
  },

  drop: async (studentId, courseId, secId, semester, year) => {
    const res = await fetch(`${API_BASE}/students/${studentId}/drop`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ courseId, secId, semester, year: year.toString() })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Drop failed');
    return data;
  }
};
