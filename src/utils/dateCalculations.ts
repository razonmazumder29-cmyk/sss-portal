import { Employee, MilestoneItem } from '../types';

export const BENGALI_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

export function toBengaliNumber(val: number | string): string {
  const str = String(val ?? '');
  return str.replace(/[0-9]/g, (digit) => BENGALI_DIGITS[parseInt(digit, 10)] || digit);
}

export function toEnglishNumber(val: number | string): string {
  const str = String(val ?? '');
  const bnToEn: Record<string, string> = {
    '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
    '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9'
  };
  return str.replace(/[০-৯]/g, (ch) => bnToEn[ch] || ch);
}

/**
 * Standard date formatting with DAY first, then MONTH, then YEAR (দিন/মাস/বছর) everywhere.
 * Example: 29/09/2026 or ২৯ সেপ্টেম্বর ২০২৬
 */
export function formatDate(dateStr: string, locale: 'bn' | 'en' = 'bn'): string {
  if (!dateStr) return '';
  let day = 0;
  let monthIndex = 0;
  let year = 0;

  if (dateStr.includes('-')) {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        // YYYY-MM-DD
        year = parseInt(parts[0], 10);
        monthIndex = parseInt(parts[1], 10) - 1;
        day = parseInt(parts[2], 10);
      } else {
        // DD-MM-YYYY
        day = parseInt(parts[0], 10);
        monthIndex = parseInt(parts[1], 10) - 1;
        year = parseInt(parts[2], 10);
      }
    }
  } else if (dateStr.includes('/')) {
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        // YYYY/MM/DD
        year = parseInt(parts[0], 10);
        monthIndex = parseInt(parts[1], 10) - 1;
        day = parseInt(parts[2], 10);
      } else {
        // DD/MM/YYYY
        day = parseInt(parts[0], 10);
        monthIndex = parseInt(parts[1], 10) - 1;
        year = parseInt(parts[2], 10);
      }
    }
  }

  if (!day || isNaN(day) || !year || isNaN(year) || monthIndex < 0 || monthIndex > 11) {
    return dateStr;
  }

  const monthNamesBn = [
    'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
    'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
  ];
  const monthNamesEn = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  const dayFormatted = String(day).padStart(2, '0');

  if (locale === 'bn') {
    return `${toBengaliNumber(dayFormatted)} ${monthNamesBn[monthIndex]} ${toBengaliNumber(year)}`;
  }
  return `${dayFormatted} ${monthNamesEn[monthIndex]} ${year}`;
}

/**
 * Numeric date format: DD/MM/YYYY (দিন/মাস/বছর)
 */
export function formatDateDDMMYYYY(dateStr: string, locale: 'bn' | 'en' = 'bn'): string {
  if (!dateStr) return '';
  let day = 0;
  let month = 0;
  let year = 0;

  if (dateStr.includes('-')) {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        year = parseInt(parts[0], 10);
        month = parseInt(parts[1], 10);
        day = parseInt(parts[2], 10);
      } else {
        day = parseInt(parts[0], 10);
        month = parseInt(parts[1], 10);
        year = parseInt(parts[2], 10);
      }
    }
  } else if (dateStr.includes('/')) {
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        year = parseInt(parts[0], 10);
        month = parseInt(parts[1], 10);
        day = parseInt(parts[2], 10);
      } else {
        day = parseInt(parts[0], 10);
        month = parseInt(parts[1], 10);
        year = parseInt(parts[2], 10);
      }
    }
  }

  if (!day || isNaN(day) || !year || isNaN(year) || !month || isNaN(month)) {
    return dateStr;
  }

  const dStr = String(day).padStart(2, '0');
  const mStr = String(month).padStart(2, '0');
  const formatted = `${dStr}/${mStr}/${year}`;
  return locale === 'bn' ? toBengaliNumber(formatted) : formatted;
}

export function normalizeDateToISO(dateStr: string): string {
  if (!dateStr) return '';
  const clean = toEnglishNumber(dateStr.trim());
  if (clean.includes('/')) {
    const parts = clean.split('/');
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
      } else {
        // DD/MM/YYYY -> YYYY-MM-DD
        return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
      }
    }
  } else if (clean.includes('-')) {
    const parts = clean.split('-');
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
      } else {
        return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
      }
    }
  }
  return clean;
}

