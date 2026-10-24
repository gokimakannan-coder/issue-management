import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Eye, EyeOff, Lock, Mail, ArrowRight, UserCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import { Button } from '../components/ui/Button';
import { toast } from 'sonner';

export const LoginPage: React.FC = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [demoAccounts, setDemoAccounts] = useState<Array<{ id: string; email: string; name: string; role: string }>>([]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
    // Fetch demo accounts
    authService.getDemoAccounts().then(setDemoAccounts).catch(console.error);
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter both email and password');
      return;
    }

    try {
      setIsLoading(true);
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Invalid login credentials');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = async (accEmail: string) => {
    setEmail(accEmail);
    setPassword('password123');
    try {
      setIsLoading(true);
      await login(accEmail, 'password123');
      toast.success(`Logged in as ${accEmail}`);
      navigate('/');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Quick login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600 mx-auto flex items-center justify-center text-white shadow-lg shadow-indigo-200">
          <ShieldCheck className="w-7 h-7" />
        </div>
        <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
          IssueFlow Enterprise
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Centralized Issue Tracking & SLA Management
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-2xl border border-slate-200/80 shadow-xl shadow-slate-100">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Work Email
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full mt-2"
              size="lg"
              isLoading={isLoading}
              icon={<ArrowRight className="w-4 h-4" />}
            >
              Sign In
            </Button>
          </form>

          {/* Quick Demo Switcher Section */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider text-center mb-3">
              Fast Demo Switcher
            </p>
            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@issueflow.com')}
                className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/30 text-left transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <UserCircle2 className="w-4 h-4 text-indigo-600" />
                  <div>
                    <span className="text-xs font-semibold text-slate-800 block">Alex Morgan</span>
                    <span className="text-[11px] text-slate-400">admin@issueflow.com</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                  ADMIN
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('manager@issueflow.com')}
                className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/30 text-left transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <UserCircle2 className="w-4 h-4 text-emerald-600" />
                  <div>
                    <span className="text-xs font-semibold text-slate-800 block">Sarah Chen</span>
                    <span className="text-[11px] text-slate-400">manager@issueflow.com</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">
                  MANAGER
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('john@issueflow.com')}
                className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/30 text-left transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <UserCircle2 className="w-4 h-4 text-blue-600" />
                  <div>
                    <span className="text-xs font-semibold text-slate-800 block">John Doe</span>
                    <span className="text-[11px] text-slate-400">john@issueflow.com</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                  EMPLOYEE
                </span>
              </button>
            </div>
            <p className="mt-2 text-[11px] text-slate-400 text-center">
              Password for all accounts is: <span className="font-mono text-slate-600">password123</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
