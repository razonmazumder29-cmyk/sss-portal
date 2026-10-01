import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Upload, 
  Download, 
  Filter, 
  Edit3, 
  Trash2, 
  ArrowLeftRight, 
  CreditCard, 
  Phone, 
  Mail, 
  Building2, 
  MapPin, 
  Droplet, 
  Calendar, 
  Table as TableIcon, 
  Grid, 
  Keyboard,
  FileSpreadsheet,
  AlertTriangle,
  Lock,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { Employee, BloodGroup, BranchItem, SettingsConfig } from '../types';
import { translations } from '../translations';
import { toBengaliNumber, formatDate, formatDateDDMMYYYY, calculateTenure, calculateAge, isDueForTransfer } from '../utils/dateCalculations';
import { exportEmployeesToCsv, exportEmployeesToExcel } from '../utils/exportImport';
import { CsvImportModal } from './CsvImportModal';
import { SssLogo } from './SssLogo';

interface EmployeeDirectoryProps {
  employees: Employee[];
  areas: string[];
  branches: BranchItem[];
  designations: string[];
  settings: SettingsConfig;
  language: 'bn' | 'en';
  isSuperAdmin: boolean;
  onAddEmployee: () => void;
  onEditEmployee: (emp: Employee) => void;
  onTransferEmployee: (emp: Employee) => void;
  onDeleteEmployee: (empId: string) => void;
  onViewIdCard: (emp: Employee) => void;
  onBulkImport: (importedList: Partial<Employee>[]) => void;
  highlightPin?: string | null;
  initialFilterTransferDue?: boolean;
}

