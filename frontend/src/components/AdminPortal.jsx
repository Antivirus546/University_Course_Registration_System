import { useState, useEffect } from 'react';
import { api } from '../api';
import toast from 'react-hot-toast';
import { ShieldCheck, CalendarPlus, Users, BookOpen, UserPlus } from 'lucide-react';

const DEPARTMENTS = [
  'Computer Science',
  'Information & Communication',
  'Electrical & Electronics',
  'Mechanical',
  'Civil',
  'Chemical',
  'Mechatronics'
];

const BRANCHES = [
  'B.Tech Computer Science & Engg',
  'B.Tech Data Science & Engg',
  'B.Tech Information Technology',
  'B.Tech Electronics & Communication Engg',
  'B.Tech Electrical & Electronics Engg',
  'B.Tech Mechanical Engg',
  'B.Tech Civil Engg',
  'B.Tech Chemical Engg',
  'B.Tech Mechatronics',
  'B.Tech Biotechnology'
];

export default function AdminPortal() {
  const [activeTab, setActiveTab] = useState('addStudent'); // 'add', 'students', 'courses', 'addStudent'
  const [formData, setFormData] = useState({ courseId: '', title: '', deptName: DEPARTMENTS[0], credits: 3, semesterType: 1, prereqId: '' });
  const [addStudentData, setAddStudentData] = useState({ id: '', name: '', branchName: BRANCHES[0], semester: 1, completedCourseIds: [] });
  const [allCourses, setAllCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [studentSemFilter, setStudentSemFilter] = useState('All');
  const [courseSemFilter, setCourseSemFilter] = useState('All');

  // Load all courses on mount (for prerequisite dropdown)
  useEffect(() => {
    api.getAllAdminCourses().then(setAllCourses).catch(() => {});
  }, []);

  useEffect(() => {
    if (activeTab === 'students') {
      loadStudents();
    } else if (activeTab === 'courses') {
      loadCourses();
    }
  }, [activeTab]);

  const loadStudents = async () => {
    try {
      setDataLoading(true);
      const data = await api.getAllStudentEnrollments();
      setStudents(data);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDataLoading(false);
    }
  };

  const loadCourses = async () => {
    try {
      setDataLoading(true);
      const data = await api.getAllAdminCourses();
      setCourses(data);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDataLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      await api.addCourse(formData.courseId, formData.title, formData.deptName, formData.credits, formData.semesterType, formData.prereqId);
      const prereqMsg = formData.prereqId ? ` (Prereq: ${formData.prereqId})` : '';
      toast.success(`Course ${formData.courseId} Added to Semester ${formData.semesterType}${prereqMsg}!`, { icon: '✅' });
      setFormData({ courseId: '', title: '', deptName: DEPARTMENTS[0], credits: 3, semesterType: 1, prereqId: '' });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddStudentSubmit = async (e) => {
    e.preventDefault();
    if (!addStudentData.id || !addStudentData.name) {
      toast.error('Please fill out all required fields');
      return;
    }
    try {
      setIsLoading(true);
      await api.register(addStudentData.id, addStudentData.name, addStudentData.branchName, addStudentData.semester, addStudentData.completedCourseIds);
      toast.success(`Student ${addStudentData.id} Registered Successfully!`, { icon: '✅' });
      setAddStudentData({ id: '', name: '', branchName: BRANCHES[0], semester: 1, completedCourseIds: [] });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto border border-emerald-500/20 bg-emerald-500/5 rounded-2xl p-8 relative overflow-hidden animate-in fade-in zoom-in-95 duration-500">
      <div className="absolute top-0 right-0 bg-emerald-500/10 px-4 py-1 text-emerald-400 text-xs font-bold rounded-bl-xl flex items-center">
        <ShieldCheck className="w-3 h-3 mr-1" /> ADMIN PRIVILEGES ACTIVE
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center">
             <ShieldCheck className="w-6 h-6 mr-2 text-emerald-400" /> Administrative Portal
          </h2>
          <p className="text-slate-400 text-sm mt-1">Manage courses and monitor student enrollments</p>
        </div>
        <div className="flex space-x-2 bg-slate-800/80 p-1 rounded-lg border border-slate-700">
          <button 
            onClick={() => setActiveTab('addStudent')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center ${activeTab === 'addStudent' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700'}`}
          >
            <UserPlus className="w-4 h-4 mr-2" /> Add Student
          </button>
          <button 
            onClick={() => setActiveTab('add')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center ${activeTab === 'add' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700'}`}
          >
            <CalendarPlus className="w-4 h-4 mr-2" /> Add Course
          </button>
          <button 
            onClick={() => setActiveTab('students')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center ${activeTab === 'students' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700'}`}
          >
            <Users className="w-4 h-4 mr-2" /> Students
          </button>
          <button 
            onClick={() => setActiveTab('courses')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center ${activeTab === 'courses' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700'}`}
          >
            <BookOpen className="w-4 h-4 mr-2" /> Master Courses
          </button>
        </div>
      </div>

      {activeTab === 'addStudent' && (
        <form onSubmit={handleAddStudentSubmit} className="space-y-5 bg-slate-800/80 border border-slate-700 p-6 rounded-xl shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
             <div>
               <label className="block text-sm font-semibold text-slate-400 mb-1">Student ID</label>
               <input
                 type="text"
                 className="w-full px-4 py-2 bg-slate-900/60 border border-slate-700/80 rounded-lg focus:ring-2 focus:ring-emerald-500/80 transition-all text-slate-200 text-sm uppercase"
                 required
                 value={addStudentData.id}
                 onChange={(e) => setAddStudentData({...addStudentData, id: e.target.value})}
                 placeholder="e.g. S020"
               />
             </div>
             
             <div>
               <label className="block text-sm font-semibold text-slate-400 mb-1">Full Name</label>
               <input
                 type="text"
                 className="w-full px-4 py-2 bg-slate-900/60 border border-slate-700/80 rounded-lg focus:ring-2 focus:ring-emerald-500/80 transition-all text-slate-200 text-sm"
                 required
                 value={addStudentData.name}
                 onChange={(e) => setAddStudentData({...addStudentData, name: e.target.value})}
                 placeholder="John Doe"
               />
             </div>

             <div>
               <label className="block text-sm font-semibold text-slate-400 mb-1">Branch</label>
               <select
                 className="w-full px-4 py-2 bg-slate-900/60 border border-slate-700/80 rounded-lg focus:ring-2 focus:ring-emerald-500/80 transition-all text-slate-200 text-sm"
                 value={addStudentData.branchName}
                 onChange={(e) => setAddStudentData({...addStudentData, branchName: e.target.value})}
               >
                 {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
               </select>
             </div>

             <div>
               <label className="block text-sm font-semibold text-slate-400 mb-1">Target Semester</label>
               <select
                 className="w-full px-4 py-2 bg-slate-900/60 border border-slate-700/80 rounded-lg focus:ring-2 focus:ring-emerald-500/80 transition-all text-slate-200 text-sm font-bold text-emerald-300"
                 value={addStudentData.semester}
                 onChange={(e) => {
                   const newSem = parseInt(e.target.value);
                   setAddStudentData({...addStudentData, semester: newSem, completedCourseIds: newSem === 1 ? [] : addStudentData.completedCourseIds});
                 }}
               >
                 {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                    <option key={sem} value={sem}>Semester {sem}</option>
                 ))}
               </select>
             </div>
          </div>

          {addStudentData.semester > 1 && (
            <div className="mt-4 p-4 border border-emerald-500/30 bg-emerald-500/5 rounded-xl">
              <h3 className="text-sm font-bold text-emerald-400 mb-2">Advanced Standing Check</h3>
              <p className="text-xs text-slate-400 mb-4">Select prerequisite courses the student has already completed.</p>
              <div className="max-h-48 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-2 pr-2">
                {allCourses.map(c => (
                  <label key={c.courseId} className="flex items-center space-x-3 p-2 rounded hover:bg-slate-700/50 cursor-pointer border border-transparent hover:border-slate-600 transition-all">
                    <input 
                      type="checkbox"
                      className="form-checkbox h-4 w-4 text-emerald-500 rounded border-slate-600 bg-slate-900 focus:ring-emerald-500 focus:ring-offset-slate-800"
                      checked={addStudentData.completedCourseIds.includes(c.courseId)}
                      onChange={(e) => {
                        const isChecked = e.target.checked;
                        setAddStudentData(prev => ({
                          ...prev,
                          completedCourseIds: isChecked 
                            ? [...prev.completedCourseIds, c.courseId]
                            : prev.completedCourseIds.filter(id => id !== c.courseId)
                        }));
                      }}
                    />
                    <span className="text-sm text-slate-300 font-medium truncate">
                      {c.courseId} <span className="text-slate-500 font-normal">— {c.title}</span>
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg shadow-emerald-600/30 mt-4"
          >
            {isLoading ? 'Processing...' : 'Register Student'}
          </button>
        </form>
      )}

      {activeTab === 'add' && (
        <form onSubmit={handleSubmit} className="space-y-5 bg-slate-800/80 border border-slate-700 p-6 rounded-xl shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
             <div>
               <label className="block text-sm font-semibold text-slate-400 mb-1">Course ID</label>
               <input
                 type="text"
                 className="w-full px-4 py-2 bg-slate-900/60 border border-slate-700/80 rounded-lg focus:ring-2 focus:ring-emerald-500/80 transition-all text-slate-200 text-sm uppercase"
                 required
                 value={formData.courseId}
                 onChange={(e) => setFormData({...formData, courseId: e.target.value})}
                 placeholder="e.g. CS400"
               />
             </div>
             
             <div>
               <label className="block text-sm font-semibold text-slate-400 mb-1">Credits</label>
               <input
                 type="number"
                 min="1" max="10"
                 className="w-full px-4 py-2 bg-slate-900/60 border border-slate-700/80 rounded-lg focus:ring-2 focus:ring-emerald-500/80 transition-all text-slate-200 text-sm"
                 required
                 value={formData.credits}
                 onChange={(e) => setFormData({...formData, credits: parseInt(e.target.value)})}
               />
             </div>

             <div>
               <label className="block text-sm font-semibold text-slate-400 mb-1">Target Semester</label>
               <select
                 className="w-full px-4 py-2 bg-slate-900/60 border border-slate-700/80 rounded-lg focus:ring-2 focus:ring-emerald-500/80 transition-all text-slate-200 text-sm font-bold text-emerald-300"
                 value={formData.semesterType}
                 onChange={(e) => setFormData({...formData, semesterType: parseInt(e.target.value)})}
               >
                 {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                    <option key={sem} value={sem}>Semester {sem}</option>
                 ))}
               </select>
             </div>
          </div>

          <div>
             <label className="block text-sm font-semibold text-slate-400 mb-1">Course Title</label>
             <input
               type="text"
               className="w-full px-4 py-2 bg-slate-900/60 border border-slate-700/80 rounded-lg focus:ring-2 focus:ring-emerald-500/80 transition-all text-slate-200 text-sm"
               required
               value={formData.title}
               onChange={(e) => setFormData({...formData, title: e.target.value})}
               placeholder="Introduction to Artificial Intelligence"
             />
          </div>

          <div>
             <label className="block text-sm font-semibold text-slate-400 mb-1">Department</label>
             <select
               className="w-full px-4 py-2 bg-slate-900/60 border border-slate-700/80 rounded-lg focus:ring-2 focus:ring-emerald-500/80 transition-all text-slate-200 text-sm"
               value={formData.deptName}
               onChange={(e) => setFormData({...formData, deptName: e.target.value})}
             >
               {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
             </select>
          </div>

          <div>
             <label className="block text-sm font-semibold text-slate-400 mb-1">
               Prerequisite <span className="text-slate-500 font-normal">(optional)</span>
             </label>
             <select
               className="w-full px-4 py-2 bg-slate-900/60 border border-slate-700/80 rounded-lg focus:ring-2 focus:ring-emerald-500/80 transition-all text-slate-200 text-sm"
               value={formData.prereqId}
               onChange={(e) => setFormData({...formData, prereqId: e.target.value})}
             >
               <option value="">— None —</option>
               {allCourses.map(c => (
                 <option key={c.courseId} value={c.courseId}>{c.courseId} — {c.title}</option>
               ))}
             </select>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg shadow-emerald-600/30 mt-4"
          >
            {isLoading ? 'Processing...' : 'Add Course and Open Section'}
          </button>
        </form>
      )}

      {activeTab === 'students' && (
        <div className="bg-slate-800/80 border border-slate-700 rounded-xl shadow-lg p-6 overflow-hidden">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-white">Student Enrollments</h3>
            <div className="flex items-center gap-2">
              <label className="text-sm text-slate-400">Filter by Sem:</label>
              <select 
                value={studentSemFilter} 
                onChange={(e) => setStudentSemFilter(e.target.value)}
                className="bg-slate-700 text-sm text-white px-3 py-1.5 rounded-md border border-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="All">All</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s}>Sem {s}</option>)}
              </select>
            </div>
          </div>
          {dataLoading ? (
            <div className="text-emerald-400 animate-pulse text-center py-8">Loading students...</div>
          ) : students.length === 0 ? (
            <div className="text-slate-400 text-center py-8">No students found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-700 text-slate-400 text-sm">
                    <th className="p-3 font-semibold">ID & Name</th>
                    <th className="p-3 font-semibold">Branch</th>
                    <th className="p-3 font-semibold">Sem</th>
                    <th className="p-3 font-semibold">Current Enrollments</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {students.filter(sys => studentSemFilter === 'All' || sys.currentSemester.toString() === studentSemFilter).map((sys) => (
                    <tr key={sys.studentId} className="hover:bg-slate-700/30 transition-colors">
                      <td className="p-3">
                        <div className="font-medium text-slate-200">{sys.studentId}</div>
                        <div className="text-xs text-slate-400">{sys.name}</div>
                      </td>
                      <td className="p-3 text-sm text-slate-300">{sys.branchName}</td>
                      <td className="p-3">
                        <span className="bg-slate-700/50 text-emerald-400 px-2 py-1 rounded text-xs font-bold">
                          S{sys.currentSemester}
                        </span>
                      </td>
                      <td className="p-3">
                        {sys.enrollments && sys.enrollments.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {sys.enrollments.map((en, idx) => (
                              <span key={idx} className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs px-2 py-1 rounded">
                                {en.courseId} - {en.title}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-500 text-xs italic">No enrollments</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'courses' && (
        <div className="bg-slate-800/80 border border-slate-700 rounded-xl shadow-lg p-6 overflow-hidden">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-white">Master Course List</h3>
            <div className="flex items-center gap-2">
              <label className="text-sm text-slate-400">Filter by Sem:</label>
              <select 
                value={courseSemFilter} 
                onChange={(e) => setCourseSemFilter(e.target.value)}
                className="bg-slate-700 text-sm text-white px-3 py-1.5 rounded-md border border-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="All">All</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s}>Sem {s}</option>)}
              </select>
            </div>
          </div>
          {dataLoading ? (
            <div className="text-emerald-400 animate-pulse text-center py-8">Loading courses...</div>
          ) : courses.length === 0 ? (
            <div className="text-slate-400 text-center py-8">No courses found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-700 text-slate-400 text-sm">
                    <th className="p-3 font-semibold">Course ID</th>
                    <th className="p-3 font-semibold">Title</th>
                    <th className="p-3 font-semibold">Department</th>
                    <th className="p-3 font-semibold">Credits</th>
                    <th className="p-3 font-semibold">Active Sections</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {courses.filter(c => {
                    if (courseSemFilter === 'All') return true;
                    if (!c.activeSemesters) return false;
                    const sems = c.activeSemesters.split(',').map(s => s.trim());
                    return sems.includes(courseSemFilter);
                  }).map((c) => (
                    <tr key={c.courseId} className="hover:bg-slate-700/30 transition-colors">
                      <td className="p-3 font-medium text-emerald-400">{c.courseId}</td>
                      <td className="p-3 text-slate-200">{c.title}</td>
                      <td className="p-3 text-sm text-slate-400">{c.deptName}</td>
                      <td className="p-3 text-slate-300 font-medium">{c.credits}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${c.activeSections > 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                          {c.activeSections} Section(s)
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
