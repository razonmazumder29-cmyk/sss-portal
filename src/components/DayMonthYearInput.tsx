import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import { toBengaliNumber } from '../utils/dateCalculations';

interface DayMonthYearInputProps {
  value: string; // YYYY-MM-DD
  onChange: (val: string) => void;
  label: string;
  required?: boolean;
  language?: 'bn' | 'en';
  helperText?: string;
}

const MONTHS_BN = [
  '০১ - জানুয়ারি (Jan)',
  '০২ - ফেব্রুয়ারি (Feb)',
  '০৩ - মার্চ (Mar)',
  '০৪ - এপ্রিল (Apr)',
  '০৫ - মে (May)',
  '০৬ - জুন (Jun)',
  '০৭ - জুলাই (Jul)',
  '০৮ - আগস্ট (Aug)',
  '০৯ - সেপ্টেম্বর (Sep)',
  '১০ - অক্টোবর (Oct)',
  '১১ - নভেম্বর (Nov)',
  '১২ - ডিসেম্বর (Dec)'
];

const MONTHS_EN = [
  '01 - Jan',
  '02 - Feb',
  '03 - Mar',
  '04 - Apr',
  '05 - May',
  '06 - Jun',
  '07 - Jul',
  '08 - Aug',
  '09 - Sep',
  '10 - Oct',
  '11 - Nov',
  '12 - Dec'
];

export const DayMonthYearInput: React.FC<DayMonthYearInputProps> = ({
  value,
  onChange,
  label,
  required = false,
  language = 'bn',
  helperText
}) => {
  const parseParts = (val: string) => {
    if (!val) return { day: '', month: '', year: '' };
    if (val.includes('-')) {
      const parts = val.split('-');
      if (parts.length === 3) {
        if (parts[0].length === 4) {
          return { day: String(parseInt(parts[2], 10) || ''), month: String(parseInt(parts[1], 10) || ''), year: parts[0] };
        } else {
          return { day: String(parseInt(parts[0], 10) || ''), month: String(parseInt(parts[1], 10) || ''), year: parts[2] };
        }
      }
    } else if (val.includes('/')) {
      const parts = val.split('/');
      if (parts.length === 3) {
        if (parts[0].length === 4) {
          return { day: String(parseInt(parts[2], 10) || ''), month: String(parseInt(parts[1], 10) || ''), year: parts[0] };
        } else {
          return { day: String(parseInt(parts[0], 10) || ''), month: String(parseInt(parts[1], 10) || ''), year: parts[2] };
        }
      }
    }
    return { day: '', month: '', year: '' };
  };

  const initial = parseParts(value);
  const [day, setDay] = useState(initial.day);
  const [month, setMonth] = useState(initial.month);
  const [year, setYear] = useState(initial.year);

  useEffect(() => {
    const updated = parseParts(value);
    setDay(updated.day);
    setMonth(updated.month);
    setYear(updated.year);
  }, [value]);

  const emitChange = (d: string, m: string, y: string) => {
    if (d && m && y && y.length === 4) {
      const dd = String(parseInt(d, 10)).padStart(2, '0');
      const mm = String(parseInt(m, 10)).padStart(2, '0');
      onChange(`${y}-${mm}-${dd}`);
    } else if (!d && !m && !y) {
      onChange('');
    }
  };

  const handleDayChange = (newDay: string) => {
    setDay(newDay);
    emitChange(newDay, month, year);
  };

  const handleMonthChange = (newMonth: string) => {
    setMonth(newMonth);
    emitChange(day, newMonth, year);
  };

  const handleYearChange = (newYear: string) => {
    setYear(newYear);
    emitChange(day, month, newYear);
  };

  const handleNativePickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (raw) {
      onChange(raw);
    }
  };

  const previewDayMonthYear = (d: string, m: string, y: string) => {
    if (!d || !m || !y || y.length !== 4) return null;
    const dd = String(parseInt(d, 10)).padStart(2, '0');
    const mm = String(parseInt(m, 10)).padStart(2, '0');
    const enStr = `${dd}/${mm}/${y}`;
    const bnStr = `${toBengaliNumber(dd)}/${toBengaliNumber(mm)}/${toBengaliNumber(y)}`;
    return { enStr, bnStr };
  };

  const preview = previewDayMonthYear(day, month, year);
  const months = language === 'bn' ? MONTHS_BN : MONTHS_EN;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
          দিন/মাস/বছর (DD/MM/YYYY)
        </span>
      </div>

      <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/80 p-1.5 rounded-2xl border border-slate-300 dark:border-slate-700 focus-within:ring-2 focus-within:ring-emerald-500 transition">
        {/* Day Select (01 - 31) */}
        <div className="w-20 shrink-0">
          <select
            value={day ? String(parseInt(day, 10)) : ''}
            onChange={(e) => handleDayChange(e.target.value)}
            required={required}
            className="w-full px-2 py-1.5 rounded-xl bg-white dark:bg-slate-900 text-xs font-semibold text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:outline-hidden"
          >
            <option value="">দিন (DD)</option>
            {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
              <option key={d} value={d}>
                {language === 'bn' ? `${toBengaliNumber(String(d).padStart(2, '0'))} (${String(d).padStart(2, '0')})` : String(d).padStart(2, '0')}
              </option>
            ))}
          </select>
        </div>

        <span className="text-slate-400 font-bold">/</span>

        {/* Month Select (01 - 12) */}
        <div className="flex-1">
          <select
            value={month ? String(parseInt(month, 10)) : ''}
            onChange={(e) => handleMonthChange(e.target.value)}
            required={required}
            className="w-full px-2 py-1.5 rounded-xl bg-white dark:bg-slate-900 text-xs font-semibold text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:outline-hidden"
          >
            <option value="">মাস (MM)</option>
            {months.map((name, i) => (
              <option key={i + 1} value={i + 1}>
                {name}
              </option>
            ))}
          </select>
        </div>

        <span className="text-slate-400 font-bold">/</span>

        {/* Year Input (YYYY) */}
        <div className="w-24 shrink-0">
          <input
            type="number"
            placeholder="বছর (YYYY)"
            min="1950"
            max="2035"
            value={year}
            onChange={(e) => handleYearChange(e.target.value)}
            required={required}
            className="w-full px-2 py-1.5 rounded-xl bg-white dark:bg-slate-900 text-xs font-semibold text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:outline-hidden font-mono"
          />
        </div>

        {/* Hidden native date input with clickable calendar button */}
        <div className="relative shrink-0 pr-1">
          <input
            type="date"
            value={value}
            onChange={handleNativePickerChange}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
            title="ক্যালেন্ডার থেকে নির্বাচন করুন"
          />
          <button
            type="button"
            className="p-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200 transition"
          >
            <CalendarIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {preview && (
        <div className="flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-300 pt-0.5">
          <span className="text-slate-400">প্রদর্শন:</span>
          <strong className="font-mono text-emerald-700 dark:text-emerald-300">{preview.enStr}</strong>
          <span className="text-slate-400">({preview.bnStr})</span>
        </div>
      )}

      {helperText && (
        <span className="text-[10px] text-slate-400 block">{helperText}</span>
      )}
    </div>
  );
};
