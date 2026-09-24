import React, { useState } from 'react';
import { 
  Droplet, 
  Phone, 
  MessageCircle, 
  Search, 
  MapPin, 
  Building2, 
  Heart,
  Share2,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { Employee, BloodGroup } from '../types';
import { translations } from '../translations';
import { toBengaliNumber } from '../utils/dateCalculations';

interface BloodBankDirectoryProps {
  employees: Employee[];
  language: 'bn' | 'en';
}

const ALL_BLOOD_GROUPS: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

export const BloodBankDirectory: React.FC<BloodBankDirectoryProps> = ({
  employees,
  language
}) => {
  const t = translations[language];
  const [selectedGroup, setSelectedGroup] = useState<BloodGroup | 'all'>('all');
  const [searchArea, setSearchArea] = useState<string>('');

  const filtered = employees.filter((emp) => {
    const matchesGroup = selectedGroup === 'all' || emp.bloodGroup === selectedGroup;
    const matchesArea = !searchArea || (
      emp.branch.toLowerCase().includes(searchArea.toLowerCase()) ||
      emp.area.toLowerCase().includes(searchArea.toLowerCase()) ||
      emp.name.toLowerCase().includes(searchArea.toLowerCase())
    );
    return matchesGroup && matchesArea;
  });

  // Calculate count per blood group
  const counts = ALL_BLOOD_GROUPS.reduce((acc, bg) => {
    acc[bg] = employees.filter(e => e.bloodGroup === bg).length;
    return acc;
  }, {} as Record<BloodGroup, number>);

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-red-700 via-rose-700 to-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-500/20 text-red-200 border border-red-400/30">
                <Heart className="w-3.5 h-3.5 fill-current text-red-400" />
                <span>{language === 'bn' ? 'জীবন রক্ষাকারী ডিরেক্টরি' : 'Emergency Lifeline'}</span>
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              {t.bloodBankTitle}
            </h2>
            <p className="text-xs sm:text-sm text-red-100/80 mt-1 max-w-2xl">
              {t.bloodBankSubtitle}
            </p>
          </div>

          <div className="p-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 text-xs flex items-center gap-3">
            <Droplet className="w-8 h-8 text-red-300 shrink-0 fill-current" />
            <div>
              <div className="font-bold text-sm">
                {language === 'bn' ? 'মোট নিবন্ধিত কর্মী' : 'Registered Donors'}: {language === 'bn' ? toBengaliNumber(employees.length) : employees.length}
              </div>
              <div className="text-red-200 text-[11px]">এসএসএস চট্টগ্রাম-০২ জোন</div>
            </div>
          </div>
        </div>
      </div>

      {/* Blood Group Selector Chips */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            রক্তের গ্রুপ অনুযায়ী বাছাই করুন (Select Blood Group):
          </label>
          <span className="text-xs text-slate-400">
            ফলাফল: <strong className="text-slate-700 dark:text-slate-200">{filtered.length} জন কর্মী</strong>
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedGroup('all')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition ${
              selectedGroup === 'all'
                ? 'bg-red-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            সকল গ্রুপ ({employees.length})
          </button>
          {ALL_BLOOD_GROUPS.map((bg) => {
            const count = counts[bg] || 0;
            const active = selectedGroup === bg;
            return (
              <button
                key={bg}
                onClick={() => setSelectedGroup(bg)}
                className={`px-3 py-2 rounded-xl text-xs font-extrabold transition flex items-center gap-1.5 ${
                  active
                    ? 'bg-red-600 text-white shadow-sm ring-2 ring-red-400'
                    : 'bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 hover:bg-red-100 border border-red-200 dark:border-red-900'
                }`}
              >
                <span>{bg}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${active ? 'bg-white/30 text-white' : 'bg-red-200 dark:bg-red-900 text-red-800 dark:text-red-200'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Branch / Area Filter Input */}
        <div className="pt-2 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchArea}
              onChange={(e) => setSearchArea(e.target.value)}
              placeholder="শাখা বা এরিয়া বা কর্মীর নাম দিয়ে খুঁজুন..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-red-500"
            />
          </div>
          {searchArea && (
            <button
              onClick={() => setSearchArea('')}
              className="text-xs text-red-600 font-medium px-2 py-1"
            >
              মুছে দিন
            </button>
          )}
        </div>
      </div>

      {/* Donor List Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-400">
            <Droplet className="w-10 h-10 mx-auto mb-2 text-slate-300" />
            <p className="text-sm">এই গ্রুপে কোনো কর্মী পাওয়া যায়নি</p>
          </div>
        ) : (
          filtered.map((emp) => {
            const emergencyText = `জরুরি রক্তের প্রয়োজনে যোগাযোগ: জনাব/জনাবা ${emp.name}, এসএসএস চট্টগ্রাম-০২ জোন থেকে আপনার সাথে যোগাযোগ করা হচ্ছে।`;
            const waUrl = `https://wa.me/880${emp.mobile.replace(/[^0-9]/g, '').slice(-10)}?text=${encodeURIComponent(emergencyText)}`;

            return (
              <div
                key={emp.id}
                className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-red-300 dark:hover:border-red-900 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                        {emp.name}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {emp.designation} · <span className="font-mono">{emp.pin}</span>
                      </p>
                    </div>
                    <span className="w-11 h-11 rounded-xl bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 font-extrabold text-sm flex items-center justify-center border-2 border-red-300 dark:border-red-800 shadow-xs shrink-0">
                      {emp.bloodGroup}
                    </span>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                    <div className="flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{emp.branch}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{emp.area}</span>
                    </div>
                  </div>
                </div>

                {/* Direct Emergency Contact Buttons */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                  <a
                    href={`tel:${emp.mobile}`}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-xs transition"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>কল দিন</span>
                  </a>
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>হোয়াটসঅ্যাপ</span>
                  </a>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
