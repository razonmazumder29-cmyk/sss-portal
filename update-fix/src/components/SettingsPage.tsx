import React, { useState, useRef, useMemo } from 'react';
import { 
  Settings, 
  MapPin, 
  Building2, 
  Briefcase, 
  Mail, 
  KeyRound, 
  Plus, 
  Trash2, 
  Download, 
  Upload, 
  CheckCircle,
  FileSpreadsheet,
  RotateCcw,
  Users,
  ShieldCheck,
  Copy,
  ClipboardCheck,
  UserPlus,
  Eye,
  EyeOff,
  AlertCircle,
  Lock
} from 'lucide-react';
import { BranchItem, SettingsConfig, AdminUser } from '../types';
import { translations } from '../translations';
import { StorageService } from '../utils/storage';
import { downloadJsonFile } from '../utils/exportImport';
import { toBengaliNumber } from '../utils/dateCalculations';

interface SettingsPageProps {
  areas: string[];
  setAreas: (areas: string[]) => void;
  branches: BranchItem[];
  setBranches: (branches: BranchItem[]) => void;
  designations: string[];
  setDesignations: (designations: string[]) => void;
  settings: SettingsConfig;
  setSettings: (settings: SettingsConfig) => void;
  adminUsers: AdminUser[];
  onSaveAdminUser: (user: AdminUser) => Promise<void>;
  onDeleteAdminUser: (userId: string, username: string) => Promise<void>;
  onSaveSettings: (settings: SettingsConfig) => Promise<void>;
  onSaveMetadata: (meta: { areas?: string[]; branches?: BranchItem[]; designations?: string[] }) => Promise<void>;
  currentUser: AdminUser;
  language: 'bn' | 'en';
  isSuperAdmin: boolean;
  onOpenLogin: () => void;
  onRestoreBackup: (jsonStr: string) => void;
  onResetDefaults: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  areas,
  setAreas,
  branches,
  setBranches,
  designations,
  setDesignations,
  settings,
  setSettings,
  adminUsers,
  onSaveAdminUser,
  onDeleteAdminUser,
  onSaveSettings,
  onSaveMetadata,
  currentUser,
  language,
  isSuperAdmin,
  onOpenLogin,
  onRestoreBackup,
  onResetDefaults
}) => {
  const t = translations[language];

  const [activeTab, setActiveTab] = useState<'emails' | 'users' | 'org' | 'backup'>('emails');

  // Email state
  const [singleEmail, setSingleEmail] = useState('');
  const [bulkEmailText, setBulkEmailText] = useState('');
  const [emailCopiedToast, setEmailCopiedToast] = useState(false);
  const [emailSearch, setEmailSearch] = useState('');

  // Admin users state
  const [newUserName, setNewUserName] = useState('');
  const [newUserFullName, setNewUserFullName] = useState('');
  const [newUserRole, setNewUserRole] = useState<AdminUser['role']>('Super Admin');
  const [newUserPin, setNewUserPin] = useState('');
  const [userMsg, setUserMsg] = useState('');
  const [showPins, setShowPins] = useState<Record<string, boolean>>({});

  // Areas & Branches
  const [newArea, setNewArea] = useState('');
  const [newBranchName, setNewBranchName] = useState('');
  const [newBranchArea, setNewBranchArea] = useState(areas[0] || '');
  const [newBranchCode, setNewBranchCode] = useState('');
  const [newDesignation, setNewDesignation] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Parse bulk emails
  const detectedEmails = useMemo(() => {
    if (!bulkEmailText.trim()) return [];
    const matches = bulkEmailText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [];
    const unique = Array.from(new Set(matches.map(m => m.trim().toLowerCase())));
    const existingSet = new Set(settings.zoneEmailList.map(e => e.toLowerCase()));
    
    return unique.map(email => ({
      email,
      isNew: !existingSet.has(email)
    }));
  }, [bulkEmailText, settings.zoneEmailList]);

  const newDetectedCount = detectedEmails.filter(e => e.isNew).length;

  // If not super admin, show security barrier
  if (!isSuperAdmin) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-12 text-center max-w-xl mx-auto space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto shadow-xs">
          <Lock className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          {language === 'bn' ? 'সিস্টেম সেটিংস Super Admin সংরক্ষিত' : 'System Settings Restricted'}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          {language === 'bn' 
            ? 'জোনাল ইমেইল ডিরেক্টরি, কর্মী বদলি ব্যবস্থাপনা ও এডমিন ইউজার একাউন্ট পরিবর্তনের জন্য Super Admin হিসেবে লগইন আবশ্যক।'
            : 'Super Admin credentials are required to modify settings, manage user accounts, or alter structure.'}
        </p>
        <button
          type="button"
          onClick={onOpenLogin}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md transition transform active:scale-98 cursor-pointer"
        >
          <KeyRound className="w-4 h-4" />
          <span>{language === 'bn' ? 'Super Admin লগইন করুন' : 'Login as Super Admin'}</span>
        </button>
      </div>
    );
  }

  // Handle Bulk Email Add
  const handleBulkAddEmails = async () => {
    const toAdd = detectedEmails.filter(e => e.isNew).map(e => e.email);
    if (toAdd.length === 0) return;
    const updated = {
      ...settings,
      zoneEmailList: [...settings.zoneEmailList, ...toAdd]
    };
    setSettings(updated);
    await onSaveSettings(updated);
    setBulkEmailText('');
  };

  const handleAddSingleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = singleEmail.trim().toLowerCase();
    if (!clean || !clean.includes('@')) return;
    if (settings.zoneEmailList.map(e => e.toLowerCase()).includes(clean)) return;
    const updated = {
      ...settings,
      zoneEmailList: [...settings.zoneEmailList, clean]
    };
    setSettings(updated);
    await onSaveSettings(updated);
    setSingleEmail('');
  };

  const handleRemoveEmail = async (emailToRemove: string) => {
    if (settings.zoneEmailList.length <= 1) return;
    const updated = {
      ...settings,
      zoneEmailList: settings.zoneEmailList.filter(e => e !== emailToRemove)
    };
    setSettings(updated);
    await onSaveSettings(updated);
  };

  const handleCopyAllEmails = () => {
    const all = settings.zoneEmailList.join(', ');
    navigator.clipboard.writeText(all);
    setEmailCopiedToast(true);
    setTimeout(() => setEmailCopiedToast(false), 2500);
  };

  // Add Admin User (Super Admin or Viewer)
  const handleAddAdminUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserFullName.trim() || !newUserPin.trim()) {
      setUserMsg('সকল প্রয়োজনীয় ঘর পূরণ করুন');
      return;
    }
    const cleanUsername = newUserName.trim().toLowerCase();
    if (adminUsers.some(u => u.username.toLowerCase() === cleanUsername)) {
      setUserMsg('এই ইউজারনেম ইতোমধ্যে ব্যবহৃত হয়েছে!');
      return;
    }
    const newUser: AdminUser = {
      id: 'usr-' + Date.now(),
      username: cleanUsername,
      fullName: newUserFullName.trim(),
      role: newUserRole,
      pin: newUserPin.trim(),
      isActive: true,
      lastLogin: new Date().toISOString()
    };
    await onSaveAdminUser(newUser);
    setNewUserName('');
    setNewUserFullName('');
    setNewUserPin('');
    setUserMsg('নতুন ইউজার সফলভাবে তৈরি হয়েছে এবং ক্লাউড ডাটাবেজে সংরক্ষিত হয়েছে!');
    setTimeout(() => setUserMsg(''), 3000);
  };

  const handleToggleUserActive = async (user: AdminUser) => {
    if (user.id === 'user-1' || user.username === 'admin') return;
    const updatedUser = { ...user, isActive: !user.isActive };
    await onSaveAdminUser(updatedUser);
  };

  const handleDeleteUser = async (userId: string, username: string) => {
    if (userId === 'user-1' || username === 'admin') {
      alert('মূল এডমিন একাউন্ট ডিলিট করা যাবে না');
      return;
    }
    if (window.confirm(`আপনি কি নিশ্চিতভাবে "${username}" একাউন্টটি ডিলিট করতে চান?`)) {
      await onDeleteAdminUser(userId, username);
    }
  };

  // Add Area
  const handleAddArea = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newArea.trim()) return;
    if (areas.includes(newArea.trim())) return;
    const updated = [...areas, newArea.trim()];
    setAreas(updated);
    await onSaveMetadata({ areas: updated });
    setNewArea('');
  };

  const handleRemoveArea = async (areaToRemove: string) => {
    if (areas.length <= 1) return;
    const updated = areas.filter(a => a !== areaToRemove);
    setAreas(updated);
    await onSaveMetadata({ areas: updated });
  };

  // Add Branch
  const handleAddBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBranchName.trim()) return;
    const newBr: BranchItem = {
      id: 'br-' + Date.now(),
      name: newBranchName.trim(),
      area: newBranchArea || areas[0],
      // কোড ফাঁকা থাকলে ঘরটিই বাদ যাবে (undefined পাঠালে ক্লাউডে সেভ ব্যর্থ হতো)
      ...(newBranchCode.trim() ? { code: newBranchCode.trim() } : {})
    };
    const updated = [...branches, newBr];
    setBranches(updated);
    await onSaveMetadata({ branches: updated });
    setNewBranchName('');
    setNewBranchCode('');
  };

  const handleRemoveBranch = async (id: string) => {
    if (branches.length <= 1) return;
    const updated = branches.filter(b => b.id !== id);
    setBranches(updated);
    await onSaveMetadata({ branches: updated });
  };

  // Add Designation
  const handleAddDesignation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDesignation.trim()) return;
    if (designations.includes(newDesignation.trim())) return;
    const updated = [...designations, newDesignation.trim()];
    setDesignations(updated);
    await onSaveMetadata({ designations: updated });
    setNewDesignation('');
  };

  const handleRemoveDesignation = async (dToRemove: string) => {
    if (designations.length <= 1) return;
    const updated = designations.filter(d => d !== dToRemove);
    setDesignations(updated);
    await onSaveMetadata({ designations: updated });
  };

  const handleDownloadBackup = () => {
    const jsonStr = StorageService.createFullBackupJson();
    const dateStr = new Date().toISOString().slice(0, 10);
    downloadJsonFile(`SSS_Chattogram02_Full_Backup_${dateStr}.json`, jsonStr);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        onRestoreBackup(content);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-6">
      {/* Settings Top Header */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span>{t.settingsTitle}</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {language === 'bn' 
              ? 'জোনাল ইমেইল ডিরেক্টরি, একাধিক Super Admin ব্যবস্থাপনা, এলাকা-ব্রাঞ্চ কাঠামো ও ক্লাউড ডাটাবেজ ব্যাকআপ'
              : 'Zone email directory, multi-user accounts, branch structure, and backup control'}
          </p>
        </div>

        {/* Sub-tabs switch */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-x-auto">
          <button
            onClick={() => setActiveTab('emails')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'emails'
                ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>ইমেইল ডিরেক্টরি ({settings.zoneEmailList.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'users'
                ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>ইউজার একাউন্টস ({adminUsers.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('org')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'org'
                ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>এরিয়া ও শাখা কাঠামো</span>
          </button>
          <button
            onClick={() => setActiveTab('backup')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'backup'
                ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>ব্যাকআপ ও রিস্টোর</span>
          </button>
        </div>
      </div>

      {/* ================= 1. BULK EMAIL DIRECTORY TAB ================= */}
      {activeTab === 'emails' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 flex-wrap gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    একসাথে একাধিক ইমেইল পেস্ট করে যুক্ত করুন (Bulk Paste Emails)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    যেকোনো টেক্সট বা তালিকা পেস্ট করুন, সিস্টেম স্বয়ংক্রিয়ভাবে ইমেইলগুলো শনাক্ত করবে
                  </p>
                </div>
              </div>
              {detectedEmails.length > 0 && (
                <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-semibold font-mono-num">
                  {toBengaliNumber(newDetectedCount)} নতুন ইমেইল শনাক্ত
                </span>
              )}
            </div>

            <div className="space-y-2">
              <textarea
                rows={4}
                value={bulkEmailText}
                onChange={(e) => setBulkEmailText(e.target.value)}
                placeholder="এখানে ইমেইল পেস্ট করুন...&#10;যেমন: panchlaish@sss.org.bd, hathazari@sss.org.bd, patiya@sss.org.bd বা যেকোনো ফরম্যাট..."
                className="w-full p-3.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-mono"
              />
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {detectedEmails.length > 0 ? (
                    <span>
                      মোট শনাক্ত: <strong className="text-slate-900 dark:text-white">{detectedEmails.length}</strong> 
                      (নতুন: <strong className="text-emerald-600">{newDetectedCount}</strong>, 
                      ইতোমধ্যে বিদ্যমান: <strong className="text-slate-400">{detectedEmails.length - newDetectedCount}</strong>)
                    </span>
                  ) : (
                    <span>কমা (,) বা স্পেস বা নতুন লাইনে সাজিয়ে পেস্ট করুন</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {bulkEmailText && (
                    <button
                      type="button"
                      onClick={() => setBulkEmailText('')}
                      className="px-3 py-2 rounded-xl text-xs text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                    >
                      মুছে ফেলুন
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={newDetectedCount === 0}
                    onClick={handleBulkAddEmails}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white shadow-xs transition cursor-pointer ${
                      newDetectedCount > 0
                        ? 'bg-emerald-600 hover:bg-emerald-700 active:scale-98'
                        : 'bg-slate-400 opacity-60 cursor-not-allowed'
                    }`}
                  >
                    <Plus className="w-4 h-4" />
                    <span>যুক্ত করুন (+{toBengaliNumber(newDetectedCount)} টি)</span>
                  </button>
                </div>
              </div>
            </div>

            <form onSubmit={handleAddSingleEmail} className="pt-3 border-t border-slate-100 dark:border-slate-800 flex gap-2">
              <input
                type="email"
                placeholder="একটি একক ইমেইল ঠিকানা লিখুন..."
                value={singleEmail}
                onChange={(e) => setSingleEmail(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-semibold hover:bg-slate-800 transition cursor-pointer shrink-0"
              >
                যুক্ত করুন
              </button>
            </form>
          </div>

          {/* Current Email List Box */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  বর্তমান সক্রিয় জোনাল ইমেইল ডিরেক্টরি
                </h3>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono-num font-bold">
                  {toBengaliNumber(settings.zoneEmailList.length)} টি
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="ইমেইল ফিল্টার করুন..."
                  value={emailSearch}
                  onChange={(e) => setEmailSearch(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200"
                />
                <button
                  type="button"
                  onClick={handleCopyAllEmails}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer"
                  title="সবগুলো ইমেইল কপি করুন"
                >
                  {emailCopiedToast ? (
                    <>
                      <ClipboardCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-600 font-bold">কপি হয়েছে!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-500" />
                      <span>সব কপি করুন</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-80 overflow-y-auto pr-1">
              {settings.zoneEmailList
                .filter(email => !emailSearch || email.toLowerCase().includes(emailSearch.toLowerCase()))
                .map((email, i) => (
                  <div 
                    key={i} 
                    className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 group hover:border-emerald-300 transition"
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <span className="text-[11px] font-mono text-slate-400 w-5">{i + 1}.</span>
                      <span className="text-xs font-mono text-slate-800 dark:text-slate-200 truncate select-all">
                        {email}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveEmail(email)}
                      className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/60 transition cursor-pointer"
                      title="মুছে ফেলুন"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* ================= 2. MULTI-USER ADMIN MANAGEMENT TAB ================= */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          {/* Add New Admin User Form */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    নতুন ইউজার / Super Admin তৈরি করুন
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    একাধিক ব্যক্তিকে Super Admin বা Viewer হিসেবে অ্যাক্সেস প্রদান করুন
                  </p>
                </div>
              </div>
            </div>

            {userMsg && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 text-xs font-semibold">
                {userMsg}
              </div>
            )}

            <form onSubmit={handleAddAdminUser} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  পুরো নাম (Full Name) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: মো. কামরুল হাসান"
                  value={newUserFullName}
                  onChange={(e) => setNewUserFullName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  ইউজারনেম (Username) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: kamrul_ctg"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white font-mono focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  অ্যাক্সেস লেভেল (Role) *
                </label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as AdminUser['role'])}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-bold"
                >
                  <option value="Super Admin">Super Admin (সম্পূর্ণ নিয়ন্ত্রণ ও বদলি ক্ষমতা)</option>
                  <option value="Viewer">Viewer (শুধুমাত্র ডাটা দেখার অনুমতি)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  পাসওয়ার্ড / পিন (PIN) *
                </label>
                <div className="flex gap-2">
                  <input
                    type="password"
                    required
                    placeholder="পাসওয়ার্ড লিখুন..."
                    value={newUserPin}
                    onChange={(e) => setNewUserPin(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white font-mono focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs transition cursor-pointer shrink-0"
                  >
                    তৈরি করুন
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Current Admin Users Roster Table */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  কেন্দ্রীয় ক্লাউড ডাটাবেজে সংরক্ষিত ইউজার তালিকা
                </h3>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 font-mono-num font-bold">
                  {toBengaliNumber(adminUsers.length)} জন
                </span>
              </div>
              <span className="text-xs text-slate-400">
                সকল কম্পিউটার ও মোবাইল থেকে এই ইউজাররা লগইন করতে পারবেন
              </span>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 font-bold uppercase text-[11px]">
                  <tr>
                    <th className="py-3 px-4">ইউজারের নাম</th>
                    <th className="py-3 px-4">ইউজারনেম</th>
                    <th className="py-3 px-4">অ্যাক্সেস লেভেল</th>
                    <th className="py-3 px-4">পাসওয়ার্ড / পিন</th>
                    <th className="py-3 px-4 text-center">অবস্থা</th>
                    <th className="py-3 px-4 text-center">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                  {adminUsers.map((user) => {
                    const isVisible = showPins[user.id] || false;
                    const isMaster = user.username === 'admin';
                    const isSuper = user.role === 'Super Admin';

                    return (
                      <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                          <div className="flex items-center gap-2">
                            <span>{user.fullName}</span>
                            {currentUser.id === user.id && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-semibold">
                                আপনি (Logged In)
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono font-semibold text-slate-700 dark:text-slate-300">
                          @{user.username}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            isSuper
                              ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                              : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono">
                          <div className="flex items-center gap-2">
                            <span>{isVisible ? user.pin : '••••••••'}</span>
                            <button
                              type="button"
                              onClick={() => setShowPins(prev => ({ ...prev, [user.id]: !prev[user.id] }))}
                              className="text-slate-400 hover:text-slate-600 cursor-pointer"
                              title={isVisible ? 'লুকান' : 'দেখুন'}
                            >
                              {isVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            type="button"
                            disabled={isMaster}
                            onClick={() => handleToggleUserActive(user)}
                            className={`px-2 py-0.5 rounded-full text-[11px] font-semibold transition cursor-pointer ${
                              user.isActive 
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' 
                                : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                            }`}
                          >
                            {user.isActive ? 'Active' : 'Inactive'}
                          </button>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {!isMaster && (
                            <button
                              type="button"
                              onClick={() => handleDeleteUser(user.id, user.username)}
                              className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/60 transition cursor-pointer"
                              title="ইউজার ডিলিট করুন"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= 3. AREA & BRANCH STRUCTURE TAB ================= */}
      {activeTab === 'org' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Areas Management */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span>এরিয়া তালিকা ({areas.length})</span>
              </h3>
            </div>
            <form onSubmit={handleAddArea} className="flex gap-2">
              <input
                type="text"
                placeholder="নতুন এরিয়ার নাম..."
                value={newArea}
                onChange={(e) => setNewArea(e.target.value)}
                className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="submit"
                className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 cursor-pointer"
              >
                যোগ
              </button>
            </form>
            <div className="space-y-1.5 max-h-64 overflow-y-auto">
              {areas.map((a, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs">
                  <span>{a}</span>
                  {areas.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveArea(a)}
                      className="text-slate-400 hover:text-red-500 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Branches Management */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-teal-600" />
                <span>শাখা তালিকা ({branches.length})</span>
              </h3>
            </div>
            <form onSubmit={handleAddBranch} className="space-y-2">
              <input
                type="text"
                placeholder="নতুন শাখার নাম..."
                value={newBranchName}
                onChange={(e) => setNewBranchName(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
              <div className="flex gap-2">
                <select
                  value={newBranchArea}
                  onChange={(e) => setNewBranchArea(e.target.value)}
                  className="flex-1 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                >
                  {areas.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-xl bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700 cursor-pointer"
                >
                  শাখা যোগ
                </button>
              </div>
            </form>
            <div className="space-y-1.5 max-h-64 overflow-y-auto">
              {branches.map((b) => (
                <div key={b.id} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs">
                  <div>
                    <div className="font-semibold">{b.name}</div>
                    <div className="text-[10px] text-slate-400">{b.area}</div>
                  </div>
                  {branches.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveBranch(b.id)}
                      className="text-slate-400 hover:text-red-500 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Designations Management */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-blue-600" />
                <span>পদবি তালিকা ({designations.length})</span>
              </h3>
            </div>
            <form onSubmit={handleAddDesignation} className="flex gap-2">
              <input
                type="text"
                placeholder="নতুন পদবির নাম..."
                value={newDesignation}
                onChange={(e) => setNewDesignation(e.target.value)}
                className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="submit"
                className="px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 cursor-pointer"
              >
                যোগ
              </button>
            </form>
            <div className="space-y-1.5 max-h-64 overflow-y-auto">
              {designations.map((d, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs">
                  <span>{d}</span>
                  {designations.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveDesignation(d)}
                      className="text-slate-400 hover:text-red-500 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================= 4. BACKUP & SYSTEM RESET TAB ================= */}
      {activeTab === 'backup' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Download className="w-4 h-4 text-emerald-600" />
              <span>সম্পূর্ণ ডাটাবেজ ব্যাকআপ ও রিস্টোর</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              সকল কর্মী, বদলি রেকর্ড, সেটিংস ও ইউজার তথ্যের একটি সম্পূর্ণ অফলাইন JSON ফাইল ডাউনলোড বা রিস্টোর করুন।
            </p>
            <div className="flex flex-wrap gap-2.5 pt-2">
              <button
                type="button"
                onClick={handleDownloadBackup}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>ব্যাকআপ ডাউনলোড (JSON)</span>
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                <span>ব্যাকআপ রিস্টোর</span>
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".json"
                className="hidden"
              />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-red-200 dark:border-red-900/50 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-red-600 dark:text-red-400 flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-red-500" />
              <span>ডিফল্ট ডাটাবেজ রিসেট (Default Reset)</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              সিস্টেমের সকল তথ্য চট্টগ্রাম-০২ জোনের প্রাথমিক স্ট্যান্ডার্ড ডাটাতে পুনঃস্থাপন করতে এটি ব্যবহার করুন।
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={onResetDefaults}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-xs cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>ডিফল্ট ডাটা রিসেট করুন</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
