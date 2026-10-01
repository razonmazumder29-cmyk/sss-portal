import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  Users, 
  Building2, 
  Printer, 
  Award, 
  Clock, 
  HeartHandshake, 
  Search, 
  X, 
  Phone, 
  MessageCircle, 
  ChevronRight, 
  MapPin, 
  Info,
  FileSpreadsheet,
  AlertTriangle,
  ArrowLeftRight
} from 'lucide-react';
import { Employee, BranchItem, AuditLog } from '../types';
import { translations } from '../translations';
import { toBengaliNumber, formatDate, formatDateDDMMYYYY, calculateTenure, isDueForTransfer } from '../utils/dateCalculations';
import { exportEmployeesToCsv, exportEmployeesToExcel } from '../utils/exportImport';
import { SssLogo } from './SssLogo';

interface DashboardReportsProps {
  employees: Employee[];
  branches: BranchItem[];
  areas: string[];
  auditLogs?: AuditLog[];
  language: 'bn' | 'en';
  isSuperAdmin: boolean;
  onInitiateTransfer?: (emp: Employee) => void;
}

type BracketKey = 'lessThan1' | 'oneToThree' | 'threeToFive' | 'fiveToTen' | 'tenPlus';

interface EmployeeTenureInfo {
  employee: Employee;
  years: number;
  months: number;
  days: number;
  totalDays: number;
  joiningDate: string;
  displayTextBn: string;
  displayTextEn: string;
}

