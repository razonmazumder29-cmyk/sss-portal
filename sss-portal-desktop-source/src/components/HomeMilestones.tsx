import React, { useState } from 'react';
import { 
  Cake, 
  Award, 
  Mail, 
  Phone, 
  MessageCircle, 
  MapPin, 
  Building2, 
  Calendar, 
  Sparkles,
  Send,
  PartyPopper,
  Clock,
  ChevronRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Employee, MilestoneItem, SettingsConfig } from '../types';
import { translations } from '../translations';
import { filterMilestones, TimeFilter, toBengaliNumber, formatDate } from '../utils/dateCalculations';
import { SendMailModal } from './SendMailModal';

interface HomeMilestonesProps {
  employees: Employee[];
  settings: SettingsConfig;
  language: 'bn' | 'en';
  onNavigateToStaff: (pin: string) => void;
}

export const HomeMilestones: React.FC<HomeMilestonesProps> = ({
  employees,
  settings,
  language,
  onNavigateToStaff
}) => {
  const t = translations[language];
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('today');
  const [mailModalConfig, setMailModalConfig] = useState<{
    isOpen: boolean;
    items: MilestoneItem[];
    groupType: 'birthday' | 'anniversary' | 'combined';
  }>({ isOpen: false, items: [], groupType: 'birthday' });

  const { birthdays, anniversaries } = filterMilestones(employees, timeFilter);

  const fireConfetti = () => {
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.7 }
    });
  };

  const handleOpenAllBirthdays = () => {
    if (birthdays.length === 0) return;
    fireConfetti();
    setMailModalConfig({
      isOpen: true,
      items: birthdays,
      groupType: 'birthday'
    });
  };

  const handleOpenAllAnniversaries = () => {
    if (anniversaries.length === 0) return;
    fireConfetti();
    setMailModalConfig({
      isOpen: true,
      items: anniversaries,
      groupType: 'anniversary'
    });
  };

  const handleOpenAllTodayCombined = () => {
    const combined = [...birthdays, ...anniversaries];
    if (combined.length === 0) return;
    fireConfetti();
    setMailModalConfig({
      isOpen: true,
      items: combined,
      groupType: 'combined'
    });
  };

  const timeFilterTabs: { id: TimeFilter; label: string }[] = [
    { id: 'today', label: t.filterToday },
    { id: 'tomorrow', label: t.filterTomorrow },
    { id: 'next7days', label: t.filterNext7Days },
    { id: 'thisMonth', label: t.filterThisMonth }
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner & Filter Bar */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute right-0 top-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-10 -bottom-10 w-60 h-60 bg-teal-400/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                <PartyPopper className="w-3.5 h-3.5" />
                <span>{settings.zoneNameBn} ({settings.zoneNameEn})</span>
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              {language === 'bn' ? 'দৈনিক সেলিব্রেশন ও শুভেচ্ছা বার্তা পোর্টাল' : 'Daily Celebrations & Greetings Portal'}
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/80 mt-1 max-w-2xl">
              {language === 'bn'
                ? 'আজকের ও আসন্ন জন্মদিনের শুভেচ্ছা এবং সংস্থায় কর্মবর্ষপূর্তির বার্তা এক ক্লিকে আউটলুক ও জিমেইলের মাধ্যমে জোন মেইল গ্রুপে প্রেরণ করুন।'
                : 'Send milestone congratulations and warm wishes via Outlook & Gmail directly to the zone mail directory.'}
            </p>
          </div>

          {/* Time Filter Segmented Control */}
          <div className="flex items-center gap-1 bg-white/10 backdrop-blur-md p-1 rounded-xl border border-white/15">
            {timeFilterTabs.map((tab) => {
              const active = timeFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setTimeFilter(tab.id);
                    if (tab.id === 'today') fireConfetti();
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    active
                      ? 'bg-white text-emerald-900 shadow-sm'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Quick Combined Action if both or multiple exist */}
        {(birthdays.length + anniversaries.length) > 1 && (
          <div className="mt-4 pt-3.5 border-t border-white/15 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-emerald-100">
              <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
              <span>
                {language === 'bn' 
                  ? `এই ফিল্টারে মোট ${toBengaliNumber(birthdays.length + anniversaries.length)} জনের বিশেষ উদযাপন রয়েছে`
                  : `Total ${birthdays.length + anniversaries.length} colleagues celebrating in this period`}
              </span>
            </div>
            <button
              onClick={handleOpenAllTodayCombined}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-emerald-950 hover:bg-emerald-50 text-xs font-bold shadow-md transition transform active:scale-98 cursor-pointer"
            >
              <Mail className="w-4 h-4 text-emerald-700" />
              <span>{t.btnSendAllTodayMilestonesMail}</span>
              <span className="bg-emerald-100 text-emerald-900 text-[11px] px-2 py-0.5 rounded-full font-mono-num font-extrabold">
                {language === 'bn' ? toBengaliNumber(birthdays.length + anniversaries.length) : (birthdays.length + anniversaries.length)}
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Split Section: Birthdays on Left, Anniversaries on Right (Direct User Request) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* ================= LEFT SIDE: BIRTHDAYS ================= */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 flex-wrap gap-2.5">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-pink-100 dark:bg-pink-950/70 text-pink-600 dark:text-pink-400 flex items-center justify-center shadow-xs">
                <Cake className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>{t.birthdaysTitle}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-pink-100 dark:bg-pink-950/80 text-pink-700 dark:text-pink-300 font-mono-num font-semibold">
                    {language === 'bn' ? toBengaliNumber(birthdays.length) : birthdays.length}
                  </span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {t.birthdaysSubtitle}
                </p>
              </div>
            </div>

            {/* Send All Birthdays Group Button */}
            {birthdays.length > 0 && (
              <button
                type="button"
                onClick={handleOpenAllBirthdays}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-pink-600 hover:bg-pink-700 text-white text-xs font-semibold shadow-xs transition transform active:scale-98 cursor-pointer"
                title={language === 'bn' ? 'সকলের জন্য একত্রে জন্মদিনের শুভেচ্ছা মেইল তৈরি করুন' : 'Create group email for all birthdays'}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>{t.btnSendAllBirthdaysMail}</span>
                <span className="bg-pink-700/80 text-white text-[10px] px-1.5 py-0.2 rounded-full font-mono-num">
                  {language === 'bn' ? toBengaliNumber(birthdays.length) : birthdays.length}
                </span>
              </button>
            )}
          </div>

          <div className="mt-4 space-y-3.5 flex-1">
            {birthdays.length === 0 ? (
              <div className="py-12 text-center text-slate-400 dark:text-slate-500">
                <Cake className="w-10 h-10 mx-auto mb-2 stroke-1 opacity-50" />
                <p className="text-xs sm:text-sm">{t.noBirthdays}</p>
                <p className="text-xs mt-1 text-slate-400">ফিল্টার পরিবর্তন করে "আগামী ৭ দিন" অথবা "চলতি মাস" দেখতে পারেন</p>
              </div>
            ) : (
              birthdays.map((item) => {
                const emp = item.employee;
                const yearsDisplay = language === 'bn' ? `${toBengaliNumber(item.years)}${t.nthBirthday}` : `${item.years}${t.nthBirthday}`;

                return (
                  <div
                    key={item.id}
                    className="group p-4 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/40 hover:border-pink-300 dark:hover:border-pink-800 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 
                            onClick={() => onNavigateToStaff(emp.pin)}
                            className="font-bold text-slate-900 dark:text-white text-sm sm:text-base hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer"
                          >
                            {emp.name}
                          </h4>
                          <span className="text-[11px] font-mono-num px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                            {emp.pin}
                          </span>
                          {item.isToday && (
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-pink-100 dark:bg-pink-900/60 text-pink-700 dark:text-pink-300 border border-pink-300 dark:border-pink-700 animate-pulse">
                              {t.birthdayTodayBadge}
                            </span>
                          )}
                          {item.isTomorrow && (
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300">
                              {t.birthdayTomorrowBadge}
                            </span>
                          )}
                        </div>

                        {/* Designation, Branch & Area */}
                        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-slate-600 dark:text-slate-300">
                          <span className="font-semibold text-emerald-700 dark:text-emerald-400">{emp.designation}</span>
                          <span className="text-slate-300 dark:text-slate-700">·</span>
                          <span className="inline-flex items-center gap-1">
                            <Building2 className="w-3 h-3 text-slate-400" />
                            {emp.branch}
                          </span>
                          <span className="text-slate-300 dark:text-slate-700">·</span>
                          <span className="inline-flex items-center gap-1 text-slate-500">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            {emp.area}
                          </span>
                        </div>

                        {/* Milestone details: Birthday */}
                        <div className="pt-1.5 flex flex-wrap items-center gap-x-2.5 text-xs font-medium text-slate-700 dark:text-slate-300">
                          <span className="text-pink-600 dark:text-pink-400 font-semibold">
                            🎂 {yearsDisplay}
                          </span>
                          <span className="text-slate-400">·</span>
                          <span className="text-slate-500 dark:text-slate-400">
                            {language === 'bn' ? 'জন্মতারিখ:' : 'DOB:'} <strong className="font-mono text-slate-700 dark:text-slate-300">{formatDate(emp.birthDate, language)}</strong>
                          </span>
                        </div>
                      </div>

                      {/* Blood Group badge */}
                      <span className="px-2 py-1 rounded-lg bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 text-xs font-bold border border-red-200 dark:border-red-900 shrink-0">
                        {emp.bloodGroup}
                      </span>
                    </div>

                    {/* Action Buttons: WhatsApp & Call (Individual mail disabled per user preference) */}
                    <div className="mt-3.5 pt-3 border-t border-slate-200/70 dark:border-slate-700/60 flex items-center justify-between gap-2">
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        {language === 'bn' ? 'ব্যক্তিগত শুভেচ্ছা:' : 'Direct Wish:'}
                      </span>

                      <div className="flex items-center gap-1.5">
                        {/* WhatsApp Button */}
                        <a
                          href={`https://wa.me/880${emp.mobile.replace(/[^0-9]/g, '').slice(-10)}?text=${encodeURIComponent(
                            `শুভ জন্মদিন ${emp.name}! এসএসএস চট্টগ্রাম-০২ জোনের পক্ষ থেকে শুভেচ্ছা ও শুভকামনা।`
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-medium hover:bg-emerald-100 transition"
                          title="Send WhatsApp Greeting"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>{t.btnWhatsApp}</span>
                        </a>

                        {/* Call Button */}
                        <a
                          href={`tel:${emp.mobile}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                          title="Call Employee"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span className="font-mono-num">{emp.mobile}</span>
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* ================= RIGHT SIDE: ANNIVERSARIES ================= */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 flex-wrap gap-2.5">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-xs">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>{t.anniversariesTitle}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 font-mono-num font-semibold">
                    {language === 'bn' ? toBengaliNumber(anniversaries.length) : anniversaries.length}
                  </span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {t.anniversariesSubtitle}
                </p>
              </div>
            </div>

            {/* Send All Anniversaries Group Button */}
            {anniversaries.length > 0 && (
              <button
                type="button"
                onClick={handleOpenAllAnniversaries}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-xs transition transform active:scale-98 cursor-pointer"
                title={language === 'bn' ? 'সকলের জন্য একত্রে সংস্থায় বর্ষপূর্তির শুভেচ্ছা মেইল তৈরি করুন' : 'Create group email for all work anniversaries'}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>{t.btnSendAllAnniversariesMail}</span>
                <span className="bg-amber-700/80 text-white text-[10px] px-1.5 py-0.2 rounded-full font-mono-num">
                  {language === 'bn' ? toBengaliNumber(anniversaries.length) : anniversaries.length}
                </span>
              </button>
            )}
          </div>

          <div className="mt-4 space-y-3.5 flex-1">
            {anniversaries.length === 0 ? (
              <div className="py-12 text-center text-slate-400 dark:text-slate-500">
                <Award className="w-10 h-10 mx-auto mb-2 stroke-1 opacity-50" />
                <p className="text-xs sm:text-sm">{t.noAnniversaries}</p>
                <p className="text-xs mt-1 text-slate-400">ফিল্টার পরিবর্তন করে "আগামী ৭ দিন" অথবা "চলতি মাস" দেখতে পারেন</p>
              </div>
            ) : (
              anniversaries.map((item) => {
                const emp = item.employee;
                const orgYearsDisplay = language === 'bn' ? `${toBengaliNumber(item.years)} বছর পূর্ণ` : `${item.years} Years Completed`;

                return (
                  <div
                    key={item.id}
                    className="group p-4 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/40 hover:border-amber-300 dark:hover:border-amber-800 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 
                            onClick={() => onNavigateToStaff(emp.pin)}
                            className="font-bold text-slate-900 dark:text-white text-sm sm:text-base hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer"
                          >
                            {emp.name}
                          </h4>
                          <span className="text-[11px] font-mono-num px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                            {emp.pin}
                          </span>
                          {item.isToday && (
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700 animate-pulse">
                              {t.annivTodayBadge}
                            </span>
                          )}
                          {item.isTomorrow && (
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300">
                              {t.annivTomorrowBadge}
                            </span>
                          )}
                        </div>

                        {/* Designation, Branch & Area */}
                        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-slate-600 dark:text-slate-300">
                          <span className="font-semibold text-emerald-700 dark:text-emerald-400">{emp.designation}</span>
                          <span className="text-slate-300 dark:text-slate-700">·</span>
                          <span className="inline-flex items-center gap-1">
                            <Building2 className="w-3 h-3 text-slate-400" />
                            {emp.branch}
                          </span>
                          <span className="text-slate-300 dark:text-slate-700">·</span>
                          <span className="inline-flex items-center gap-1 text-slate-500">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            {emp.area}
                          </span>
                        </div>

                        {/* Milestone details: Org years only */}
                        <div className="pt-1.5 flex flex-wrap items-center gap-x-2.5 text-xs font-medium text-slate-700 dark:text-slate-300">
                          <span className="text-amber-700 dark:text-amber-400 font-semibold">
                            🏆 সংস্থায় কর্মবর্ষপূর্তি: <strong className="text-slate-900 dark:text-white font-bold">{orgYearsDisplay}</strong>
                          </span>
                          <span className="text-slate-400">·</span>
                          <span className="text-slate-500 dark:text-slate-400">
                            {language === 'bn' ? 'যোগদানের তারিখ:' : 'Joined:'} <strong className="font-mono text-slate-700 dark:text-slate-300">{formatDate(emp.orgJoiningDate, language)}</strong>
                          </span>
                        </div>
                      </div>

                      {/* Experience badge */}
                      <span className="px-2 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 text-xs font-bold border border-amber-200 dark:border-amber-900 shrink-0 font-mono-num">
                        {language === 'bn' ? toBengaliNumber(item.years) : item.years} Yrs
                      </span>
                    </div>

                    {/* Action Buttons: WhatsApp & Call (Individual mail disabled per user preference) */}
                    <div className="mt-3.5 pt-3 border-t border-slate-200/70 dark:border-slate-700/60 flex items-center justify-between gap-2">
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        {language === 'bn' ? 'ব্যক্তিগত শুভেচ্ছা:' : 'Direct Wish:'}
                      </span>

                      <div className="flex items-center gap-1.5">
                        {/* WhatsApp Button */}
                        <a
                          href={`https://wa.me/880${emp.mobile.replace(/[^0-9]/g, '').slice(-10)}?text=${encodeURIComponent(
                            `সংস্থায় সফল ${item.years} বছর পূর্তিতে আন্তরিক শুভেচ্ছা ও শুভকামনা, ${emp.name}!`
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-medium hover:bg-emerald-100 transition"
                          title="Send WhatsApp Congratulations"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>{t.btnWhatsApp}</span>
                        </a>

                        {/* Call Button */}
                        <a
                          href={`tel:${emp.mobile}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                          title="Call Employee"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span className="font-mono-num">{emp.mobile}</span>
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

      </div>

      {/* Send Mail Popup Modal (Group Mail Delivery) */}
      {mailModalConfig.isOpen && (
        <SendMailModal
          items={mailModalConfig.items}
          groupType={mailModalConfig.groupType}
          settings={settings}
          language={language}
          onClose={() => setMailModalConfig({ isOpen: false, items: [], groupType: 'birthday' })}
        />
      )}
    </div>
  );
};