export const EmployeeDirectory: React.FC<EmployeeDirectoryProps> = ({
  employees,
  areas,
  branches,
  designations,
  settings,
  language,
  isSuperAdmin,
  onAddEmployee,
  onEditEmployee,
  onTransferEmployee,
  onDeleteEmployee,
  onViewIdCard,
  onBulkImport,
  highlightPin,
  initialFilterTransferDue = false
}) => {
  const t = translations[language];

  // Filters
  const [searchTerm, setSearchTerm] = useState<string>(highlightPin || '');
  const [selectedArea, setSelectedArea] = useState<string>('all');
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [selectedDesignation, setSelectedDesignation] = useState<string>('all');
  const [selectedBlood, setSelectedBlood] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [filterTransferDueOnly, setFilterTransferDueOnly] = useState<boolean>(initialFilterTransferDue);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  useEffect(() => {
    if (highlightPin) {
      setSearchTerm(highlightPin);
    }
  }, [highlightPin]);

  useEffect(() => {
    if (initialFilterTransferDue) {
      setFilterTransferDueOnly(true);
    }
  }, [initialFilterTransferDue]);

  // Keyboard navigation state
  const [focusedCell, setFocusedCell] = useState<{ row: number; col: number }>({ row: 0, col: 0 });
  const tableRef = useRef<HTMLTableElement>(null);

  // Filtered employees
  const filteredEmployees = employees.filter((emp) => {
    const q = searchTerm.toLowerCase().trim();
    const matchesSearch = !q || (
      emp.name.toLowerCase().includes(q) ||
      emp.pin.toLowerCase().includes(q) ||
      emp.branch.toLowerCase().includes(q) ||
      emp.area.toLowerCase().includes(q) ||
      emp.designation.toLowerCase().includes(q) ||
      emp.mobile.includes(q) ||
      emp.bloodGroup.toLowerCase().includes(q)
    );
    const matchesArea = selectedArea === 'all' || emp.area === selectedArea;
    const matchesBranch = selectedBranch === 'all' || emp.branch === selectedBranch;
    const matchesDesignation = selectedDesignation === 'all' || emp.designation === selectedDesignation;
    const matchesBlood = selectedBlood === 'all' || emp.bloodGroup === selectedBlood;
    const matchesStatus = selectedStatus === 'all' || emp.status === selectedStatus;
    const matchesTransferDue = !filterTransferDueOnly || isDueForTransfer(emp.branchJoiningDate);

    return matchesSearch && matchesArea && matchesBranch && matchesDesignation && matchesBlood && matchesStatus && matchesTransferDue;
  });

  const totalTransferDueInZone = employees.filter(e => e.status !== 'Retired' && isDueForTransfer(e.branchJoiningDate)).length;

  const TOTAL_COLS = 12;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (viewMode !== 'table' || filteredEmployees.length === 0) return;
    const maxRow = filteredEmployees.length - 1;
    const maxCol = TOTAL_COLS - 1;
    let { row, col } = focusedCell;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      row = Math.min(maxRow, row + 1);
      setFocusedCell({ row, col });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      row = Math.max(0, row - 1);
      setFocusedCell({ row, col });
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      col = Math.min(maxCol, col + 1);
      setFocusedCell({ row, col });
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      col = Math.max(0, col - 1);
      setFocusedCell({ row, col });
    } else if (e.key === 'Tab') {
      e.preventDefault();
      if (e.shiftKey) {
        if (col > 0) col--;
        else if (row > 0) { row--; col = maxCol; }
      } else {
        if (col < maxCol) col++;
        else if (row < maxRow) { row++; col = 0; }
      }
      setFocusedCell({ row, col });
    } else if (e.key === 'Enter') {
      const currentEmp = filteredEmployees[row];
      if (currentEmp) {
        onViewIdCard(currentEmp);
      }
    }
  };

  const handleExportCsv = () => {
    exportEmployeesToCsv(filteredEmployees, language);
  };

  const handleExportExcel = () => {
    exportEmployeesToExcel(filteredEmployees, language);
  };

  return (
    <div className="space-y-4">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3">
          <SssLogo size="md" variant="rounded" className="border-emerald-500/20 shadow-xs" />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {language === 'bn' ? 'চট্টগ্রাম-০২ জোন কর্মী ডাটাবেজ' : 'Chattogram-02 Zone Staff Database'}
              </h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-mono-num font-bold">
                {language === 'bn' ? toBengaliNumber(filteredEmployees.length) : filteredEmployees.length} জন
              </span>
              {isSuperAdmin ? (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 text-purple-900 dark:bg-purple-950 dark:text-purple-300 font-bold border border-purple-300 dark:border-purple-800 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-purple-600" />
                  <span>Super Admin পূর্ণ নিয়ন্ত্রণ</span>
                </span>
              ) : (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 font-semibold border border-slate-200 dark:border-slate-700 flex items-center gap-1">
                  <Lock className="w-3 h-3 text-slate-500" />
                  <span>Viewer (শুধুমাত্র দেখার অনুমতি)</span>
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {language === 'bn' 
                ? 'কর্মীদের সম্পূর্ণ তথ্য, ৩ বছর ব্রাঞ্চ বদলি সতর্কতা ও স্বয়ংক্রিয় স্ট্যাটাস মনিটরিং'
                : 'Personnel records, 3-year transfer monitoring, and service records'}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* View mode toggle */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs transition cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
              title="Table View"
            >
              <TableIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-lg text-xs transition cursor-pointer ${
                viewMode === 'cards'
                  ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
              title="Card View"
            >
              <Grid className="w-4 h-4" />
            </button>
          </div>

          {/* Super Admin Bulk Import */}
          {isSuperAdmin && (
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-semibold hover:bg-blue-100 transition cursor-pointer"
              title="এক্সেল বা CSV ফাইল থেকে একসাথে সকল কর্মী যোগ করুন"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-blue-600" />
              <span>{language === 'bn' ? 'এক্সেল আপলোড' : 'Excel Import'}</span>
            </button>
          )}

          {/* Export to Excel (.xlsx) */}
          <button
            onClick={handleExportExcel}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/80 transition cursor-pointer"
            title="মাইক্রোসফট এক্সেলে ডাউনলোড করুন"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{language === 'bn' ? 'এক্সেল (.xlsx)' : 'Export Excel'}</span>
          </button>

          {/* Export to CSV */}
          <button
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/80 transition cursor-pointer"
          >
            <span>CSV</span>
          </button>

          {/* Add New Staff (Super Admin Only) */}
          {isSuperAdmin ? (
            <button
              onClick={onAddEmployee}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition transform active:scale-98 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{t.btnAddEmployee}</span>
            </button>
          ) : (
            <div 
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 text-xs font-medium border border-slate-200 dark:border-slate-700 cursor-not-allowed"
              title="নতুন কর্মী যোগ করতে Super Admin একাউন্ট লগইন আবশ্যক"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>কর্মী যোগ (লক)</span>
            </div>
          )}
        </div>
      </div>

      {/* Filter and Search Panel with 3-Year Due for Transfer Toggle */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        {/* Quick Due for Transfer Filter Highlight Button */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setFilterTransferDueOnly(!filterTransferDueOnly)}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-2xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
                filterTransferDueOnly
                  ? 'bg-red-600 text-white ring-2 ring-red-400'
                  : 'bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900 hover:bg-red-100'
              }`}
            >
              <AlertTriangle className={`w-3.5 h-3.5 ${filterTransferDueOnly ? 'text-white' : 'text-red-600'}`} />
              <span>{t.filterDueForTransfer}</span>
              <span className={`px-1.5 py-0.2 rounded-full font-mono text-[10px] ${
                filterTransferDueOnly ? 'bg-white text-red-700' : 'bg-red-600 text-white'
              }`}>
                {language === 'bn' ? toBengaliNumber(totalTransferDueInZone) : totalTransferDueInZone}
              </span>
            </button>

            {filterTransferDueOnly && (
              <span className="text-xs text-red-600 dark:text-red-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>৩ বছর অতিক্রান্ত কর্মীদের ফিল্টার চালু রয়েছে</span>
              </span>
            )}
          </div>

          <div className="text-[11px] text-slate-500">
            সংস্থাগত নিয়মানুযায়ী ব্রাঞ্চ মেয়াদ ৩ বছর অতিক্রান্ত হলে লাল ব্যাজ প্রদর্শিত হয়
          </div>
        </div>

        {/* Filter Dropdowns Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2.5">
          {/* Universal Search Input */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
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

          {/* Area Filter */}
          <div>
            <select
              value={selectedArea}
              onChange={(e) => {
                setSelectedArea(e.target.value);
                setSelectedBranch('all');
              }}
              className="w-full px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            >
              <option value="all">{t.filterAllAreas}</option>
              {areas.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>

          {/* Branch Filter */}
          <div>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="w-full px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            >
              <option value="all">{t.filterAllBranches}</option>
              {branches
                .filter(b => selectedArea === 'all' || b.area === selectedArea)
                .map((b) => (
                  <option key={b.id} value={b.name}>{b.name}</option>
                ))}
            </select>
          </div>

          {/* Designation Filter */}
          <div>
            <select
              value={selectedDesignation}
              onChange={(e) => setSelectedDesignation(e.target.value)}
              className="w-full px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            >
              <option value="all">{t.filterAllDesignations}</option>
              {designations.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Blood Group Filter */}
          <div>
            <select
              value={selectedBlood}
              onChange={(e) => setSelectedBlood(e.target.value)}
              className="w-full px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            >
              <option value="all">{t.filterAllBlood}</option>
              {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map((bg) => (
                <option key={bg} value={bg}>{bg}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Keyboard navigation hint & Reset */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-1.5">
            <Keyboard className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{t.keyboardNavHint}</span>
          </div>
          {(searchTerm || selectedArea !== 'all' || selectedBranch !== 'all' || selectedDesignation !== 'all' || selectedBlood !== 'all' || filterTransferDueOnly) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedArea('all');
                setSelectedBranch('all');
                setSelectedDesignation('all');
                setSelectedBlood('all');
                setSelectedStatus('all');
                setFilterTransferDueOnly(false);
              }}
              className="text-emerald-600 dark:text-emerald-400 hover:underline font-semibold cursor-pointer"
            >
              সব ফিল্টার রিসেট
            </button>
          )}
        </div>
      </div>

      {/* Main View: Table or Card Grid */}
      {viewMode === 'table' ? (
        <div 
          tabIndex={0}
          onKeyDown={handleKeyDown}
          className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
        >
          <div className="overflow-x-auto max-h-[640px] overflow-y-auto">
            <table ref={tableRef} className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="sticky top-0 z-20 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-700 text-[11px]">
                <tr>
                  <th className="py-3 px-3 w-12 text-center">{t.serialNo}</th>
                  <th className="py-3 px-3">{t.staffName}</th>
                  <th className="py-3 px-3">{t.pin}</th>
                  <th className="py-3 px-3">{t.designation}</th>
                  <th className="py-3 px-3">{t.branch}</th>
                  <th className="py-3 px-3">{t.area}</th>
                  <th className="py-3 px-3">{t.mobile}</th>
                  <th className="py-3 px-3 text-center">{t.bloodGroup}</th>
                  <th className="py-3 px-3">
                    {language === 'bn' ? 'সংস্থায় যোগদান (DD/MM/YYYY)' : 'Org Joining Date (DD/MM/YYYY)'}
                  </th>
                  <th className="py-3 px-3">
                    {language === 'bn' ? 'বর্তমান শাখায় মেয়াদ ও সতর্কতা' : 'Branch Tenure & Transfer Alert'}
                  </th>
                  <th className="py-3 px-3">
                    {language === 'bn' ? 'জন্ম তারিখ (DD/MM/YYYY)' : 'Date of Birth (DD/MM/YYYY)'}
                  </th>
                  <th className="py-3 px-3 text-center">{t.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredEmployees.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="py-12 text-center text-slate-400">
                      কোনো কর্মীর রেকর্ড পাওয়া যায়নি
                    </td>
                  </tr>
                ) : (
                  filteredEmployees.map((emp, rIdx) => {
                    const tenure = calculateTenure(emp.orgJoiningDate);
                    const branchTenure = calculateTenure(emp.branchJoiningDate);
                    const hasTransferDue = isDueForTransfer(emp.branchJoiningDate);

                    const isRowFocused = focusedCell.row === rIdx;
                    const getCellClass = (cIdx: number) => {
                      const isCellActive = isRowFocused && focusedCell.col === cIdx;
                      return isCellActive 
                        ? 'outline-2 outline-emerald-500 -outline-offset-2 bg-emerald-50/70 dark:bg-emerald-950/50' 
                        : '';
                    };

                    return (
                      <tr 
                        key={emp.id}
                        className={`transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/60 ${
                          hasTransferDue ? 'bg-red-50/20 dark:bg-red-950/15' : ''
                        } ${isRowFocused ? 'bg-slate-50/80 dark:bg-slate-800/40' : ''}`}
                      >
                        {/* 0. Serial */}
                        <td 
                          onClick={() => setFocusedCell({ row: rIdx, col: 0 })}
                          className={`py-2.5 px-3 text-center font-mono-num text-slate-400 ${getCellClass(0)}`}
                        >
                          {language === 'bn' ? toBengaliNumber(emp.serialNo || rIdx + 1) : (emp.serialNo || rIdx + 1)}
                        </td>

                        {/* 1. Name + Due for Transfer Tag */}
                        <td 
                          onClick={() => setFocusedCell({ row: rIdx, col: 1 })}
                          className={`py-2.5 px-3 font-bold text-slate-900 dark:text-white ${getCellClass(1)}`}
                        >
                          <div className="flex flex-col gap-1">
                            <span className="text-sm">{emp.name}</span>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {/* 3-Year Due for Transfer Red Alert Badge */}
                              {hasTransferDue && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-600 text-white font-extrabold text-[10px] tracking-wide animate-pulse shadow-xs">
                                  <AlertTriangle className="w-2.5 h-2.5" />
                                  <span>Due for Transfer (৩+ বছর)</span>
                                </span>
                              )}
                              {emp.status && emp.status !== 'Active' && (
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                                  {emp.status}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* 2. PIN */}
                        <td 
                          onClick={() => setFocusedCell({ row: rIdx, col: 2 })}
                          className={`py-2.5 px-3 font-mono-num font-semibold text-slate-700 dark:text-slate-300 ${getCellClass(2)}`}
                        >
                          {emp.pin}
                        </td>

                        {/* 3. Designation */}
                        <td 
                          onClick={() => setFocusedCell({ row: rIdx, col: 3 })}
                          className={`py-2.5 px-3 font-medium text-emerald-700 dark:text-emerald-400 ${getCellClass(3)}`}
                        >
                          {emp.designation}
                        </td>

                        {/* 4. Branch */}
                        <td 
                          onClick={() => setFocusedCell({ row: rIdx, col: 4 })}
                          className={`py-2.5 px-3 text-slate-800 dark:text-slate-200 font-semibold ${getCellClass(4)}`}
                        >
                          {emp.branch}
                        </td>

                        {/* 5. Area */}
                        <td 
                          onClick={() => setFocusedCell({ row: rIdx, col: 5 })}
                          className={`py-2.5 px-3 text-slate-600 dark:text-slate-400 ${getCellClass(5)}`}
                        >
                          {emp.area}
                        </td>

                        {/* 6. Mobile */}
                        <td 
                          onClick={() => setFocusedCell({ row: rIdx, col: 6 })}
                          className={`py-2.5 px-3 font-mono-num ${getCellClass(6)}`}
                        >
                          <a 
                            href={`tel:${emp.mobile}`}
                            className="hover:underline text-slate-800 dark:text-slate-200"
                          >
                            {emp.mobile}
                          </a>
                        </td>

                        {/* 7. Blood Group */}
                        <td 
                          onClick={() => setFocusedCell({ row: rIdx, col: 7 })}
                          className={`py-2.5 px-3 text-center ${getCellClass(7)}`}
                        >
                          <span className="inline-block px-2 py-0.5 rounded-full text-xs font-bold bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900">
                            {emp.bloodGroup}
                          </span>
                        </td>

                        {/* 8. Org Joining (Day first strictly) */}
                        <td 
                          onClick={() => setFocusedCell({ row: rIdx, col: 8 })}
                          className={`py-2.5 px-3 font-mono-num ${getCellClass(8)}`}
                        >
                          <div className="font-semibold text-slate-800 dark:text-slate-200">
                            {formatDateDDMMYYYY(emp.orgJoiningDate, language)}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {language === 'bn' ? tenure.displayTextBn : tenure.displayTextEn}
                          </div>
                        </td>

                        {/* 9. Branch Joining & 3-Year Transfer Due Alert */}
                        <td 
                          onClick={() => setFocusedCell({ row: rIdx, col: 9 })}
                          className={`py-2.5 px-3 font-mono-num ${getCellClass(9)}`}
                        >
                          <div className="font-semibold text-slate-800 dark:text-slate-200">
                            {formatDateDDMMYYYY(emp.branchJoiningDate, language)}
                          </div>
                          <div className={`text-[11px] font-bold ${
                            hasTransferDue ? 'text-red-600 dark:text-red-400' : 'text-slate-500'
                          }`}>
                            {language === 'bn' ? branchTenure.displayTextBn : branchTenure.displayTextEn}
                            {hasTransferDue && (
                              <span className="block text-[10px] text-red-600 font-extrabold uppercase">
                                ⚠️ ৩ বছর অতিক্রান্ত (বদলি প্রযোজ্য)
                              </span>
                            )}
                          </div>
                        </td>

                        {/* 10. Date of Birth (Day first strictly) */}
                        <td 
                          onClick={() => setFocusedCell({ row: rIdx, col: 10 })}
                          className={`py-2.5 px-3 font-mono-num ${getCellClass(10)}`}
                        >
                          <div className="font-semibold text-slate-800 dark:text-slate-200">
                            {formatDateDDMMYYYY(emp.birthDate, language)}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {language === 'bn' ? `${toBengaliNumber(calculateAge(emp.birthDate))} বছর বয়স` : `${calculateAge(emp.birthDate)} yrs`}
                          </div>
                        </td>

                        {/* 11. Actions */}
                        <td 
                          onClick={() => setFocusedCell({ row: rIdx, col: 11 })}
                          className={`py-2.5 px-3 text-center ${getCellClass(11)}`}
                        >
                          <div className="flex items-center justify-center gap-1">
                            {/* Branch Transfer Quick Button (Super Admin Only) */}
                            {isSuperAdmin ? (
                              <button
                                onClick={() => onTransferEmployee(emp)}
                                className={`p-1.5 rounded-lg transition cursor-pointer ${
                                  hasTransferDue
                                    ? 'bg-red-600 text-white hover:bg-red-700 shadow-xs'
                                    : 'text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/60'
                                }`}
                                title={hasTransferDue ? 'Due for Transfer: অবিলম্বে বদলি কার্যকর করুন' : 'শাখা বদলি কার্যকর করুন'}
                              >
                                <ArrowLeftRight className="w-4 h-4" />
                              </button>
                            ) : (
                              <span 
                                className="p-1.5 text-slate-300 cursor-not-allowed"
                                title="বদলি কার্যকর করতে Super Admin লগইন আবশ্যক"
                              >
                                <Lock className="w-3.5 h-3.5" />
                              </span>
                            )}

                            {/* View ID Card */}
                            <button
                              onClick={() => onViewIdCard(emp)}
                              className="p-1.5 rounded-lg text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 cursor-pointer"
                              title={t.viewIdCard}
                            >
                              <CreditCard className="w-4 h-4" />
                            </button>

                            {/* Edit (Super Admin Only) */}
                            {isSuperAdmin && (
                              <button
                                onClick={() => onEditEmployee(emp)}
                                className="p-1.5 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/60 cursor-pointer"
                                title="কর্মী তথ্য সম্পাদনা করুন"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                            )}

                            {/* Delete (Super Admin Only per user instructions) */}
                            {isSuperAdmin && (
                              <button
                                onClick={() => {
                                  if (window.confirm(language === 'bn' ? `আপনি কি নিশ্চিতভাবে ${emp.name}-কে ডাটাবেজ থেকে স্থায়ীভাবে ডিলিট করতে চান?` : `Permanently delete ${emp.name}?`)) {
                                    onDeleteEmployee(emp.id);
                                  }
                                }}
                                className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/60 cursor-pointer"
                                title="স্থায়ীভাবে ডিলিট করুন (Super Admin ক্ষমতা)"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Card View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEmployees.map((emp) => {
            const tenure = calculateTenure(emp.orgJoiningDate);
            const branchTenure = calculateTenure(emp.branchJoiningDate);
            const hasTransferDue = isDueForTransfer(emp.branchJoiningDate);

            return (
              <div 
                key={emp.id}
                className={`bg-white dark:bg-slate-900 rounded-3xl p-5 border shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow duration-200 ${
                  hasTransferDue 
                    ? 'border-red-300 dark:border-red-900/80 ring-1 ring-red-400/50' 
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-slate-900 dark:text-white text-base">
                          {emp.name}
                        </h4>
                        <span className="text-xs font-mono-num px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {emp.pin}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mt-0.5">
                        {emp.designation}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <span className="px-2 py-0.5 rounded-xl bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 text-xs font-bold border border-red-200 dark:border-red-900 shrink-0">
                        {emp.bloodGroup}
                      </span>
                    </div>
                  </div>

                  {/* Due for Transfer alert banner on card */}
                  {hasTransferDue && (
                    <div className="p-2 rounded-xl bg-red-500 text-white text-[11px] font-bold flex items-center justify-between shadow-2xs">
                      <span className="flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Due for Transfer (৩+ বছর অতিক্রান্ত)</span>
                      </span>
                      {isSuperAdmin && (
                        <button
                          type="button"
                          onClick={() => onTransferEmployee(emp)}
                          className="px-2 py-0.5 rounded-lg bg-white text-red-700 text-[10px] font-black hover:bg-red-50 cursor-pointer"
                        >
                          বদলি করুন
                        </button>
                      )}
                    </div>
                  )}

                  {/* Branch & Area */}
                  <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-2xl">
                    <div className="flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-semibold text-slate-900 dark:text-white">{emp.branch}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{emp.area}</span>
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="space-y-1 text-xs text-slate-600 dark:text-slate-300 pt-1">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-slate-500">সংস্থায় যোগদান:</span>
                      <span className="font-mono-num font-semibold text-slate-800 dark:text-slate-200">
                        {formatDateDDMMYYYY(emp.orgJoiningDate, language)} ({language === 'bn' ? tenure.displayTextBn : tenure.displayTextEn})
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-slate-500">বর্তমান শাখায় মেয়াদ:</span>
                      <span className={`font-mono-num font-bold ${hasTransferDue ? 'text-red-600' : 'text-slate-800 dark:text-slate-200'}`}>
                        {language === 'bn' ? branchTenure.displayTextBn : branchTenure.displayTextEn}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer Quick Actions */}
                <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <a
                      href={`tel:${emp.mobile}`}
                      className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 text-xs font-mono-num flex items-center gap-1"
                      title={emp.mobile}
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>{emp.mobile}</span>
                    </a>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onViewIdCard(emp)}
                      className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 cursor-pointer"
                      title="আইডি কার্ড দেখুন"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                    </button>

                    {/* Transfer Button */}
                    {isSuperAdmin ? (
                      <button
                        onClick={() => onTransferEmployee(emp)}
                        className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold cursor-pointer ${
                          hasTransferDue
                            ? 'bg-red-600 text-white hover:bg-red-700'
                            : 'bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 hover:bg-teal-100'
                        }`}
                      >
                        {t.btnTransfer}
                      </button>
                    ) : (
                      <span className="p-2 text-slate-300" title="Super Admin লগইন আবশ্যক">
                        <Lock className="w-3.5 h-3.5" />
                      </span>
                    )}

                    {isSuperAdmin && (
                      <button
                        onClick={() => onEditEmployee(emp)}
                        className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                        title="সম্পাদনা করুন"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Excel / CSV Bulk Import Modal */}
      {isImportModalOpen && (
        <CsvImportModal
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          onImportSuccess={onBulkImport}
          language={language}
        />
      )}
    </div>
  );
};
