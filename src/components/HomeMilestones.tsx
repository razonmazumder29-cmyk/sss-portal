import React, { useState } from 'react';
import { 
  Cake, 
  Award, 
  Mail, 
  Phone, 
  MessageCircle, 
  Building2, 
  MapPin, 
  Calendar,
  Sparkles,
  Search,
  LayoutGrid,
  ListFilter,
  AlertTriangle,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Employee, MilestoneItem, SettingsConfig } from '../types';
import { translations } from '../translations';
import { filterMilestones, TimeFilter, toBengaliNumber, formatDate, formatDateDDMMYYYY, isDueForTransfer } from '../utils/dateCalculations';
import { SendMailModal } from './SendMailModal';
import { SssLogo } from './SssLogo';

interface HomeMilestonesProps {
  employees: Employee[];
  settings: SettingsConfig;
  language: 'bn' | 'en';
  onNavigateToStaff: (pin: string) => void;
  onNavigateToTransferDue: () => void;
  isSuperAdmin: boolean;
}

export const HomeMilestones: React.FC<HomeMilestonesProps> = ({
  employees,
  settings,
  language,
  onNavigateToStaff,
  onNavigateToTransferDue,
  isSuperAdmin
}) => {
  const t = translations[language];
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('today');
  const [activeCategory, setActiveCategory] = useState<'all' | 'birthdays' | 'anniversaries'>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'compact'>('cards');
  const [searchTerm, setSearchTerm] = useState('');
  const [mailModalConfig, setMailModalConfig] = useState<{
    isOpen: boolean;
    item?: MilestoneItem | null;
    items?: MilestoneItem[];
    groupType: 'birthday' | 'anniversary' | 'combined';
  }>({ isOpen: false, groupType: 'birthday' });

  const { birthdays, anniversaries } = filterMilestones(employees, timeFilter);

  // Count employees due for transfer (3+ years in branch)
  const transferDueEmployees = employees.filter(e => e.status !== 'Retired' && isDueForTransfer(e.branchJoiningDate));
  const transferDueCount = transferDueEmployees.length;

  const fireConfetti = () => {
    confetti({
      particleCount: 60,
      spread: 60,
      origin: { y: 0.65 }
    });
  };

  const timeFilterTabs: { id: TimeFilter; labelBn: string; labelEn: string }[] = [
    { id: 'today', labelBn: 'আজকের দিন', labelEn: 'Today' },
    { id: 'tomorrow', labelBn: 'আগামীকাল', labelEn: 'Tomorrow' },
    { id: 'next7days', labelBn: 'পরবর্তী ৭ দিন', labelEn: 'Next 7 Days' },
    { id: 'thisMonth', labelBn: 'চলতি মাস', labelEn: 'This Month' },
    { id: 'allUpcoming', labelBn: 'সব আসন্ন', labelEn: 'All Upcoming' }
  ];

  const filterList = (items: MilestoneItem[]) => {
    if (!searchTerm.trim()) return items;
    const q = searchTerm.toLowerCase().trim();
    return items.filter(
      item => 
        item.employee.name.toLowerCase().includes(q) ||
        item.employee.pin.toLowerCase().includes(q) ||
        item.employee.branch.toLowerCase().includes(q) ||
        item.employee.designation.toLowerCase().includes(q)
    );
  };

  const filteredBirthdays = filterList(birthdays);
  const filteredAnniversaries = filterList(anniversaries);
  const totalCount = birthdays.length + anniversaries.length;

  const handleOpenCombinedMail = () => {
    const combined = [...birthdays, ...anniversaries];
    if (combined.length === 0) return;
    fireConfetti();
    setMailModalConfig({
      isOpen: true,
      items: combined,
      groupType: 'combined'
    });
  };

  const handleOpenBirthdaysMail = () => {
    if (birthdays.length === 0) return;
    fireConfetti();
    setMailModalConfig({
      isOpen: true,
      items: birthdays,
      groupType: 'birthday'
    });
  };

  const handleOpenAnniversariesMail = () => {
    if (anniversaries.length === 0) return;
    fireConfetti();
    setMailModalConfig({
      isOpen: true,
      items: anniversaries,
      groupType: 'anniversary'
    });
  };

  const handleOpenSingleMail = (item: MilestoneItem) => {
    setMailModalConfig({
      isOpen: true,
      item,
      groupType: item.type
    });
  };

  return (
    <div className="space-y-6">
      {/* ================= 3-YEAR BRANCH TRANSFER ALERT BANNER ================= */}
      {transferDueCount > 0 && (
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white rounded-3xl p-5 shadow-lg border border-red-500 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0 border border-white/30">
              <AlertTriangle className="w-6 h-6 text-yellow-300 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-black tracking-wider px-2 py-0.5 rounded-full bg-yellow-400 text-red-950 font-mono">
                  {language === 'bn' ? 'সংস্থাগত নিয়ম সতর্কতা' : 'Policy Warning'}
                </span>
                <span className="text-xs font-semibold text-rose-100">
                  {language === 'bn' ? 'একই ব্রাঞ্চে ৩+ বছর অতিক্রান্ত' : '3+ Years in Current Branch'}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black mt-1 leading-snug">
                {language === 'bn' 
                  ? `চট্টগ্রাম-০২ জোনে ${toBengaliNumber(transferDueCount)} জন কর্মীর একই ব্রাঞ্চে ৩ বছর পূর্ণ হয়েছে এবং তারা "Due for Transfer"`
                  : `${transferDueCount} employees in Chattogram-02 Zone have completed 3+ years in their branch and are "Due for Transfer"`}
              </h3>
              <p className="text-xs text-rose-100 mt-0.5 max-w-2xl">
                {language === 'bn'
                  ? 'সংস্থার মানবসম্পদ নীতিমালা মোতাবেক মেয়াদোত্তীর্ণ কর্মীদের অবিলম্বে নতুন ব্রাঞ্চে বদলির সুপারিশ করা হচ্ছে।'
                  : 'Per organizational HR policy, employees exceeding 3 years of branch tenure are eligible for rotation.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onNavigateToTransferDue}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-white text-red-700 hover:bg-rose-50 text-xs sm:text-sm font-black shadow-md transition transform active:scale-98 shrink-0 cursor-pointer"
          >
            <span>{language === 'bn' ? 'বদলির তালিকা দেখুন' : 'View Transfer Due Staff'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ================= REFINED EXECUTIVE HEADER ================= */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          {/* Brand & Title */}
          <div className="flex items-start gap-4">
            <SssLogo size="lg" variant="rounded" className="border-emerald-500/25 shadow-xs shrink-0" />
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-1">
                <span>{settings.orgNameBn}</span>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <span>{settings.zoneNameBn} ({settings.zoneNameEn})</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {language === 'bn' ? 'দৈনিক শুভেচ্ছা ও কর্মপূর্তি বার্তা পোর্টাল' : 'Daily Celebrations & Greetings Portal'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
                {language === 'bn'
                  ? 'সহকর্মীদের জন্মদিনে এবং সংস্থায় একনিষ্ঠ কর্মপূর্তি বার্ষিকীতে আউটলুক ও জিমেইলের মাধ্যমে কেন্দ্রীয় ডিরেক্টরিতে অফিশিয়াল বার্তা পাঠান।'
                  : 'Send milestone congratulations and warm wishes via Outlook & Gmail directly to the zone directory.'}
              </p>
            </div>
          </div>

          {/* Time Filter Tabs */}
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700 overflow-x-auto shrink-0">
            {timeFilterTabs.map((tab) => {
              const active = timeFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setTimeFilter(tab.id);
                    if (tab.id === 'today') fireConfetti();
                  }}
                  className={`px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    active
                      ? 'bg-white dark:bg-slate-900 text-emerald-800 dark:text-emerald-300 shadow-xs font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {language === 'bn' ? tab.labelBn : tab.labelEn}
                </button>
              );
            })}
          </div>
        </div>

        {/* Milestone Quick Summary Strip */}
        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Birthday Summary */}
          <div 
            onClick={() => setActiveCategory(activeCategory === 'birthdays' ? 'all' : 'birthdays')}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
              activeCategory === 'birthdays'
                ? 'bg-rose-50/80 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 ring-1 ring-rose-400'
                : 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-800 hover:bg-slate-100/60 dark:hover:bg-slate-800/70'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold">
                <Cake className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">
                  {language === 'bn' ? 'জন্মদিন উদযাপন' : 'Birthdays'}
                </span>
                <span className="text-lg font-black text-slate-900 dark:text-white font-mono-num">
                  {language === 'bn' ? toBengaliNumber(birthdays.length) : birthdays.length} জন
                </span>
              </div>
            </div>
            {birthdays.length > 0 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenBirthdaysMail();
                }}
                className="px-2.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1 cursor-pointer"
                title="সকল জন্মদিনের শুভেচ্ছা পাঠান"
              >
                <Mail className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">গ্রুপ মেইল</span>
              </button>
            )}
          </div>

          {/* Anniversary Summary */}
          <div 
            onClick={() => setActiveCategory(activeCategory === 'anniversaries' ? 'all' : 'anniversaries')}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
              activeCategory === 'anniversaries'
                ? 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 ring-1 ring-amber-400'
                : 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-800 hover:bg-slate-100/60 dark:hover:bg-slate-800/70'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">
                  {language === 'bn' ? 'কর্মপূর্তি বার্ষিকী' : 'Work Anniversaries'}
                </span>
                <span className="text-lg font-black text-slate-900 dark:text-white font-mono-num">
                  {language === 'bn' ? toBengaliNumber(anniversaries.length) : anniversaries.length} জন
                </span>
              </div>
            </div>
            {anniversaries.length > 0 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenAnniversariesMail();
                }}
                className="px-2.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1 cursor-pointer"
                title="সকল কর্মপূর্তির শুভেচ্ছা পাঠান"
              >
                <Mail className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">গ্রুপ মেইল</span>
              </button>
            )}
          </div>

          {/* Combined Action */}
          <div className="p-3.5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">
                  {language === 'bn' ? 'মোট উদযাপন' : 'Total Milestones'}
                </span>
                <span className="text-lg font-black text-emerald-800 dark:text-emerald-300 font-mono-num">
                  {language === 'bn' ? toBengaliNumber(totalCount) : totalCount} জন
                </span>
              </div>
            </div>
            {totalCount > 0 && (
              <button
                type="button"
                onClick={handleOpenCombinedMail}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer"
                title="আজকের সকল সহকর্মীর জন্য একত্রিত ইমেইল বার্তা তৈরি করুন"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>একত্রিত মেইল</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ================= SEARCH & VIEW CONTROLS ================= */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder={language === 'bn' ? 'নাম, পদবি, পিন দিয়ে খুঁজুন...' : 'Search by name, PIN, designation, branch...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-8 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Category Toggle */}
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700 text-xs">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                activeCategory === 'all'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              সকল ({totalCount})
            </button>
            <button
              onClick={() => setActiveCategory('birthdays')}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                activeCategory === 'birthdays'
                  ? 'bg-white dark:bg-slate-700 text-rose-700 dark:text-rose-300 shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              জন্মদিন ({birthdays.length})
            </button>
            <button
              onClick={() => setActiveCategory('anniversaries')}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                activeCategory === 'anniversaries'
                  ? 'bg-white dark:bg-slate-700 text-amber-700 dark:text-amber-300 shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              কর্মপূর্তি ({anniversaries.length})
            </button>
          </div>

          {/* Layout Switcher */}
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700">
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-lg text-xs transition cursor-pointer ${
                viewMode === 'cards'
                  ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-300 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
              title="Card View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('compact')}
              className={`p-1.5 rounded-lg text-xs transition cursor-pointer ${
                viewMode === 'compact'
                  ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-300 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
              title="Compact View"
            >
              <ListFilter className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ================= CONTENT SECTIONS ================= */}
      {totalCount === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-12 text-center text-slate-400">
          <Calendar className="w-12 h-12 mx-auto mb-3 text-slate-300 dark:text-slate-600 stroke-1" />
          <h4 className="text-base font-bold text-slate-700 dark:text-slate-300">
            এই সময়ে কোনো জন্মদিন বা কর্মপূর্তি নেই
          </h4>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
            অন্যান্য সময় দেখতে উপরের &apos;আগামীকাল&apos;, &apos;পরবর্তী ৭ দিন&apos; বা &apos;চলতি মাস&apos; ফিল্টার ব্যবহার করুন।
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* SECTION 1: BIRTHDAYS */}
          {(activeCategory === 'all' || activeCategory === 'birthdays') && filteredBirthdays.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    {language === 'bn' ? 'জন্মদিনের শুভেচ্ছা ও সংবর্ধনা' : 'Birthday Celebrations'}
                  </h3>
                  <span className="text-xs text-slate-400 font-mono-num">
                    ({language === 'bn' ? toBengaliNumber(filteredBirthdays.length) : filteredBirthdays.length})
                  </span>
                </div>
              </div>

              {viewMode === 'cards' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filteredBirthdays.map((item) => {
                    const emp = item.employee;
                    const yearsDisplay = language === 'bn' ? `${toBengaliNumber(item.years)}তম জন্মদিন` : `${item.years}th Birthday`;
                    const hasTransferDue = isDueForTransfer(emp.branchJoiningDate);

                    return (
                      <div
                        key={item.id}
                        className={`bg-white dark:bg-slate-900 rounded-2xl border p-4.5 transition-all duration-200 flex flex-col justify-between ${
                          item.isToday
                            ? 'border-rose-300 dark:border-rose-900/80 shadow-sm ring-1 ring-rose-200 dark:ring-rose-900/50'
                            : 'border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <div className="space-y-2.5">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-sm shrink-0 ${
                                item.isToday
                                  ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 ring-2 ring-rose-400/50'
                                  : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                              }`}>
                                {emp.name.charAt(0)}
                              </div>
                              <div>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <h4 
                                    onClick={() => onNavigateToStaff(emp.pin)}
                                    className="font-bold text-slate-900 dark:text-white text-sm hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer"
                                    title="ডাটাবেজে বিস্তারিত দেখুন"
                                  >
                                    {emp.name}
                                  </h4>
                                  {hasTransferDue && (
                                    <span className="text-[10px] px-2 py-0.2 rounded-full bg-red-600 text-white font-bold" title="একই ব্রাঞ্চে ৩+ বছর অতিক্রান্ত">
                                      Due for Transfer
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mt-0.5">
                                  {emp.designation}
                                </p>
                              </div>
                            </div>

                            <span className={`text-[11px] font-bold px-2.5 py-1 rounded-xl shrink-0 ${
                              item.isToday
                                ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300'
                                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                            }`}>
                              {item.isToday ? 'আজকে জন্মদিন 🎂' : yearsDisplay}
                            </span>
                          </div>

                          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 pt-0.5 flex-wrap">
                            <span className="flex items-center gap-1">
                              <Building2 className="w-3 h-3 text-slate-400" />
                              {emp.branch}
                            </span>
                            <span className="text-slate-300 dark:text-slate-700">•</span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              {emp.area}
                            </span>
                            <span className="text-slate-300 dark:text-slate-700">•</span>
                            <span className="font-mono text-slate-400 text-[11px]">
                              PIN: {emp.pin}
                            </span>
                          </div>

                          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-600 dark:text-slate-300 flex items-center justify-between">
                            <span className="text-slate-500 text-[11px]">জন্ম তারিখ (DD/MM/YYYY):</span>
                            <span className="font-mono font-semibold text-slate-900 dark:text-white text-[11px]">
                              {formatDateDDMMYYYY(emp.birthDate, language)}
                            </span>
                          </div>
                        </div>

                        <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenSingleMail(item)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium cursor-pointer"
                            title="অফিসিয়াল ইমেইল পাঠান"
                          >
                            <Mail className="w-3.5 h-3.5 text-slate-500" />
                            <span>ইমেইল পাঠান</span>
                          </button>
                          <div className="flex items-center gap-1.5">
                            <a
                              href={`https://wa.me/880${emp.mobile.replace(/[^0-9]/g, '').slice(-10)}?text=${encodeURIComponent(
                                `শুভ জন্মদিন ${emp.name}! আপনার সুন্দর ও সাফল্যমণ্ডিত জীবন কামনা করি - এসএসএস চট্টগ্রাম-০২ জোন।`
                              )}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold hover:bg-emerald-100 transition"
                              title="হোয়াটসঅ্যাপে শুভেচ্ছা পাঠান"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              <span>WhatsApp</span>
                            </a>
                            <a
                              href={`tel:${emp.mobile}`}
                              className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 text-xs"
                              title={`কল করুন: ${emp.mobile}`}
                            >
                              <Phone className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                      <thead className="bg-slate-50 dark:bg-slate-800/70 text-slate-700 dark:text-slate-200 font-bold border-b border-slate-200/80 dark:border-slate-700">
                        <tr>
                          <th className="py-2.5 px-4">কর্মীর নাম</th>
                          <th className="py-2.5 px-3">পিন নং</th>
                          <th className="py-2.5 px-3">পদবি</th>
                          <th className="py-2.5 px-3">বর্তমান শাখা ও এরিয়া</th>
                          <th className="py-2.5 px-3">জন্ম তারিখ (DD/MM/YYYY)</th>
                          <th className="py-2.5 px-3">উদযাপন</th>
                          <th className="py-2.5 px-4 text-right">অ্যাকশন</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {filteredBirthdays.map((item) => {
                          const emp = item.employee;
                          const hasTransferDue = isDueForTransfer(emp.branchJoiningDate);
                          return (
                            <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                              <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                                <span 
                                  onClick={() => onNavigateToStaff(emp.pin)}
                                  className="hover:text-emerald-600 cursor-pointer"
                                >
                                  {emp.name}
                                </span>
                                {hasTransferDue && (
                                  <span className="ml-2 text-[10px] px-1.5 py-0.2 rounded bg-red-600 text-white font-bold">
                                    Due for Transfer
                                  </span>
                                )}
                              </td>
                              <td className="py-3 px-3 font-mono text-slate-500">{emp.pin}</td>
                              <td className="py-3 px-3 font-semibold text-emerald-700 dark:text-emerald-400">{emp.designation}</td>
                              <td className="py-3 px-3 text-slate-500">{emp.branch} • {emp.area}</td>
                              <td className="py-3 px-3 font-mono font-semibold text-slate-800 dark:text-slate-200">
                                {formatDateDDMMYYYY(emp.birthDate, language)}
                              </td>
                              <td className="py-3 px-3">
                                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-lg ${
                                  item.isToday
                                    ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300'
                                    : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                                }`}>
                                  {item.isToday ? 'আজকে জন্মদিন 🎂' : `${item.years}তম`}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => handleOpenSingleMail(item)}
                                    className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                                    title="মেইল পাঠান"
                                  >
                                    <Mail className="w-3.5 h-3.5" />
                                  </button>
                                  <a
                                    href={`https://wa.me/880${emp.mobile.replace(/[^0-9]/g, '').slice(-10)}?text=${encodeURIComponent(
                                      `শুভ জন্মদিন ${emp.name}! আপনার সুন্দর ও সাফল্যমণ্ডিত জীবন কামনা করি - এসএসএস চট্টগ্রাম-০২ জোন।`
                                    )}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/60"
                                    title="WhatsApp"
                                  >
                                    <MessageCircle className="w-3.5 h-3.5" />
                                  </a>
                                  <a
                                    href={`tel:${emp.mobile}`}
                                    className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/60"
                                    title={`Call ${emp.mobile}`}
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
                </div>
              )}
            </div>
          )}

          {/* SECTION 2: WORK ANNIVERSARIES */}
          {(activeCategory === 'all' || activeCategory === 'anniversaries') && filteredAnniversaries.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    {language === 'bn' ? 'সংস্থায় কর্মপূর্তি বার্ষিকী' : 'Work Anniversaries'}
                  </h3>
                  <span className="text-xs text-slate-400 font-mono-num">
                    ({language === 'bn' ? toBengaliNumber(filteredAnniversaries.length) : filteredAnniversaries.length})
                  </span>
                </div>
              </div>

              {viewMode === 'cards' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filteredAnniversaries.map((item) => {
                    const emp = item.employee;
                    const yearsDisplay = language === 'bn' ? `${toBengaliNumber(item.years)} বছর সম্পন্ন` : `${item.years} Years Completed`;
                    const hasTransferDue = isDueForTransfer(emp.branchJoiningDate);

                    return (
                      <div
                        key={item.id}
                        className={`bg-white dark:bg-slate-900 rounded-2xl border p-4.5 transition-all duration-200 flex flex-col justify-between ${
                          item.isToday
                            ? 'border-amber-300 dark:border-amber-900/80 shadow-sm ring-1 ring-amber-200 dark:ring-amber-900/50'
                            : 'border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <div className="space-y-2.5">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-sm shrink-0 ${
                                item.isToday
                                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 ring-2 ring-amber-400/50'
                                  : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                              }`}>
                                {emp.name.charAt(0)}
                              </div>
                              <div>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <h4 
                                    onClick={() => onNavigateToStaff(emp.pin)}
                                    className="font-bold text-slate-900 dark:text-white text-sm hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer"
                                    title="ডাটাবেজে বিস্তারিত দেখুন"
                                  >
                                    {emp.name}
                                  </h4>
                                  {hasTransferDue && (
                                    <span className="text-[10px] px-2 py-0.2 rounded-full bg-red-600 text-white font-bold" title="একই ব্রাঞ্চে ৩+ বছর অতিক্রান্ত">
                                      Due for Transfer
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mt-0.5">
                                  {emp.designation}
                                </p>
                              </div>
                            </div>

                            <span className={`text-[11px] font-bold px-2.5 py-1 rounded-xl shrink-0 ${
                              item.isToday
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
                                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                            }`}>
                              {item.isToday ? 'আজ কর্মপূর্তি 🌟' : yearsDisplay}
                            </span>
                          </div>

                          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 pt-0.5 flex-wrap">
                            <span className="flex items-center gap-1">
                              <Building2 className="w-3 h-3 text-slate-400" />
                              {emp.branch}
                            </span>
                            <span className="text-slate-300 dark:text-slate-700">•</span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              {emp.area}
                            </span>
                            <span className="text-slate-300 dark:text-slate-700">•</span>
                            <span className="font-mono text-slate-400 text-[11px]">
                              PIN: {emp.pin}
                            </span>
                          </div>

                          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-600 dark:text-slate-300 flex items-center justify-between">
                            <span className="text-slate-500 text-[11px]">সংস্থায় যোগদান (DD/MM/YYYY):</span>
                            <span className="font-mono font-semibold text-slate-900 dark:text-white text-[11px]">
                              {formatDateDDMMYYYY(emp.orgJoiningDate, language)}
                            </span>
                          </div>
                        </div>

                        <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenSingleMail(item)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium cursor-pointer"
                            title="অফিসিয়াল ইমেইল পাঠান"
                          >
                            <Mail className="w-3.5 h-3.5 text-slate-500" />
                            <span>ইমেইল পাঠান</span>
                          </button>
                          <div className="flex items-center gap-1.5">
                            <a
                              href={`https://wa.me/880${emp.mobile.replace(/[^0-9]/g, '').slice(-10)}?text=${encodeURIComponent(
                                `সংস্থায় সফলভাবে ${item.years} বছর পূর্তিতে অভিনন্দন, ${emp.name}! আপনার অব্যাহত সাফল্য কামনা করি - এসএসএস চট্টগ্রাম-০২ জোন।`
                              )}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold hover:bg-emerald-100 transition"
                              title="WhatsApp"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              <span>WhatsApp</span>
                            </a>
                            <a
                              href={`tel:${emp.mobile}`}
                              className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 text-xs"
                              title={`কল করুন: ${emp.mobile}`}
                            >
                              <Phone className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                      <thead className="bg-slate-50 dark:bg-slate-800/70 text-slate-700 dark:text-slate-200 font-bold border-b border-slate-200/80 dark:border-slate-700">
                        <tr>
                          <th className="py-2.5 px-4">কর্মীর নাম</th>
                          <th className="py-2.5 px-3">পিন নং</th>
                          <th className="py-2.5 px-3">পদবি</th>
                          <th className="py-2.5 px-3">বর্তমান শাখা ও এরিয়া</th>
                          <th className="py-2.5 px-3">যোগদানের তারিখ (DD/MM/YYYY)</th>
                          <th className="py-2.5 px-3">পূর্ণ মেয়াদ</th>
                          <th className="py-2.5 px-4 text-right">অ্যাকশন</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {filteredAnniversaries.map((item) => {
                          const emp = item.employee;
                          const hasTransferDue = isDueForTransfer(emp.branchJoiningDate);
                          return (
                            <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                              <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                                <span 
                                  onClick={() => onNavigateToStaff(emp.pin)}
                                  className="hover:text-emerald-600 cursor-pointer"
                                >
                                  {emp.name}
                                </span>
                                {hasTransferDue && (
                                  <span className="ml-2 text-[10px] px-1.5 py-0.2 rounded bg-red-600 text-white font-bold">
                                    Due for Transfer
                                  </span>
                                )}
                              </td>
                              <td className="py-3 px-3 font-mono text-slate-500">{emp.pin}</td>
                              <td className="py-3 px-3 font-semibold text-emerald-700 dark:text-emerald-400">{emp.designation}</td>
                              <td className="py-3 px-3 text-slate-500">{emp.branch} • {emp.area}</td>
                              <td className="py-3 px-3 font-mono font-semibold text-slate-800 dark:text-slate-200">
                                {formatDateDDMMYYYY(emp.orgJoiningDate, language)}
                              </td>
                              <td className="py-3 px-3">
                                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-lg ${
                                  item.isToday
                                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
                                    : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                                }`}>
                                  {item.isToday ? 'আজ কর্মপূর্তি 🌟' : `${item.years} বছর`}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => handleOpenSingleMail(item)}
                                    className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                                    title="মেইল পাঠান"
                                  >
                                    <Mail className="w-3.5 h-3.5" />
                                  </button>
                                  <a
                                    href={`https://wa.me/880${emp.mobile.replace(/[^0-9]/g, '').slice(-10)}?text=${encodeURIComponent(
                                      `সংস্থায় সফলভাবে ${item.years} বছর পূর্তিতে অভিনন্দন, ${emp.name}! আপনার অব্যাহত সাফল্য কামনা করি - এসএসএস চট্টগ্রাম-০২ জোন।`
                                    )}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/60"
                                    title="WhatsApp"
                                  >
                                    <MessageCircle className="w-3.5 h-3.5" />
                                  </a>
                                  <a
                                    href={`tel:${emp.mobile}`}
                                    className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/60"
                                    title={`Call ${emp.mobile}`}
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
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Send Mail Modal */}
      {mailModalConfig.isOpen && (
        <SendMailModal
          item={mailModalConfig.item}
          items={mailModalConfig.items}
          groupType={mailModalConfig.groupType}
          settings={settings}
          language={language}
          onClose={() => setMailModalConfig({ isOpen: false, groupType: 'birthday' })}
        />
      )}
    </div>
  );
};
