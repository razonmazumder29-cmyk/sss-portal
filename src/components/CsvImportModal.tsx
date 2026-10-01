import React, { useState, useRef } from 'react';
import { 
  X, 
  Upload, 
  FileSpreadsheet, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  Users,
  FileCheck2,
  Trash2
} from 'lucide-react';
import { Employee } from '../types';
import { translations } from '../translations';
import { 
  parseSpreadsheetFile, 
  downloadSampleExcelTemplate, 
  downloadSampleCsvTemplate 
} from '../utils/exportImport';
import { toBengaliNumber, formatDateDDMMYYYY } from '../utils/dateCalculations';

interface CsvImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (importedEmployees: Partial<Employee>[]) => void;
  language: 'bn' | 'en';
}

export const CsvImportModal: React.FC<CsvImportModalProps> = ({
  isOpen,
  onClose,
  onImportSuccess,
  language
}) => {
  if (!isOpen) return null;
  const t = translations[language];

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [parsedList, setParsedList] = useState<Partial<Employee>[]>([]);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [fileNames, setFileNames] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const processFiles = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;
    setIsLoading(true);
    setParseErrors([]);

    const allEmployees: Partial<Employee>[] = [];
    const allErrors: string[] = [];
    const names: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      names.push(file.name);
      try {
        const res = await parseSpreadsheetFile(file);
        if (res.success && res.employees.length > 0) {
          allEmployees.push(...res.employees);
        }
        if (res.errors.length > 0) {
          allErrors.push(`[${file.name}] ${res.errors.join(', ')}`);
        }
      } catch (err) {
        allErrors.push(`[${file.name}] ফাইল ত্রুটি: ${String(err)}`);
      }
    }

    setFileNames(names);
    setParsedList(allEmployees);
    setParseErrors(allErrors);
    setIsLoading(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      processFiles(files);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleCommit = () => {
    if (parsedList.length === 0) return;
    onImportSuccess(parsedList);
    onClose();
  };

  const handleClear = () => {
    setParsedList([]);
    setParseErrors([]);
    setFileNames([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-5xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-150"
        role="dialog"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-xs">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>{language === 'bn' ? 'এক্সেল / CSV বাল্ক কর্মী আপলোড' : 'Bulk Staff Import (.xlsx, .xls, .csv)'}</span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-semibold">
                  দিন/মাস/বছর ফরম্যাট
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {language === 'bn' 
                  ? 'আপনার এক্সেল বা সিএসভি শিট আপলোড করে কেন্দ্রীয় ক্লাউড ডাটাবেজে একসাথে সকল কর্মী সংরক্ষণ করুন'
                  : 'Upload single or multiple Excel / CSV sheets to sync all zonal employees'}
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

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Action Bar: Download Templates */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60">
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-emerald-950 dark:text-emerald-300">
                {language === 'bn' ? 'নমুনা স্প্রেডশিট টেমপ্লেট ডাউনলোড করুন' : 'Download Sample Spreadsheet Template'}
              </h4>
              <p className="text-xs text-emerald-800/80 dark:text-emerald-400/80 mt-0.5">
                {language === 'bn'
                  ? 'সঠিক কলাম এবং দিন/মাস/বছর ফরম্যাটে ডাটা সাজাতে আমাদের টেমপ্লেট ব্যবহার করুন'
                  : 'Use our pre-formatted template with Day/Month/Year date columns'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={downloadSampleExcelTemplate}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? 'এক্সেল টেমপ্লেট (.xlsx)' : 'Excel Template (.xlsx)'}</span>
              </button>
              <button
                type="button"
                onClick={downloadSampleCsvTemplate}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-slate-800 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100/50 text-xs font-semibold transition cursor-pointer"
              >
                <span>{language === 'bn' ? 'CSV টেমপ্লেট' : 'CSV Template'}</span>
              </button>
            </div>
          </div>

          {/* Drag & Drop Upload Zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all duration-200 ${
              isDragOver 
                ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/40 scale-[1.01]' 
                : 'border-slate-300 dark:border-slate-700 hover:border-emerald-400 dark:hover:border-emerald-600 bg-slate-50/40 dark:bg-slate-800/30'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".xlsx, .xls, .csv, .tsv"
              multiple
              className="hidden"
            />
            
            <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-xs">
              <Upload className="w-7 h-7" />
            </div>
            <h4 className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-200">
              {isLoading 
                ? (language === 'bn' ? 'স্প্রেডশিট প্রসেস করা হচ্ছে...' : 'Processing spreadsheet...') 
                : (language === 'bn' ? 'এক্সেল বা সিএসভি ফাইল এখানে ড্রপ করুন অথবা ক্লিক করুন' : 'Drag & drop Excel or CSV file(s) here, or click to browse')}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              সমর্থিত ফাইল: <span className="font-semibold text-emerald-600 dark:text-emerald-400">.xlsx, .xls, .csv, .tsv</span>
            </p>

            {fileNames.length > 0 && (
              <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-semibold">
                <FileCheck2 className="w-3.5 h-3.5" />
                <span>{fileNames.join(', ')}</span>
              </div>
            )}
          </div>

          {/* Parse Errors if any */}
          {parseErrors.length > 0 && (
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-amber-900 dark:text-amber-300">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                <span>ফাইল সংক্রান্ত সতর্কতা:</span>
              </div>
              <ul className="list-disc list-inside text-amber-800 dark:text-amber-400 space-y-0.5 pl-2 max-h-28 overflow-y-auto">
                {parseErrors.map((err, idx) => (
                  <li key={idx}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Parsed Employees Table Preview */}
          {parsedList.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    {language === 'bn' ? 'আমদানির জন্য প্রস্তুত কর্মী তালিকা' : 'Preview Staff Records Ready to Import'}
                  </span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-mono-num font-bold">
                    {language === 'bn' ? `${toBengaliNumber(parsedList.length)} জন` : `${parsedList.length} members`}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleClear}
                  className="inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-700 dark:hover:text-red-400 font-semibold cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>মুছে ফেলুন</span>
                </button>
              </div>

              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden max-h-72 overflow-y-auto">
                <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold uppercase text-[11px] sticky top-0">
                    <tr>
                      <th className="py-2.5 px-3">SL</th>
                      <th className="py-2.5 px-3">{t.staffName}</th>
                      <th className="py-2.5 px-3">{t.pin}</th>
                      <th className="py-2.5 px-3">{t.designation}</th>
                      <th className="py-2.5 px-3">{t.branch}</th>
                      <th className="py-2.5 px-3">{t.area}</th>
                      <th className="py-2.5 px-3">{t.mobile}</th>
                      <th className="py-2.5 px-3 text-center">{t.bloodGroup}</th>
                      <th className="py-2.5 px-3">সংস্থায় যোগ (DD/MM/YYYY)</th>
                      <th className="py-2.5 px-3">জন্ম (DD/MM/YYYY)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                    {parsedList.map((emp, i) => (
                      <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="py-2 px-3 font-mono">{emp.serialNo || i + 1}</td>
                        <td className="py-2 px-3 font-bold text-slate-900 dark:text-white">{emp.name}</td>
                        <td className="py-2 px-3 font-mono-num">{emp.pin}</td>
                        <td className="py-2 px-3 text-emerald-700 dark:text-emerald-400">{emp.designation}</td>
                        <td className="py-2 px-3">{emp.branch}</td>
                        <td className="py-2 px-3 text-slate-500">{emp.area}</td>
                        <td className="py-2 px-3 font-mono-num">{emp.mobile}</td>
                        <td className="py-2 px-3 text-center">
                          <span className="px-1.5 py-0.5 rounded bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 font-bold text-[10px]">
                            {emp.bloodGroup}
                          </span>
                        </td>
                        <td className="py-2 px-3 font-mono-num font-semibold text-slate-800 dark:text-slate-200">
                          {formatDateDDMMYYYY(emp.orgJoiningDate || '', language)}
                        </td>
                        <td className="py-2 px-3 font-mono-num">
                          {formatDateDDMMYYYY(emp.birthDate || '', language)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {parsedList.length > 0 
              ? (language === 'bn' ? `মোট ${toBengaliNumber(parsedList.length)} জন কর্মী ডাটাবেজে অন্তর্ভুক্ত হতে প্রস্তুত` : `${parsedList.length} staff records ready to merge`)
              : (language === 'bn' ? 'ফাইল সিলেক্ট করে প্রিভিউ দেখে চূড়ান্ত করুন' : 'Select file to preview before importing')}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              {t.cancel}
            </button>
            <button
              type="button"
              disabled={parsedList.length === 0}
              onClick={handleCommit}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-md transition cursor-pointer ${
                parsedList.length > 0
                  ? 'bg-emerald-600 hover:bg-emerald-700 active:scale-98'
                  : 'bg-slate-400 cursor-not-allowed opacity-60'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>
                {language === 'bn' 
                  ? `ক্লাউড ডাটাবেজে যুক্ত করুন (${toBengaliNumber(parsedList.length)} জন)`
                  : `Add All Staff (${parsedList.length})`}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
