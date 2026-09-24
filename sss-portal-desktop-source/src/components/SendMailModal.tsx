import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  Mail, 
  ExternalLink, 
  Copy, 
  Check, 
  Send, 
  AtSign,
  Users,
  User,
  RotateCcw,
  Cake,
  Award,
  CheckSquare,
  Square
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { MilestoneItem, SettingsConfig } from '../types';
import { translations } from '../translations';
import { 
  prepareEmailData, 
  prepareGroupEmailData, 
  GroupGreetingType 
} from '../utils/mailHelper';
import { toBengaliNumber } from '../utils/dateCalculations';

interface SendMailModalProps {
  item?: MilestoneItem | null;
  items?: MilestoneItem[];
  groupType?: GroupGreetingType;
  settings: SettingsConfig;
  language: 'bn' | 'en';
  onClose: () => void;
}

export const SendMailModal: React.FC<SendMailModalProps> = ({
  item,
  items,
  groupType,
  settings,
  language,
  onClose
}) => {
  const t = translations[language];

  // Consolidate target items: either passed array or single item
  const allAvailableItems = useMemo<MilestoneItem[]>(() => {
    if (items && items.length > 0) {
      return items;
    }
    if (item) {
      return [item];
    }
    return [];
  }, [items, item]);

  const isGroup = allAvailableItems.length > 1 || Boolean(groupType && allAvailableItems.length > 0);

  // Selected item IDs for group selection
  const [selectedIds, setSelectedIds] = useState<string[]>(() => 
    allAvailableItems.map(it => it.id)
  );

  // Synchronize selected IDs if items prop changes
  useEffect(() => {
    setSelectedIds(allAvailableItems.map(it => it.id));
  }, [allAvailableItems]);

  const activeItems = useMemo<MilestoneItem[]>(() => {
    return allAvailableItems.filter(it => selectedIds.includes(it.id));
  }, [allAvailableItems, selectedIds]);

  // Determine effective group type
  const effectiveGroupType = useMemo<GroupGreetingType>(() => {
    if (groupType) return groupType;
    const hasBirthdays = activeItems.some(i => i.type === 'birthday');
    const hasAnniversaries = activeItems.some(i => i.type === 'anniversary');
    if (hasBirthdays && hasAnniversaries) return 'combined';
    if (hasAnniversaries) return 'anniversary';
    return 'birthday';
  }, [groupType, activeItems]);

  // Compute email content based on active items
  const generatedData = useMemo(() => {
    if (activeItems.length === 0) {
      return {
        subject: '',
        body: '',
        recipients: [...settings.zoneEmailList]
      };
    }
    const data = prepareGroupEmailData(activeItems, effectiveGroupType, settings, language);
    return {
      subject: data.subject,
      body: data.body,
      recipients: data.recipients
    };
  }, [activeItems, effectiveGroupType, settings, language]);

  const [subject, setSubject] = useState(generatedData.subject);
  const [body, setBody] = useState(generatedData.body);
  const [copied, setCopied] = useState(false);

  // Update subject and body whenever active items change
  useEffect(() => {
    setSubject(generatedData.subject);
    setBody(generatedData.body);
  }, [generatedData]);

  if (allAvailableItems.length === 0) return null;

  const triggerCelebration = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const handleCopy = () => {
    if (!subject && !body) return;
    navigator.clipboard.writeText(`বিষয়: ${subject}\n\n${body}`);
    setCopied(true);
    triggerCelebration();
    setTimeout(() => setCopied(false), 2500);
  };

  const handleResetContent = () => {
    setSubject(generatedData.subject);
    setBody(generatedData.body);
  };

  const handleToggleItem = (id: string) => {
    setSelectedIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(x => x !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleToggleAll = () => {
    if (selectedIds.length === allAvailableItems.length) {
      // If all selected, keep at least first one or clear
      setSelectedIds([]);
    } else {
      setSelectedIds(allAvailableItems.map(it => it.id));
    }
  };

  const recipientList = generatedData.recipients;
  const toQuery = encodeURIComponent(recipientList.join(', '));
  const subQuery = encodeURIComponent(subject);
  const bodyQuery = encodeURIComponent(body);

  const activeGmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${toQuery}&su=${subQuery}&body=${bodyQuery}`;
  const activeOutlookOfficeUrl = `https://outlook.office.com/mail/deeplink/compose?to=${toQuery}&subject=${subQuery}&body=${bodyQuery}`;
  const activeOutlookLiveUrl = `https://outlook.live.com/mail/0/deeplink/compose?to=${toQuery}&subject=${subQuery}&body=${bodyQuery}`;
  const activeMailtoUrl = `mailto:${toQuery}?subject=${subQuery}&body=${bodyQuery}`;

  const openLink = (url: string) => {
    if (activeItems.length === 0) return;
    triggerCelebration();
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const allSelected = selectedIds.length === allAvailableItems.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div 
        className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>{t.sendMailGroupModalTitle}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-semibold font-mono-num">
                  {language === 'bn' ? toBengaliNumber(activeItems.length) : activeItems.length} জন
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {effectiveGroupType === 'birthday' 
                  ? (language === 'bn' ? 'সকল জন্মদিনের সহকর্মীকে একত্রে মেইল' : 'All birthday colleagues in one email') 
                  : effectiveGroupType === 'anniversary'
                    ? (language === 'bn' ? 'সকল কর্মবর্ষপূর্তির সহকর্মীকে একত্রে মেইল' : 'All work anniversary colleagues in one email')
                    : (language === 'bn' ? 'জন্মদিন ও কর্মবর্ষপূর্তির সকল সহকর্মীকে একত্রে মেইল' : 'Combined celebration email for all colleagues')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs sm:text-sm">
          
          {/* Interactive Recipient Selection Bar */}
          {allAvailableItems.length >= 1 && (
            <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl p-3.5 space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-indigo-500" />
                  <span>{t.includedEmployeesLabel}</span>
                  <span className="text-[11px] font-mono-num font-semibold text-slate-500">
                    ({language === 'bn' ? toBengaliNumber(activeItems.length) : activeItems.length} / {language === 'bn' ? toBengaliNumber(allAvailableItems.length) : allAvailableItems.length})
                  </span>
                </span>
                
                {allAvailableItems.length > 1 && (
                  <button
                    type="button"
                    onClick={handleToggleAll}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                  >
                    {allSelected ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
                    <span>{allSelected ? (language === 'bn' ? 'সব বাতিল' : 'Deselect All') : t.toggleAll}</span>
                  </button>
                )}
              </div>

              {/* Employee Badges */}
              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
                {allAvailableItems.map((item) => {
                  const isSelected = selectedIds.includes(item.id);
                  const isBday = item.type === 'birthday';
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleToggleItem(item.id)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all text-left ${
                        isSelected
                          ? isBday
                            ? 'bg-pink-50 dark:bg-pink-950/60 border-pink-300 dark:border-pink-800 text-pink-900 dark:text-pink-200 font-semibold shadow-2xs'
                            : 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 font-semibold shadow-2xs'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 line-through opacity-70'
                      }`}
                    >
                      <span className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[10px] ${
                        isSelected ? (isBday ? 'text-pink-600' : 'text-amber-600') : 'text-slate-400'
                      }`}>
                        {isSelected ? '✓' : '○'}
                      </span>
                      <span>{item.employee.name}</span>
                      <span className="text-[10px] opacity-80">({item.employee.branch})</span>
                      {isBday ? (
                        <Cake className="w-3 h-3 text-pink-500 shrink-0" />
                      ) : (
                        <Award className="w-3 h-3 text-amber-500 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {activeItems.length === 0 && (
                <p className="text-xs text-rose-500 dark:text-rose-400 font-semibold">
                  ⚠️ {t.noRecipientsSelected}
                </p>
              )}
            </div>
          )}

          {/* Recipient list info */}
          <div className="bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1.5 text-xs font-semibold text-emerald-900 dark:text-emerald-300">
              <AtSign className="w-3.5 h-3.5" />
              <span>{t.sendMailRecipientHelp}</span>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-1 max-h-24 overflow-y-auto">
              {recipientList.map((email, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-emerald-200 dark:border-slate-700 text-[11px] font-mono-num text-slate-700 dark:text-slate-200"
                >
                  {email}
                </span>
              ))}
            </div>
          </div>

          {/* Subject field */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                {t.previewEmailSubject}
              </label>
              <button
                type="button"
                onClick={handleResetContent}
                className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition"
                title="টেম্পলেটের আসল টেক্সট ফিরিয়ে আনুন"
              >
                <RotateCcw className="w-3 h-3" />
                <span>{language === 'bn' ? 'রিসেট' : 'Reset'}</span>
              </button>
            </div>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              disabled={activeItems.length === 0}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden disabled:opacity-50"
            />
          </div>

          {/* Body field */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                {t.previewEmailBody}
              </label>
              <button
                type="button"
                onClick={handleCopy}
                disabled={activeItems.length === 0}
                className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-medium disabled:opacity-50"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? t.copiedText : t.copyText}</span>
              </button>
            </div>
            <textarea
              rows={9}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              disabled={activeItems.length === 0}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm font-sans leading-relaxed focus:ring-2 focus:ring-emerald-500 focus:outline-hidden resize-none disabled:opacity-50"
            />
          </div>

          {/* Direct Launch Buttons */}
          <div className="pt-2">
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">
              সরাসরি সেন্ড করার মাধ্যম নির্বাচন করুন (Choose Dispatch Method):
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Gmail Web */}
              <button
                type="button"
                onClick={() => openLink(activeGmailUrl)}
                disabled={activeItems.length === 0}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-xs sm:text-sm shadow-xs transition transform active:scale-98 disabled:opacity-50 cursor-pointer"
              >
                <Mail className="w-4 h-4" />
                <span>{t.sendViaGmail}</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-80" />
              </button>

              {/* Outlook Web (Office 365) */}
              <button
                type="button"
                onClick={() => openLink(activeOutlookOfficeUrl)}
                disabled={activeItems.length === 0}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm shadow-xs transition transform active:scale-98 disabled:opacity-50 cursor-pointer"
              >
                <Mail className="w-4 h-4" />
                <span>{t.sendViaOutlook}</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-80" />
              </button>

              {/* Outlook Live Web */}
              <button
                type="button"
                onClick={() => openLink(activeOutlookLiveUrl)}
                disabled={activeItems.length === 0}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs sm:text-sm shadow-xs transition transform active:scale-98 disabled:opacity-50 cursor-pointer"
              >
                <Mail className="w-4 h-4" />
                <span>{t.sendViaOutlookLive}</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-80" />
              </button>

              {/* Default Mail App (mailto) */}
              <button
                type="button"
                onClick={() => {
                  if (activeItems.length === 0) return;
                  triggerCelebration();
                  window.location.href = activeMailtoUrl;
                }}
                disabled={activeItems.length === 0}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 text-white font-semibold text-xs sm:text-sm shadow-xs transition transform active:scale-98 disabled:opacity-50 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>{t.sendViaMailto}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-between items-center">
          <button
            type="button"
            onClick={handleCopy}
            disabled={activeItems.length === 0}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer disabled:opacity-50"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? t.copiedText : t.copyText}</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold hover:bg-slate-300 transition cursor-pointer"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
};
