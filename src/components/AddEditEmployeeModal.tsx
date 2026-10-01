import React, { useState, useEffect } from 'react';
import { 
  X, 
  UserPlus, 
  Save, 
  Building2, 
  MapPin, 
  Briefcase, 
  Phone, 
  Mail, 
  Calendar, 
  Droplet,
  FileSpreadsheet,
  Upload
} from 'lucide-react';
import { Employee, BloodGroup, BranchItem, EmployeeStatus } from '../types';
import { translations } from '../translations';
import { formatDateDDMMYYYY } from '../utils/dateCalculations';

interface AddEditEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (employeeData: Partial<Employee>) => void;
  employeeToEdit?: Employee | null;
  areas: string[];
  branches: BranchItem[];
  designations: string[];
  language: 'bn' | 'en';
  nextSerialNo: number;
  onOpenBulkImport?: () => void;
}

const BLOOD_GROUPS: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
const STATUSES: EmployeeStatus[] = ['Active', 'Transferred', 'On Leave', 'Deputation', 'Retired'];

export const AddEditEmployeeModal: React.FC<AddEditEmployeeModalProps> = ({
  isOpen,
  onClose,
  onSave,
  employeeToEdit,
  areas,
  branches,
  designations,
  language,
  nextSerialNo,
  onOpenBulkImport
}) => {
  if (!isOpen) return null;
  const t = translations[language];

  const [serialNo, setSerialNo] = useState<number>(employeeToEdit?.serialNo || nextSerialNo);
  const [area, setArea] = useState<string>(employeeToEdit?.area || areas[0] || '');
  const [branch, setBranch] = useState<string>(employeeToEdit?.branch || '');
  const [name, setName] = useState<string>(employeeToEdit?.name || '');
  const [pin, setPin] = useState<string>(employeeToEdit?.pin || '');
  const [designation, setDesignation] = useState<string>(employeeToEdit?.designation || designations[0] || '');
  const [mobile, setMobile] = useState<string>(employeeToEdit?.mobile || '');
  const [email, setEmail] = useState<string>(employeeToEdit?.email || '');
  const [orgJoiningDate, setOrgJoiningDate] = useState<string>(employeeToEdit?.orgJoiningDate || '');
  const [branchJoiningDate, setBranchJoiningDate] = useState<string>(employeeToEdit?.branchJoiningDate || '');
  const [birthDate, setBirthDate] = useState<string>(employeeToEdit?.birthDate || '');
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>(employeeToEdit?.bloodGroup || 'B+');
  const [status, setStatus] = useState<EmployeeStatus>(employeeToEdit?.status || 'Active');
  const [notes, setNotes] = useState<string>(employeeToEdit?.notes || '');
  const [error, setError] = useState<string>('');

  const filteredBranches = branches.filter(b => !area || b.area === area);

  useEffect(() => {
    if (!branch && filteredBranches.length > 0) {
      setBranch(filteredBranches[0].name);
    }
  }, [area, branch, filteredBranches]);

  const handleAreaChange = (selectedArea: string) => {
    setArea(selectedArea);
    const inArea = branches.filter(b => b.area === selectedArea);
    if (inArea.length > 0) {
      setBranch(inArea[0].name);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError(language === 'bn' ? 'কর্মীর নাম লিখুন' : 'Employee Name is required');
      return;
    }
    if (!pin.trim()) {
      setError(language === 'bn' ? 'পরিচিতি নম্বর (PIN) লিখুন' : 'PIN is required');
      return;
    }
    if (!mobile.trim()) {
      setError(language === 'bn' ? 'মোবাইল নম্বর লিখুন' : 'Mobile number is required');
      return;
    }
    if (!orgJoiningDate) {
      setError(language === 'bn' ? 'সংস্থায় যোগদানের তারিখ দিন' : 'Org joining date is required');
      return;
    }
    if (!branchJoiningDate) {
      setBranchJoiningDate(orgJoiningDate);
    }

    onSave({
      id: employeeToEdit?.id,
      serialNo,
      area,
      branch,
      name: name.trim(),
      pin: pin.trim(),
      designation,
      mobile: mobile.trim(),
      email: email.trim(),
      orgJoiningDate,
      branchJoiningDate: branchJoiningDate || orgJoiningDate,
      birthDate,
      bloodGroup,
      status,
      notes: notes.trim(),
      transferHistory: employeeToEdit?.transferHistory || []
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-150"
        role="dialog"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-xs">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {employeeToEdit ? t.editEmployee : t.addEmployee}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {language === 'bn' 
                  ? 'সকল তারিখ দিন/মাস/বছর (DD/MM/YYYY) হিসেবে সংরক্ষিত ও প্রদর্শিত হবে'
                  : 'All dates will be formatted in Day/Month/Year'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Bulk upload hint */}
        {!employeeToEdit && onOpenBulkImport && (
          <div className="mx-6 mt-4 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2 text-xs text-emerald-900 dark:text-emerald-300">
              <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                <strong>একসাথে একাধিক কর্মী যুক্ত করতে চান?</strong> এক্সেল বা CSV ফাইল আপলোড করুন
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenBulkImport();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>এক্সেল আপলোড করুন</span>
            </button>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300 border border-red-200 text-xs">
              {error}
            </div>
          )}

          {/* Row 1: Sl No, Area, Branch */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t.serialNo}
              </label>
              <input
                type="number"
                value={serialNo}
                onChange={(e) => setSerialNo(parseInt(e.target.value, 10) || 1)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm font-mono-num focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t.area} <span className="text-red-500">*</span>
              </label>
              <select
                value={area}
                onChange={(e) => handleAreaChange(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              >
                {areas.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t.branch} <span className="text-red-500">*</span>
              </label>
              <select
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              >
                {filteredBranches.map((b) => (
                  <option key={b.id} value={b.name}>{b.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: Name, PIN, Designation */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t.staffName} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="কর্মীর নাম লিখুন..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t.pin} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="যেমন: SSS-89412"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t.designation} <span className="text-red-500">*</span>
              </label>
              <select
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              >
                {designations.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 3: Mobile, Email, Blood Group */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t.mobile} <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                required
                placeholder="যেমন: 01812345678"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t.email}
              </label>
              <input
                type="email"
                placeholder="যেমন: employee@sss.org.bd"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t.bloodGroup} (রক্তের গ্রুপ) <span className="text-red-500">*</span>
              </label>
              <select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value as BloodGroup)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm font-bold text-red-600 dark:text-red-400 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              >
                {BLOOD_GROUPS.map((bg) => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 4: Org Joining Date, Branch Joining Date, Date of Birth */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t.orgJoiningDate} <span className="text-red-500">*</span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block font-normal">(ফরম্যাট: দিন/মাস/বছর)</span>
              </label>
              <input
                type="date"
                required
                value={orgJoiningDate}
                onChange={(e) => {
                  setOrgJoiningDate(e.target.value);
                  if (!branchJoiningDate) setBranchJoiningDate(e.target.value);
                }}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
              {orgJoiningDate && (
                <span className="text-[11px] font-mono-num text-slate-500 mt-1 block">
                  প্রদর্শন: {formatDateDDMMYYYY(orgJoiningDate, language)}
                </span>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t.branchJoiningDate} <span className="text-red-500">*</span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block font-normal">(৩ বছর বদলি গণনার জন্য)</span>
              </label>
              <input
                type="date"
                required
                value={branchJoiningDate}
                onChange={(e) => setBranchJoiningDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
              {branchJoiningDate && (
                <span className="text-[11px] font-mono-num text-slate-500 mt-1 block">
                  প্রদর্শন: {formatDateDDMMYYYY(branchJoiningDate, language)}
                </span>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t.dateOfBirth} <span className="text-red-500">*</span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block font-normal">(ফরম্যাট: দিন/মাস/বছর)</span>
              </label>
              <input
                type="date"
                required
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
              {birthDate && (
                <span className="text-[11px] font-mono-num text-slate-500 mt-1 block">
                  প্রদর্শন: {formatDateDDMMYYYY(birthDate, language)}
                </span>
              )}
            </div>
          </div>

          {/* Row 5: Status & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                কর্মীর অবস্থা (Status)
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as EmployeeStatus)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              >
                {STATUSES.map(st => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t.notes} (ঐচ্ছিক)
              </label>
              <input
                type="text"
                placeholder="প্রয়োজনীয় কোনো মন্তব্য লিখুন..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Footer buttons */}
          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-md transition transform active:scale-98 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{employeeToEdit ? t.save : t.add}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
