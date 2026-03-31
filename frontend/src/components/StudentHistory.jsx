import { useState, useEffect } from 'react';
import { api } from '../api';
import toast from 'react-hot-toast';
import { BookOpen, XCircle, FileText } from 'lucide-react';

export default function StudentHistory({ studentId }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const data = await api.getHistory(studentId);
      setHistory(data);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDrop = async (courseId, semester, year) => {
    if (!window.confirm(`Are you sure you want to drop ${courseId}?`)) return;
    
    // Assuming secId "1" as a default since history might not store section ID clearly 
    // depending on the original schema. The backend DAO might ignore it or require '1'.
    try {
      const res = await api.drop(studentId, courseId, "1", semester, year);
      toast.success(res.message || `Successfully dropped ${courseId}`);
      fetchHistory(); // refresh the list
    } catch (err) {
      toast.error(err.message, { duration: 4000 });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Student History</h2>
          <p className="text-slate-400 text-sm mt-1">Review your past grades and current enrollments</p>
        </div>
        <div className="flex items-center space-x-2 bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2">
          <BookOpen className="w-5 h-5 text-indigo-400" />
          <span className="text-slate-300 font-medium">{history.length} Records</span>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
        </div>
      ) : history.length === 0 ? (
        <div className="text-center py-20 bg-slate-800/30 rounded-2xl border border-slate-700/50">
          <FileText className="mx-auto h-12 w-12 text-slate-500 mb-3" />
          <h3 className="text-lg font-medium text-slate-300">No enrollment history</h3>
          <p className="text-slate-500 mt-1">You haven't registered for any classes yet.</p>
        </div>
      ) : (
        <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-700/50">
              <thead className="bg-slate-900/50">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Course</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Title</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Term</th>
                  <th scope="col" className="px-6 py-4 text-center text-xs font-medium text-slate-400 uppercase tracking-wider">Credits</th>
                  <th scope="col" className="px-6 py-4 text-center text-xs font-medium text-slate-400 uppercase tracking-wider">Grade</th>
                  <th scope="col" className="px-6 py-4 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50 bg-slate-800/80">
                {history.map((record, idx) => {
                  const isCurrent = record.grade === null || record.grade === '';
                  const statusLabel = isCurrent ? "Enrolled" : record.grade;
                  const isDroppable = isCurrent && record.semester === 'Odd' && record.year === 2026;

                  return (
                    <tr key={`${record.courseId}-${record.semester}-${record.year}-${idx}`} className="hover:bg-slate-700/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                          {record.courseId}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                        {record.title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                        {record.semester} {record.year}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-slate-300">
                        {record.credits}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                          isCurrent 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                            : 'bg-slate-700 text-slate-300 border border-slate-600'
                        }`}>
                          {statusLabel}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {isDroppable ? (
                          <button
                            onClick={() => handleDrop(record.courseId, record.semester, record.year)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10 px-3 py-1.5 rounded-lg transition-colors flex items-center justify-end ml-auto group"
                          >
                            <span className="mr-1.5">Drop</span>
                            <XCircle className="w-4 h-4 group-hover:-rotate-90 transition-transform duration-300" />
                          </button>
                        ) : (
                          <span className="text-slate-600 text-xs text-center w-full block">Complete</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
