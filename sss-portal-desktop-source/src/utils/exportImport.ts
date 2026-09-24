import { Employee } from '../types';

export function exportEmployeesToCsv(employees: Employee[], language: 'bn' | 'en' = 'bn'): void {
  // UTF-8 BOM (\uFEFF) ensures Excel renders Bengali and unicode text without garbled characters
  const BOM = '\uFEFF';
  
  const headers = language === 'bn' ? [
    'ক্রমিক নং',
    'এরিয়া',
    'শাখা',
    'কর্মীর নাম',
    'পিন (PIN)',
    'পদবী',
    'মোবাইল নম্বর',
    'ইমেইল',
    'সংস্থায় যোগদানের তারিখ',
    'শাখায় যোগদানের তারিখ',
    'জন্ম তারিখ',
    'রক্তের গ্রুপ',
    'স্ট্যাটাস',
    'মন্তব্য'
  ] : [
    'Sl No',
    'Area',
    'Branch',
    'Employee Name',
    'PIN',
    'Designation',
    'Mobile',
    'Email',
    'Org Joining Date',
    'Branch Joining Date',
    'Date of Birth',
    'Blood Group',
    'Status',
    'Notes'
  ];

  const escapeField = (val: unknown): string => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = employees.map((emp, index) => [
    escapeField(emp.serialNo || index + 1),
    escapeField(emp.area),
    escapeField(emp.branch),
    escapeField(emp.name),
    escapeField(emp.pin),
    escapeField(emp.designation),
    escapeField(emp.mobile),
    escapeField(emp.email || ''),
    escapeField(emp.orgJoiningDate),
    escapeField(emp.branchJoiningDate),
    escapeField(emp.birthDate),
    escapeField(emp.bloodGroup),
    escapeField(emp.status),
    escapeField(emp.notes || '')
  ]);

  const csvContent = BOM + [
    headers.map(h => `"${h}"`).join(','),
    ...rows.map(r => r.join(','))
  ].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const dateStr = new Date().toISOString().slice(0, 10);
  link.setAttribute('href', url);
  link.setAttribute('download', `SSS_Chattogram02_Staff_Database_${dateStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadJsonFile(filename: string, content: string): void {
  const blob = new Blob([content], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
