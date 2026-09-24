import { MilestoneItem, SettingsConfig } from '../types';
import { toBengaliNumber, formatDate } from './dateCalculations';

export interface GeneratedEmailMessage {
  subject: string;
  body: string;
  recipients: string[];
  gmailUrl: string;
  outlookUrl: string;
  outlookLiveUrl: string;
  mailtoUrl: string;
  whatsappUrl?: string;
}

export function generateGreeting(
  item: MilestoneItem,
  settings: SettingsConfig,
  language: 'bn' | 'en' = 'bn'
): { subject: string; body: string } {
  const { employee, years, type } = item;
  const orgName = language === 'bn' ? settings.orgNameBn : settings.orgNameEn;
  const zoneName = language === 'bn' ? settings.zoneNameBn : settings.zoneNameEn;
  const formattedDob = formatDate(employee.birthDate, language);
  const formattedJoin = formatDate(employee.orgJoiningDate, language);

  if (type === 'birthday') {
    if (language === 'bn') {
      const subject = `জন্মদিনের আন্তরিক শুভেচ্ছা ও অভিনন্দন - ${employee.name} (${employee.designation}, ${employee.branch})`;
      const body = `শ্রদ্ধেয় সহকর্মী,\n\n` +
        `শুভ জন্মদিন!\n\n` +
        `আজকের এই বিশেষ দিনে ${orgName}, জোন: ${zoneName}-এর সকল সহকর্মীর পক্ষ থেকে জনাব/জনাবা ${employee.name} (${employee.designation}, ${employee.branch}, এরিয়া: ${employee.area})-কে জানাই আন্তরিক প্রীতি ও উষ্ণ শুভেচ্ছা।\n\n` +
        `কর্মীর তথ্য:\n` +
        `• নাম: ${employee.name}\n` +
        `• পিন: ${employee.pin}\n` +
        `• পদবী: ${employee.designation}\n` +
        `• বর্তমান শাখা: ${employee.branch} (এরিয়া: ${employee.area})\n` +
        `• জন্মদিন: ${formattedDob}\n\n` +
        `আপনার ভবিষ্যৎ কর্মজীবন ও ব্যক্তিগত জীবন সুখ, সমৃদ্ধি ও সুস্বাস্থ্যে ভরে উঠুক—এই শুভকামনা রইলো।\n\n` +
        `শুভেচ্ছান্তে,\n` +
        `জোনাল অফিস ও সকল সহকর্মীবৃন্দ\n` +
        `${orgName}\n` +
        `জোন: ${zoneName}`;
      return { subject, body };
    } else {
      const subject = `Warm Birthday Greetings to ${employee.name} (${employee.designation}, ${employee.branch})`;
      const body = `Dear Colleague,\n\n` +
        `Happy Birthday!\n\n` +
        `On this special day, on behalf of everyone at ${orgName}, Zone: ${zoneName}, we extend our heartfelt felicitations and warm wishes to ${employee.name} (${employee.designation}, ${employee.branch}, Area: ${employee.area}).\n\n` +
        `Employee Details:\n` +
        `• Name: ${employee.name}\n` +
        `• PIN: ${employee.pin}\n` +
        `• Designation: ${employee.designation}\n` +
        `• Branch: ${employee.branch} (Area: ${employee.area})\n` +
        `• Date of Birth: ${formattedDob}\n\n` +
        `May your days ahead be blessed with health, happiness, and continued success in all your endeavors.\n\n` +
        `Warm regards,\n` +
        `Zonal Office & Colleagues\n` +
        `${orgName}\n` +
        `Zone: ${zoneName}`;
      return { subject, body };
    }
  } else {
    // Work Anniversary
    if (language === 'bn') {
      const yearsBn = toBengaliNumber(years);
      const subject = `সংস্থায় সফল ${yearsBn} বছর পূর্তিতে আন্তরিক শুভেচ্ছা - ${employee.name} (${employee.branch})`;
      const body = `শ্রদ্ধেয় সহকর্মী,\n\n` +
        `সংস্থায় কর্মবার্ষিকীর গৌরবময় শুভকামনা!\n\n` +
        `অত্যন্ত আনন্দের সাথে জানাচ্ছি যে, জনাব/জনাবা ${employee.name} (${employee.designation}) অদ্য আমাদের প্রিয় সংস্থা "${orgName}"-এ সুনামের সাথে সফলতার ${yearsBn} বছর পূর্ণ করেছেন।\n\n` +
        `কর্মীর অর্জন ও সংক্ষিপ্ত বিবরণ:\n` +
        `• নাম: ${employee.name}\n` +
        `• পিন: ${employee.pin}\n` +
        `• পদবী: ${employee.designation}\n` +
        `• বর্তমান শাখা: ${employee.branch} (এরিয়া: ${employee.area})\n` +
        `• সংস্থায় যোগদানের তারিখ: ${formattedJoin}\n` +
        `• সংস্থায় মোট চাকুরিকাল: ${yearsBn} বছর পূর্ণ\n\n` +
        `সংস্থার উন্নয়ন, গ্রাহকসেবা ও অগ্রযাত্রায় আপনার একনিষ্ঠ অবদান আমাদের জন্য অনুপ্রেরণাদায়ী। আপনার আগামী দিনগুলোর জন্য অফুরন্ত শুভকামনা ও সুস্বাস্থ্য কামনা করছি।\n\n` +
        `অভিনন্দন ও শুভেচ্ছান্তে,\n` +
        `জোনাল অফিস ও সকল সহকর্মীবৃন্দ\n` +
        `${orgName}\n` +
        `জোন: ${zoneName}`;
      return { subject, body };
    } else {
      const subject = `Congratulations on completing ${years} Years at ${orgName} - ${employee.name}`;
      const body = `Dear Colleague,\n\n` +
        `Heartiest congratulations on your Work Anniversary!\n\n` +
        `We proudly celebrate the milestone of ${employee.name} (${employee.designation}), who completes ${years} glorious years of dedicated service with "${orgName}".\n\n` +
        `Staff Milestone Overview:\n` +
        `• Name: ${employee.name}\n` +
        `• PIN: ${employee.pin}\n` +
        `• Designation: ${employee.designation}\n` +
        `• Current Branch: ${employee.branch} (Area: ${employee.area})\n` +
        `• Org Joining Date: ${formattedJoin}\n` +
        `• Organization Tenure: ${years} Years Completed\n\n` +
        `Thank you for your tireless commitment, passion, and valuable contributions toward the progress of our organization. Wishing you continued success and happiness.\n\n` +
        `Best wishes,\n` +
        `Zonal Office & All Staff\n` +
        `${orgName}\n` +
        `Zone: ${zoneName}`;
      return { subject, body };
    }
  }
}

