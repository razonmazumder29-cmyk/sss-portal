import React from 'react';
import { X, Printer, Building2, Phone, Mail, Award, Droplet } from 'lucide-react';
import { Employee, SettingsConfig } from '../types';
import { translations } from '../translations';
import { formatDate, toBengaliNumber } from '../utils/dateCalculations';

interface EmployeeIdModalProps {
  employee: Employee | null;
  settings: SettingsConfig;
  language: 'bn' | 'en';
  onClose: () => void;
}

export const EmployeeIdModal: React.FC<EmployeeIdModalProps> = ({
  employee,
  settings,
  language,
  onClose
}) => {
  if (!employee) return null;
  const t = translations[language];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div 
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[95vh] animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
      >
        {/* Header no-print */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 no-print">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {language === 'bn' ? 'অফিশিয়াল কর্মী আইডি কার্ড' : 'Official Staff ID Card'}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'প্রিন্ট করুন' : 'Print Card'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable ID Card Container */}
        <div className="p-6 flex justify-center bg-slate-100 dark:bg-slate-950/80 overflow-y-auto">
          <div className="print-card w-full max-w-[340px] bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden text-slate-900 flex flex-col relative">
            {/* Card Header */}
            <div className="bg-gradient-to-r from-emerald-800 to-teal-700 p-4 text-white text-center relative">
              <div className="w-12 h-12 mx-auto rounded-full bg-white text-emerald-800 font-extrabold flex items-center justify-center shadow-md text-base border-2 border-emerald-400">
                SSS
              </div>
              <h4 className="font-extrabold text-sm mt-1.5 tracking-tight">
                {settings.orgNameBn}
              </h4>
              <p className="text-[11px] text-emerald-100 font-medium">
                {settings.orgNameEn}
              </p>
              <div className="mt-1 inline-block px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-semibold tracking-wide">
                জোন: {settings.zoneNameBn} ({settings.zoneNameEn})
              </div>
            </div>

            {/* Avatar & Core Info */}
            <div className="p-5 text-center flex-1 space-y-3">
              <div className="relative inline-block mx-auto">
                <div className="w-24 h-24 rounded-full bg-slate-100 border-4 border-emerald-500/30 flex items-center justify-center text-3xl font-extrabold text-slate-600 shadow-inner">
                  {employee.name.charAt(0)}
                </div>
                <span className="absolute bottom-0 right-0 px-2 py-0.5 rounded-full bg-red-600 text-white text-[11px] font-bold shadow-xs">
                  {employee.bloodGroup}
                </span>
              </div>

              <div>
                <h3 className="text-lg font-extrabold text-slate-900 leading-tight">
                  {employee.name}
                </h3>
                <p className="text-xs font-bold text-emerald-700 mt-0.5">
                  {employee.designation}
                </p>
                <p className="text-xs font-mono font-semibold text-slate-500 mt-0.5">
                  PIN: {employee.pin}
                </p>
              </div>

              {/* Detail Rows */}
              <div className="pt-2 border-t border-slate-100 text-left text-xs space-y-2">
                <div className="flex justify-between py-0.5 border-b border-slate-50">
                  <span className="text-slate-500">বর্তমান শাখা:</span>
                  <span className="font-bold text-slate-800">{employee.branch}</span>
                </div>
                <div className="flex justify-between py-0.5 border-b border-slate-50">
                  <span className="text-slate-500">এরিয়া:</span>
                  <span className="font-semibold text-slate-800">{employee.area}</span>
                </div>
                <div className="flex justify-between py-0.5 border-b border-slate-50">
                  <span className="text-slate-500">মোবাইল:</span>
                  <span className="font-mono font-bold text-slate-800">{employee.mobile}</span>
                </div>
                <div className="flex justify-between py-0.5 border-b border-slate-50">
                  <span className="text-slate-500">সংস্থায় যোগদান:</span>
                  <span className="font-medium text-slate-800">{formatDate(employee.orgJoiningDate, 'bn')}</span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="text-slate-500">রক্তের গ্রুপ:</span>
                  <span className="font-bold text-red-600">{employee.bloodGroup}</span>
                </div>
              </div>

              {/* Barcode Mock Visual */}
              <div className="pt-3">
                <div className="h-9 w-4/5 mx-auto bg-repeat-x flex items-center justify-center gap-0.5 opacity-70">
                  {[4,2,3,1,5,2,4,1,3,2,5,1,4,2,3,5,2,1,4,3,2,4,1,5,3,2].map((w, idx) => (
                    <div key={idx} className="bg-slate-800 h-7" style={{ width: `${w}px` }} />
                  ))}
                </div>
                <span className="text-[10px] font-mono text-slate-400 block mt-1">
                  {employee.pin} · SSS-CTG02
                </span>
              </div>
            </div>

            {/* Card Footer */}
            <div className="bg-slate-50 p-3 text-center border-t border-slate-200">
              <p className="text-[10px] text-slate-500 leading-tight">
                এই কার্ডটি সোসাইটি ফর সোসাল সার্ভিস (এসএসএস)-এর সম্পত্তি। কার্ডটি পাওয়া গেলে নিকটস্থ এসএসএস শাখা অথবা জোন অফিসে জমা দেওয়ার জন্য অনুরোধ করা হলো।
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
