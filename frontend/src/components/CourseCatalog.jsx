import { useState, useEffect } from 'react';
import { api } from '../api';
import toast from 'react-hot-toast';
import { Search, Info, Clock, CheckCircle } from 'lucide-react';

export default function CourseCatalog({ studentId, currentSemester }) {
  const [courses, setCourses] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const data = await api.getCourses(currentSemester);
      setCourses(data);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [currentSemester]);

  const handleEnroll = async (courseId, secId) => {
    try {
      const res = await api.enroll(studentId, courseId, secId, currentSemester);
      toast.success(res.message || `Successfully enrolled in ${courseId}`);
      fetchCourses(); // refresh available seats
    } catch (err) {
      toast.error(err.message, { duration: 4000 });
    }
  };

  const filteredCourses = courses.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.instructorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.courseId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Course Catalog</h2>
          <p className="text-emerald-400 text-sm mt-1 font-medium">Filtering for <b className="text-emerald-300">Semester {currentSemester}</b> Classes</p>
        </div>
        
        {/* Search Bar */}
        <div className="relative w-full md:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-500" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2.5 border border-slate-700 rounded-xl leading-5 bg-slate-800/50 text-slate-300 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors sm:text-sm"
            placeholder="Search by title, instructor, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="text-center py-20 bg-slate-800/30 rounded-2xl border border-slate-700/50">
          <Info className="mx-auto h-12 w-12 text-slate-500 mb-3" />
          <h3 className="text-lg font-medium text-slate-300">No courses found</h3>
          <p className="text-slate-500 mt-1">Adjust your search or check back later.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => {
            const isFull = course.enrolled >= course.capacity;
            const progress = (course.enrolled / course.capacity) * 100;

            return (
              <div 
                key={`${course.courseId}-${course.secId}`}
                className="bg-slate-800 rounded-2xl border border-slate-700 shadow-lg overflow-hidden transition-all duration-300 hover:shadow-indigo-500/10 hover:-translate-y-1 hover:border-slate-600 flex flex-col h-full"
              >
                <div className="p-6 flex-grow">
                  <div className="flex justify-between items-start mb-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      {course.courseId} - Sec {course.secId}
                    </span>
                    {isFull && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-500 border border-red-500/20">
                        Full
                      </span>
                    )}
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-2 leading-tight">{course.title}</h3>
                  <p className="text-slate-400 text-sm mb-4">Instructor: <span className="text-slate-300">{course.instructorName}</span></p>
                  
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center text-sm text-slate-400 bg-slate-900/50 p-2 rounded-lg">
                      <Clock className="h-4 w-4 mr-2 text-indigo-400" />
                      {course.day} {course.startTime} - {course.endTime}
                    </div>
                  </div>

                  {/* Capacity Bar */}
                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                      <span>Capacity</span>
                      <span>{course.enrolled} / {course.capacity}</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-1.5">
                      <div 
                        className={`h-1.5 rounded-full ${isFull ? 'bg-red-500' : 'bg-indigo-500'}`} 
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-800/80 border-t border-slate-700">
                  <button
                    onClick={() => handleEnroll(course.courseId, course.secId)}
                    disabled={isFull}
                    className={`w-full flex items-center justify-center py-2.5 px-4 rounded-xl text-sm font-semibold transition-all ${
                      isFull 
                        ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white hover:shadow-lg hover:shadow-indigo-500/25'
                    }`}
                  >
                    {isFull ? 'Waitlist (Disabled)' : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Enroll Now
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