export function prepareEmailData(
  item: MilestoneItem,
  settings: SettingsConfig,
  language: 'bn' | 'en' = 'bn'
): GeneratedEmailMessage {
  const { subject, body } = generateGreeting(item, settings, language);
  
  // Combine official zone recipients + employee email (if present)
  const recipientList = [...settings.zoneEmailList];
  if (item.employee.email && !recipientList.includes(item.employee.email)) {
    recipientList.unshift(item.employee.email);
  }

  const toStr = recipientList.join(', ');

  const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(toStr)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  const outlookUrl = `https://outlook.office.com/mail/deeplink/compose?to=${encodeURIComponent(toStr)}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  const outlookLiveUrl = `https://outlook.live.com/mail/0/deeplink/compose?to=${encodeURIComponent(toStr)}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  const mailtoUrl = `mailto:${encodeURIComponent(toStr)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  // Clean phone number for WhatsApp
  let cleanMobile = item.employee.mobile.replace(/[^0-9]/g, '');
  if (cleanMobile.startsWith('0')) {
    cleanMobile = '880' + cleanMobile.slice(1);
  } else if (!cleanMobile.startsWith('880')) {
    cleanMobile = '880' + cleanMobile;
  }

  const shortWish = item.type === 'birthday' 
    ? (language === 'bn' 
        ? `শুভ জন্মদিন ${item.employee.name}! এসএসএস চট্টগ্রাম-০২ জোনের পক্ষ থেকে আপনার সুস্বাস্থ্য ও দীর্ঘায়ু কামনা করছি।` 
        : `Happy Birthday ${item.employee.name}! Wishing you good health and prosperity from SSS Chattogram-02 Zone.`)
    : (language === 'bn'
        ? `সংস্থায় সফল ${toBengaliNumber(item.years)} বছর পূর্তিতে আন্তরিক শুভেচ্ছা ও শুভকামনা, ${item.employee.name}!`
        : `Warm congratulations on completing ${item.years} years of service at SSS, ${item.employee.name}!`);

  const whatsappUrl = `https://wa.me/${cleanMobile}?text=${encodeURIComponent(shortWish)}`;

  return {
    subject,
    body,
    recipients: recipientList,
    gmailUrl,
    outlookUrl,
    outlookLiveUrl,
    mailtoUrl,
    whatsappUrl
  };
}

