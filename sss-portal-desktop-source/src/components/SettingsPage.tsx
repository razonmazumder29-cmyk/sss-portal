import React, { useState, useRef } from 'react';
import { 
  Settings, 
  MapPin, 
  Building2, 
  Briefcase, 
  Mail, 
  Lock, 
  KeyRound, 
  Plus, 
  Trash2, 
  Save, 
  Download, 
  Upload, 
  CheckCircle,
  AlertCircle,
  ShieldAlert
} from 'lucide-react';
import { BranchItem, SettingsConfig } from '../types';
import { translations } from '../translations';
import { StorageService } from '../utils/storage';
import { downloadJsonFile } from '../utils/exportImport';

interface SettingsPageProps {
  areas: string[];
  setAreas: (areas: string[]) => void;
  branches: BranchItem[];
  setBranches: (branches: BranchItem[]) => void;
  designations: string[];
  setDesignations: (designations: string[]) => void;
  settings: SettingsConfig;
  setSettings: (settings: SettingsConfig) => void;
  language: 'bn' | 'en';
  isAdmin: boolean;
  onRestoreBackup: (jsonStr: string) => void;
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
  language,
  isAdmin,
  onRestoreBackup
}) => {
  const t = translations[language];

  // Local states for adding new items
  const [newArea, setNewArea] = useState('');
  
  const [newBranchName, setNewBranchName] = useState('');
  const [newBranchArea, setNewBranchArea] = useState(areas[0] || '');
  const [newBranchCode, setNewBranchCode] = useState('');

  const [newDesignation, setNewDesignation] = useState('');
  const [newEmail, setNewEmail] = useState('');

  // Password change state
  const [newPassword, setNewPassword] = useState('');
  const [passwordNotice, setPasswordNotice] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Add Area
  const handleAddArea = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newArea.trim()) return;
    if (areas.includes(newArea.trim())) return;
    const updated = [...areas, newArea.trim()];
    setAreas(updated);
    StorageService.saveAreas(updated);
    StorageService.addAuditLog({
      action: 'UPDATE',
      performedBy: 'Admin',
      details: `Added new area: ${newArea.trim()}`
    });
    setNewArea('');
  };

  const handleRemoveArea = (areaToRemove: string) => {
    if (areas.length <= 1) return;
    const updated = areas.filter(a => a !== areaToRemove);
    setAreas(updated);
    StorageService.saveAreas(updated);
    StorageService.addAuditLog({
      action: 'UPDATE',
      performedBy: 'Admin',
      details: `Removed area: ${areaToRemove}`
    });
  };

  // Add Branch
  const handleAddBranch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBranchName.trim()) return;
    const newBr: BranchItem = {
      id: 'br-' + Date.now(),
      name: newBranchName.trim(),
      area: newBranchArea || areas[0],
      code: newBranchCode.trim() || undefined
    };
    const updated = [...branches, newBr];
    setBranches(updated);
    StorageService.saveBranches(updated);
    StorageService.addAuditLog({
      action: 'UPDATE',
      performedBy: 'Admin',
      details: `Added new branch: ${newBranchName.trim()} in ${newBranchArea}`
    });
    setNewBranchName('');
    setNewBranchCode('');
  };

  const handleRemoveBranch = (id: string, name: string) => {
    if (branches.length <= 1) return;
    const updated = branches.filter(b => b.id !== id);
    setBranches(updated);
    StorageService.saveBranches(updated);
    StorageService.addAuditLog({
      action: 'UPDATE',
      performedBy: 'Admin',
      details: `Removed branch: ${name}`
    });
  };

  // Add Designation
  const handleAddDesignation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDesignation.trim()) return;
    if (designations.includes(newDesignation.trim())) return;
    const updated = [...designations, newDesignation.trim()];
    setDesignations(updated);
    StorageService.saveDesignations(updated);
    StorageService.addAuditLog({
      action: 'UPDATE',
      performedBy: 'Admin',
      details: `Added new designation: ${newDesignation.trim()}`
    });
    setNewDesignation('');
  };

  const handleRemoveDesignation = (dToRemove: string) => {
    if (designations.length <= 1) return;
    const updated = designations.filter(d => d !== dToRemove);
    setDesignations(updated);
    StorageService.saveDesignations(updated);
    StorageService.addAuditLog({
      action: 'UPDATE',
      performedBy: 'Admin',
      details: `Removed designation: ${dToRemove}`
    });
  };

  // Add Zone Email
  const handleAddEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim() || !newEmail.includes('@')) return;
    if (settings.zoneEmailList.includes(newEmail.trim())) return;
    const updated = {
      ...settings,
      zoneEmailList: [...settings.zoneEmailList, newEmail.trim()]
    };
    setSettings(updated);
    StorageService.saveSettings(updated);
    StorageService.addAuditLog({
      action: 'UPDATE',
      performedBy: 'Admin',
      details: `Added official recipient email: ${newEmail.trim()}`
    });
    setNewEmail('');
  };

  const handleRemoveEmail = (emailToRemove: string) => {
    if (settings.zoneEmailList.length <= 1) return;
    const updated = {
      ...settings,
      zoneEmailList: settings.zoneEmailList.filter(e => e !== emailToRemove)
    };
    setSettings(updated);
    StorageService.saveSettings(updated);
    StorageService.addAuditLog({
      action: 'UPDATE',
      performedBy: 'Admin',
      details: `Removed official recipient email: ${emailToRemove}`
    });
  };

  // Change Admin Password
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword.trim()) return;
    const updated = {
      ...settings,
      adminPasswordHash: newPassword.trim()
    };
    setSettings(updated);
    StorageService.saveSettings(updated);
    setPasswordNotice('অ্যাডমিন পাসওয়ার্ড সফলভাবে পরিবর্তিত হয়েছে!');
    setNewPassword('');
    setTimeout(() => setPasswordNotice(''), 3000);
  };

  // Full Backup Download
  const handleDownloadBackup = () => {
    const jsonStr = StorageService.createFullBackupJson();
    const dateStr = new Date().toISOString().slice(0, 10);
    downloadJsonFile(`SSS_Chattogram02_Full_Backup_${dateStr}.json`, jsonStr);
    StorageService.addAuditLog({
      action: 'EXPORT',
      performedBy: 'Admin',
      details: 'Exported complete database JSON backup'
    });
  };

  // File Upload Restore
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
      {/* Settings Header */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <span>{t.settingsTitle}</span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          {language === 'bn'
            ? 'এরিয়া, শাখা, পদবী ড্রপডাউন এবং জোন অফিস মেইল কনফিগারেশন'
            : 'Configure Areas, Branches, Designations dropdowns, and Zone Mailing directory'}
        </p>
      </div>

      {/* Grid of Dropdown Management Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* 1. Area Dropdown Management */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <MapPin className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {t.areaSettingsTitle}
            </h3>
          </div>

          {/* Form to add area */}
          <form onSubmit={handleAddArea} className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. Boalkhali (বোয়ালখালী)"
              value={newArea}
              onChange={(e) => setNewArea(e.target.value)}
              className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
            <button
              type="submit"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>যোগ করুন</span>
            </button>
          </form>

          {/* Current Area List */}
          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {areas.map((a) => (
              <div
                key={a}
                className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-xs"
              >
                <span className="font-semibold text-slate-800 dark:text-slate-200">{a}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveArea(a)}
                  className="text-slate-400 hover:text-red-500 p-1"
                  title="Remove area"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Branch Dropdown Management */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <Building2 className="w-4 h-4 text-teal-600" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {t.branchSettingsTitle}
            </h3>
          </div>

          {/* Form to add branch */}
          <form onSubmit={handleAddBranch} className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="শাখার নাম (e.g. New Market Branch)"
                value={newBranchName}
                onChange={(e) => setNewBranchName(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
              />
              <select
                value={newBranchArea}
                onChange={(e) => setNewBranchArea(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
              >
                {areas.map(a => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="শাখা কোড (ঐচ্ছিক, e.g. CTG-05)"
                value={newBranchCode}
                onChange={(e) => setNewBranchCode(e.target.value)}
                className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
              />
              <button
                type="submit"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>যোগ করুন</span>
              </button>
            </div>
          </form>

          {/* Current Branch List */}
          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {branches.map((b) => (
              <div
                key={b.id}
                className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-xs"
              >
                <div>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{b.name}</span>
                  <span className="text-[10px] text-slate-400 ml-2">[{b.area}]</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveBranch(b.id, b.name)}
                  className="text-slate-400 hover:text-red-500 p-1"
                  title="Remove branch"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Designation Dropdown Management */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <Briefcase className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {t.designationSettingsTitle}
            </h3>
          </div>

          <form onSubmit={handleAddDesignation} className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. Senior Auditor"
              value={newDesignation}
              onChange={(e) => setNewDesignation(e.target.value)}
              className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
            <button
              type="submit"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>যোগ করুন</span>
            </button>
          </form>

          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {designations.map((d) => (
              <div
                key={d}
                className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-xs"
              >
                <span className="font-semibold text-slate-800 dark:text-slate-200">{d}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveDesignation(d)}
                  className="text-slate-400 hover:text-red-500 p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Zone Email Addresses (Outlook & Gmail Recipients) */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <Mail className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {t.emailListTitle}
            </h3>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            হোম পেজে "মেইল পাঠান" বাটনে ক্লিক করলে নিচের সকল অফিশিয়াল মেইল অ্যাড্রেসে স্বয়ংক্রিয়ভাবে শুভেচ্ছা বার্তা যাবে:
          </p>

          <form onSubmit={handleAddEmail} className="flex gap-2">
            <input
              type="email"
              placeholder="e.g. sss.zone.chattogram02@gmail.com"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>যোগ করুন</span>
            </button>
          </form>

          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {settings.zoneEmailList.map((email) => (
              <div
                key={email}
                className="flex items-center justify-between p-2 rounded-lg bg-blue-50/50 dark:bg-blue-950/40 text-xs border border-blue-100 dark:border-blue-900/50"
              >
                <span className="font-mono text-slate-800 dark:text-slate-200">{email}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveEmail(email)}
                  className="text-slate-400 hover:text-red-500 p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Security & Database Maintenance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Security Password Box */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <KeyRound className="w-4 h-4 text-amber-600" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {t.securityTitle}
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            ডাটাবেজে নতুন কর্মী এন্ট্রি, তথ্য পরিবর্তন ও বদলি সম্পাদনের জন্য অ্যাডমিন পাসওয়ার্ড নিরাপত্তা।
          </p>

          {passwordNotice && (
            <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs flex items-center gap-2 border border-emerald-200">
              <CheckCircle className="w-4 h-4" />
              <span>{passwordNotice}</span>
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                নতুন অ্যাডমিন পাসওয়ার্ড নির্ধারণ করুন:
              </label>
              <input
                type="password"
                required
                placeholder="নতুন পাসওয়ার্ড টাইপ করুন"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold"
            >
              পাসওয়ার্ড আপডেট করুন
            </button>
          </form>
        </div>

        {/* Backup & Restore Box */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <Download className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              ডাটা ব্যাকআপ ও রিস্টোর (JSON Backup)
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            অন্য কম্পিউটারে সম্পূর্ণ ডাটাবেজ স্থানান্তর করতে ব্যাকআপ ডাউনলোড করুন অথবা পূর্বের ব্যাকআপ ফাইল থেকে রিস্টোর করুন।
          </p>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={handleDownloadBackup}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition"
            >
              <Download className="w-4 h-4" />
              <span>{t.btnBackupJson}</span>
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold transition"
            >
              <Upload className="w-4 h-4" />
              <span>{t.btnRestoreJson}</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
