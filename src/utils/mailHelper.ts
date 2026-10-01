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
        `আসসালামু আলাইকুম / আন্তরিক শুভেচ্ছা।\n\n` +
        `অদ্য এই আনন্দঘন দিনে ${orgName}, জোন: ${zoneName}-এর পক্ষ থেকে অত্যন্ত আনন্দের সাথে আমাদের প্রিয় সহকর্মী ${employee.name} (${employee.designation}, ${employee.branch}, এরিয়া: ${employee.area})-কে জন্মদিনের হৃদয়গ্রাহী শুভেচ্ছা ও অভিনন্দন জানাচ্ছি।\n\n` +
        `কর্মীর পরিচিতি:\n` +
        `  নাম: ${employee.name}\n` +
        `  পিন (PIN): ${employee.pin}\n` +
        `  পদবি: ${employee.designation}\n` +
        `  কর্মস্থল: ${employee.branch} (এরিয়া: ${employee.area})\n` +
        `  জন্মদিন: ${formattedDob}\n\n` +
        `আপনার ভবিষ্যৎ কর্মজীবন ও ব্যক্তিগত জীবন আরও আনন্দময়, সুস্বাস্থ্য ও সমৃদ্ধিতে ভরে উঠুক এই শুভকামনা।\n\n` +
        `শুভেচ্ছান্তে,\n` +
        `জোনাল অফিস ও সকল সহকর্মীবৃন্দ\n` +
        `${orgName}\n` +
        `জোন: ${zoneName}`;
      return { subject, body };
    } else {
      const subject = `Warm Birthday Greetings to ${employee.name} (${employee.designation}, ${employee.branch})`;
      const body = `Dear Colleague,\n\n` +
        `Warm greetings!\n\n` +
        `On this special day, on behalf of everyone at ${orgName}, Zone: ${zoneName}, we extend our heartfelt felicitations and warm wishes to ${employee.name} (${employee.designation}, ${employee.branch}, Area: ${employee.area}).\n\n` +
        `Employee Details:\n` +
        `  Name: ${employee.name}\n` +
        `  PIN: ${employee.pin}\n` +
        `  Designation: ${employee.designation}\n` +
        `  Branch: ${employee.branch} (Area: ${employee.area})\n` +
        `  Date of Birth: ${formattedDob}\n\n` +
        `May your days ahead be blessed with good health, happiness, and continued success in all your endeavors.\n\n` +
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
      const subject = `সংস্থায় সফলভাবে ${yearsBn} বছর পূর্তিতে অভিনন্দন - ${employee.name} (${employee.branch})`;
      const body = `শ্রদ্ধেয় সহকর্মী,\n\n` +
        `আসসালামু আলাইকুম / আন্তরিক শুভেচ্ছা।\n\n` +
        `অত্যন্ত গৌরবের সাথে জানাচ্ছি যে, আমাদের নিষ্ঠাবান সহকর্মী ${employee.name} (${employee.designation}) অদ্য আমাদের প্রিয় সংস্থা "${orgName}"-এ সাফল্যের সাথে ${yearsBn} বছর পূর্ণ করলেন।\n\n` +
        `কর্মীর তথ্য:\n` +
        `  নাম: ${employee.name}\n` +
        `  পিন (PIN): ${employee.pin}\n` +
        `  পদবি: ${employee.designation}\n` +
        `  বর্তমান শাখা: ${employee.branch} (এরিয়া: ${employee.area})\n` +
        `  সংস্থায় যোগদানের তারিখ: ${formattedJoin}\n` +
        `  সংস্থায় মোট মেয়াদ: ${yearsBn} বছর সম্পন্ন\n\n` +
        `সংস্থার অগ্রযাত্রায় আপনার নিরলস শ্রম, একনিষ্ঠতা ও অবদানের জন্য গভীর কৃতজ্ঞতা ও অভিনন্দন। আগামী দিনগুলোতে আপনার উত্তরোত্তর সমৃদ্ধি কামনা করি।\n\n` +
        `শুভেচ্ছান্তে,\n` +
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
        `  Name: ${employee.name}\n` +
        `  PIN: ${employee.pin}\n` +
        `  Designation: ${employee.designation}\n` +
        `  Current Branch: ${employee.branch} (Area: ${employee.area})\n` +
        `  Org Joining Date: ${formattedJoin}\n` +
        `  Organization Tenure: ${years} Years Completed\n\n` +
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
  const recipientList = [...settings.zoneEmailList];
  if (item.employee.email && !recipientList.includes(item.employee.email)) {
    recipientList.unshift(item.employee.email);
  }

  const toStr = recipientList.join(', ');
  const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(toStr)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  const outlookUrl = `https://outlook.office.com/mail/deeplink/compose?to=${encodeURIComponent(toStr)}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  const outlookLiveUrl = `https://outlook.live.com/mail/0/deeplink/compose?to=${encodeURIComponent(toStr)}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  const mailtoUrl = `mailto:${encodeURIComponent(toStr)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  let cleanMobile = item.employee.mobile.replace(/[^0-9]/g, '');
  if (cleanMobile.startsWith('0')) {
    cleanMobile = '880' + cleanMobile.slice(1);
  } else if (!cleanMobile.startsWith('880')) {
    cleanMobile = '880' + cleanMobile;
  }

  const shortWish = item.type === 'birthday' 
    ? (language === 'bn' 
        ? `শুভ জন্মদিন ${item.employee.name}! আপনার দীর্ঘায়ু ও সাফল্য কামনা করি - এসএসএস চট্টগ্রাম-০২ জোন।`
        : `Happy Birthday ${item.employee.name}! Wishing you good health and prosperity from SSS Chattogram-02 Zone.`)
    : (language === 'bn'
        ? `সংস্থায় সফলভাবে ${toBengaliNumber(item.years)} বছর পূর্তিতে আন্তরিক শুভেচ্ছা, ${item.employee.name}!`
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
      const subject = `আজকের জন্মদিনের শুভেচ্ছা (${countBn} জন সহকর্মী) - জোন: ${zoneName}`;
      const staffListText = items.map((it, idx) => {
        const emp = it.employee;
        const numBn = toBengaliNumber(idx + 1);
        const yearsBn = toBengaliNumber(it.years);
        const dobStr = formatDate(emp.birthDate, 'bn');
        return `${numBn}. নাম: ${emp.name} (${emp.designation})\n     পিন: ${emp.pin}\n     শাখা: ${emp.branch} (এরিয়া: ${emp.area})\n     জন্মদিন: ${dobStr} (${yearsBn}তম জন্মদিন)`;
      }).join('\n\n');

      const body = `শ্রদ্ধেয় সহকর্মীবৃন্দ,\n\n` +
        `আসসালামু আলাইকুম / আন্তরিক শুভেচ্ছা।\n\n` +
        `অদ্য এই আনন্দঘন দিনে ${orgName}, জোন: ${zoneName}-এর পক্ষ থেকে যে সকল প্রিয় সহকর্মী আজ জন্মদিন উদযাপন করছেন, তাদের সকলকে জানাই উষ্ণ অভিনন্দন ও প্রাণঢালা শুভেচ্ছা:\n\n` +
        `আজকের জন্মদিনের সহকর্মীবৃন্দ:\n` +
        `--------------------------------------------------\n` +
        `${staffListText}\n` +
        `--------------------------------------------------\n\n` +
        `আপনাদের সকলের সুস্বাস্থ্য, দীর্ঘায়ু ও উত্তরোত্তর কর্মসাফল্য কামনা করি।\n\n` +
        `শুভেচ্ছান্তে,\n` +
        `জোনাল অফিস ও সহকর্মীবৃন্দ\n` +
        `${orgName}\n` +
        `জোন: ${zoneName}`;
      return { subject, body };
    } else {
      const subject = `Warm Birthday Greetings to our Zonal Colleagues (${items.length} Members)`;
      const staffListText = items.map((it, idx) => {
        const emp = it.employee;
        const dobStr = formatDate(emp.birthDate, 'en');
        return `${idx + 1}. ${emp.name} (${emp.designation})\n     PIN: ${emp.pin}\n     Branch: ${emp.branch} (Area: ${emp.area})\n     Date of Birth: ${dobStr} (${it.years}th Birthday)`;
      }).join('\n\n');

      const body = `Dear Colleagues,\n\n` +
        `Warm greetings!\n\n` +
        `On this special day, on behalf of everyone at ${orgName}, Zone: ${zoneName}, we extend our heartfelt felicitations and warm wishes to our colleagues celebrating their birthdays.\n\n` +
        `Celebrating Colleagues:\n` +
        `--------------------------------------------------\n` +
        `${staffListText}\n` +
        `--------------------------------------------------\n\n` +
        `May your days ahead be blessed with health, happiness, and continued success.\n\n` +
        `Warm regards,\n` +
        `Zonal Office & Colleagues\n` +
        `${orgName}\n` +
        `Zone: ${zoneName}`;
      return { subject, body };
    }
  } else if (groupType === 'anniversary') {
    if (language === 'bn') {
      const countBn = toBengaliNumber(items.length);
      const subject = `সংস্থায় সফল কর্মপূর্তিতে অভিনন্দন (${countBn} জন সহকর্মী) - ${zoneName}`;
      const staffListText = items.map((it, idx) => {
        const emp = it.employee;
        const numBn = toBengaliNumber(idx + 1);
        const yearsBn = toBengaliNumber(it.years);
        const joinStr = formatDate(emp.orgJoiningDate, 'bn');
        return `${numBn}. নাম: ${emp.name} (${emp.designation})\n     পিন: ${emp.pin}\n     বর্তমান শাখা: ${emp.branch} (এরিয়া: ${emp.area})\n     যোগদানের তারিখ: ${joinStr}\n     সংস্থায় মেয়াদ: ${yearsBn} বছর সম্পন্ন`;
      }).join('\n\n');

      const body = `শ্রদ্ধেয় সহকর্মীবৃন্দ,\n\n` +
        `আসসালামু আলাইকুম / আন্তরিক শুভেচ্ছা।\n\n` +
        `অত্যন্ত আনন্দের সাথে জানাচ্ছি যে, অদ্য আমাদের প্রিয় সংস্থা "${orgName}"-এ নিষ্ঠাবান সেবার ধারাবাহিকতায় যে সকল সহকর্মী কর্মপূর্তির মাইলফলক স্পর্শ করেছেন, তাদের জানাই আন্তরিক অভিনন্দন:\n\n` +
        `কর্মপূর্তি উদযাপনকারী সহকর্মীবৃন্দ:\n` +
        `--------------------------------------------------\n` +
        `${staffListText}\n` +
        `--------------------------------------------------\n\n` +
        `আপনাদের মূল্যবান শ্রম, একনিষ্ঠতা ও অবদানের জন্য আন্তরিক ধন্যবাদ। আগামী দিনগুলো আরও সমৃদ্ধিময় হোক।\n\n` +
        `শুভেচ্ছান্তে,\n` +
        `জোনাল অফিস ও সহকর্মীবৃন্দ\n` +
        `${orgName}\n` +
        `জোন: ${zoneName}`;
      return { subject, body };
    } else {
      const subject = `Congratulations on Work Anniversaries at ${orgName} (${items.length} Colleagues)`;
      const staffListText = items.map((it, idx) => {
        const emp = it.employee;
        const joinStr = formatDate(emp.orgJoiningDate, 'en');
        return `${idx + 1}. ${emp.name} (${emp.designation})\n     PIN: ${emp.pin}\n     Current Branch: ${emp.branch} (Area: ${emp.area})\n     Org Joining Date: ${joinStr}\n     Org Tenure: ${it.years} Years Completed`;
      }).join('\n\n');

      const body = `Dear Colleagues,\n\n` +
        `Heartiest congratulations on your Work Anniversaries!\n\n` +
        `We proudly celebrate the dedicated service of our esteemed colleagues who mark their work anniversaries at "${orgName}":\n\n` +
        `Colleagues Marking Work Anniversaries:\n` +
        `--------------------------------------------------\n` +
        `${staffListText}\n` +
        `--------------------------------------------------\n\n` +
        `Thank you for your tireless commitment, passion, and valuable contributions.\n\n` +
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
      const subject = `আজকের শুভ জন্মদিন ও কর্মপূর্তি উদযাপন (${totalBn} জন সহকর্মী) - ${zoneName}`;
      let sections = '';
      if (bItems.length > 0) {
        sections += `জন্মদিনের শুভেচ্ছা:\n` +
          `--------------------------------------------------\n` +
          bItems.map((it, idx) => {
            const emp = it.employee;
            return `${toBengaliNumber(idx + 1)}. ${emp.name} (${emp.designation}, ${emp.branch}) - ${toBengaliNumber(it.years)}তম জন্মদিন`;
          }).join('\n') + `\n--------------------------------------------------\n\n`;
      }
      if (aItems.length > 0) {
        sections += `কর্মপূর্তিতে অভিনন্দন:\n` +
          `--------------------------------------------------\n` +
          aItems.map((it, idx) => {
            const emp = it.employee;
            return `${toBengaliNumber(idx + 1)}. ${emp.name} (${emp.designation}, ${emp.branch}) - সংস্থায় ${toBengaliNumber(it.years)} বছর পূর্ণ`;
          }).join('\n') + `\n--------------------------------------------------\n\n`;
      }

      const body = `শ্রদ্ধেয় সহকর্মীবৃন্দ,\n\n` +
        `${orgName}, জোন: ${zoneName}-এর পক্ষ থেকে আজকের সকল উদযাপনে আমাদের আন্তরিক শুভেচ্ছা ও মোবারকবাদ:\n\n` +
        sections +
        `আপনাদের সবার সুন্দর ও সফল ভবিষ্যৎ কামনা করছি।\n\n` +
        `শুভেচ্ছান্তে,\n` +
        `জোনাল অফিস ও সহকর্মীবৃন্দ\n` +
        `${orgName}\n` +
        `জোন: ${zoneName}`;
      return { subject, body };
    } else {
      const subject = `Birthday & Work Anniversary Greetings to Zonal Colleagues (${items.length} Members)`;
      let sections = '';
      if (bItems.length > 0) {
        sections += `Birthday Celebrants:\n` +
          `--------------------------------------------------\n` +
          bItems.map((it, idx) => `${idx + 1}. ${it.employee.name} (${it.employee.designation}, ${it.employee.branch}) - ${it.years}th Birthday`).join('\n') +
          `\n--------------------------------------------------\n\n`;
      }
      if (aItems.length > 0) {
        sections += `Work Anniversary Celebrants:\n` +
          `--------------------------------------------------\n` +
          aItems.map((it, idx) => `${idx + 1}. ${it.employee.name} (${it.employee.designation}, ${it.employee.branch}) - ${it.years} Years Completed`).join('\n') +
          `\n--------------------------------------------------\n\n`;
      }

      const body = `Dear Colleagues,\n\n` +
        `On behalf of everyone at ${orgName}, Zone: ${zoneName}, we extend our heartfelt felicitations and warm wishes to our colleagues celebrating today.\n\n` +
        sections +
        `Wishing you all good health, continued success, and happiness.\n\n` +
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
