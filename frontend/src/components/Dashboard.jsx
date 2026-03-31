import { useState } from 'react';
import CourseCatalog from './CourseCatalog';
import StudentHistory from './StudentHistory';
import { LogOut, GraduationCap, LayoutDashboard, History } from 'lucide-react';

export default function Dashboard({ studentId, currentSemester, onLogout }) {
  const [activeTab, setActiveTab] = useState('catalog');

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col md:flex-row selection:bg-indigo-500 selection:text-white">
      {/* Sidebar Navigation */}
      <nav className="w-full md:w-64 bg-slate-800 border-b md:border-b-0 md:border-r border-slate-700 shadow-2xl flex flex-col md:h-screen sticky top-0 md:fixed z-10 transition-all">
        <div className="p-6 md:p-8 flex items-center shrink-0">
          <div className="bg-indigo-500/10 w-10 h-10 rounded-xl flex items-center justify-center mr-3 border border-indigo-500/20">
            <GraduationCap className="h-6 w-6 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight leading-none bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">Uni Portal</h1>
            <p className="text-xs text-indigo-400 mt-1 tracking-wide font-medium">Registration System</p>
          </div>
        </div>

        <div className="px-4 py-2 md:py-6 flex-grow flex md:flex-col gap-2 overflow-x-auto md:overflow-hidden hide-scrollbar">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`flex items-center flex-shrink-0 w-auto md:w-full px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium group ${
              activeTab === 'catalog' 
                ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 shadow-inner' 
                : 'text-slate-400 hover:bg-slate-700/50 hover:text-slate-200'
            }`}
          >
            <LayoutDashboard className={`h-5 w-5 mr-3 transition-transform duration-300 ${activeTab === 'catalog' ? 'scale-110' : 'group-hover:scale-110'}`} />
            Course Catalog
          </button>
          
          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center flex-shrink-0 w-auto md:w-full px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium group ${
              activeTab === 'history' 
                ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 shadow-inner' 
                : 'text-slate-400 hover:bg-slate-700/50 hover:text-slate-200'
            }`}
          >
            <History className={`h-5 w-5 mr-3 transition-transform duration-300 ${activeTab === 'history' ? 'scale-110' : 'group-hover:scale-110'}`} />
            Student History
          </button>
        </div>

        <div className="p-4 md:p-6 mt-auto hidden md:block border-t border-slate-700/50 shrink-0">
          <div className="bg-slate-900/50 rounded-xl p-4 mb-4 border border-slate-700">
            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Logged in as</p>
            <p className="text-sm text-white font-medium flex items-center">
              <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
              {studentId}
            </p>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center px-4 py-2.5 rounded-lg text-sm font-semibold text-slate-400 hover:text-white hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all group"
          >
            <LogOut className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Sign Out
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 w-full md:ml-64 relative min-h-screen pb-20 md:pb-0">
        {/* Mobile Header elements that only show on small screens */}
        <div className="md:hidden flex justify-between items-center p-4 bg-slate-800 border-b border-slate-700 sticky top-[73px] z-10 backdrop-blur-md bg-opacity-80">
           <p className="text-sm font-medium text-slate-300">ID: {studentId}</p>
           <button onClick={onLogout} className="text-xs font-semibold text-slate-400 hover:text-red-400 flex items-center">
             <LogOut className="h-3 w-3 mr-1" /> Logout
           </button>
        </div>
        
        {/* Render Tab Content */}
        <div className="p-4 md:p-8 lg:p-12 animate-in fade-in zoom-in-95 duration-300 relative z-0">
          {activeTab === 'catalog' ? (
            <CourseCatalog studentId={studentId} currentSemester={currentSemester} />

          ) : (
            <StudentHistory studentId={studentId} />
          )}
        </div>
      </main>
    </div>
  );
}
