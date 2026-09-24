import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  UserPlus, 
  ArrowLeftRight, 
  Edit3, 
  Trash2, 
  CreditCard, 
  Download, 
  Phone, 
  Mail, 
  Grid, 
  Table as TableIcon,
  Building2,
  MapPin,
  Keyboard,
  Calendar,
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import { Employee, BranchItem, BloodGroup } from '../types';
import { translations } from '../translations';
import { formatDate, calculateTenure, calculateAge, toBengaliNumber } from '../utils/dateCalculations';
import { exportEmployeesToCsv } from '../utils/exportImport';

interface EmployeeDirectoryProps {
  employees: Employee[];
  areas: string[];
  branches: BranchItem[];
  designations: string[];
  language: 'bn' | 'en';
  isAdmin: boolean;
  onAddEmployee: () => void;
  onEditEmployee: (emp: Employee) => void;
  onTransferEmployee: (emp: Employee) => void;
  onDeleteEmployee: (empId: string) => void;
  onViewIdCard: (emp: Employee) => void;
  highlightPin?: string | null;
}

export const EmployeeDirectory: React.FC<EmployeeDirectoryProps> = ({
  employees,
  areas,
  branches,
  designations,
  language,
  isAdmin,
  onAddEmployee,
  onEditEmployee,
  onTransferEmployee,
  onDeleteEmployee,
  onViewIdCard,
  highlightPin
}) => {
  const t = translations[language];

  // Filters
  const [searchTerm, setSearchTerm] = useState<string>(highlightPin || '');
  const [selectedArea, setSelectedArea] = useState<string>('all');
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [selectedDesignation, setSelectedDesignation] = useState<string>('all');
  const [selectedBlood, setSelectedBlood] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Keyboard navigation state for table (Row, Col)
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

    return matchesSearch && matchesArea && matchesBranch && matchesDesignation && matchesBlood;
  });

  // Table Columns count: 12 columns
  const TOTAL_COLS = 12;

  // Handle Arrow & Tab key navigation
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

  return (
    <div className="space-y-4">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>{language === 'bn' ? 'চট্টগ্রাম-০২ জোন কর্মী ডাটাবেজ' : 'Chattogram-02 Zone Staff Database'}</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-mono-num font-bold">
              {language === 'bn' ? toBengaliNumber(filteredEmployees.length) : filteredEmployees.length}
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {language === 'bn'
              ? 'সকল কর্মকর্তা ও কর্মচারীদের তথ্য, বদলির রেকর্ড এবং জরুরি রক্তের গ্রুপ তালিকা'
              : 'Complete personnel records, transfer track record, and emergency details'}
          </p>
        </div>

        {/* Action Buttons: Add employee, CSV Export, View Switch */}
        <div className="flex flex-wrap items-center gap-2">
          {/* View mode toggle */}
          <div className="flex items-center p-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md text-xs transition ${
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
              className={`p-1.5 rounded-md text-xs transition ${
                viewMode === 'cards'
                  ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
              title="Card View"
            >
              <Grid className="w-4 h-4" />
            </button>
          </div>

          {/* Export to CSV (UTF-8 BOM) */}
          <button
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/80 transition"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{t.btnExportCsv}</span>
          </button>

          {/* Add New Staff */}
          <button
            onClick={onAddEmployee}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition transform active:scale-98"
          >
            <UserPlus className="w-4 h-4" />
            <span>{t.btnAddNewStaff}</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Box */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
          />
        </div>

        {/* Dropdown Filters: Area, Branch, Designation, Blood */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
          {/* Area */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
              {t.area}
            </label>
            <select
              value={selectedArea}
              onChange={(e) => {
                setSelectedArea(e.target.value);
                setSelectedBranch('all');
              }}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs focus:ring-1 focus:ring-emerald-500"
            >
              <option value="all">{t.allAreas}</option>
              {areas.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>

          {/* Branch */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
              {t.branch}
            </label>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs focus:ring-1 focus:ring-emerald-500"
            >
              <option value="all">{t.allBranches}</option>
              {branches
                .filter(b => selectedArea === 'all' || b.area === selectedArea)
                .map((b) => (
                  <option key={b.id} value={b.name}>{b.name}</option>
                ))}
            </select>
          </div>

          {/* Designation */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
              {t.designation}
            </label>
            <select
              value={selectedDesignation}
              onChange={(e) => setSelectedDesignation(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs focus:ring-1 focus:ring-emerald-500"
            >
              <option value="all">{t.allDesignations}</option>
              {designations.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Blood Group */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
              {t.bloodGroup}
            </label>
            <select
              value={selectedBlood}
              onChange={(e) => setSelectedBlood(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs focus:ring-1 focus:ring-emerald-500 font-bold"
            >
              <option value="all">{t.allBloodGroups}</option>
              {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map((bg) => (
                <option key={bg} value={bg}>{bg}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Keyboard navigation hint */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-1.5">
            <Keyboard className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{t.keyboardNavHint}</span>
          </div>
          {(searchTerm || selectedArea !== 'all' || selectedBranch !== 'all' || selectedDesignation !== 'all' || selectedBlood !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedArea('all');
                setSelectedBranch('all');
                setSelectedDesignation('all');
                setSelectedBlood('all');
              }}
              className="text-emerald-600 dark:text-emerald-400 hover:underline font-semibold"
            >
              ফিল্টার রিসেট করুন
            </button>
          )}
        </div>
      </div>

      {/* Main View: Table or Card Grid */}
      {viewMode === 'table' ? (
        <div 
          tabIndex={0}
          onKeyDown={handleKeyDown}
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
        >
          <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
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
                  <th className="py-3 px-3">{t.orgJoiningDate}</th>
                  <th className="py-3 px-3">{t.branchJoiningDate}</th>
                  <th className="py-3 px-3">{t.dateOfBirth}</th>
                  <th className="py-3 px-3 text-center">{t.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredEmployees.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="py-12 text-center text-slate-400">
                      কোনো কর্মীর তথ্য পাওয়া যায়নি
                    </td>
                  </tr>
                ) : (
                  filteredEmployees.map((emp, rIdx) => {
                    const tenure = calculateTenure(emp.orgJoiningDate);
                    const branchTenure = calculateTenure(emp.branchJoiningDate);
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
                          isRowFocused ? 'bg-slate-50/80 dark:bg-slate-800/40' : ''
                        }`}
                      >
                        {/* 0. Serial */}
                        <td 
                          onClick={() => setFocusedCell({ row: rIdx, col: 0 })}
                          className={`py-2.5 px-3 text-center font-mono-num text-slate-500 font-medium ${getCellClass(0)}`}
                        >
                          {language === 'bn' ? toBengaliNumber(emp.serialNo || rIdx + 1) : (emp.serialNo || rIdx + 1)}
                        </td>

                        {/* 1. Name */}
                        <td 
                          onClick={() => setFocusedCell({ row: rIdx, col: 1 })}
                          className={`py-2.5 px-3 font-bold text-slate-900 dark:text-white ${getCellClass(1)}`}
                        >
                          <button
                            onClick={() => onViewIdCard(emp)}
                            className="text-left hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-1.5"
                          >
                            <span>{emp.name}</span>
                          </button>
                        </td>

                        {/* 2. PIN */}
                        <td 
                          onClick={() => setFocusedCell({ row: rIdx, col: 2 })}
                          className={`py-2.5 px-3 font-mono font-semibold text-slate-700 dark:text-slate-300 ${getCellClass(2)}`}
                        >
                          {emp.pin}
                        </td>

                        {/* 3. Designation */}
                        <td 
                          onClick={() => setFocusedCell({ row: rIdx, col: 3 })}
                          className={`py-2.5 px-3 font-semibold text-emerald-700 dark:text-emerald-400 ${getCellClass(3)}`}
                        >
                          {emp.designation}
                        </td>

                        {/* 4. Branch */}
                        <td 
                          onClick={() => setFocusedCell({ row: rIdx, col: 4 })}
                          className={`py-2.5 px-3 text-slate-800 dark:text-slate-200 ${getCellClass(4)}`}
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

                        {/* 8. Org Joining */}
                        <td 
                          onClick={() => setFocusedCell({ row: rIdx, col: 8 })}
                          className={`py-2.5 px-3 font-mono-num ${getCellClass(8)}`}
                        >
                          <div>{formatDate(emp.orgJoiningDate, language)}</div>
                          <div className="text-[10px] text-slate-400">
                            {language === 'bn' ? tenure.displayTextBn : tenure.displayTextEn}
                          </div>
                        </td>

                        {/* 9. Branch Joining */}
                        <td 
                          onClick={() => setFocusedCell({ row: rIdx, col: 9 })}
                          className={`py-2.5 px-3 font-mono-num ${getCellClass(9)}`}
                        >
                          <div>{formatDate(emp.branchJoiningDate, language)}</div>
                          <div className="text-[10px] text-slate-400">
                            {language === 'bn' ? branchTenure.displayTextBn : branchTenure.displayTextEn}
                          </div>
                        </td>

                        {/* 10. Date of Birth */}
                        <td 
                          onClick={() => setFocusedCell({ row: rIdx, col: 10 })}
                          className={`py-2.5 px-3 font-mono-num ${getCellClass(10)}`}
                        >
                          <div>{formatDate(emp.birthDate, language)}</div>
                          <div className="text-[10px] text-slate-400">
                            {language === 'bn' ? `${toBengaliNumber(calculateAge(emp.birthDate))} বছর বয়স` : `${calculateAge(emp.birthDate)} yrs old`}
                          </div>
                        </td>

                        {/* 11. Actions */}
                        <td 
                          onClick={() => setFocusedCell({ row: rIdx, col: 11 })}
                          className={`py-2.5 px-3 text-center ${getCellClass(11)}`}
                        >
                          <div className="flex items-center justify-center gap-1">
                            {/* Branch Transfer Quick Button */}
                            <button
                              onClick={() => onTransferEmployee(emp)}
                              className="p-1.5 rounded-md text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-950/60"
                              title="Branch Transfer (শাখা বদলি)"
                            >
                              <ArrowLeftRight className="w-3.5 h-3.5" />
                            </button>

                            {/* View ID Card */}
                            <button
                              onClick={() => onViewIdCard(emp)}
                              className="p-1.5 rounded-md text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                              title="ID Card"
                            >
                              <CreditCard className="w-3.5 h-3.5" />
                            </button>

                            {/* Edit */}
                            <button
                              onClick={() => onEditEmployee(emp)}
                              className="p-1.5 rounded-md text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/60"
                              title="Edit Employee"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete */}
                            <button
                              onClick={() => onDeleteEmployee(emp.id)}
                              className="p-1.5 rounded-md text-red-500 hover:bg-red-50 dark:hover:bg-red-950/60"
                              title="Delete Employee"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
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
        /* Card Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEmployees.map((emp) => {
            const tenure = calculateTenure(emp.orgJoiningDate);
            return (
              <div
                key={emp.id}
                className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold flex items-center justify-center text-sm border border-emerald-300 dark:border-emerald-800">
                      {emp.name.charAt(0)}
                    </div>
                    <div>
                      <h3 
                        onClick={() => onViewIdCard(emp)}
                        className="font-bold text-slate-900 dark:text-white text-sm hover:text-emerald-600 cursor-pointer"
                      >
                        {emp.name}
                      </h3>
                      <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                        {emp.designation}
                      </p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400 border border-red-200">
                    {emp.bloodGroup}
                  </span>
                </div>

                <div className="text-xs space-y-1.5 text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">PIN:</span>
                    <span className="font-mono font-semibold">{emp.pin}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">{t.branch}:</span>
                    <span className="font-medium text-slate-900 dark:text-slate-100">{emp.branch}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">{t.area}:</span>
                    <span>{emp.area}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">চাকুরিকাল:</span>
                    <span>{language === 'bn' ? tenure.displayTextBn : tenure.displayTextEn}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">মোবাইল:</span>
                    <a href={`tel:${emp.mobile}`} className="font-mono font-semibold text-emerald-600">
                      {emp.mobile}
                    </a>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <button
                    onClick={() => onViewIdCard(emp)}
                    className="inline-flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400 hover:text-emerald-600"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>ID Card</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onTransferEmployee(emp)}
                      className="px-2 py-1 rounded bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 text-xs font-semibold hover:bg-teal-100"
                    >
                      {t.btnTransfer}
                    </button>
                    <button
                      onClick={() => onEditEmployee(emp)}
                      className="p-1 rounded text-slate-400 hover:text-slate-600"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
