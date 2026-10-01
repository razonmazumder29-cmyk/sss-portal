import React, { useState, useEffect } from 'react';
import { 
  X, 
  ArrowLeftRight, 
  Building2, 
  MapPin, 
  Calendar, 
  CheckCircle,
  AlertCircle,
  AlertTriangle 
} from 'lucide-react';
import { Employee, BranchItem } from '../types';
import { translations } from '../translations';
import { formatDate, calculateTenure, isDueForTransfer } from '../utils/dateCalculations';

interface TransferModalProps {
  employees: Employee[];
  areas: string[];
  branches: BranchItem[];
  preselectedEmployeeId?: string | null;
  language: 'bn' | 'en';
  isOpen: boolean;
  onClose: () => void;
  onExecuteTransfer: (data: {
    employeeId: string;
    newArea: string;
    newBranch: string;
    transferDate: string;
    orderRef?: string;
    reason?: string;
  }) => void;
}

export const TransferModal: React.FC<TransferModalProps> = ({
  employees,
  areas,
  branches,
  preselectedEmployeeId,
  language,
  isOpen,
  onClose,
  onExecuteTransfer
}) => {
  if (!isOpen) return null;
  const t = translations[language];

  const [selectedEmpId, setSelectedEmpId] = useState<string>(
    preselectedEmployeeId || (employees.length > 0 ? employees[0].id : '')
  );

  const currentEmp = employees.find(e => e.id === selectedEmpId);
  const [targetArea, setTargetArea] = useState<string>('');
  const [targetBranch, setTargetBranch] = useState<string>('');
  const [transferDate, setTransferDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [orderRef, setOrderRef] = useState<string>('');
  const [reason, setReason] = useState<string>('দাপ্তরিক ও সংস্থাগত প্রয়োজনে শাখা বদলি');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (preselectedEmployeeId) {
      setSelectedEmpId(preselectedEmployeeId);
    }
  }, [preselectedEmployeeId]);

  useEffect(() => {
    if (currentEmp) {
      setTargetArea(currentEmp.area);
      const candidates = branches.filter(b => b.area === currentEmp.area && b.name !== currentEmp.branch);
      if (candidates.length > 0) {
        setTargetBranch(candidates[0].name);
      } else {
        const otherBranch = branches.find(b => b.name !== currentEmp.branch);
        if (otherBranch) {
          setTargetArea(otherBranch.area);
          setTargetBranch(otherBranch.name);
        }
      }
    }
  }, [selectedEmpId, currentEmp, branches]);

  const filteredBranches = branches.filter(b => !targetArea || b.area === targetArea);

  const handleAreaChange = (newArea: string) => {
    setTargetArea(newArea);
    const branchInArea = branches.find(b => b.area === newArea);
    if (branchInArea) {
      setTargetBranch(branchInArea.name);
    } else {
      setTargetBranch('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmpId) {
      setError(language === 'bn' ? 'অনুগ্রহ করে একজন কর্মী নির্বাচন করুন' : 'Please select an employee');
      return;
    }
    if (!targetBranch) {
      setError(language === 'bn' ? 'অনুগ্রহ করে নতুন শাখা নির্বাচন করুন' : 'Please select the target branch');
      return;
    }
    if (currentEmp && targetBranch === currentEmp.branch) {
      setError(language === 'bn' ? 'বদলিকৃত নতুন শাখা বর্তমান শাখা থেকে ভিন্ন হতে হবে' : 'Target branch must be different from current branch');
      return;
    }

    onExecuteTransfer({
      employeeId: selectedEmpId,
      newArea: targetArea,
      newBranch: targetBranch,
      transferDate,
      orderRef,
      reason
    });
    onClose();
  };

  const branchTenure = currentEmp ? calculateTenure(currentEmp.branchJoiningDate) : null;
  const isOverdue = currentEmp ? isDueForTransfer(currentEmp.branchJoiningDate) : false;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div 
        className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-950 flex items-center justify-center text-teal-600 dark:text-teal-400">
              <ArrowLeftRight className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {t.transferModalTitle}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {language === 'bn' ? 'Super Admin ক্ষমতায় কর্মীর শাখা বদলি ও কেন্দ্রীয় রেকর্ড হালনাগাদ' : 'Transfer employee seamlessly between branches'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs sm:text-sm">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300 border border-red-200 dark:border-red-800 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Employee Selection Dropdown */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {t.transferSelectStaff} <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedEmpId}
              onChange={(e) => setSelectedEmpId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            >
              {employees.map((emp) => {
                const due = isDueForTransfer(emp.branchJoiningDate);
                return (
                  <option key={emp.id} value={emp.id}>
                    {due ? '⚠️ [Due for Transfer] ' : ''}{emp.name} ({emp.pin}) - {emp.designation} [{emp.branch}]
                  </option>
                );
              })}
            </select>
          </div>

          {/* Current Location Box */}
          {currentEmp && (
            <div className={`p-4 rounded-2xl border ${
              isOverdue 
                ? 'bg-red-50/80 dark:bg-red-950/40 border-red-300 dark:border-red-800/80' 
                : 'bg-slate-100/80 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700'
            }`}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {t.currentLocation}:
                </span>
                {isOverdue && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-600 text-white font-black text-[10px]">
                    <AlertTriangle className="w-3 h-3" />
                    <span>একই ব্রাঞ্চে ৩+ বছর অতিক্রান্ত (Due for Transfer)</span>
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
                <span className="flex items-center gap-1 text-teal-700 dark:text-teal-400">
                  <Building2 className="w-3.5 h-3.5" />
                  {currentEmp.branch}
                </span>
                <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400 font-normal">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {currentEmp.area}
                </span>
                <span className="text-slate-500 font-normal">
                  (বর্তমান শাখায় মেয়াদ: <strong>{branchTenure?.displayTextBn}</strong>)
                </span>
              </div>
            </div>
          )}

          {/* New Area & New Branch */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t.newArea} <span className="text-red-500">*</span>
              </label>
              <select
                value={targetArea}
                onChange={(e) => handleAreaChange(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              >
                {areas.map((area) => (
                  <option key={area} value={area}>
                    {area}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t.newBranch} <span className="text-red-500">*</span>
              </label>
              <select
                value={targetBranch}
                onChange={(e) => setTargetBranch(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              >
                {filteredBranches.map((branch) => (
                  <option key={branch.id} value={branch.name}>
                    {branch.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Transfer Date & Order Ref */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t.effectiveTransferDate} (DD/MM/YYYY) <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={transferDate}
                onChange={(e) => setTransferDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t.orderReference}
              </label>
              <input
                type="text"
                placeholder="যেমন: SSS/HR/TR/2026/089"
                value={orderRef}
                onChange={(e) => setOrderRef(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Reason / Remarks */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {t.transferReason}
            </label>
            <input
              type="text"
              placeholder="বদলির কারণ..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          {/* Note */}
          <p className="text-[11px] text-slate-500 dark:text-slate-400 bg-emerald-50/50 dark:bg-emerald-950/30 p-3 rounded-xl border border-emerald-200/50 dark:border-emerald-800/30">
            💡 বদলি কার্যকর করার সাথে সাথে কর্মীর নতুন শাখায় মেয়াদ গণনা <strong>{transferDate}</strong> তারিখ থেকে শুরু হবে এবং কেন্দ্রীয় ক্লাউড ডাটাবেজে রিয়েল-টাইমে আপডেট হবে।
          </p>

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
            >
              <CheckCircle className="w-4 h-4" />
              <span>{t.confirmTransfer}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
