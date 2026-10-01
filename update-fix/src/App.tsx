import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HomeMilestones } from './components/HomeMilestones';
import { EmployeeDirectory } from './components/EmployeeDirectory';
import { BloodBankDirectory } from './components/BloodBankDirectory';
import { DashboardReports } from './components/DashboardReports';
import { SettingsPage } from './components/SettingsPage';
import { TransferModal } from './components/TransferModal';
import { AddEditEmployeeModal } from './components/AddEditEmployeeModal';
import { EmployeeIdModal } from './components/EmployeeIdModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { CsvImportModal } from './components/CsvImportModal';
import { StorageService } from './utils/storage';
import { filterMilestones, isDueForTransfer } from './utils/dateCalculations';
import { Employee, BranchItem, SettingsConfig, AuditLog, AdminUser, CloudSyncStatus } from './types';
import { CloudService } from './services/cloudService';
import { CheckCircle2, AlertTriangle } from 'lucide-react';

export default function App() {
  // State Initialization from persistent cache
  const [employees, setEmployees] = useState<Employee[]>(() => StorageService.getEmployees());
  const [areas, setAreas] = useState<string[]>(() => StorageService.getAreas());
  const [branches, setBranches] = useState<BranchItem[]>(() => StorageService.getBranches());
  const [designations, setDesignations] = useState<string[]>(() => StorageService.getDesignations());
  const [settings, setSettings] = useState<SettingsConfig>(() => StorageService.getSettings());
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>(() => StorageService.getAdminUsers());
  const [currentUser, setCurrentUser] = useState<AdminUser>(() => StorageService.getCurrentUser());
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => StorageService.getAuditLogs());

  // Cloud Database Sync Status
  const [cloudStatus, setCloudStatus] = useState<CloudSyncStatus>('syncing');

  // UI Navigation & Preferences
  const [activeTab, setActiveTab] = useState<'home' | 'directory' | 'blood' | 'dashboard' | 'settings'>('home');
  const [language, setLanguage] = useState<'bn' | 'en'>(() => StorageService.getLanguage());
  const [theme, setTheme] = useState<'light' | 'dark'>(() => StorageService.getTheme());

  // Modals state
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [employeeToEdit, setEmployeeToEdit] = useState<Employee | null>(null);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [preselectedEmpForTransfer, setPreselectedEmpForTransfer] = useState<string | null>(null);
  const [selectedStaffForId, setSelectedStaffForId] = useState<Employee | null>(null);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [directorySearchPin, setDirectorySearchPin] = useState<string | null>(null);
  const [filterTransferDueInDirectory, setFilterTransferDueInDirectory] = useState<boolean>(false);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const isSuperAdmin = currentUser.role === 'Super Admin';

  // Real-time Firestore Subscriptions
  useEffect(() => {
    // 1. Subscribe to Employees (Real-time sync across devices)
    const unsubEmployees = CloudService.subscribeEmployees(
      (updatedList) => {
        setEmployees(updatedList);
        setCloudStatus('connected');
      },
      (status) => {
        setCloudStatus(status);
      }
    );

    // 2. Subscribe to Admin Users
    const unsubAdminUsers = CloudService.subscribeAdminUsers((users) => {
      setAdminUsers(users);
      // Update currentUser reference if changed in cloud
      const updatedCurrent = users.find(u => u.username === currentUser.username);
      if (updatedCurrent) {
        setCurrentUser(updatedCurrent);
        StorageService.saveCurrentUser(updatedCurrent);
      }
    });

    // 3. Subscribe to Settings
    const unsubSettings = CloudService.subscribeSettings((cfg) => {
      setSettings(cfg);
    });

    // 4. Subscribe to Metadata (Areas, Branches, Designations)
    const unsubMeta = CloudService.subscribeMetadata((meta) => {
      if (meta.areas) setAreas(meta.areas);
      if (meta.branches) setBranches(meta.branches);
      if (meta.designations) setDesignations(meta.designations);
    });

    return () => {
      if (typeof unsubEmployees === 'function') unsubEmployees();
      if (typeof unsubAdminUsers === 'function') unsubAdminUsers();
      if (typeof unsubSettings === 'function') unsubSettings();
      if (typeof unsubMeta === 'function') unsubMeta();
    };
  }, [currentUser.username]);

  // Sync theme
  useEffect(() => {
    StorageService.saveTheme(theme);
    if (typeof document !== 'undefined') {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
        document.body?.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
        document.body?.classList.remove('dark');
      }
    }
  }, [theme]);

  // Sync language
  useEffect(() => {
    StorageService.saveLanguage(language);
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;
    }
  }, [language]);

  // Compute 3-Year Transfer Due Count
  const dueForTransferCount = employees.filter(
    e => e.status !== 'Retired' && isDueForTransfer(e.branchJoiningDate)
  ).length;

  // Compute today's milestones
  const todayMilestones = filterMilestones(employees, 'today');
  const todayCount = todayMilestones.birthdays.length + todayMilestones.anniversaries.length;

  // Manual Force Cloud Sync
  const handleForceSync = async () => {
    setCloudStatus('syncing');
    try {
      const isOnline = await CloudService.checkCloudConnection();
      if (isOnline) {
        setCloudStatus('connected');
        showToast(language === 'bn' ? 'সেন্ট্রাল ক্লাউড ডাটাবেজ সফলভাবে সিঙ্ক হয়েছে!' : 'Cloud database synced live!');
      } else {
        setCloudStatus('offline');
        showToast(language === 'bn' ? 'ক্লাউড সিঙ্ক অফলাইন মোডে চলছে' : 'Cloud sync in offline cache mode');
      }
    } catch {
      setCloudStatus('offline');
    }
  };

  // Save / Update Employee (Super Admin Only)
  const handleSaveEmployee = async (empData: Partial<Employee>) => {
    if (!isSuperAdmin) {
      setIsAdminLoginOpen(true);
      showToast(language === 'bn' ? 'কর্মী যোগ বা সম্পাদনা করতে Super Admin লগইন আবশ্যক' : 'Super Admin access required');
      return;
    }

    try {
      setCloudStatus('syncing');
      await CloudService.saveEmployee(empData, currentUser.fullName);
      setCloudStatus('connected');
      showToast(
        empData.id 
          ? (language === 'bn' ? 'কর্মী তথ্য সফলভাবে আপডেট হয়েছে' : 'Employee details updated')
          : (language === 'bn' ? 'নতুন কর্মী কেন্দ্রীয় ক্লাউড ডাটাবেজে যুক্ত হয়েছে' : 'New employee added to cloud database')
      );
    } catch (err) {
      console.error('Save error:', err);
      // Local fallback
      let updated: Employee[];
      if (empData.id) {
        updated = employees.map(e => e.id === empData.id ? { ...e, ...empData } as Employee : e);
      } else {
        const newEmp = { ...empData, id: 'emp-' + Date.now() } as Employee;
        updated = [...employees, newEmp];
      }
      setEmployees(updated);
      StorageService.saveEmployees(updated);
      showToast((language === 'bn' ? 'ক্লাউডে সেভ হয়নি, শুধু এই কম্পিউটারে রাখা হয়েছে। কারণ: ' : 'Cloud save failed, kept on this computer only. Reason: ') + (err instanceof Error ? err.message : String(err)));
    }
  };

  // Delete employee (Super Admin Only per user instructions)
  const handleDeleteEmployee = async (empId: string) => {
    if (!isSuperAdmin) {
      setIsAdminLoginOpen(true);
      showToast(language === 'bn' ? 'কর্মী ডিলিট করার ক্ষমতা শুধুমাত্র Super Admin-দের জন্য সংরক্ষিত' : 'Delete permission restricted to Super Admin');
      return;
    }

    const target = employees.find(e => e.id === empId);
    const targetName = target ? target.name : 'Employee';

    try {
      setCloudStatus('syncing');
      await CloudService.deleteEmployee(empId, targetName, currentUser.fullName);
      setCloudStatus('connected');
      showToast(language === 'bn' ? `${targetName}-কে স্থায়ীভাবে ডিলিট করা হয়েছে` : `${targetName} deleted`);
    } catch (err) {
      console.error('Delete error:', err);
      const filtered = employees.filter(e => e.id !== empId);
      setEmployees(filtered);
      StorageService.saveEmployees(filtered);
      showToast((language === 'bn' ? 'ক্লাউড থেকে মোছা যায়নি, শুধু এই কম্পিউটার থেকে সরানো হয়েছে। কারণ: ' : 'Cloud delete failed, removed on this computer only. Reason: ') + (err instanceof Error ? err.message : String(err)));
    }
  };

  // Branch Transfer execution (Super Admin Only)
  const handleExecuteTransfer = async (data: {
    employeeId: string;
    newArea: string;
    newBranch: string;
    transferDate: string;
    orderRef?: string;
    reason?: string;
  }) => {
    if (!isSuperAdmin) {
      setIsAdminLoginOpen(true);
      showToast(language === 'bn' ? 'ট্রান্সফার কার্যকর করতে Super Admin লগইন আবশ্যক' : 'Super Admin access required');
      return;
    }

    const target = employees.find(e => e.id === data.employeeId);
    if (!target) return;

    try {
      setCloudStatus('syncing');
      await CloudService.executeTransfer(data, currentUser.fullName);
      setCloudStatus('connected');
      showToast(
        language === 'bn'
          ? `${target.name}-কে সফলভাবে ${data.newBranch}-এ বদলি কার্যকর করা হয়েছে (৩ বছর মেয়াদ রিসেট)`
          : `${target.name} transferred to ${data.newBranch} (Tenure reset)`
      );
    } catch (err) {
      console.error('Transfer error:', err);
      // Fallback
      const transferRecord = {
        id: 'tr-' + Date.now(),
        fromArea: target.area,
        fromBranch: target.branch,
        toArea: data.newArea,
        toBranch: data.newBranch,
        transferDate: data.transferDate,
        orderRef: data.orderRef,
        reason: data.reason,
        recordedAt: new Date().toISOString()
      };
      const updated = employees.map(emp => {
        if (emp.id === data.employeeId) {
          return {
            ...emp,
            area: data.newArea,
            branch: data.newBranch,
            branchJoiningDate: data.transferDate,
            lastTransferDate: data.transferDate,
            transferHistory: [transferRecord, ...(emp.transferHistory || [])]
          };
        }
        return emp;
      });
      setEmployees(updated);
      StorageService.saveEmployees(updated);
      showToast(language === 'bn' ? 'বদলি অফলাইন ক্যাশে সংরক্ষিত হয়েছে' : 'Transfer saved to offline cache');
    }
  };

  // Bulk Excel/CSV Import
  const handleBulkImport = async (importedList: Partial<Employee>[]) => {
    if (!isSuperAdmin) {
      setIsAdminLoginOpen(true);
      showToast(language === 'bn' ? 'বাল্ক আমদানির জন্য Super Admin লগইন আবশ্যক' : 'Super Admin access required');
      return;
    }

    try {
      setCloudStatus('syncing');
      const count = await CloudService.bulkImportEmployees(importedList, currentUser.fullName);
      setCloudStatus('connected');
      showToast(language === 'bn' ? `${count} জন কর্মী ক্লাউড ডাটাবেজে সফলভাবে যুক্ত হয়েছে!` : `Imported ${count} staff to cloud!`);
    } catch (err) {
      console.error('Bulk import error:', err);
      // Fallback
      let currentMaxSl = employees.reduce((max, e) => Math.max(max, e.serialNo || 0), 0);
      const newItems: Employee[] = importedList.map(item => {
        currentMaxSl++;
        return {
          id: 'emp-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
          serialNo: item.serialNo || currentMaxSl,
          area: item.area || areas[0],
          branch: item.branch || branches[0].name,
          name: item.name || '',
          pin: item.pin || `SSS-${Math.floor(10000 + Math.random() * 90000)}`,
          designation: item.designation || designations[0],
          mobile: item.mobile || '',
          email: item.email || '',
          orgJoiningDate: item.orgJoiningDate || new Date().toISOString().slice(0, 10),
          branchJoiningDate: item.branchJoiningDate || item.orgJoiningDate || new Date().toISOString().slice(0, 10),
          birthDate: item.birthDate || '1995-01-01',
          bloodGroup: item.bloodGroup || 'B+',
          status: item.status || 'Active',
          notes: item.notes || '',
          transferHistory: []
        };
      });
      const merged = [...employees, ...newItems];
      setEmployees(merged);
      StorageService.saveEmployees(merged);
      showToast((language === 'bn' ? 'ক্লাউডে ইমপোর্ট হয়নি, শুধু এই কম্পিউটারে রাখা হয়েছে। কারণ: ' : 'Cloud import failed, kept on this computer only. Reason: ') + (err instanceof Error ? err.message : String(err)));
    }
  };

  // Save Settings to Cloud
  const handleSaveSettings = async (newSettings: SettingsConfig) => {
    try {
      setCloudStatus('syncing');
      await CloudService.saveSettings(newSettings, currentUser.fullName);
      setCloudStatus('connected');
      showToast(language === 'bn' ? 'সেটিংস সফলভাবে সংরক্ষিত হয়েছে' : 'Settings saved');
    } catch {
      StorageService.saveSettings(newSettings);
      showToast(language === 'bn' ? 'সেটিংস অফলাইনে সংরক্ষিত হয়েছে' : 'Settings saved locally');
    }
  };

  // Save Metadata to Cloud
  const handleSaveMetadata = async (meta: { areas?: string[]; branches?: BranchItem[]; designations?: string[] }) => {
    // আগে এই কম্পিউটারে সংরক্ষণ করে রাখা হচ্ছে
    if (meta.areas) StorageService.saveAreas(meta.areas);
    if (meta.branches) StorageService.saveBranches(meta.branches);
    if (meta.designations) StorageService.saveDesignations(meta.designations);

    try {
      setCloudStatus('syncing');
      await CloudService.saveMetadata(meta, currentUser.fullName);
      setCloudStatus('connected');
      showToast(language === 'bn' ? 'কাঠামো ক্লাউডে সংরক্ষিত হয়েছে' : 'Structure updated in cloud');
    } catch (err) {
      console.error('Metadata save error:', err);
      setCloudStatus('offline');
      showToast(
        (language === 'bn'
          ? 'ক্লাউডে সেভ হয়নি, শুধু এই কম্পিউটারে রাখা হয়েছে। কারণ: '
          : 'Cloud save failed, kept on this computer only. Reason: ') +
          (err instanceof Error ? err.message : String(err))
      );
    }
  };

  // Save Admin User to Cloud
  const handleSaveAdminUser = async (user: AdminUser) => {
    try {
      setCloudStatus('syncing');
      await CloudService.saveAdminUser(user, currentUser.fullName);
      setCloudStatus('connected');
      showToast(language === 'bn' ? 'ইউজার একাউন্ট ক্লাউডে সংরক্ষিত হয়েছে' : 'User account saved to cloud');
    } catch {
      const updated = adminUsers.map(u => u.id === user.id ? user : u);
      if (!adminUsers.some(u => u.id === user.id)) updated.push(user);
      setAdminUsers(updated);
      StorageService.saveAdminUsers(updated);
    }
  };

  // Delete Admin User from Cloud
  const handleDeleteAdminUser = async (userId: string, username: string) => {
    try {
      setCloudStatus('syncing');
      await CloudService.deleteAdminUser(userId, username, currentUser.fullName);
      setCloudStatus('connected');
      showToast(language === 'bn' ? 'ইউজার একাউন্ট ডিলিট করা হয়েছে' : 'User deleted');
    } catch {
      const updated = adminUsers.filter(u => u.id !== userId);
      setAdminUsers(updated);
      StorageService.saveAdminUsers(updated);
    }
  };

  // Restore Backup
  const handleRestoreBackup = (jsonStr: string) => {
    const ok = StorageService.restoreBackupJson(jsonStr);
    if (ok) {
      setEmployees(StorageService.getEmployees());
      setAreas(StorageService.getAreas());
      setBranches(StorageService.getBranches());
      setDesignations(StorageService.getDesignations());
      setSettings(StorageService.getSettings());
      setAdminUsers(StorageService.getAdminUsers());
      setAuditLogs(StorageService.getAuditLogs());
      showToast(language === 'bn' ? 'ব্যাকআপ সফলভাবে রিস্টোর হয়েছে!' : 'Backup restored successfully!');
    } else {
      showToast(language === 'bn' ? 'ভুল ব্যাকআপ JSON ফাইল' : 'Invalid backup JSON file');
    }
  };

  // Reset to default
  const handleResetDefaults = async () => {
    if (window.confirm(language === 'bn' ? 'আপনি কি কেন্দ্রীয় ডাটাবেজ প্রাথমিক স্ট্যান্ডার্ড তথ্যে রিসেট করতে চান?' : 'Reset to default data?')) {
      await CloudService.seedInitialDatabase();
      StorageService.resetToDefaults();
      setEmployees(StorageService.getEmployees());
      setAreas(StorageService.getAreas());
      setBranches(StorageService.getBranches());
      setDesignations(StorageService.getDesignations());
      setSettings(StorageService.getSettings());
      setAdminUsers(StorageService.getAdminUsers());
      showToast(language === 'bn' ? 'ডাটাবেজ স্ট্যান্ডার্ড তথ্যে পুনঃস্থাপন করা হয়েছে' : 'Database reset to defaults');
    }
  };

  // Logout
  const handleLogout = () => {
    const viewerUser: AdminUser = {
      id: 'viewer-guest',
      username: 'guest',
      fullName: 'সাধারণ পর্যবেক্ষক (Viewer)',
      role: 'Viewer',
      pin: '',
      isActive: true
    };
    setCurrentUser(viewerUser);
    StorageService.saveCurrentUser(viewerUser);
    showToast(language === 'bn' ? 'লগআউট সম্পন্ন হয়েছে। বর্তমানে Viewer (শুধুমাত্র দেখার মোডে) আছেন।' : 'Logged out. Read-only viewer mode active.');
  };

  // Quick Navigation to Transfer Due
  const handleNavigateToTransferDue = () => {
    setFilterTransferDueInDirectory(true);
    setDirectorySearchPin(null);
    setActiveTab('directory');
  };

  const handleNavigateToStaff = (pin: string) => {
    setDirectorySearchPin(pin);
    setFilterTransferDueInDirectory(false);
    setActiveTab('directory');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white transition-colors duration-200">
      {/* Toast Banner */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xl border border-slate-700 dark:border-slate-300 text-xs sm:text-sm animate-in fade-in slide-in-from-bottom-4 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600 shrink-0" />
          <span className="font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (tab !== 'directory') {
            setDirectorySearchPin(null);
            setFilterTransferDueInDirectory(false);
          }
          setActiveTab(tab);
        }}
        language={language}
        setLanguage={setLanguage}
        theme={theme}
        setTheme={setTheme}
        currentUser={currentUser}
        onOpenAdminLogin={() => setIsAdminLoginOpen(true)}
        onLogout={handleLogout}
        todayMilestoneCount={todayCount}
        dueForTransferCount={dueForTransferCount}
        cloudStatus={cloudStatus}
        onForceSync={handleForceSync}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'home' && (
          <HomeMilestones
            employees={employees}
            settings={settings}
            language={language}
            onNavigateToStaff={handleNavigateToStaff}
            onNavigateToTransferDue={handleNavigateToTransferDue}
            isSuperAdmin={isSuperAdmin}
          />
        )}

        {activeTab === 'directory' && (
          <EmployeeDirectory
            employees={employees}
            areas={areas}
            branches={branches}
            designations={designations}
            settings={settings}
            language={language}
            isSuperAdmin={isSuperAdmin}
            onAddEmployee={() => {
              setEmployeeToEdit(null);
              setIsAddEditOpen(true);
            }}
            onEditEmployee={(emp) => {
              setEmployeeToEdit(emp);
              setIsAddEditOpen(true);
            }}
            onTransferEmployee={(emp) => {
              setPreselectedEmpForTransfer(emp.id);
              setIsTransferOpen(true);
            }}
            onDeleteEmployee={handleDeleteEmployee}
            onViewIdCard={(emp) => setSelectedStaffForId(emp)}
            onBulkImport={handleBulkImport}
            highlightPin={directorySearchPin}
            initialFilterTransferDue={filterTransferDueInDirectory}
          />
        )}

        {activeTab === 'blood' && (
          <BloodBankDirectory
            employees={employees}
            language={language}
          />
        )}

        {activeTab === 'dashboard' && (
          <DashboardReports
            employees={employees}
            branches={branches}
            areas={areas}
            auditLogs={auditLogs}
            language={language}
            isSuperAdmin={isSuperAdmin}
            onInitiateTransfer={(emp) => {
              setPreselectedEmpForTransfer(emp.id);
              setIsTransferOpen(true);
            }}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsPage
            areas={areas}
            setAreas={setAreas}
            branches={branches}
            setBranches={setBranches}
            designations={designations}
            setDesignations={setDesignations}
            settings={settings}
            setSettings={setSettings}
            adminUsers={adminUsers}
            onSaveAdminUser={handleSaveAdminUser}
            onDeleteAdminUser={handleDeleteAdminUser}
            onSaveSettings={handleSaveSettings}
            onSaveMetadata={handleSaveMetadata}
            currentUser={currentUser}
            language={language}
            isSuperAdmin={isSuperAdmin}
            onOpenLogin={() => setIsAdminLoginOpen(true)}
            onRestoreBackup={handleRestoreBackup}
            onResetDefaults={handleResetDefaults}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 mt-12 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
          <div>
            <strong className="text-slate-700 dark:text-slate-300">{settings.orgNameBn}</strong> • জোন: {settings.zoneNameBn}
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${cloudStatus === 'connected' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              <span>{cloudStatus === 'connected' ? 'সেন্ট্রাল ক্লাউড লাইভ' : 'অফলাইন ক্যাশ মোড'}</span>
            </span>
            <span>•</span>
            <span>৩ বছর ব্রাঞ্চ বদলি পলিসি মনিটরিং পোর্টাল</span>
          </div>
        </div>
      </footer>

      {/* Add / Edit Employee Modal */}
      <AddEditEmployeeModal
        isOpen={isAddEditOpen}
        onClose={() => {
          setIsAddEditOpen(false);
          setEmployeeToEdit(null);
        }}
        onSave={handleSaveEmployee}
        employeeToEdit={employeeToEdit}
        areas={areas}
        branches={branches}
        designations={designations}
        language={language}
        nextSerialNo={employees.length + 1}
        onOpenBulkImport={() => setIsBulkImportOpen(true)}
      />

      {/* Branch Transfer Modal */}
      <TransferModal
        isOpen={isTransferOpen}
        onClose={() => {
          setIsTransferOpen(false);
          setPreselectedEmpForTransfer(null);
        }}
        employees={employees}
        areas={areas}
        branches={branches}
        preselectedEmployeeId={preselectedEmpForTransfer}
        language={language}
        onExecuteTransfer={handleExecuteTransfer}
      />

      {/* Printable ID Card Modal */}
      <EmployeeIdModal
        employee={selectedStaffForId}
        settings={settings}
        language={language}
        onClose={() => setSelectedStaffForId(null)}
      />

      {/* Password-based Admin Login Modal */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onSuccess={(authenticatedUser: AdminUser) => {
          setCurrentUser(authenticatedUser);
          StorageService.saveCurrentUser(authenticatedUser);
          showToast(
            language === 'bn' 
              ? `স্বাগতম, ${authenticatedUser.fullName} (${authenticatedUser.role})!`
              : `Welcome, ${authenticatedUser.fullName}!`
          );
        }}
        adminUsers={adminUsers}
        language={language}
      />

      {/* Global Bulk Excel/CSV Import Modal */}
      {isBulkImportOpen && (
        <CsvImportModal
          isOpen={isBulkImportOpen}
          onClose={() => setIsBulkImportOpen(false)}
          onImportSuccess={handleBulkImport}
          language={language}
        />
      )}
    </div>
  );
}
