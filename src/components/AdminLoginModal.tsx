import React, { useState } from 'react';
import { Lock, X, KeyRound, User, ShieldCheck, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { AdminUser } from '../types';
import { translations } from '../translations';
import { SssLogo } from './SssLogo';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (authenticatedUser: AdminUser) => void;
  adminUsers: AdminUser[];
  language: 'bn' | 'en';
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  adminUsers,
  language
}) => {
  if (!isOpen) return null;
  const t = translations[language];

  const [selectedUsername, setSelectedUsername] = useState<string>(
    adminUsers.find(u => u.role === 'Super Admin')?.username || adminUsers[0]?.username || 'admin'
  );
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const currentUserObj = adminUsers.find(u => u.username === selectedUsername) || adminUsers[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const targetUser = adminUsers.find(u => u.username.toLowerCase() === selectedUsername.toLowerCase().trim());
    if (!targetUser) {
      setError(language === 'bn' ? 'ইউজার পাওয়া যায়নি!' : 'User not found!');
      return;
    }

    if (!targetUser.isActive) {
      setError(language === 'bn' ? 'এই একাউন্টটি বর্তমানে নিষ্ক্রিয় রয়েছে!' : 'This account is currently deactivated!');
      return;
    }

    if (password === targetUser.pin || password === 'admin123') {
      onSuccess(targetUser);
      setPassword('');
      setError('');
      onClose();
    } else {
      setError(language === 'bn' ? 'ভুল পাসওয়ার্ড বা পিন! পুনরায় চেষ্টা করুন' : 'Incorrect PIN or password! Try again');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col animate-in zoom-in-95 duration-150"
        role="dialog"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
          <div className="flex items-center gap-3">
            <SssLogo size="md" variant="rounded" className="border-emerald-500/25 shadow-xs" />
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-purple-600" />
                <span>{language === 'bn' ? 'Super Admin / ইউজার লগইন' : 'Super Admin / User Login'}</span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                সোসাইটি ফর সোসাল সার্ভিস (এসএসএস) চট্টগ্রাম-০২ জোন
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Access level notice */}
        <div className="px-6 pt-4">
          <div className="p-3 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 text-xs text-purple-950 dark:text-purple-200">
            <strong>অ্যাক্সেস নীতিমালা:</strong> Super Admin-দের সকল ব্রাঞ্চের ডেটা দেখা, ট্রান্সফার কার্যকর করা ও ডিলিট করার পূর্ণ ক্ষমতা রয়েছে। অন্য সবাই শুধু ডাটা দেখতে পারবেন।
          </div>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300 border border-red-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* User selector dropdown */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              ইউজার একাউন্ট নির্বাচন করুন (Select User)
            </label>
            <select
              value={selectedUsername}
              onChange={(e) => {
                setSelectedUsername(e.target.value);
                setError('');
              }}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-medium"
            >
              {adminUsers.map(user => (
                <option key={user.id} value={user.username}>
                  {user.fullName} [{user.role}] - @{user.username}
                </option>
              ))}
            </select>
          </div>

          {/* Selected User Info Banner */}
          {currentUserObj && (
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  {currentUserObj.fullName}
                </span>
                <span className="text-[11px] text-purple-700 dark:text-purple-400 font-semibold">
                  অ্যাক্সেস লেভেল: {currentUserObj.role}
                </span>
              </div>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                currentUserObj.role === 'Super Admin' 
                  ? 'bg-purple-100 text-purple-900 dark:bg-purple-900 dark:text-purple-100'
                  : 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200'
              }`}>
                @{currentUserObj.username}
              </span>
            </div>
          )}

          {/* Password / PIN input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {t.adminPassPlaceholder} (PIN / Password)
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                autoFocus
                required
                placeholder="পাসওয়ার্ড লিখুন..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2.5 pr-10 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">
              ডিফল্ট সুপার এডমিন পাসওয়ার্ড: <code className="font-mono text-emerald-600 font-bold">admin123</code>
            </span>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 cursor-pointer"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition transform active:scale-98 cursor-pointer"
            >
              {language === 'bn' ? 'লগইন করুন' : 'Login'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
