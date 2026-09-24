import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  Users, 
  Building2, 
  ArrowLeftRight, 
  Printer, 
  Award,
  Clock,
  HeartHandshake,
  Search,
  X,
  Phone,
  MessageCircle,
  ExternalLink,
  ChevronRight,
  MapPin,
  Calendar,
  Sparkles,
  Info
} from 'lucide-react';
import { Employee, BranchItem, AuditLog } from '../types';
import { translations } from '../translations';
import { toBengaliNumber, formatDate, calculateTenure } from '../utils/dateCalculations';
import { exportEmployeesToCsv } from '../utils/exportImport';

interface DashboardReportsProps {
  employees: Employee[];
  branches: BranchItem[];
  areas: string[];
  auditLogs?: AuditLog[];
  language: 'bn' | 'en';
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
  language
}) => {
  const t = translations[language];

  // Active modal state for drilldown
  const [drilldownModal, setDrilldownModal] = useState<{
    type: 'org' | 'branch';
    bracketKey: BracketKey;
  } | null>(null);

  const [drilldownSearch, setDrilldownSearch] = useState('');

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

    // Helper to group into 5 standard brackets
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

      // Sort each bucket by totalDays descending
      (Object.keys(buckets) as BracketKey[]).forEach(k => {
        buckets[k].sort((a, b) => b.totalDays - a.totalDays);
      });

      // Compute stats
      const totalCount = list.length;

      return {
        buckets,
        totalCount
      };
    };

    return {
      orgStats: groupIntoBuckets(orgList),
      branchStats: groupIntoBuckets(branchList)
    };
  }, [employees]);

  // Branch breakdown counts
  const branchCounts: Record<string, number> = useMemo(() => {
    const counts: Record<string, number> = {};
    branches.forEach(b => { counts[b.name] = 0; });
    employees.forEach(e => {
      counts[e.branch] = (counts[e.branch] || 0) + 1;
    });
    return counts;
  }, [branches, employees]);

  // Blood group breakdown counts
  const bloodCounts: Record<string, number> = useMemo(() => {
    const counts: Record<string, number> = {};
    employees.forEach(e => {
      counts[e.bloodGroup] = (counts[e.bloodGroup] || 0) + 1;
    });
    return counts;
  }, [employees]);

  // Bracket metadata helper
  const bracketMeta: Record<BracketKey, { labelBn: string; labelEn: string; colorTheme: string }> = {
    lessThan1: {
      labelBn: '১ বছরের কম',
      labelEn: 'Less than 1 yr',
      colorTheme: 'blue'
    },
    oneToThree: {
      labelBn: '১ থেকে ৩ বছর',
      labelEn: '1 to 3 yrs',
      colorTheme: 'teal'
    },
    threeToFive: {
      labelBn: '৩ থেকে ৫ বছর',
      labelEn: '3 to 5 yrs',
      colorTheme: 'amber'
    },
    fiveToTen: {
      labelBn: '৫ থেকে ১০ বছর',
      labelEn: '5 to 10 yrs',
      colorTheme: 'purple'
    },
    tenPlus: {
      labelBn: '১০ বছরের অধিক',
      labelEn: 'Over 10 yrs',
      colorTheme: 'emerald'
    }
  };

  // Bracket keys list
  const bracketKeys: BracketKey[] = ['lessThan1', 'oneToThree', 'threeToFive', 'fiveToTen', 'tenPlus'];

  // Drilldown current data
  const currentModalData = useMemo(() => {
    if (!drilldownModal) return null;
    const stats = drilldownModal.type === 'org' ? processedData.orgStats : processedData.branchStats;
    const list = stats.buckets[drilldownModal.bracketKey] || [];
    
    // Filter by search query
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

    return {
      type: drilldownModal.type,
      bracketKey: drilldownModal.bracketKey,
      items: filtered,
      totalInBracket: list.length,
      label: language === 'bn' 
        ? bracketMeta[drilldownModal.bracketKey].labelBn 
        : bracketMeta[drilldownModal.bracketKey].labelEn,
      scopeTitle: drilldownModal.type === 'org'
        ? (language === 'bn' ? 'সংস্থায় চাকুরিকাল' : 'Tenure in Organization')
        : (language === 'bn' ? 'বর্তমান শাখায় চাকুরিকাল' : 'Tenure in Current Branch')
    };
  }, [drilldownModal, drilldownSearch, processedData, language]);

  return (
    <div className="space-y-6">
      {/* Top Banner & Print Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span>{t.dashboardTitle}</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            সংস্থা ও শাখায় চাকুরিকালের পূর্ণাঙ্গ বিশ্লেষণ, এরিয়া-শাখা বণ্টন ও কর্মী পরিসংখ্যান
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => exportEmployeesToCsv(employees, language)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-xs transition"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>{language === 'bn' ? 'এক্সপোর্ট CSV' : 'Export CSV'}</span>
          </button>

          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition"
          >
            <Printer className="w-4 h-4" />
            <span>{language === 'bn' ? 'রিপোর্ট প্রিন্ট করুন' : 'Print Report'}</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Staff */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">
              {t.totalEmployees}
            </span>
            <span className="text-xl font-extrabold text-slate-900 dark:text-white font-mono-num">
              {language === 'bn' ? toBengaliNumber(employees.length) : employees.length} {language === 'bn' ? 'জন' : ''}
            </span>
          </div>
        </div>

        {/* Total Branches */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">
              {t.totalBranches}
            </span>
            <span className="text-xl font-extrabold text-slate-900 dark:text-white font-mono-num">
              {language === 'bn' ? toBengaliNumber(branches.length) : branches.length} {language === 'bn' ? 'টি' : ''}
            </span>
          </div>
        </div>

        {/* Total Areas */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">
              {language === 'bn' ? 'মোট এরিয়া' : 'Total Areas'}
            </span>
            <span className="text-xl font-extrabold text-slate-900 dark:text-white font-mono-num">
              {language === 'bn' ? toBengaliNumber(areas.length) : areas.length} {language === 'bn' ? 'টি' : ''}
            </span>
          </div>
        </div>
      </div>

      {/* ================= DETAILED TENURE SECTIONS (SIDE BY SIDE) ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. TENURE IN ORGANIZATION (সংস্থায় চাকুরিকালের বিস্তারিত ব্যাপ্তি) */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-xs">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {language === 'bn' ? 'সংস্থায় চাকুরিকালের ব্যাপ্তি' : 'Tenure in Organization'}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {language === 'bn' 
                      ? 'যেকোনো ঘরে ক্লিক করে সংশ্লিষ্ট কর্মীদের পূর্ণাঙ্গ তালিকা দেখুন' 
                      : 'Click any bracket to view detailed staff roster'}
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
                    className={`text-left p-3.5 rounded-xl border transition-all transform hover:-translate-y-0.5 hover:shadow-md cursor-pointer group flex flex-col justify-between ${
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
                        <span>{language === 'bn' ? 'তালিকা দেখুন' : 'View'}</span>
                        <ChevronRight className="w-3.5 h-3.5 transition transform group-hover:translate-x-0.5" />
                      </span>
                    </div>

                    <div className="mt-2 flex items-baseline justify-between">
                      <span className="text-xl font-extrabold text-slate-900 dark:text-white font-mono">
                        {language === 'bn' ? toBengaliNumber(count) : count} {language === 'bn' ? 'জন' : ''}
                      </span>
                      <span className="text-xs font-mono font-medium text-slate-500 dark:text-slate-400">
                        {language === 'bn' ? `${toBengaliNumber(pct)}%` : `${pct}%`}
                      </span>
                    </div>

                    {/* Progress visual */}
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

        {/* 2. TENURE IN CURRENT BRANCH (বর্তমান শাখায় চাকুরির বিস্তারিত ব্যাপ্তি) */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-xs">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {language === 'bn' ? 'বর্তমান শাখায় চাকুরির ব্যাপ্তি' : 'Tenure in Current Branch'}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {language === 'bn' 
                      ? 'যেকোনো ঘরে ক্লিক করে সংশ্লিষ্ট কর্মীদের পূর্ণাঙ্গ তালিকা দেখুন' 
                      : 'Click any bracket to view detailed staff roster'}
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                {language === 'bn' ? `মোট: ${toBengaliNumber(employees.length)} জন` : `Total: ${employees.length}`}
              </span>
            </div>

            {/* Interactive Bracket Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {bracketKeys.map(key => {
                const count = processedData.branchStats.buckets[key].length;
                const total = processedData.branchStats.totalCount || 1;
                const pct = Math.round((count / total) * 100);
                const isTenPlus = key === 'tenPlus';
                const label = language === 'bn' ? bracketMeta[key].labelBn : bracketMeta[key].labelEn;

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      setDrilldownSearch('');
                      setDrilldownModal({ type: 'branch', bracketKey: key });
                    }}
                    className={`text-left p-3.5 rounded-xl border transition-all transform hover:-translate-y-0.5 hover:shadow-md cursor-pointer group flex flex-col justify-between ${
                      isTenPlus 
                        ? 'sm:col-span-2 bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 dark:from-blue-950/40 dark:via-indigo-950/30 dark:to-blue-950/40 border-blue-300 dark:border-blue-800 ring-blue-500' 
                        : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-600'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-xs font-bold ${isTenPlus ? 'text-blue-900 dark:text-blue-300' : 'text-slate-700 dark:text-slate-200'}`}>
                        {label}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 group-hover:underline">
                        <span>{language === 'bn' ? 'তালিকা দেখুন' : 'View'}</span>
                        <ChevronRight className="w-3.5 h-3.5 transition transform group-hover:translate-x-0.5" />
                      </span>
                    </div>

                    <div className="mt-2 flex items-baseline justify-between">
                      <span className="text-xl font-extrabold text-slate-900 dark:text-white font-mono">
                        {language === 'bn' ? toBengaliNumber(count) : count} {language === 'bn' ? 'জন' : ''}
                      </span>
                      <span className="text-xs font-mono font-medium text-slate-500 dark:text-slate-400">
                        {language === 'bn' ? `${toBengaliNumber(pct)}%` : `${pct}%`}
                      </span>
                    </div>

                    {/* Progress visual */}
                    <div className="mt-2 w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isTenPlus ? 'bg-blue-600' : 'bg-blue-500'
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

      {/* ================= SECONDARY ANALYTICS (BRANCH DISTRIBUTION & BLOOD GROUP) ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Branch-wise Staff Distribution */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-600" />
              <span>
                {language === 'bn' 
                  ? 'শাখাভিত্তিক কর্মী বিন্যাস (Branch Distribution)' 
                  : 'Branch-wise Staff Distribution'}
              </span>
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              {branches.length} {language === 'bn' ? 'টি শাখা' : 'branches'}
            </span>
          </div>

          <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
            {branches.map(b => {
              const count = branchCounts[b.name] || 0;
              const pct = employees.length > 0 ? Math.round((count / employees.length) * 100) : 0;
              return (
                <div key={b.id} className="space-y-1 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{b.name}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                        {b.area}
                      </span>
                    </div>
                    <span className="font-mono text-slate-600 dark:text-slate-400 font-semibold">
                      {language === 'bn' ? toBengaliNumber(count) : count} {language === 'bn' ? 'জন' : ''} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Blood Group Breakdown */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <HeartHandshake className="w-4 h-4 text-red-500" />
              <span>
                {language === 'bn' 
                  ? 'রক্তের গ্রুপভিত্তিক কর্মী পরিসংখ্যান' 
                  : 'Blood Group Distribution'}
              </span>
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              ৮টি গ্রুপ
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => {
              const count = bloodCounts[bg] || 0;
              const pct = employees.length > 0 ? Math.round((count / employees.length) * 100) : 0;
              return (
                <div key={bg} className="p-3.5 rounded-xl bg-red-50/50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/40 text-center flex flex-col justify-center">
                  <span className="font-extrabold text-base text-red-600 dark:text-red-400 block">{bg}</span>
                  <span className="text-lg font-bold text-slate-900 dark:text-white font-mono block mt-1">
                    {language === 'bn' ? toBengaliNumber(count) : count} {language === 'bn' ? 'জন' : ''}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono mt-0.5">({pct}%)</span>
                </div>
              );
            })}
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-500 shrink-0" />
            <span>
              জরুরি রক্তের প্রয়োজনে রক্তদাতার তালিকা এবং সরাসরি যোগাযোগের জন্য <strong>"জরুরি রক্তের ব্যাংক"</strong> ট্যাবটি ব্যবহার করুন।
            </span>
          </div>
        </div>
      </div>

      {/* ================= DETAILED DRILLDOWN MODAL ================= */}
      {currentModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div 
            className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150"
            role="dialog"
            aria-modal="true"
          >
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-xs ${
                  currentModalData.type === 'org' ? 'bg-amber-600' : 'bg-blue-600'
                }`}>
                  {currentModalData.type === 'org' ? <Award className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {currentModalData.scopeTitle}
                    </span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                      {currentModalData.label}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                    {language === 'bn' 
                      ? `${currentModalData.label} ব্যাপ্তিতে কর্মরত কর্মীদের তালিকা (${toBengaliNumber(currentModalData.totalInBracket)} জন)`
                      : `Staff Roster for ${currentModalData.label} (${currentModalData.totalInBracket} members)`}
                  </h3>
                </div>
              </div>

              <button
                onClick={() => setDrilldownModal(null)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-800 transition"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Switch Tabs between brackets & Search bar */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              {/* Bracket Switcher Tabs */}
              <div className="flex flex-wrap gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                {bracketKeys.map(k => {
                  const isActive = drilldownModal?.bracketKey === k;
                  const count = (drilldownModal?.type === 'org' ? processedData.orgStats : processedData.branchStats).buckets[k].length;
                  const label = language === 'bn' ? bracketMeta[k].labelBn : bracketMeta[k].labelEn;

                  return (
                    <button
                      key={k}
                      type="button"
                      onClick={() => {
                        setDrilldownSearch('');
                        setDrilldownModal(prev => prev ? { ...prev, bracketKey: k } : null);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                        isActive
                          ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      <span>{label}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-slate-700 dark:bg-slate-300 text-white dark:text-slate-900">
                        {language === 'bn' ? toBengaliNumber(count) : count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Search input */}
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder={language === 'bn' ? 'নাম, পিন বা শাখা দিয়ে খুঁজুন...' : 'Search name, PIN, branch...'}
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
                      ? (language === 'bn' ? 'অনুসন্ধান অনুযায়ী কোনো কর্মী পাওয়া যায়নি' : 'No staff matched your search')
                      : (language === 'bn' ? 'এই ব্যাপ্তিতে বর্তমানে কোনো কর্মী নেই' : 'No staff currently in this bracket')}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                  <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                    <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 font-bold uppercase text-[11px] border-b border-slate-200 dark:border-slate-800 sticky top-0">
                      <tr>
                        <th className="py-2.5 px-3">{language === 'bn' ? 'ক্রমিক' : 'SL'}</th>
                        <th className="py-2.5 px-3">{language === 'bn' ? 'কর্মীর নাম ও পিন' : 'Staff Name & PIN'}</th>
                        <th className="py-2.5 px-3">{language === 'bn' ? 'পদবী' : 'Designation'}</th>
                        <th className="py-2.5 px-3">{language === 'bn' ? 'শাখা ও এরিয়া' : 'Branch & Area'}</th>
                        <th className="py-2.5 px-3">
                          {currentModalData.type === 'org' 
                            ? (language === 'bn' ? 'সংস্থায় যোগদান' : 'Org Join Date')
                            : (language === 'bn' ? 'শাখায় যোগদান' : 'Branch Join Date')}
                        </th>
                        <th className="py-2.5 px-3">{language === 'bn' ? 'সুনির্দিষ্ট ব্যাপ্তি' : 'Exact Tenure'}</th>
                        <th className="py-2.5 px-3 text-right">{language === 'bn' ? 'যোগাযোগ' : 'Contact'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                      {currentModalData.items.map((item, idx) => (
                        <tr key={item.employee.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                          <td className="py-2.5 px-3 font-mono text-slate-400">
                            {language === 'bn' ? toBengaliNumber(idx + 1) : idx + 1}
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="font-semibold text-slate-900 dark:text-white">
                              {item.employee.name}
                            </div>
                            <div className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">
                              PIN: {item.employee.pin}
                            </div>
                          </td>
                          <td className="py-2.5 px-3 font-medium text-slate-700 dark:text-slate-300">
                            {item.employee.designation}
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="font-semibold text-slate-800 dark:text-slate-200">
                              {item.employee.branch}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {item.employee.area}
                            </div>
                          </td>
                          <td className="py-2.5 px-3 font-mono text-slate-500 whitespace-nowrap">
                            {formatDate(item.joiningDate, language)}
                          </td>
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            <span className="px-2 py-1 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 font-semibold text-[11px] border border-amber-200 dark:border-amber-900/50">
                              {language === 'bn' ? item.displayTextBn : item.displayTextEn}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <div className="inline-flex items-center gap-1">
                              <a
                                href={`tel:${item.employee.mobile}`}
                                className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                                title="Call"
                              >
                                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                              </a>
                              <a
                                href={`https://wa.me/880${item.employee.mobile.replace(/[^0-9]/g, '').slice(-10)}`}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 transition"
                                title="WhatsApp"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                              </a>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400">
                মোট প্রদর্শিত: <strong>{language === 'bn' ? toBengaliNumber(currentModalData.items.length) : currentModalData.items.length}</strong> জন কর্মী
              </span>
              <button
                onClick={() => setDrilldownModal(null)}
                className="px-4 py-1.5 rounded-xl bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 text-white font-semibold transition"
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
