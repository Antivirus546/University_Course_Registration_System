import { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import Dashboard from './components/Dashboard';
import RegisterForm from './components/RegisterForm';
import AdminPortal from './components/AdminPortal';
import { api } from './api';
import toast from 'react-hot-toast';
import { LogOut, ShieldCheck } from 'lucide-react';
import './App.css';

function App() {
  const [studentId, setStudentId] = useState('');
  const [currentSemester, setCurrentSemester] = useState(1);
  const [viewMode, setViewMode] = useState('login'); // 'login', 'register', 'dashboard', 'admin'
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!studentId.trim()) return;

    try {
      setIsLoading(true);
      const res = await api.login(studentId.trim());
      setCurrentSemester(res.currentSemester);
      setViewMode('dashboard');
      toast.success(`Welcome back, ${res.studentId}!`);
    } catch (err) {
      toast.error(err.message, { 
        duration: 4000,
        style: { borderRadius: '10px', background: '#334155', color: '#f8fafc', border: '1px solid #475569' }
      });
    } finally {
      setIsLoading(false);
    }
  };

  const attemptAdminLogin = () => {
    setViewMode('admin_login');
  };

  const handleLogout = () => {
    setViewMode('login');
    setStudentId('');
    toast('Logged out successfully', { icon: '👋', style: { borderRadius: '10px', background: '#334155', color: '#f8fafc' } });
  };

  if (viewMode === 'dashboard') {
    return (
      <>
        <Toaster position="top-right" />
        <Dashboard studentId={studentId} currentSemester={currentSemester} onLogout={handleLogout} />
      </>
    );
  }

  if (viewMode === 'admin') {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col p-4 selection:bg-emerald-500 selection:text-white relative">
        <Toaster position="top-right" />
        <div className="flex justify-between items-center p-4 border-b border-slate-800 mb-8 max-w-6xl w-full mx-auto">
           <h1 className="font-bold text-xl text-emerald-400 uppercase tracking-widest">SysAdmin Console</h1>
           <button onClick={handleLogout} className="flex items-center text-slate-400 hover:text-red-400 font-medium transition-colors">
              <LogOut className="w-4 h-4 mr-2" /> Terminate Session
           </button>
        </div>
        <AdminPortal />
      </div>
    );
  }

  if (viewMode === 'admin_login') {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-4 selection:bg-emerald-500 selection:text-white relative overflow-hidden">
        <Toaster position="top-right" />
        <div className="bg-slate-800/80 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-emerald-500/30 w-full max-w-sm relative z-10 animate-in fade-in zoom-in-95 duration-500">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center uppercase tracking-widest text-emerald-400">
             <ShieldCheck className="w-6 h-6 mr-2" /> Credentials
          </h2>
          <form onSubmit={(e) => {
             e.preventDefault();
             const pwd = e.target.password.value;
             if (pwd === 'admin123') {
                setViewMode('admin');
                toast.success('Admin authorization granted.', { icon: '🔓' });
             } else {
                toast.error('Unauthorized Access Denied', { icon: '🛑' });
             }
          }} className="space-y-6">
            <input 
              type="password" 
              name="password"
              placeholder="Enter Admin Password" 
              className="w-full px-4 py-3 bg-slate-900/60 border border-slate-700/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/80 transition-all font-medium text-slate-200 uppercase tracking-widest"
              autoFocus
            />
            <div className="flex space-x-3">
              <button type="button" onClick={() => setViewMode('login')} className="w-1/3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-3 px-4 rounded-xl transition-all border border-slate-700">Abort</button>
              <button type="submit" className="w-2/3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 px-4 rounded-xl transition-all shadow-lg shadow-emerald-600/30 text-sm">Verify Passkey</button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-4 selection:bg-indigo-500 selection:text-white relative overflow-hidden">
      <Toaster position="top-right" />
      
      {/* Background Decorative Rings */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-indigo-500/10 rounded-full animate-[spin_60s_linear_infinite]"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-indigo-500/20 rounded-full animate-[spin_40s_linear_infinite_reverse]"></div>

      {viewMode === 'register' ? (
        <RegisterForm onCancel={() => setViewMode('login')} />
      ) : (
        <div className="bg-slate-800/80 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-slate-700/80 w-full max-w-md relative z-10 animate-in fade-in slide-in-from-top-4 duration-500 hover:shadow-indigo-500/20 hover:border-indigo-500/40">
          
          <div className="text-center mb-8">
            <div className="bg-indigo-500/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-indigo-500/20 shadow-inner group transition-transform hover:scale-105">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-indigo-400 group-hover:text-indigo-300 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                <path d="M6 12v5c3 3 9 3 12 0v-5"/>
              </svg>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white mb-2 leading-tight">University Portal</h1>
            <p className="text-slate-400 font-medium">Course Registration System</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="group relative">
              <label htmlFor="studentId" className="block text-sm font-semibold text-slate-400 mb-2 transition-colors group-hover:text-indigo-400">
                Student ID
              </label>
              <input
                type="text"
                id="studentId"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900/60 border border-slate-700/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/80 focus:border-indigo-500/60 transition-all placeholder-slate-600 font-medium text-slate-200 uppercase"
                placeholder="e.g. S001"
                required
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3.5 px-4 rounded-xl transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg shadow-indigo-600/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-indigo-500 disabled:opacity-70 disabled:hover:translate-y-0 disabled:cursor-not-allowed flex justify-center items-center"
            >
              {isLoading ? (
                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                'Access Dashboard'
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-700/50 flex flex-col space-y-4">
             <button
                onClick={() => setViewMode('register')}
                className="text-sm font-medium text-slate-400 hover:text-indigo-400 transition-colors"
             >
               Don't have an account? <span className="text-white hover:underline">Register</span>
             </button>
             <button
               onClick={attemptAdminLogin}
               className="text-[10px] text-slate-600 uppercase tracking-widest hover:text-slate-400 transition-colors opacity-50 hover:opacity-100"
               title="Click to open admin prompt"
             >
               [ Admin Portal ]
             </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