export const DashboardReports: React.FC<DashboardReportsProps> = ({
  employees,
  branches,
  areas,
  auditLogs = [],
  language,
  isSuperAdmin,
  onInitiateTransfer
}) => {
  const t = translations[language];

  // Active modal state for drilldown
  const [drilldownModal, setDrilldownModal] = useState<{
    type: 'org' | 'branch' | 'dueForTransfer';
    bracketKey?: BracketKey;
  } | null>(null);

  const [drilldownSearch, setDrilldownSearch] = useState('');

  // Transfer Due list (3+ years in branch)
  const transferDueList = useMemo(() => {
    return employees.filter(e => e.status !== 'Retired' && isDueForTransfer(e.branchJoiningDate));
  }, [employees]);

  // Process all employees tenure for Organization and Current Branch
  const processedData = useMemo(() => {
    const today = new Date();
    const todayTime = today.getTime();
    const orgList: EmployeeTenureInfo[] = [];
    const branchList: EmployeeTenureInfo[] = [];

    employees.forEach(emp => {
      // 1. Organization Tenure
      if (emp.orgJoiningDate) {
        const tenure = calculateTenure(emp.orgJoiningDate, today);
        const joinTime = new Date(emp.orgJoiningDate).getTime();
        const totalDays = Math.max(0, Math.floor((todayTime - joinTime) / (1000 * 60 * 60 * 24)));
        orgList.push({
          employee: emp,
          years: tenure.years,
          months: tenure.months,
          days: tenure.days,
          totalDays,
          joiningDate: emp.orgJoiningDate,
          displayTextBn: tenure.displayTextBn,
          displayTextEn: tenure.displayTextEn
        });
      }

      // 2. Branch Tenure
      const bDate = emp.branchJoiningDate || emp.orgJoiningDate;
      if (bDate) {
        const tenure = calculateTenure(bDate, today);
        const joinTime = new Date(bDate).getTime();
        const totalDays = Math.max(0, Math.floor((todayTime - joinTime) / (1000 * 60 * 60 * 24)));
        branchList.push({
          employee: emp,
          years: tenure.years,
          months: tenure.months,
          days: tenure.days,
          totalDays,
          joiningDate: bDate,
          displayTextBn: tenure.displayTextBn,
          displayTextEn: tenure.displayTextEn
        });
      }
    });

    const groupIntoBuckets = (list: EmployeeTenureInfo[]) => {
      const buckets: Record<BracketKey, EmployeeTenureInfo[]> = {
        lessThan1: [],
        oneToThree: [],
        threeToFive: [],
        fiveToTen: [],
        tenPlus: []
      };

      list.forEach(item => {
        if (item.years < 1) {
          buckets.lessThan1.push(item);
        } else if (item.years <= 3) {
          buckets.oneToThree.push(item);
        } else if (item.years <= 5) {
          buckets.threeToFive.push(item);
        } else if (item.years <= 10) {
          buckets.fiveToTen.push(item);
        } else {
          buckets.tenPlus.push(item);
        }
      });

      (Object.keys(buckets) as BracketKey[]).forEach(k => {
        buckets[k].sort((a, b) => b.totalDays - a.totalDays);
      });

      return {
        buckets,
        totalCount: list.length
      };
    };

    return {
      orgStats: groupIntoBuckets(orgList),
      branchStats: groupIntoBuckets(branchList)
    };
  }, [employees]);

  // Blood group counts
  const bloodCounts = useMemo(() => {
    const counts: Record<string, number> = {
      'A+': 0, 'A-': 0, 'B+': 0, 'B-': 0, 'O+': 0, 'O-': 0, 'AB+': 0, 'AB-': 0
    };
    employees.forEach(e => {
      if (counts[e.bloodGroup] !== undefined) {
        counts[e.bloodGroup]++;
      }
    });
    return counts;
  }, [employees]);

  const bracketMeta: Record<BracketKey, { labelBn: string; labelEn: string; descBn: string; descEn: string }> = {
    lessThan1: {
      labelBn: '১ বছরের কম (নতুন)',
      labelEn: '< 1 Year (New)',
      descBn: 'শাখা ও সংস্থায় প্রাথমিক পর্বে যুক্ত সহকর্মী',
      descEn: 'Newly joined team members in induction phase'
    },
    oneToThree: {
      labelBn: '১ - ৩ বছর',
      labelEn: '1 - 3 Years',
      descBn: 'নির্ধারিত ব্রাঞ্চে স্বাভাবিক মেয়াদে কর্মরত',
      descEn: 'Established professional tenure'
    },
    threeToFive: {
      labelBn: '৩ - ৫ বছর (বদলি প্রযোজ্য ⚠️)',
      labelEn: '3 - 5 Years (Transfer Due ⚠️)',
      descBn: 'সংস্থাগত নিয়ম অনুযায়ী ৩ বছর অতিক্রান্ত বদলি উপযুক্ত',
      descEn: 'Experienced workforce due for rotation'
    },
    fiveToTen: {
      labelBn: '৫ - ১০ বছর (অবিলম্বে বদলি ⚠️)',
      labelEn: '5 - 10 Years (Urgent Transfer ⚠️)',
      descBn: 'একই ব্রাঞ্চে দীর্ঘকাল কর্মরত, অবিলম্বে বদলি আবশ্যক',
      descEn: 'Senior seasoned operational personnel'
    },
    tenPlus: {
      labelBn: '১০+ বছর (অগ্রজ কর্মী)',
      labelEn: '10+ Years (Veterans)',
      descBn: 'সংস্থার অন্যতম ভিত্তি ও অভিজ্ঞ সহকর্মীবৃন্দ',
      descEn: 'Key institutional pillars & veteran mentors'
    }
  };

  const bracketKeys: BracketKey[] = ['lessThan1', 'oneToThree', 'threeToFive', 'fiveToTen', 'tenPlus'];

  // Current modal data
  const currentModalData = useMemo(() => {
    if (!drilldownModal) return null;

    if (drilldownModal.type === 'dueForTransfer') {
      const q = drilldownSearch.trim().toLowerCase();
      const filtered = q
        ? transferDueList.filter(e =>
            e.name.toLowerCase().includes(q) ||
            e.pin.toLowerCase().includes(q) ||
            e.branch.toLowerCase().includes(q) ||
            e.designation.toLowerCase().includes(q)
          )
        : transferDueList;

      return {
        type: 'dueForTransfer' as const,
        items: filtered.map(e => ({
          employee: e,
          joiningDate: e.branchJoiningDate,
          ...calculateTenure(e.branchJoiningDate)
        })),
        totalInBracket: transferDueList.length,
        label: language === 'bn' ? 'Due for Transfer (একই ব্রাঞ্চে ৩+ বছর অতিক্রান্ত)' : 'Due for Transfer (3+ Years in Branch)',
        scopeTitle: language === 'bn' ? 'সংস্থাগত বদলি সতর্কতা' : 'Policy Rotation Alert'
      };
    }

    const stats = drilldownModal.type === 'org' ? processedData.orgStats : processedData.branchStats;
    const list = drilldownModal.bracketKey ? (stats.buckets[drilldownModal.bracketKey] || []) : [];
    
    const q = drilldownSearch.trim().toLowerCase();
    const filtered = q
      ? list.filter(item => 
          item.employee.name.toLowerCase().includes(q) ||
          item.employee.pin.toLowerCase().includes(q) ||
          item.employee.branch.toLowerCase().includes(q) ||
          item.employee.designation.toLowerCase().includes(q) ||
          item.employee.area.toLowerCase().includes(q) ||
          item.employee.mobile.includes(q)
        )
      : list;

    const label = drilldownModal.bracketKey ? (
      language === 'bn' 
        ? bracketMeta[drilldownModal.bracketKey].labelBn 
        : bracketMeta[drilldownModal.bracketKey].labelEn
    ) : '';

    return {
      type: drilldownModal.type,
      bracketKey: drilldownModal.bracketKey,
      items: filtered,
      totalInBracket: list.length,
      label,
      scopeTitle: drilldownModal.type === 'org'
        ? (language === 'bn' ? 'সংস্থায় সার্বিক মেয়াদ' : 'Tenure in Organization')
        : (language === 'bn' ? 'বর্তমান ব্রাঞ্চে চাকরির মেয়াদ' : 'Tenure in Current Branch')
    };
  }, [drilldownModal, drilldownSearch, processedData, transferDueList, language]);

  return (
    <div className="space-y-6">
      {/* Top Banner & Print Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3">
          <SssLogo size="md" variant="rounded" className="border-emerald-500/25 shadow-xs" />
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span>{t.dashboardTitle}</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {language === 'bn' 
                ? 'সোসাইটি ফর সোসাল সার্ভিস (এসএসএস) চট্টগ্রাম-০২ জোন কর্মী ব্যবস্থাপনা ও ৩ বছর বদলি অ্যানালিটিক্স'
                : 'Tenure analysis in organization & current branch with 3-year transfer alert'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => exportEmployeesToExcel(employees, language)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-xs transition cursor-pointer"
            title="এক্সেল ফাইলে ডাউনলোড (.xlsx)"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>{language === 'bn' ? 'এক্সেল (.xlsx)' : 'Export Excel'}</span>
          </button>
          <button
            onClick={() => exportEmployeesToCsv(employees, language)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-xs transition cursor-pointer"
          >
            <span>{language === 'bn' ? 'CSV ডাউনলোড' : 'Export CSV'}</span>
          </button>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>{language === 'bn' ? 'রিপোর্ট প্রিন্ট' : 'Print Report'}</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Cards with 3-Year Due for Transfer Highlight */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Due for Transfer (৩+ বছর অতিক্রান্ত) - PROMINENT RED ALERT */}
        <div 
          onClick={() => {
            setDrilldownSearch('');
            setDrilldownModal({ type: 'dueForTransfer' });
          }}
          className={`p-5 rounded-3xl border shadow-xs flex items-center justify-between cursor-pointer transition transform hover:-translate-y-0.5 ${
            transferDueList.length > 0
              ? 'bg-red-50 dark:bg-red-950/50 border-red-300 dark:border-red-800 ring-2 ring-red-500/60'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
              transferDueList.length > 0
                ? 'bg-red-600 text-white shadow-md animate-pulse'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
            }`}>
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-red-700 dark:text-red-400 uppercase tracking-wide block">
                {language === 'bn' ? 'Due for Transfer (৩+ বছর)' : 'Due for Transfer'}
              </span>
              <span className="text-2xl font-black text-red-600 dark:text-red-300 font-mono-num">
                {language === 'bn' ? toBengaliNumber(transferDueList.length) : transferDueList.length} জন
              </span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-red-500" />
        </div>

        {/* KPI 2: Total Staff */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">
              {t.totalEmployees}
            </span>
            <span className="text-2xl font-black text-slate-900 dark:text-white font-mono-num">
              {language === 'bn' ? toBengaliNumber(employees.length) : employees.length} জন
            </span>
          </div>
        </div>

        {/* KPI 3: Total Branches */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-teal-100 dark:bg-teal-950 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">
              {t.totalBranches}
            </span>
            <span className="text-2xl font-black text-slate-900 dark:text-white font-mono-num">
              {language === 'bn' ? toBengaliNumber(branches.length) : branches.length} টি
            </span>
          </div>
        </div>

        {/* KPI 4: Total Areas */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">
              {language === 'bn' ? 'মোট এরিয়া' : 'Total Areas'}
            </span>
            <span className="text-2xl font-black text-slate-900 dark:text-white font-mono-num">
              {language === 'bn' ? toBengaliNumber(areas.length) : areas.length} টি
            </span>
          </div>
        </div>
      </div>

      {/* ================= DETAILED TENURE SECTIONS (SIDE BY SIDE) ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. TENURE IN CURRENT BRANCH (Highlighted with 3-year transfer warnings) */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 flex items-center justify-center shadow-xs">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>{language === 'bn' ? 'বর্তমান ব্রাঞ্চে মেয়াদ (Branch Tenure)' : 'Tenure in Current Branch'}</span>
                    <span className="text-[10px] px-2 py-0.2 rounded-full bg-red-600 text-white font-black">
                      ৩ বছর বদলি নিয়ম
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {language === 'bn' 
                      ? 'যেকোনো ব্র্যাকেটে ক্লিক করে তালিকা ও বদলি ব্যবস্থাপনা করুন'
                      : 'Critical for branch transfer and roster planning'}
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800">
                {language === 'bn' ? `মোট: ${toBengaliNumber(employees.length)} জন` : `Total: ${employees.length}`}
              </span>
            </div>

            {/* Interactive Bracket Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {bracketKeys.map(key => {
                const count = processedData.branchStats.buckets[key].length;
                const total = processedData.branchStats.totalCount || 1;
                const pct = Math.round((count / total) * 100);
                const isTransferDueBracket = key === 'threeToFive' || key === 'fiveToTen' || key === 'tenPlus';
                const label = language === 'bn' ? bracketMeta[key].labelBn : bracketMeta[key].labelEn;

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      setDrilldownSearch('');
                      setDrilldownModal({ type: 'branch', bracketKey: key });
                    }}
                    className={`text-left p-4 rounded-2xl border transition-all transform hover:-translate-y-0.5 hover:shadow-md cursor-pointer group flex flex-col justify-between ${
                      key === 'tenPlus'
                        ? 'sm:col-span-2'
                        : ''
                    } ${
                      isTransferDueBracket
                        ? 'bg-red-50/40 dark:bg-red-950/20 border-red-200 dark:border-red-900/60 hover:border-red-400'
                        : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-blue-400'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-xs font-bold ${isTransferDueBracket ? 'text-red-700 dark:text-red-300' : 'text-slate-700 dark:text-slate-200'}`}>
                        {label}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 group-hover:underline">
                        <span>তালিকা</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>

                    <div className="mt-3 flex items-baseline justify-between">
                      <span className="text-xl font-black text-slate-900 dark:text-white font-mono-num">
                        {language === 'bn' ? toBengaliNumber(count) : count} <span className="text-xs font-normal text-slate-500">জন</span>
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
                        {language === 'bn' ? `${toBengaliNumber(pct)}%` : `${pct}%`}
                      </span>
                    </div>

                    <div className="mt-2 w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isTransferDueBracket ? 'bg-red-600' : 'bg-blue-500'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 2. TENURE IN ORGANIZATION */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-xs">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {language === 'bn' ? 'সংস্থায় সার্বিক মেয়াদ (Organization Tenure)' : 'Tenure in Organization'}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {language === 'bn' 
                      ? 'সোসাইটি ফর সোসাল সার্ভিস (এসএসএস)-এ সহকর্মীদের মোট চাকরির মেয়াদ'
                      : 'Overall tenure across the organization'}
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                {language === 'bn' ? `মোট: ${toBengaliNumber(employees.length)} জন` : `Total: ${employees.length}`}
              </span>
            </div>

            {/* Interactive Bracket Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {bracketKeys.map(key => {
                const count = processedData.orgStats.buckets[key].length;
                const total = processedData.orgStats.totalCount || 1;
                const pct = Math.round((count / total) * 100);
                const isTenPlus = key === 'tenPlus';
                const label = language === 'bn' ? bracketMeta[key].labelBn : bracketMeta[key].labelEn;

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      setDrilldownSearch('');
                      setDrilldownModal({ type: 'org', bracketKey: key });
                    }}
                    className={`text-left p-4 rounded-2xl border transition-all transform hover:-translate-y-0.5 hover:shadow-md cursor-pointer group flex flex-col justify-between ${
                      isTenPlus 
                        ? 'sm:col-span-2 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 dark:from-emerald-950/40 dark:via-teal-950/30 dark:to-emerald-950/40 border-emerald-300 dark:border-emerald-800 ring-emerald-500' 
                        : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-amber-400 dark:hover:border-amber-600'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-xs font-bold ${isTenPlus ? 'text-emerald-900 dark:text-emerald-300' : 'text-slate-700 dark:text-slate-200'}`}>
                        {label}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 group-hover:underline">
                        <span>তালিকা</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>

                    <div className="mt-3 flex items-baseline justify-between">
                      <span className="text-xl font-black text-slate-900 dark:text-white font-mono-num">
                        {language === 'bn' ? toBengaliNumber(count) : count} <span className="text-xs font-normal text-slate-500">জন</span>
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
                        {language === 'bn' ? `${toBengaliNumber(pct)}%` : `${pct}%`}
                      </span>
                    </div>

                    <div className="mt-2 w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isTenPlus ? 'bg-emerald-600' : 'bg-amber-500'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ================= BLOOD GROUP BREAKDOWN SECTION ================= */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 flex items-center justify-center shadow-xs">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {language === 'bn' ? 'রক্তের গ্রুপ ও জরুরি সহায়তাকেন্দ্রীক পরিসংখ্যান' : 'Blood Group Distribution & Emergency Lifeline'}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {language === 'bn' 
                  ? 'জোনভুক্ত সকল কর্মীর রক্তের গ্রুপ অনুপাত'
                  : 'Breakdown of blood groups across all zone staff'}
              </p>
            </div>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
            {language === 'bn' ? '৮টি রক্তের গ্রুপ' : '8 Blood Groups'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => {
            const count = bloodCounts[bg] || 0;
            const pct = employees.length > 0 ? Math.round((count / employees.length) * 100) : 0;
            return (
              <div key={bg} className="p-4 rounded-2xl bg-red-50/60 dark:bg-red-950/30 border border-red-100 dark:border-red-900/50 text-center flex flex-col justify-center hover:shadow-xs transition">
                <span className="font-black text-xl text-red-600 dark:text-red-400 block">{bg}</span>
                <span className="text-xl font-black text-slate-900 dark:text-white font-mono-num block mt-1">
                  {language === 'bn' ? toBengaliNumber(count) : count} <span className="text-xs font-normal text-slate-500">জন</span>
                </span>
                <span className="text-[11px] text-slate-400 font-mono-num mt-0.5">({pct}%)</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ================= DETAILED DRILLDOWN MODAL ================= */}
      {currentModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div 
            className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150"
            role="dialog"
            aria-modal="true"
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-xs ${
                  currentModalData.type === 'dueForTransfer' 
                    ? 'bg-red-600'
                    : currentModalData.type === 'org' 
                    ? 'bg-amber-600' 
                    : 'bg-blue-600'
                }`}>
                  {currentModalData.type === 'dueForTransfer' ? (
                    <AlertTriangle className="w-5 h-5" />
                  ) : currentModalData.type === 'org' ? (
                    <Award className="w-5 h-5" />
                  ) : (
                    <Clock className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {currentModalData.scopeTitle}
                    </span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300">
                      {currentModalData.label}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                    {language === 'bn' 
                      ? `${currentModalData.label} তালিকা (${toBengaliNumber(currentModalData.totalInBracket)} জন)`
                      : `Staff Roster for ${currentModalData.label} (${currentModalData.totalInBracket} members)`}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setDrilldownModal(null)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-800 transition cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Filter Search bar */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-between items-center">
              <span className="text-xs font-medium text-slate-500">
                {currentModalData.type === 'dueForTransfer' && (
                  <span className="text-red-600 font-bold">
                    ⚠️ সংস্থাগত নিয়ম অনুযায়ী একই ব্রাঞ্চে ৩ বছর পূর্ণ হওয়ায় এই কর্মীদের অন্য ব্রাঞ্চে বদলি কার্যকর করার নির্দেশ রয়েছে।
                  </span>
                )}
              </span>
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder={language === 'bn' ? 'নাম, পিন, শাখা দিয়ে খুঁজুন...' : 'Search name, PIN, branch...'}
                  value={drilldownSearch}
                  onChange={(e) => setDrilldownSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Modal Table Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {currentModalData.items.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-xs">
                    {drilldownSearch 
                      ? (language === 'bn' ? 'অনুসন্ধানের সাথে কোনো কর্মী মেলেনি' : 'No staff matched your search')
                      : (language === 'bn' ? 'বর্তমানে এই তালিকায় কোনো কর্মী নেই' : 'No staff currently in this bracket')}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
                  <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                    <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 font-bold uppercase text-[11px] border-b border-slate-200 dark:border-slate-800 sticky top-0">
                      <tr>
                        <th className="py-2.5 px-3">{language === 'bn' ? 'ক্রমিক' : 'SL'}</th>
                        <th className="py-2.5 px-3">{language === 'bn' ? 'নাম ও পিন' : 'Staff Name & PIN'}</th>
                        <th className="py-2.5 px-3">{language === 'bn' ? 'পদবি' : 'Designation'}</th>
                        <th className="py-2.5 px-3">{language === 'bn' ? 'বর্তমান শাখা ও এরিয়া' : 'Branch & Area'}</th>
                        <th className="py-2.5 px-3">
                          {currentModalData.type === 'org' 
                            ? (language === 'bn' ? 'সংস্থায় যোগদান (DD/MM/YYYY)' : 'Org Join Date (DD/MM/YYYY)')
                            : (language === 'bn' ? 'বর্তমান শাখায় যোগদান (DD/MM/YYYY)' : 'Branch Join Date (DD/MM/YYYY)')}
                        </th>
                        <th className="py-2.5 px-3">{language === 'bn' ? 'সুনির্দিষ্ট মেয়াদ' : 'Exact Tenure'}</th>
                        <th className="py-2.5 px-3 text-right">{language === 'bn' ? 'অ্যাকশন' : 'Action'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                      {currentModalData.items.map((item, idx) => {
                        const hasTransferDue = isDueForTransfer(item.employee.branchJoiningDate);
                        return (
                          <tr key={item.employee.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                            <td className="py-2.5 px-3 font-mono text-slate-400">
                              {idx + 1}
                            </td>
                            <td className="py-2.5 px-3">
                              <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                <span>{item.employee.name}</span>
                                {hasTransferDue && (
                                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-red-600 text-white font-bold">
                                    Due
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] font-mono-num text-slate-400">
                                {item.employee.pin}
                              </div>
                            </td>
                            <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300">
                              {item.employee.designation}
                            </td>
                            <td className="py-2.5 px-3">
                              <div className="font-medium text-slate-800 dark:text-slate-200">
                                {item.employee.branch}
                              </div>
                              <div className="text-[11px] text-slate-400">
                                {item.employee.area}
                              </div>
                            </td>
                            <td className="py-2.5 px-3 font-mono-num font-semibold text-slate-800 dark:text-slate-200">
                              <div>{formatDateDDMMYYYY(item.joiningDate, language)}</div>
                              <div className="text-[10px] text-slate-400 font-normal">
                                {formatDate(item.joiningDate, language)}
                              </div>
                            </td>
                            <td className="py-2.5 px-3">
                              <span className={`inline-block px-2.5 py-1 rounded-xl text-[11px] font-bold font-mono-num ${
                                hasTransferDue 
                                  ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300' 
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                              }`}>
                                {language === 'bn' ? item.displayTextBn : item.displayTextEn}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {isSuperAdmin && onInitiateTransfer && (
                                  <button
                                    onClick={() => {
                                      setDrilldownModal(null);
                                      onInitiateTransfer(item.employee);
                                    }}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-[11px] font-bold shadow-2xs cursor-pointer"
                                    title="শাখা বদলি কার্যকর করুন"
                                  >
                                    <ArrowLeftRight className="w-3 h-3" />
                                    <span>বদলি করুন</span>
                                  </button>
                                )}
                                <a
                                  href={`tel:${item.employee.mobile}`}
                                  className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition"
                                  title={item.employee.mobile}
                                >
                                  <Phone className="w-3.5 h-3.5" />
                                </a>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-between text-xs text-slate-500">
              <span>
                {language === 'bn' 
                  ? `মোট ${toBengaliNumber(currentModalData.items.length)} জন কর্মী তালিকাভুক্ত`
                  : `Showing ${currentModalData.items.length} personnel`}
              </span>
              <button
                onClick={() => setDrilldownModal(null)}
                className="px-4 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 font-semibold cursor-pointer"
              >
                {language === 'bn' ? 'বন্ধ করুন' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
