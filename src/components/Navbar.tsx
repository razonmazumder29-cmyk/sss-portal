import React from 'react';
import { 
  Building2, 
  CalendarHeart, 
  Users, 
  Droplet, 
  BarChart3, 
  Settings, 
  Moon, 
  Sun, 
  Globe, 
  Lock, 
  Unlock,
  ShieldCheck,
  RefreshCw,
  Cloud,
  CloudOff,
  AlertTriangle,
  UserCheck,
  LogOut
} from 'lucide-react';
import { translations } from '../translations';
import { formatDate, toBengaliNumber } from '../utils/dateCalculations';
import { AdminUser, CloudSyncStatus } from '../types';
import { SssLogo } from './SssLogo';

interface NavbarProps {
  activeTab: 'home' | 'directory' | 'blood' | 'dashboard' | 'settings';
  setActiveTab: (tab: 'home' | 'directory' | 'blood' | 'dashboard' | 'settings') => void;
  language: 'bn' | 'en';
  setLanguage: (lang: 'bn' | 'en') => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  currentUser: AdminUser;
  onOpenAdminLogin: () => void;
  onLogout: () => void;
  todayMilestoneCount: number;
  dueForTransferCount: number;
  cloudStatus: CloudSyncStatus;
  onForceSync: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  language,
  setLanguage,
  theme,
  setTheme,
  currentUser,
  onOpenAdminLogin,
  onLogout,
  todayMilestoneCount,
  dueForTransferCount,
  cloudStatus,
  onForceSync
}) => {
  const t = translations[language];
  const todayStr = new Date().toISOString().slice(0, 10);
  const formattedToday = formatDate(todayStr, language);
  const isSuperAdmin = currentUser.role === 'Super Admin';

  interface NavItem {
    id: 'home' | 'directory' | 'blood' | 'dashboard' | 'settings';
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number | null;
    alertBadge?: number | null;
  }

  const navItems: NavItem[] = [
    { 
      id: 'home', 
      label: t.tabHome, 
      icon: CalendarHeart, 
      badge: todayMilestoneCount > 0 ? todayMilestoneCount : null 
    },
    { 
      id: 'directory', 
      label: t.tabEmployees, 
      icon: Users,
      alertBadge: dueForTransferCount > 0 ? dueForTransferCount : null
    },
    { 
      id: 'blood', 
      label: t.tabBloodBank, 
      icon: Droplet 
    },
    { 
      id: 'dashboard', 
      label: t.tabDashboard, 
      icon: BarChart3,
      alertBadge: dueForTransferCount > 0 ? dueForTransferCount : null
    },
    { 
      id: 'settings', 
      label: t.tabSettings, 
      icon: Settings 
    }
  ];

  const handleToggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors shadow-xs no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Header Row */}
        <div className="flex items-center justify-between py-2.5 border-b border-slate-100 dark:border-slate-800/80 gap-3">
          {/* Brand & Organization Title */}
          <div className="flex items-center gap-3">
            <SssLogo size="md" />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white leading-tight">
                  {t.orgName}
                </h1>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  {t.zoneTitle}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 hidden md:block">
                {t.tagline} • <span className="font-semibold text-emerald-600 dark:text-emerald-400">{formattedToday}</span>
              </p>
            </div>
          </div>

          {/* Quick Controls: Cloud Status, Sync, Lang, Theme, User Access */}
          <div className="flex items-center gap-2 flex-wrap justify-end">
            {/* Real-time Cloud Connection Indicator */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={onForceSync}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                  cloudStatus === 'connected'
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                    : cloudStatus === 'syncing'
                    ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-800 animate-pulse'
                    : 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                }`}
                title="রিয়েল-টাইম কেন্দ্রীয় ক্লাউড ডাটাবেজ স্ট্যাটাস (ক্লিক করে সিঙ্ক করুন)"
              >
                <span className={`w-2 h-2 rounded-full ${
                  cloudStatus === 'connected' 
                    ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' 
                    : cloudStatus === 'syncing' 
                    ? 'bg-blue-500 animate-ping' 
                    : 'bg-amber-500'
                }`} />
                <span className="hidden sm:inline font-mono text-[11px]">
                  {cloudStatus === 'connected' 
                    ? (language === 'bn' ? 'ক্লাউড লাইভ' : 'Cloud Live') 
                    : cloudStatus === 'syncing' 
                    ? (language === 'bn' ? 'সিঙ্ক হচ্ছে...' : 'Syncing...') 
                    : (language === 'bn' ? 'অফলাইন ক্যাশ' : 'Offline Cache')}
                </span>
                <RefreshCw className={`w-3 h-3 ${cloudStatus === 'syncing' ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {/* Language Switcher */}
            <button
              onClick={() => setLanguage(language === 'bn' ? 'en' : 'bn')}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer"
              title="Change Language / ভাষা পরিবর্তন"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{language === 'bn' ? 'বাংলা' : 'English'}</span>
            </button>

            {/* Dark / Light Mode Switcher */}
            <button
              onClick={handleToggleTheme}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer"
              aria-label="Toggle Theme"
              title={theme === 'light' ? 'ডার্ক মোড (Dark Mode)' : 'লাইট মোড (Light Mode)'}
            >
              {theme === 'light' ? (
                <Moon className="w-3.5 h-3.5 text-slate-700" />
              ) : (
                <Sun className="w-3.5 h-3.5 text-amber-400" />
              )}
            </button>

            {/* User Role & Login Badge */}
            {isSuperAdmin ? (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={onOpenAdminLogin}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-purple-50 text-purple-900 dark:bg-purple-950/80 dark:text-purple-200 border border-purple-300 dark:border-purple-800 text-xs font-bold hover:bg-purple-100 transition cursor-pointer"
                  title="লগইনকৃত Super Admin একাউন্ট"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                  <span className="hidden md:inline max-w-[110px] truncate">{currentUser.fullName}</span>
                  <span className="px-1.5 py-0.2 rounded-md bg-purple-600 text-white text-[10px] uppercase font-bold tracking-wide">
                    Super Admin
                  </span>
                </button>
                <button
                  onClick={onLogout}
                  className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition cursor-pointer"
                  title="লগআউট করুন"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAdminLogin}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-200 text-xs font-bold hover:bg-amber-100 transition cursor-pointer"
                title="Super Admin হিসেবে লগইন করুন (ট্রান্সফার ও এডিটের জন্য)"
              >
                <Lock className="w-3.5 h-3.5 text-amber-600" />
                <span>Super Admin লগইন</span>
              </button>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2 scrollbar-none" aria-label="Tabs">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`} />
                <span>{item.label}</span>

                {/* Milestone Badge */}
                {item.badge && item.badge > 0 && (
                  <span
                    className={`ml-1 text-[11px] font-mono-num font-extrabold px-1.5 py-0.2 rounded-full ${
                      isActive
                        ? 'bg-white text-emerald-800'
                        : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    }`}
                  >
                    {language === 'bn' ? toBengaliNumber(item.badge) : item.badge}
                  </span>
                )}

                {/* Due for Transfer Alert Badge (Red Alert) */}
                {item.alertBadge && item.alertBadge > 0 && (
                  <span
                    className="ml-1 text-[10px] font-mono-num font-black px-1.5 py-0.2 rounded-full bg-red-600 text-white animate-pulse"
                    title={`Due for Transfer: ${item.alertBadge} জন কর্মীর ৩ বছর অতিক্রান্ত`}
                  >
                    {language === 'bn' ? `${toBengaliNumber(item.alertBadge)} বদলি` : `${item.alertBadge} Due`}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
