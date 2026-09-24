import { Employee, MilestoneItem } from '../types';

export const BENGALI_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

export function toBengaliNumber(val: number | string): string {
  const str = String(val);
  return str.replace(/[0-9]/g, (digit) => BENGALI_DIGITS[parseInt(digit, 10)] || digit);
}

export function formatDate(dateStr: string, locale: 'bn' | 'en' = 'bn'): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;

  const year = parseInt(parts[0], 10);
  const monthIndex = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);

  const monthNamesBn = [
    'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
    'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
  ];
  const monthNamesEn = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  if (locale === 'bn') {
    return `${toBengaliNumber(day)} ${monthNamesBn[monthIndex]} ${toBengaliNumber(year)}`;
  }
  return `${day} ${monthNamesEn[monthIndex]} ${year}`;
}

export function calculateAge(birthDateStr: string, refDate: Date = new Date()): number {
  if (!birthDateStr) return 0;
  const birth = new Date(birthDateStr);
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
  displayTextBn: string;
  displayTextEn: string;
} {
  if (!joiningDateStr) {
    return { years: 0, months: 0, days: 0, displayTextBn: '০ দিন', displayTextEn: '0 days' };
  }

  const joinDate = new Date(joiningDateStr);
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
  if (partsBn.length === 0) {
    partsBn.push(`${toBengaliNumber(days)} দিন`);
    partsEn.push(`${days} ${days === 1 ? 'day' : 'days'}`);
  }

  return {
    years,
    months,
    days,
    displayTextBn: partsBn.join(' '),
    displayTextEn: partsEn.join(' ')
  };
}

/**
 * Checks milestone for a specific target date (MM-DD) relative to a reference date.
 */
export function getUpcomingMilestoneInfo(
  dateStr: string,
  refDate: Date = new Date()
): {
  isToday: boolean;
  isTomorrow: boolean;
  daysUntil: number;
  occurrenceDate: string; // YYYY-MM-DD for this year
  completedYears: number;
} | null {
  if (!dateStr) return null;

  const parts = dateStr.split('-');
  if (parts.length !== 3) return null;

  const origYear = parseInt(parts[0], 10);
  const targetMonth = parseInt(parts[1], 10) - 1;
  const targetDay = parseInt(parts[2], 10);

  const currentYear = refDate.getFullYear();
  
  // Create candidate date in current year
  let candidate = new Date(currentYear, targetMonth, targetDay);
  
  // Set normalized time at 00:00:00
  const todayNormalized = new Date(refDate.getFullYear(), refDate.getMonth(), refDate.getDate());
  
  // If target already passed more than 60 days ago in current year, evaluate for next year
  // Otherwise compare against current year
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
    // 1. Birthday Check
    if (emp.birthDate) {
      const bInfo = getUpcomingMilestoneInfo(emp.birthDate, refDate);
      if (bInfo) {
        let matches = false;
        if (filter === 'today' && bInfo.isToday) matches = true;
        else if (filter === 'tomorrow' && bInfo.isTomorrow) matches = true;
        else if (filter === 'next7days' && bInfo.daysUntil >= 0 && bInfo.daysUntil <= 7) matches = true;
        else if (filter === 'thisMonth') {
          const bMonth = parseInt(emp.birthDate.split('-')[1], 10) - 1;
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

    // 2. Organization Anniversary Check
    if (emp.orgJoiningDate) {
      const aInfo = getUpcomingMilestoneInfo(emp.orgJoiningDate, refDate);
      if (aInfo && aInfo.completedYears >= 1) { // 1+ years anniversary
        let matches = false;
        if (filter === 'today' && aInfo.isToday) matches = true;
        else if (filter === 'tomorrow' && aInfo.isTomorrow) matches = true;
        else if (filter === 'next7days' && aInfo.daysUntil >= 0 && aInfo.daysUntil <= 7) matches = true;
        else if (filter === 'thisMonth') {
          const aMonth = parseInt(emp.orgJoiningDate.split('-')[1], 10) - 1;
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

  // Sort by closest daysUntil
  birthdays.sort((a, b) => a.daysUntil - b.daysUntil);
  anniversaries.sort((a, b) => a.daysUntil - b.daysUntil);

  return { birthdays, anniversaries };
}
