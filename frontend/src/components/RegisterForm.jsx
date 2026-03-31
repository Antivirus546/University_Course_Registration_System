import { useState } from 'react';
import { api } from '../api';
import toast from 'react-hot-toast';
import { UserPlus, ArrowLeft } from 'lucide-react';

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

export default function RegisterForm({ onCancel }) {
  const [formData, setFormData] = useState({ id: '', name: '', branchName: BRANCHES[0], semester: 1 });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.id || !formData.name) {
      toast.error('Please fill out all required fields');
      return;
    }
    try {
      setIsLoading(true);
      await api.register(formData.id, formData.name, formData.branchName, formData.semester);
      toast.success('Registration successful! You may now login.', { icon: '🎓' });
      onCancel(); // return to login
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-slate-800/80 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-slate-700/80 w-full max-w-md relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center mb-6">
        <div className="bg-indigo-500/10 w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-indigo-500/20 shadow-inner group">
          <UserPlus className="w-6 h-6 text-indigo-400 group-hover:text-indigo-300 transition-colors" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-white mb-1">Create Account</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-slate-400 mb-1">Full Name</label>
          <input
            type="text"
            className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-700/80 rounded-xl focus:ring-2 focus:ring-indigo-500/80 focus:border-indigo-500/60 transition-all text-slate-200 text-sm"
            required
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            placeholder="John Doe"
          />
        </div>

        <div>
           <label className="block text-sm font-semibold text-slate-400 mb-1">Student ID</label>
           <input
             type="text"
             className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-700/80 rounded-xl focus:ring-2 focus:ring-indigo-500/80 focus:border-indigo-500/60 transition-all text-slate-200 text-sm uppercase"
             required
             value={formData.id}
             onChange={(e) => setFormData({...formData, id: e.target.value})}
             placeholder="e.g. S001"
           />
        </div>

        <div>
           <label className="block text-sm font-semibold text-slate-400 mb-1">Branch</label>
           <select
             className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-700/80 rounded-xl focus:ring-2 focus:ring-indigo-500/80 focus:border-indigo-500/60 transition-all text-slate-200 text-sm"
             value={formData.branchName}
             onChange={(e) => setFormData({...formData, branchName: e.target.value})}
           >
             {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
           </select>
        </div>

        <div>
           <label className="block text-sm font-semibold text-slate-400 mb-1">Current Semester (1-8)</label>
           <input
             type="number"
             min="1" max="8"
             className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-700/80 rounded-xl focus:ring-2 focus:ring-indigo-500/80 focus:border-indigo-500/60 transition-all text-slate-200 text-sm"
             required
             value={formData.semester}
             onChange={(e) => setFormData({...formData, semester: parseInt(e.target.value)})}
           />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg shadow-indigo-600/30 focus:outline-none focus:ring-2 focus:ring-indigo-500 mt-2"
        >
          {isLoading ? 'Registering...' : 'Complete Registration'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <button onClick={onCancel} className="text-sm font-medium text-slate-400 hover:text-indigo-400 transition-colors flex items-center justify-center w-full">
           <ArrowLeft className="w-4 h-4 mr-1" /> Back to Login
        </button>
      </div>
    </div>
  );
}