export function calculateAge(birthDateStr: string, refDate: Date = new Date()): number {
  if (!birthDateStr) return 0;
  const iso = normalizeDateToISO(birthDateStr);
  const birth = new Date(iso);
  if (isNaN(birth.getTime())) return 0;
  let age = refDate.getFullYear() - birth.getFullYear();
  const m = refDate.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && refDate.getDate() < birth.getDate())) {
    age--;
  }
  return Math.max(0, age);
}

export function calculateTenure(joiningDateStr: string, refDate: Date = new Date()): {
  years: number;
  months: number;
  days: number;
  totalDays: number;
  displayTextBn: string;
  displayTextEn: string;
} {
  if (!joiningDateStr) {
    return { years: 0, months: 0, days: 0, totalDays: 0, displayTextBn: '০ দিন', displayTextEn: '0 days' };
  }
  const iso = normalizeDateToISO(joiningDateStr);
  const joinDate = new Date(iso);
  if (isNaN(joinDate.getTime())) {
    return { years: 0, months: 0, days: 0, totalDays: 0, displayTextBn: '০ দিন', displayTextEn: '0 days' };
  }

  const totalDays = Math.max(0, Math.floor((refDate.getTime() - joinDate.getTime()) / (1000 * 60 * 60 * 24)));

  let years = refDate.getFullYear() - joinDate.getFullYear();
  let months = refDate.getMonth() - joinDate.getMonth();
  let days = refDate.getDate() - joinDate.getDate();

  if (days < 0) {
    months--;
    const prevMonthLastDay = new Date(refDate.getFullYear(), refDate.getMonth(), 0).getDate();
    days += prevMonthLastDay;
  }
  if (months < 0) {
    years--;
    months += 12;
  }

  years = Math.max(0, years);
  months = Math.max(0, months);
  days = Math.max(0, days);

  const partsBn: string[] = [];
  const partsEn: string[] = [];

  if (years > 0) {
    partsBn.push(`${toBengaliNumber(years)} বছর`);
    partsEn.push(`${years} ${years === 1 ? 'yr' : 'yrs'}`);
  }
  if (months > 0) {
    partsBn.push(`${toBengaliNumber(months)} মাস`);
    partsEn.push(`${months} ${months === 1 ? 'mo' : 'mos'}`);
  }
  if (days > 0 || (years === 0 && months === 0)) {
    partsBn.push(`${toBengaliNumber(days)} দিন`);
    partsEn.push(`${days} ${days === 1 ? 'day' : 'days'}`);
  }

  return {
    years,
    months,
    days,
    totalDays,
    displayTextBn: partsBn.join(' '),
    displayTextEn: partsEn.join(' ')
  };
}

/**
 * Organizational 3-Year Branch Tenure Rule:
 * Returns true if an employee has served in their current branch for 3 years or more.
 */
export function isDueForTransfer(branchJoiningDateStr: string, refDate: Date = new Date()): boolean {
  if (!branchJoiningDateStr) return false;
  const tenure = calculateTenure(branchJoiningDateStr, refDate);
  return tenure.years >= 3;
}

export function getUpcomingMilestoneInfo(
  dateStr: string,
  refDate: Date = new Date()
): {
  isToday: boolean;
  isTomorrow: boolean;
  daysUntil: number;
  occurrenceDate: string; // YYYY-MM-DD
  completedYears: number;
} | null {
  if (!dateStr) return null;
  const iso = normalizeDateToISO(dateStr);
  const parts = iso.split('-');
  if (parts.length !== 3) return null;

  const origYear = parseInt(parts[0], 10);
  const targetMonth = parseInt(parts[1], 10) - 1;
  const targetDay = parseInt(parts[2], 10);

  const currentYear = refDate.getFullYear();
  const candidate = new Date(currentYear, targetMonth, targetDay);
  const todayNormalized = new Date(refDate.getFullYear(), refDate.getMonth(), refDate.getDate());

  const diffTime = candidate.getTime() - todayNormalized.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  const isToday = diffDays === 0;
  const isTomorrow = diffDays === 1;
  const completedYears = currentYear - origYear;

  const occurrenceMonthStr = String(targetMonth + 1).padStart(2, '0');
  const occurrenceDayStr = String(targetDay).padStart(2, '0');
  const occurrenceDate = `${currentYear}-${occurrenceMonthStr}-${occurrenceDayStr}`;

  return {
    isToday,
    isTomorrow,
    daysUntil: diffDays,
    occurrenceDate,
    completedYears
  };
}

