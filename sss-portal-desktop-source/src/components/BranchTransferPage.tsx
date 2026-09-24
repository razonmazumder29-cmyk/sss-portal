import React, { useState } from 'react';
import { 
  ArrowLeftRight, 
  Search, 
  Building2, 
  MapPin, 
  Calendar, 
  FileText, 
  Clock, 
  CheckCircle2,
  PlusCircle,
  History
} from 'lucide-react';
import { Employee, BranchItem } from '../types';
import { translations } from '../translations';
import { formatDate } from '../utils/dateCalculations';

interface BranchTransferPageProps {
  employees: Employee[];
  areas: string[];
  branches: BranchItem[];
  language: 'bn' | 'en';
  onOpenTransferModal: () => void;
}

export const BranchTransferPage: React.FC<BranchTransferPageProps> = ({
  employees,
  areas,
  branches,
  language,
  onOpenTransferModal
}) => {
  const t = translations[language];
  const [searchTerm, setSearchTerm] = useState('');

  // Collect all transfer histories across all employees
  const allTransfers = employees.flatMap((emp) => 
    (emp.transferHistory || []).map((tr) => ({
      ...tr,
      employeeName: emp.name,
      employeePin: emp.pin,
      employeeDesignation: emp.designation,
      employeeId: emp.id
    }))
  ).sort((a, b) => new Date(b.transferDate).getTime() - new Date(a.transferDate).getTime());

  const filteredTransfers = allTransfers.filter(tr => {
    const q = searchTerm.toLowerCase();
    return !q || (
      tr.employeeName.toLowerCase().includes(q) ||
      tr.employeePin.toLowerCase().includes(q) ||
      tr.fromBranch.toLowerCase().includes(q) ||
      tr.toBranch.toLowerCase().includes(q) ||
      (tr.orderRef && tr.orderRef.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-600 dark:text-teal-400 flex items-center justify-center shadow-xs">
            <ArrowLeftRight className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {t.tabTransfer}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {language === 'bn' 
                ? 'চট্টগ্রাম-০২ জোনের কর্মীদের এক শাখা হতে অন্য শাখায় পদায়ন ও বদলির অফিশিয়াল ট্র্যাকার' 
                : 'Official tracker for staff redeployment & branch transfers across Chattogram-02'}
            </p>
          </div>
        </div>

        <button
          onClick={onOpenTransferModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs sm:text-sm font-semibold shadow-xs transition"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{language === 'bn' ? 'নতুন বদলি কার্যকর করুন' : 'Execute New Transfer'}</span>
        </button>
      </div>

      {/* Transfer History Table & Filter */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-5 space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {language === 'bn' ? 'সাম্প্রতিক শাখা বদলির ইতিহাস' : 'Recent Transfer Log'}
            </h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 font-mono font-bold">
              {filteredTransfers.length}
            </span>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="কর্মী, পিন বা শাখা দিয়ে খুঁজুন..."
              className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>

        {/* History Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold uppercase text-[11px] border-y border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-2.5 px-3">কর্মীর নাম ও পদবী</th>
                <th className="py-2.5 px-3">পূর্বের এরিয়া ও শাখা</th>
                <th className="py-2.5 px-3">নতুন এরিয়া ও শাখা</th>
                <th className="py-2.5 px-3">কার্যকর তারিখ</th>
                <th className="py-2.5 px-3">স্মারক / রেফারেন্স</th>
                <th className="py-2.5 px-3">কারণ / বিবরণ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredTransfers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    কোনো শাখা বদলির রেকর্ড পাওয়া যায়নি। উপরের "নতুন বদলি কার্যকর করুন" বাটনে ক্লিক করে বদলি সম্পন্ন করুন।
                  </td>
                </tr>
              ) : (
                filteredTransfers.map((tr, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900 dark:text-white">{tr.employeeName}</div>
                      <div className="text-[11px] text-teal-700 dark:text-teal-400 font-medium">
                        {tr.employeeDesignation} · <span className="font-mono">{tr.employeePin}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-medium text-slate-800 dark:text-slate-200">{tr.fromBranch}</div>
                      <div className="text-[10px] text-slate-400">{tr.fromArea}</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                        <span>{tr.toBranch}</span>
                      </div>
                      <div className="text-[10px] text-slate-400">{tr.toArea}</div>
                    </td>
                    <td className="py-3 px-3 font-mono font-medium">
                      {formatDate(tr.transferDate, language)}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-500">
                      {tr.orderRef || '—'}
                    </td>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-400 max-w-xs truncate">
                      {tr.reason || 'দাপ্তরিক বদলি'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
