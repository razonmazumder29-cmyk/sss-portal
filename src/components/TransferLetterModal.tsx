import React from 'react';
import { X, Printer, FileText } from 'lucide-react';
import { Employee, TransferRecord, SettingsConfig } from '../types';
import { formatDate } from '../utils/dateCalculations';

interface TransferLetterModalProps {
  employee: Employee;
  transfer: TransferRecord;
  settings: SettingsConfig;
  language: 'bn' | 'en';
  onClose: () => void;
}

export const TransferLetterModal: React.FC<TransferLetterModalProps> = ({
  employee,
  transfer,
  settings,
  language,
  onClose
}) => {
  const handlePrint = () => {
    window.print();
  };

  const memoRef = transfer.orderRef || `SSS/CTG02/TR/${new Date().getFullYear()}/${Math.floor(100 + Math.random() * 900)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div 
        className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[95vh] animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
      >
        {/* Top Control Bar */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 no-print">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {language === 'bn' ? 'অফিসিয়াল বদলির আদেশপত্র (Printable Order Letter)' : 'Official Transfer Order'}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'প্রিন্ট করুন' : 'Print Letter'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Official Document */}
        <div className="p-8 bg-slate-100 dark:bg-slate-950/80 flex justify-center overflow-y-auto">
          <div className="print-card w-full max-w-xl bg-white rounded-2xl shadow-xl border border-slate-200 p-8 text-slate-900 text-xs sm:text-sm font-sans leading-relaxed">
            
            {/* Letterhead */}
            <div className="text-center border-b-2 border-emerald-700 pb-4 mb-6">
              <div className="w-12 h-12 mx-auto rounded-xl bg-emerald-700 text-white font-black text-lg flex items-center justify-center mb-1">
                SSS
              </div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight">
                {settings.orgNameBn}
              </h2>
              <p className="text-xs text-slate-600 font-medium">
                {settings.orgNameEn}
              </p>
              <p className="text-[11px] text-emerald-800 font-semibold mt-0.5">
                জোনাল কার্যালয়: {settings.zoneNameBn} ({settings.zoneNameEn})
              </p>
              <p className="text-[10px] text-slate-400">
                ইমেইল: {settings.zoneEmailList[0] || 'sss.zone.chattogram02@gmail.com'} | ফোন: {settings.zonePhone}
              </p>
            </div>

            {/* Memo & Date */}
            <div className="flex justify-between items-center text-xs mb-6 font-mono">
              <div>
                <span className="font-semibold text-slate-500">স্মারক নং: </span>
                <span className="font-bold text-slate-800">{memoRef}</span>
              </div>
              <div>
                <span className="font-semibold text-slate-500">তারিখ: </span>
                <span className="font-bold text-slate-800">{formatDate(transfer.transferDate, 'bn')}</span>
              </div>
            </div>

            {/* Subject */}
            <div className="mb-5 p-2 bg-slate-50 border-l-4 border-emerald-600 font-bold text-slate-900">
              বিষয়: দাপ্তরিক প্রয়োজনে কর্মকর্তা/কর্মচারীর শাখা বদলি ও দায়িত্ব হস্তান্তর প্রসঙ্গে।
            </div>

            {/* Letter Body */}
            <div className="space-y-3.5 text-justify text-slate-700 leading-relaxed">
              <p>
                সংশ্লিষ্ট সকলের অবগতির জন্য জানানো যাচ্ছে যে, সংস্থাগত নিয়মানুযায়ী এবং প্রশাসনিক গতিশীলতা বজায় রাখার স্বার্থে নিম্নে বর্ণিত সহকর্মীকে বর্তমান কর্মস্থল হতে পরিবর্তিত নতুন কর্মস্থলে বদলি করা হলো:
              </p>

              {/* Table of transfer */}
              <div className="my-4 border border-slate-300 rounded-lg overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-100 border-b border-slate-300 font-bold text-slate-800">
                    <tr>
                      <th className="p-2">কর্মীর নাম ও পদবি</th>
                      <th className="p-2">পিন নং</th>
                      <th className="p-2">বর্তমান কর্মস্থল</th>
                      <th className="p-2">বদলিকৃত কর্মস্থল</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-2 font-semibold text-slate-900">
                        {employee.name}<br />
                        <span className="text-slate-500 text-[11px] font-normal">{employee.designation}</span>
                      </td>
                      <td className="p-2 font-mono font-bold">{employee.pin}</td>
                      <td className="p-2">
                        {transfer.fromBranch}<br />
                        <span className="text-[10px] text-slate-500">{transfer.fromArea}</span>
                      </td>
                      <td className="p-2 font-bold text-emerald-800">
                        {transfer.toBranch}<br />
                        <span className="text-[10px] text-slate-500 font-normal">{transfer.toArea}</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <p>
                <strong>শর্তাবলি ও নির্দেশনা:</strong>
              </p>
              <ul className="list-disc pl-5 space-y-1 text-xs text-slate-600">
                <li>
                  সংশ্লিষ্ট কর্মীকে আগামী <strong>{formatDate(transfer.transferDate, 'bn')}</strong> তারিখের মধ্যে বর্তমান শাখার দায়িত্ব যথাযথভাবে হস্তান্তর করে অবমুক্ত (Release) হতে হবে।
                </li>
                <li>
                  নতুন শাখায় অবিলম্বে যোগদানপূর্বক জোনাল কার্যালয়কে অবহিত করার জন্য নির্দেশ প্রদান করা হলো।
                </li>
                {transfer.reason && (
                  <li>
                    বদলির কারণ / বিবরণ: <em>{transfer.reason}</em>
                  </li>
                )}
              </ul>

              <p className="pt-2">
                কর্তৃপক্ষের আদেশক্রমে এই নির্দেশ অবিলম্বে কার্যকর হবে।
              </p>
            </div>

            {/* Signature Block */}
            <div className="mt-12 pt-4 flex justify-between items-end">
              <div className="text-[10px] text-slate-400 space-y-0.5">
                <p className="font-bold text-slate-600">অনুলিপি প্রেরিত হলো:</p>
                <p>১. মানবসম্পদ বিভাগ (HRD), প্রধান কার্যালয়</p>
                <p>২. জোনাল ম্যানেজার মহোদয়ের দপ্তর</p>
                <p>৩. শাখা ব্যবস্থাপক, {transfer.fromBranch} ও {transfer.toBranch}</p>
                <p>৪. জনাব {employee.name}, {employee.designation}</p>
                <p>৫. সংশ্লিষ্ট নথি/মাস্টার ফাইল</p>
              </div>

              <div className="text-right">
                <div className="h-8 border-b border-slate-600 w-32 ml-auto mb-1"></div>
                <p className="font-extrabold text-slate-900 text-xs">জোনাল ম্যানেজার</p>
                <p className="text-[11px] text-slate-600">{settings.zoneNameBn}</p>
                <p className="text-[10px] text-slate-500">{settings.orgNameBn}</p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