export type TimeFilter = 'today' | 'tomorrow' | 'next7days' | 'thisMonth' | 'allUpcoming';

export function filterMilestones(
  employees: Employee[],
  filter: TimeFilter,
  refDate: Date = new Date()
): {
  birthdays: MilestoneItem[];
  anniversaries: MilestoneItem[];
} {
  const birthdays: MilestoneItem[] = [];
  const anniversaries: MilestoneItem[] = [];
  const currentMonth = refDate.getMonth();

  employees.forEach((emp) => {
    if (emp.status === 'Retired') return;

    if (emp.birthDate) {
      const bInfo = getUpcomingMilestoneInfo(emp.birthDate, refDate);
      if (bInfo) {
        let matches = false;
        if (filter === 'today' && bInfo.isToday) matches = true;
        else if (filter === 'tomorrow' && bInfo.isTomorrow) matches = true;
        else if (filter === 'next7days' && bInfo.daysUntil >= 0 && bInfo.daysUntil <= 7) matches = true;
        else if (filter === 'thisMonth') {
          const iso = normalizeDateToISO(emp.birthDate);
          const bMonth = parseInt(iso.split('-')[1], 10) - 1;
          if (bMonth === currentMonth) matches = true;
        } else if (filter === 'allUpcoming' && bInfo.daysUntil >= 0 && bInfo.daysUntil <= 30) {
          matches = true;
        }

        if (matches) {
          birthdays.push({
            id: `bday-${emp.id}`,
            type: 'birthday',
            employee: emp,
            years: Math.max(1, bInfo.completedYears),
            branchYears: calculateTenure(emp.branchJoiningDate, refDate).years,
            date: bInfo.occurrenceDate,
            isToday: bInfo.isToday,
            isTomorrow: bInfo.isTomorrow,
            daysUntil: bInfo.daysUntil
          });
        }
      }
    }

    if (emp.orgJoiningDate) {
      const aInfo = getUpcomingMilestoneInfo(emp.orgJoiningDate, refDate);
      if (aInfo && aInfo.completedYears >= 1) {
        let matches = false;
        if (filter === 'today' && aInfo.isToday) matches = true;
        else if (filter === 'tomorrow' && aInfo.isTomorrow) matches = true;
        else if (filter === 'next7days' && aInfo.daysUntil >= 0 && aInfo.daysUntil <= 7) matches = true;
        else if (filter === 'thisMonth') {
          const iso = normalizeDateToISO(emp.orgJoiningDate);
          const aMonth = parseInt(iso.split('-')[1], 10) - 1;
          if (aMonth === currentMonth) matches = true;
        } else if (filter === 'allUpcoming' && aInfo.daysUntil >= 0 && aInfo.daysUntil <= 30) {
          matches = true;
        }

        if (matches) {
          anniversaries.push({
            id: `anniv-${emp.id}`,
            type: 'anniversary',
            employee: emp,
            years: aInfo.completedYears,
            branchYears: calculateTenure(emp.branchJoiningDate, refDate).years,
            date: aInfo.occurrenceDate,
            isToday: aInfo.isToday,
            isTomorrow: aInfo.isTomorrow,
            daysUntil: aInfo.daysUntil
          });
        }
      }
    }
  });

  birthdays.sort((a, b) => a.daysUntil - b.daysUntil);
  anniversaries.sort((a, b) => a.daysUntil - b.daysUntil);

  return { birthdays, anniversaries };
}
