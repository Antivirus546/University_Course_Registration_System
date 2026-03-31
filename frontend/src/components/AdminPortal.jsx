import { useState, useEffect } from 'react';
import { api } from '../api';
import toast from 'react-hot-toast';
import { ShieldCheck, CalendarPlus, Users, BookOpen } from 'lucide-react';

const DEPARTMENTS = [
  'Computer Science',
  'Information & Communication',
  'Electrical & Electronics',
  'Mechanical',
  'Civil',
  'Chemical',
  'Mechatronics'
];

export default function AdminPortal() {
  const [activeTab, setActiveTab] = useState('add'); // 'add', 'students', 'courses'
  const [formData, setFormData] = useState({ courseId: '', title: '', deptName: DEPARTMENTS[0], credits: 3, semesterType: 1 });
  const [isLoading, setIsLoading] = useState(false);
  
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [studentSemFilter, setStudentSemFilter] = useState('All');
  const [courseSemFilter, setCourseSemFilter] = useState('All');

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
      await api.addCourse(formData.courseId, formData.title, formData.deptName, formData.credits, formData.semesterType);
      toast.success(`Course ${formData.courseId} Added to Semester ${formData.semesterType}!`, { icon: '✅' });
      setFormData({ courseId: '', title: '', deptName: DEPARTMENTS[0], credits: 3, semesterType: 1 });
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