export type GroupGreetingType = 'birthday' | 'anniversary' | 'combined';

export function generateGroupGreeting(
  items: MilestoneItem[],
  groupType: GroupGreetingType,
  settings: SettingsConfig,
  language: 'bn' | 'en' = 'bn'
): { subject: string; body: string } {
  if (items.length === 0) {
    return { subject: '', body: '' };
  }
  
  if (items.length === 1) {
    return generateGreeting(items[0], settings, language);
  }

  const orgName = language === 'bn' ? settings.orgNameBn : settings.orgNameEn;
  const zoneName = language === 'bn' ? settings.zoneNameBn : settings.zoneNameEn;

  if (groupType === 'birthday') {
    if (language === 'bn') {
      const countBn = toBengaliNumber(items.length);
      const subject = `শুভ জন্মদিন! জোনাল সহকর্মীদের জন্মদিনের আন্তরিক শুভেচ্ছা ও অভিনন্দন (${countBn} জন)`;

      const staffListText = items.map((it, idx) => {
        const emp = it.employee;
        const numBn = toBengaliNumber(idx + 1);
        const yearsBn = toBengaliNumber(it.years);
        const dobStr = formatDate(emp.birthDate, 'bn');
        return `${numBn}. জনাব/জনাবা ${emp.name} (${emp.designation})\n   • পিন: ${emp.pin}\n   • বর্তমান শাখা: ${emp.branch} (এরিয়া: ${emp.area})\n   • জন্মতারিখ: ${dobStr} (${yearsBn}তম জন্মদিন)`;
      }).join('\n\n');

      const body = `শ্রদ্ধেয় সহকর্মী,\n\n` +
        `শুভ জন্মদিন!\n\n` +
        `আজকের এই আনন্দঘন দিনে ${orgName}, জোন: ${zoneName}-এর সকল সহকর্মীর পক্ষ থেকে অদ্যকার শুভ জন্মদিন উদযাপনকারী সম্মানিত সহকর্মীবৃন্দকে জানাই আন্তরিক প্রীতি ও উষ্ণ শুভেচ্ছা।\n\n` +
        `জন্মদিন উদযাপনকারী সহকর্মীবৃন্দ:\n` +
        `--------------------------------------------------\n` +
        `${staffListText}\n` +
        `--------------------------------------------------\n\n` +
        `আপনাদের ভবিষ্যৎ কর্মজীবন ও ব্যক্তিগত জীবন সুখ, সমৃদ্ধি, সুস্বাস্থ্য ও দীর্ঘায়ুতে ভরে উঠুক—এই শুভকামনা রইলো।\n\n` +
        `অভিনন্দন ও শুভেচ্ছান্তে,\n` +
        `জোনাল অফিস ও সকল সহকর্মীবৃন্দ\n` +
        `${orgName}\n` +
        `জোন: ${zoneName}`;

      return { subject, body };
    } else {
      const subject = `Warm Birthday Greetings to our Zonal Colleagues (${items.length} Members)`;

      const staffListText = items.map((it, idx) => {
        const emp = it.employee;
        const dobStr = formatDate(emp.birthDate, 'en');
        return `${idx + 1}. ${emp.name} (${emp.designation})\n   • PIN: ${emp.pin}\n   • Branch: ${emp.branch} (Area: ${emp.area})\n   • Date of Birth: ${dobStr} (${it.years}th Birthday)`;
      }).join('\n\n');

      const body = `Dear Colleagues,\n\n` +
        `Happy Birthday!\n\n` +
        `On this special day, on behalf of everyone at ${orgName}, Zone: ${zoneName}, we extend our heartfelt felicitations and warm wishes to our colleagues celebrating their birthdays.\n\n` +
        `Celebrating Colleagues:\n` +
        `--------------------------------------------------\n` +
        `${staffListText}\n` +
        `--------------------------------------------------\n\n` +
        `May your days ahead be blessed with health, happiness, and continued success in all your personal and professional endeavors.\n\n` +
        `Warm regards,\n` +
        `Zonal Office & Colleagues\n` +
        `${orgName}\n` +
        `Zone: ${zoneName}`;

      return { subject, body };
    }
  } else if (groupType === 'anniversary') {
    if (language === 'bn') {
      const countBn = toBengaliNumber(items.length);
      const subject = `সংস্থায় সফল কর্মবর্ষপূর্তিতে আন্তরিক শুভেচ্ছা ও অভিনন্দন (${countBn} জন)`;

      const staffListText = items.map((it, idx) => {
        const emp = it.employee;
        const numBn = toBengaliNumber(idx + 1);
        const yearsBn = toBengaliNumber(it.years);
        const joinStr = formatDate(emp.orgJoiningDate, 'bn');
        return `${numBn}. জনাব/জনাবা ${emp.name} (${emp.designation})\n   • পিন: ${emp.pin}\n   • বর্তমান শাখা: ${emp.branch} (এরিয়া: ${emp.area})\n   • সংস্থায় যোগদানের তারিখ: ${joinStr}\n   • সংস্থায় চাকুরিকাল: সফল ${yearsBn} বছর পূর্ণ`;
      }).join('\n\n');

      const body = `শ্রদ্ধেয় সহকর্মী,\n\n` +
        `সংস্থায় কর্মবার্ষিকীর গৌরবময় শুভকামনা!\n\n` +
        `অত্যন্ত আনন্দের সাথে জানাচ্ছি যে, আমাদের প্রিয় সংস্থা "${orgName}"-এ সুনামের সাথে দায়িত্ব পালনকারী নিম্নোক্ত সম্মানিত সহকর্মীবৃন্দ অদ্য তাঁদের চাকুরির সফল কর্মবর্ষপূর্তি উদযাপন করছেন:\n\n` +
        `সংস্থায় কর্মবর্ষপূর্তি উদযাপনকারী সহকর্মীবৃন্দ:\n` +
        `--------------------------------------------------\n` +
        `${staffListText}\n` +
        `--------------------------------------------------\n\n` +
        `সংস্থার উন্নয়ন, গ্রাহকসেবা ও অগ্রযাত্রায় আপনাদের একনিষ্ঠ শ্রম, মেধা ও অবদান আমাদের জন্য পরম অনুপ্রেরণাদায়ী। আপনাদের ভবিষ্যৎ কর্মজীবন ও ব্যক্তিগত জীবনের উত্তরোত্তর সাফল্য, সুস্বাস্থ্য ও দীর্ঘায়ু কামনা করছি।\n\n` +
        `অভিনন্দন ও শুভেচ্ছান্তে,\n` +
        `জোনাল অফিস ও সকল সহকর্মীবৃন্দ\n` +
        `${orgName}\n` +
        `জোন: ${zoneName}`;

      return { subject, body };
    } else {
      const subject = `Congratulations on Work Anniversaries at ${orgName} (${items.length} Colleagues)`;

      const staffListText = items.map((it, idx) => {
        const emp = it.employee;
        const joinStr = formatDate(emp.orgJoiningDate, 'en');
        return `${idx + 1}. ${emp.name} (${emp.designation})\n   • PIN: ${emp.pin}\n   • Current Branch: ${emp.branch} (Area: ${emp.area})\n   • Org Joining Date: ${joinStr}\n   • Org Tenure: ${it.years} Years Completed`;
      }).join('\n\n');

      const body = `Dear Colleagues,\n\n` +
        `Heartiest congratulations on your Work Anniversaries!\n\n` +
        `We proudly celebrate the dedicated service of our esteemed colleagues who mark their work anniversaries at "${orgName}":\n\n` +
        `Colleagues Marking Work Anniversaries:\n` +
        `--------------------------------------------------\n` +
        `${staffListText}\n` +
        `--------------------------------------------------\n\n` +
        `Thank you for your tireless commitment, passion, and valuable contributions toward the progress of our organization. Wishing you continued success and happiness.\n\n` +
        `Best wishes,\n` +
        `Zonal Office & All Staff\n` +
        `${orgName}\n` +
        `Zone: ${zoneName}`;

      return { subject, body };
    }
  } else {
    // Combined
    const bItems = items.filter(i => i.type === 'birthday');
    const aItems = items.filter(i => i.type === 'anniversary');

    if (language === 'bn') {
      const totalBn = toBengaliNumber(items.length);
      const subject = `আজকের জন্মদিন ও সংস্থায় কর্মবর্ষপূর্তির আন্তরিক শুভেচ্ছা ও অভিনন্দন (${totalBn} জন)`;

      let sections = '';
      if (bItems.length > 0) {
        sections += `🎂 জন্মদিন উদযাপনকারী সহকর্মীবৃন্দ:\n` +
          `--------------------------------------------------\n` +
          bItems.map((it, idx) => {
            const emp = it.employee;
            return `${toBengaliNumber(idx + 1)}. ${emp.name} (${emp.designation}, ${emp.branch}) - ${toBengaliNumber(it.years)}তম জন্মদিন`;
          }).join('\n') + `\n--------------------------------------------------\n\n`;
      }
      if (aItems.length > 0) {
        sections += `🏆 সংস্থায় কর্মবর্ষপূর্তি উদযাপনকারী সহকর্মীবৃন্দ:\n` +
          `--------------------------------------------------\n` +
          aItems.map((it, idx) => {
            const emp = it.employee;
            return `${toBengaliNumber(idx + 1)}. ${emp.name} (${emp.designation}, ${emp.branch}) - সফল ${toBengaliNumber(it.years)} বছর পূর্ণ`;
          }).join('\n') + `\n--------------------------------------------------\n\n`;
      }

      const body = `শ্রদ্ধেয় সহকর্মী,\n\n` +
        `আজকের এই বিশেষ দিনে ${orgName}, জোন: ${zoneName}-এর সকল সহকর্মীর পক্ষ থেকে অদ্যকার শুভ জন্মদিন ও সংস্থায় কর্মবর্ষপূর্তি উদযাপনকারী সম্মানিত সকল সহকর্মীদের জানাই আন্তরিক অভিনন্দন ও উষ্ণ শুভেচ্ছা।\n\n` +
        sections +
        `আপনাদের সকলের ভবিষ্যৎ কর্মজীবন ও ব্যক্তিগত জীবন সুখ, সমৃদ্ধি, সুস্বাস্থ্য ও দীর্ঘায়ুতে ভরে উঠুক—এই শুভকামনা রইলো।\n\n` +
        `অভিনন্দন ও শুভেচ্ছান্তে,\n` +
        `জোনাল অফিস ও সকল সহকর্মীবৃন্দ\n` +
        `${orgName}\n` +
        `জোন: ${zoneName}`;

      return { subject, body };
    } else {
      const subject = `Birthday & Work Anniversary Greetings to Zonal Colleagues (${items.length} Members)`;

      let sections = '';
      if (bItems.length > 0) {
        sections += `🎂 Birthday Celebrants:\n` +
          `--------------------------------------------------\n` +
          bItems.map((it, idx) => `${idx + 1}. ${it.employee.name} (${it.employee.designation}, ${it.employee.branch}) - ${it.years}th Birthday`).join('\n') +
          `\n--------------------------------------------------\n\n`;
      }
      if (aItems.length > 0) {
        sections += `🏆 Work Anniversary Celebrants:\n` +
          `--------------------------------------------------\n` +
          aItems.map((it, idx) => `${idx + 1}. ${it.employee.name} (${it.employee.designation}, ${it.employee.branch}) - ${it.years} Years Completed`).join('\n') +
          `\n--------------------------------------------------\n\n`;
      }

      const body = `Dear Colleagues,\n\n` +
        `On behalf of everyone at ${orgName}, Zone: ${zoneName}, we extend our heartfelt felicitations and warm wishes to our colleagues celebrating their birthdays and work anniversaries today.\n\n` +
        sections +
        `Wishing you all good health, continued success, and happiness in your career and personal life.\n\n` +
        `Warm regards,\n` +
        `Zonal Office & Colleagues\n` +
        `${orgName}\n` +
        `Zone: ${zoneName}`;

      return { subject, body };
    }
  }
}

export function prepareGroupEmailData(
  items: MilestoneItem[],
  groupType: GroupGreetingType,
  settings: SettingsConfig,
  language: 'bn' | 'en' = 'bn'
): GeneratedEmailMessage {
  const { subject, body } = generateGroupGreeting(items, groupType, settings, language);

  const recipientList = [...settings.zoneEmailList];
  items.forEach((item) => {
    if (item.employee.email && !recipientList.includes(item.employee.email)) {
      recipientList.push(item.employee.email);
    }
  });

  const toStr = recipientList.join(', ');

  const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(toStr)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  const outlookUrl = `https://outlook.office.com/mail/deeplink/compose?to=${encodeURIComponent(toStr)}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  const outlookLiveUrl = `https://outlook.live.com/mail/0/deeplink/compose?to=${encodeURIComponent(toStr)}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  const mailtoUrl = `mailto:${encodeURIComponent(toStr)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  return {
    subject,
    body,
    recipients: recipientList,
    gmailUrl,
    outlookUrl,
    outlookLiveUrl,
    mailtoUrl
  };
}
