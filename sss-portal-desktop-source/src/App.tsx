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
import { StorageService } from './utils/storage';
import { filterMilestones } from './utils/dateCalculations';
import { Employee, BranchItem, SettingsConfig, AuditLog } from './types';
import { translations } from './translations';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function App() {
  // State Initialization from persistent storage
  const [employees, setEmployees] = useState<Employee[]>(() => StorageService.getEmployees());
  const [areas, setAreas] = useState<string[]>(() => StorageService.getAreas());
  const [branches, setBranches] = useState<BranchItem[]>(() => StorageService.getBranches());
  const [designations, setDesignations] = useState<string[]>(() => StorageService.getDesignations());
  const [settings, setSettings] = useState<SettingsConfig>(() => StorageService.getSettings());
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => StorageService.getAuditLogs());

  // UI state
  const [activeTab, setActiveTab] = useState<'home' | 'directory' | 'blood' | 'dashboard' | 'settings'>('home');
  const [language, setLanguage] = useState<'bn' | 'en'>(() => StorageService.getLanguage());
  const [theme, setTheme] = useState<'light' | 'dark'>(() => StorageService.getTheme());
  const [isAdmin, setIsAdmin] = useState<boolean>(true); // Default active for seamless editing and transfer

  // Modals state
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [employeeToEdit, setEmployeeToEdit] = useState<Employee | null>(null);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [preselectedEmpForTransfer, setPreselectedEmpForTransfer] = useState<string | null>(null);
  const [selectedStaffForId, setSelectedStaffForId] = useState<Employee | null>(null);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [directorySearchPin, setDirectorySearchPin] = useState<string | null>(null);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Sync theme with HTML root class
  useEffect(() => {
    StorageService.saveTheme(theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Sync language
  useEffect(() => {
    StorageService.saveLanguage(language);
    document.documentElement.lang = language;
  }, [language]);

  // Calculate today's milestones
  const todayMilestones = filterMilestones(employees, 'today');
  const todayCount = todayMilestones.birthdays.length + todayMilestones.anniversaries.length;

  // Add / Edit Employee Handler
  const handleSaveEmployee = (empData: Partial<Employee>) => {
    let updatedEmployees: Employee[];
    const nowIso = new Date().toISOString();

    if (empData.id) {
      // Edit existing
      updatedEmployees = employees.map(emp => {
        if (emp.id === empData.id) {
          return {
            ...emp,
            ...empData
          } as Employee;
        }
        return emp;
      });
      StorageService.addAuditLog({
        action: 'UPDATE',
        performedBy: 'Admin',
        details: `Updated details for ${empData.name} (${empData.pin})`,
        employeeId: empData.id,
        employeeName: empData.name
      });
      showToast(language === 'bn' ? 'কর্মী তথ্য সফলভাবে আপডেট হয়েছে' : 'Employee details updated successfully');
    } else {
      // Add new
      const newEmp: Employee = {
        id: 'emp-' + Date.now(),
        serialNo: empData.serialNo || employees.length + 1,
        area: empData.area || areas[0],
        branch: empData.branch || branches[0].name,
        name: empData.name || '',
        pin: empData.pin || '',
        designation: empData.designation || designations[0],
        mobile: empData.mobile || '',
        email: empData.email || '',
        orgJoiningDate: empData.orgJoiningDate || nowIso.slice(0, 10),
        branchJoiningDate: empData.branchJoiningDate || empData.orgJoiningDate || nowIso.slice(0, 10),
        birthDate: empData.birthDate || '',
        bloodGroup: empData.bloodGroup || 'B+',
        status: empData.status || 'Active',
        notes: empData.notes || '',
        transferHistory: []
      };
      updatedEmployees = [...employees, newEmp];
      StorageService.addAuditLog({
        action: 'CREATE',
        performedBy: 'Admin',
        details: `Added new employee ${newEmp.name} (${newEmp.pin}) to ${newEmp.branch}`,
        employeeId: newEmp.id,
        employeeName: newEmp.name
      });
      showToast(language === 'bn' ? 'নতুন কর্মী সফলভাবে যুক্ত হয়েছে' : 'New employee registered successfully');
    }

    setEmployees(updatedEmployees);
    StorageService.saveEmployees(updatedEmployees);
    setAuditLogs(StorageService.getAuditLogs());
    setIsAddEditOpen(false);
    setEmployeeToEdit(null);
  };

  // Delete Employee Handler
  const handleDeleteEmployee = (empId: string) => {
    const target = employees.find(e => e.id === empId);
    if (!target) return;
    const confirmMsg = language === 'bn' 
      ? `আপনি কি নিশ্চিতভাবে ${target.name} (${target.pin})-এর ডাটা মুছে ফেলতে চান?`
      : `Are you sure you want to delete ${target.name} (${target.pin})?`;
    
    if (window.confirm(confirmMsg)) {
      const updated = employees.filter(e => e.id !== empId);
      setEmployees(updated);
      StorageService.saveEmployees(updated);
      StorageService.addAuditLog({
        action: 'DELETE',
        performedBy: 'Admin',
        details: `Deleted employee record: ${target.name} (${target.pin})`,
        employeeId: target.id,
        employeeName: target.name
      });
      setAuditLogs(StorageService.getAuditLogs());
      showToast(language === 'bn' ? 'কর্মীর রেকর্ড মুছে ফেলা হয়েছে' : 'Employee record deleted');
    }
  };

  // Branch Transfer Execution Handler
  const handleExecuteTransfer = (data: {
    employeeId: string;
    newArea: string;
    newBranch: string;
    transferDate: string;
    orderRef?: string;
    reason?: string;
  }) => {
    const target = employees.find(e => e.id === data.employeeId);
    if (!target) return;

    const newTransferRecord = {
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

    const updatedEmployees = employees.map(emp => {
      if (emp.id === data.employeeId) {
        return {
          ...emp,
          area: data.newArea,
          branch: data.newBranch,
          branchJoiningDate: data.transferDate, // update branch joining date as required
          lastTransferDate: data.transferDate,
          transferHistory: [newTransferRecord, ...(emp.transferHistory || [])]
        };
      }
      return emp;
    });

    setEmployees(updatedEmployees);
    StorageService.saveEmployees(updatedEmployees);

    StorageService.addAuditLog({
      action: 'TRANSFER',
      performedBy: 'Admin',
      details: `Transferred ${target.name} (${target.pin}) from ${target.branch} to ${data.newBranch}`,
      employeeId: target.id,
      employeeName: target.name
    });
    setAuditLogs(StorageService.getAuditLogs());

    showToast(
      language === 'bn' 
        ? `${target.name}-কে সফলভাবে ${data.newBranch} শাখায় বদলি করা হয়েছে` 
        : `${target.name} successfully transferred to ${data.newBranch}`
    );
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
      setAuditLogs(StorageService.getAuditLogs());
      showToast(language === 'bn' ? 'ব্যাকআপ সফলভাবে রিস্টোর হয়েছে!' : 'Backup restored successfully!');
    } else {
      showToast(language === 'bn' ? 'ব্যাকআপ ফাইলটি সঠিক নয়' : 'Invalid backup JSON file');
    }
  };

  // Navigate to staff in directory
  const handleNavigateToStaff = (pin: string) => {
    setDirectorySearchPin(pin);
    setActiveTab('directory');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white transition-colors duration-200">
      {/* Toast Banner */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xl border border-slate-700 dark:border-slate-300 text-xs sm:text-sm animate-in fade-in slide-in-from-bottom-4 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600 shrink-0" />
          <span className="font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (tab !== 'directory') setDirectorySearchPin(null);
          setActiveTab(tab);
        }}
        language={language}
        setLanguage={setLanguage}
        theme={theme}
        setTheme={setTheme}
        isAdmin={isAdmin}
        setIsAdmin={setIsAdmin}
        onOpenAdminLogin={() => setIsAdminLoginOpen(true)}
        todayMilestoneCount={todayCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'home' && (
          <HomeMilestones
            employees={employees}
            settings={settings}
            language={language}
            onNavigateToStaff={handleNavigateToStaff}
          />
        )}

        {activeTab === 'directory' && (
          <EmployeeDirectory
            employees={employees}
            areas={areas}
            branches={branches}
            designations={designations}
            language={language}
            isAdmin={isAdmin}
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
            highlightPin={directorySearchPin}
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
            language={language}
            isAdmin={isAdmin}
            onRestoreBackup={handleRestoreBackup}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 mt-12 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
          <div>
            <strong className="text-slate-700 dark:text-slate-300">{settings.orgNameBn}</strong> · জোন: {settings.zoneNameBn}
          </div>
          <div>
            কর্মকর্তা-কর্মচারী ডাটাবেজ ও স্বয়ংক্রিয় শুভেচ্ছা বার্তা সিস্টেম
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

      {/* Admin Unlock Modal */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onSuccess={() => {
          setIsAdmin(true);
          showToast(language === 'bn' ? 'অ্যাডমিন মোড সক্রিয় হয়েছে' : 'Admin mode unlocked');
        }}
        expectedPasswordHash={settings.adminPasswordHash}
        language={language}
      />
    </div>
  );
}
