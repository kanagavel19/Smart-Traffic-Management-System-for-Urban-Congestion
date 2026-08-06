import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { GlassCard } from '../common/GlassCard';
import { Lock, Mail, Users, ArrowLeft } from 'lucide-react';

interface LoginPageProps {
  onBack: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onBack }) => {
  const { login, switchRole } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');
    try {
      await login(email, password);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Login failed. Please check credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Preset switch login
  const handleDemoLogin = (role: 'Administrator' | 'Traffic Officer' | 'Citizen') => {
    setIsSubmitting(true);
    let matchedEmail = 'citizen@traffic.gov';
    let matchedPwd = 'citizenpassword';
    if (role === 'Administrator') {
      matchedEmail = 'admin@traffic.gov';
      matchedPwd = 'adminpassword';
    } else if (role === 'Traffic Officer') {
      matchedEmail = 'officer@traffic.gov';
      matchedPwd = 'officerpassword';
    }
    
    setEmail(matchedEmail);
    setPassword(matchedPwd);

    setTimeout(async () => {
      try {
        await login(matchedEmail, matchedPwd);
      } catch (err) {
        // Force offline helper
        switchRole(role);
      } finally {
        setIsSubmitting(false);
      }
    }, 450);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-slate-950 p-6">
      {/* Background orbs */}
      <div className="absolute top-1/4 left-1/4 -z-10 h-[400px] w-[400px] rounded-full bg-blue-500/5 blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/4 -z-10 h-[400px] w-[400px] rounded-full bg-emerald-500/5 blur-[120px]" />

      <div className="w-full max-w-md">
        {/* Back link */}
        <button 
          onClick={onBack}
          className="flex items-center space-x-2 text-slate-400 hover:text-white transition-all text-xs font-semibold mb-6 uppercase tracking-wider cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Exit to Portal Home</span>
        </button>

        <GlassCard className="relative overflow-hidden border-blue-500/10">
          <div className="text-center mb-8">
            <span className="text-3xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-emerald-400 to-indigo-400">
              METROPULSE
            </span>
            <h2 className="text-xl font-bold text-white mt-3">Access Control Login</h2>
            <p className="text-xs text-slate-500 mt-1">Connect to the Intelligent Core Signal Matrix</p>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-lg text-xs font-medium text-center">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-400 flex items-center">
                <Mail className="h-3.5 w-3.5 mr-1 text-slate-500" />
                Email Address
              </label>
              <input 
                type="email" 
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full mt-1.5 p-3 rounded-lg border border-slate-800 bg-slate-900/60 text-white text-sm focus:outline-none focus:border-blue-500" 
                placeholder="developer@city.gov"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 flex items-center">
                <Lock className="h-3.5 w-3.5 mr-1 text-slate-500" />
                Password
              </label>
              <input 
                type="password" 
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full mt-1.5 p-3 rounded-lg border border-slate-800 bg-slate-900/60 text-white text-sm focus:outline-none focus:border-blue-500" 
                placeholder="••••••••"
              />
            </div>
            
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800/50 text-white font-bold rounded-lg transition-all active:scale-95 cursor-pointer shadow-lg shadow-blue-500/15"
            >
              {isSubmitting ? 'Verifying Gateway...' : 'Authorized Connect'}
            </button>
          </form>

          {/* Quick Sandbox Override Presets */}
          <div className="mt-8 pt-6 border-t border-slate-800">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest block text-center mb-4 flex items-center justify-center">
              <Users className="h-3.5 w-3.5 mr-1.5" />
              Developer Bypass Login Logs
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleDemoLogin('Administrator')}
                className="py-2.5 px-1 bg-blue-900/20 hover:bg-blue-900/40 text-blue-400 border border-blue-500/20 rounded-lg text-[10px] font-bold transition-all uppercase tracking-wider text-center cursor-pointer"
              >
                Admin
              </button>
              <button
                onClick={() => handleDemoLogin('Traffic Officer')}
                className="py-2.5 px-1 bg-amber-900/20 hover:bg-amber-900/40 text-amber-400 border border-amber-500/20 rounded-lg text-[10px] font-bold transition-all uppercase tracking-wider text-center cursor-pointer"
              >
                Officer
              </button>
              <button
                onClick={() => handleDemoLogin('Citizen')}
                className="py-2.5 px-1 bg-emerald-900/20 hover:bg-emerald-900/40 text-emerald-400 border border-emerald-500/20 rounded-lg text-[10px] font-bold transition-all uppercase tracking-wider text-center cursor-pointer"
              >
                Citizen
              </button>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
