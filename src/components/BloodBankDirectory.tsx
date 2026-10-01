import React, { useState } from 'react';
import { 
  Droplet, 
  Phone, 
  MessageCircle, 
  Search, 
  MapPin, 
  Building2, 
  Heart,
  LayoutGrid,
  ListFilter
} from 'lucide-react';
import { Employee, BloodGroup } from '../types';
import { translations } from '../translations';
import { toBengaliNumber } from '../utils/dateCalculations';
import { SssLogo } from './SssLogo';

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
  const [viewMode, setViewMode] = useState<'cards' | 'compact'>('cards');

  const filtered = employees.filter((emp) => {
    const matchesGroup = selectedGroup === 'all' || emp.bloodGroup === selectedGroup;
    const matchesArea = !searchArea || (
      emp.branch.toLowerCase().includes(searchArea.toLowerCase()) ||
      emp.area.toLowerCase().includes(searchArea.toLowerCase()) ||
      emp.name.toLowerCase().includes(searchArea.toLowerCase()) ||
      emp.pin.includes(searchArea)
    );
    return matchesGroup && matchesArea;
  });

  const counts = ALL_BLOOD_GROUPS.reduce((acc, bg) => {
    acc[bg] = employees.filter(e => e.bloodGroup === bg).length;
    return acc;
  }, {} as Record<BloodGroup, number>);

  return (
    <div className="space-y-6">
      {/* Refined Executive Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <SssLogo size="lg" variant="rounded" className="border-red-500/20 shadow-xs shrink-0" />
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-rose-700 dark:text-rose-400 mb-1">
                <Heart className="w-3.5 h-3.5 fill-current" />
                <span>{language === 'bn' ? 'জরুরি রক্তদান নেটওয়ার্ক' : 'Emergency Blood Bank Directory'}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {t.bloodBankTitle}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
                {t.bloodBankSubtitle}
              </p>
            </div>
          </div>

          <div className="p-4 bg-rose-50 dark:bg-rose-950/40 rounded-2xl border border-rose-200 dark:border-rose-900/60 text-xs flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-900 text-rose-600 dark:text-rose-300 flex items-center justify-center font-bold">
              <Droplet className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="font-extrabold text-sm text-slate-900 dark:text-white">
                {language === 'bn' ? toBengaliNumber(employees.length) : employees.length} জন
              </div>
              <div className="text-rose-700 dark:text-rose-300 text-[11px]">
                নিবন্ধিত কর্মী রক্তদাতা
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Blood Group Filter & Search Controls */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            রক্তের গ্রুপ অনুযায়ী বাছাই করুন:
          </label>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400">
              পাওয়া গেছে: <strong className="text-slate-900 dark:text-white font-mono">{language === 'bn' ? toBengaliNumber(filtered.length) : filtered.length} জন</strong>
            </span>
            {/* View Mode */}
            <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700">
              <button
                onClick={() => setViewMode('cards')}
                className={`p-1.5 rounded-lg text-xs transition cursor-pointer ${
                  viewMode === 'cards' 
                    ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-300 shadow-xs' 
                    : 'text-slate-500'
                }`}
                title="Card View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('compact')}
                className={`p-1.5 rounded-lg text-xs transition cursor-pointer ${
                  viewMode === 'compact' 
                    ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-300 shadow-xs' 
                    : 'text-slate-500'
                }`}
                title="Compact View"
              >
                <ListFilter className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Group Filter Buttons */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedGroup('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              selectedGroup === 'all'
                ? 'bg-rose-600 text-white shadow-xs font-bold'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
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
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  active
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-rose-50/70 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 border border-rose-200/80 dark:border-rose-900/60'
                }`}
              >
                <span>{bg}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  active ? 'bg-white/30 text-white' : 'bg-rose-200/80 dark:bg-rose-900 text-rose-900 dark:text-rose-200'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchArea}
            onChange={(e) => setSearchArea(e.target.value)}
            placeholder="শাখা, এরিয়া, নাম বা মোবাইল নম্বর দিয়ে খুঁজুন..."
            className="w-full pl-10 pr-8 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-rose-500"
          />
          {searchArea && (
            <button
              onClick={() => setSearchArea('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Donor List */}
      {filtered.length === 0 ? (
        <div className="py-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 text-slate-400">
          <Droplet className="w-10 h-10 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
          <p className="text-sm font-medium">এই গ্রুপের কোনো রক্তদাতা সহকর্মী পাওয়া যায়নি</p>
        </div>
      ) : viewMode === 'cards' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((emp) => {
            const emergencyText = `শ্রদ্ধেয় সহকর্মী ${emp.name}, জরুরি প্রয়োজনে আপনার রক্তের গ্রুপ (${emp.bloodGroup}) আবশ্যক। আপনি কি রক্তদানে সহায়তা করতে পারবেন? - এসএসএস চট্টগ্রাম-০২ জোন।`;
            const waUrl = `https://wa.me/880${emp.mobile.replace(/[^0-9]/g, '').slice(-10)}?text=${encodeURIComponent(emergencyText)}`;

            return (
              <div
                key={emp.id}
                className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-rose-300 dark:hover:border-rose-800 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                        {emp.name}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {emp.designation} • <span className="font-mono text-slate-400">{emp.pin}</span>
                      </p>
                    </div>
                    <span className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-extrabold text-sm flex items-center justify-center border border-rose-200 dark:border-rose-800 shrink-0">
                      {emp.bloodGroup}
                    </span>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1 text-xs text-slate-600 dark:text-slate-300">
                    <div className="flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{emp.branch}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{emp.area}</span>
                    </div>
                  </div>
                </div>

                {/* Direct Contact Buttons */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                  <a
                    href={`tel:${emp.mobile}`}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs transition"
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
                    <span>WhatsApp</span>
                  </a>
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
                  <th className="py-2.5 px-3">রক্তের গ্রুপ</th>
                  <th className="py-2.5 px-3">পিন নং</th>
                  <th className="py-2.5 px-3">পদবি</th>
                  <th className="py-2.5 px-3">বর্তমান কর্মস্থল</th>
                  <th className="py-2.5 px-3">মোবাইল</th>
                  <th className="py-2.5 px-4 text-right">যোগাযোগ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map((emp) => {
                  const emergencyText = `শ্রদ্ধেয় সহকর্মী ${emp.name}, জরুরি প্রয়োজনে আপনার রক্তের গ্রুপ (${emp.bloodGroup}) আবশ্যক। আপনি কি রক্তদানে সহায়তা করতে পারবেন? - এসএসএস চট্টগ্রাম-০২ জোন।`;
                  const waUrl = `https://wa.me/880${emp.mobile.replace(/[^0-9]/g, '').slice(-10)}?text=${encodeURIComponent(emergencyText)}`;

                  return (
                    <tr key={emp.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{emp.name}</td>
                      <td className="py-3 px-3">
                        <span className="font-extrabold text-xs text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950 px-2 py-0.5 rounded-lg border border-rose-200 dark:border-rose-900">
                          {emp.bloodGroup}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-500">{emp.pin}</td>
                      <td className="py-3 px-3 font-semibold text-slate-700 dark:text-slate-300">{emp.designation}</td>
                      <td className="py-3 px-3 text-slate-500">{emp.branch} • {emp.area}</td>
                      <td className="py-3 px-3 font-mono font-semibold text-slate-800 dark:text-slate-200">{emp.mobile}</td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <a
                            href={`tel:${emp.mobile}`}
                            className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60"
                            title="কল দিন"
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </a>
                          <a
                            href={waUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/60"
                            title="WhatsApp"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
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
  );
};
