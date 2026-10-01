import * as XLSX from 'xlsx';
import { Employee, BloodGroup, EmployeeStatus } from '../types';
import { normalizeDateToISO } from './dateCalculations';

function cleanSpreadsheetDate(rawVal: unknown): string {
  if (rawVal === undefined || rawVal === null || rawVal === '') return '';
  if (typeof rawVal === 'number' && rawVal > 1000 && rawVal < 100000) {
    try {
      const utcDays = Math.floor(rawVal - 25569);
      const utcValue = utcDays * 86400;
      const dateInfo = new Date(utcValue * 1000);
      const y = dateInfo.getUTCFullYear();
      const m = String(dateInfo.getUTCMonth() + 1).padStart(2, '0');
      const d = String(dateInfo.getUTCDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    } catch {
      // Fallback
    }
  }
  const str = String(rawVal).trim();
  return normalizeDateToISO(str);
}

function normalizeBloodGroup(raw: unknown): BloodGroup {
  if (!raw) return 'B+';
  const clean = String(raw).toUpperCase().trim().replace(/\s+/g, '');
  const valid: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
  if (valid.includes(clean as BloodGroup)) return clean as BloodGroup;
  return 'B+';
}

function normalizeStatus(raw: unknown): EmployeeStatus {
  if (!raw) return 'Active';
  const str = String(raw).toLowerCase().trim();
  if (str.includes('leave')) return 'On Leave';
  if (str.includes('transfer')) return 'Transferred';
  if (str.includes('deputation')) return 'Deputation';
  if (str.includes('retire')) return 'Retired';
  return 'Active';
}

export const SPREADSHEET_COLUMNS_BN = [
  'ক্রমিক (Sl No)',
  'এরিয়া (Area)',
  'শাখা (Branch)',
  'কর্মীর নাম (Name)',
  'পরিচিতি নম্বর (PIN)',
  'পদবি (Designation)',
  'মোবাইল নম্বর (Mobile)',
  'ইমেইল (Email)',
  'সংস্থায় যোগদানের তারিখ (DD/MM/YYYY)',
  'বর্তমান শাখায় যোগদানের তারিখ (DD/MM/YYYY)',
  'জন্ম তারিখ (DD/MM/YYYY)',
  'রক্তের গ্রুপ (Blood Group)',
  'বর্তমান অবস্থা (Status)',
  'মন্তব্য (Notes)'
];

export const SPREADSHEET_COLUMNS_EN = [
  'Sl No',
  'Area',
  'Branch',
  'Employee Name',
  'PIN',
  'Designation',
  'Mobile',
  'Email',
  'Org Joining Date (DD/MM/YYYY)',
  'Branch Joining Date (DD/MM/YYYY)',
  'Date of Birth (DD/MM/YYYY)',
  'Blood Group',
  'Status',
  'Notes'
];

export function exportEmployeesToExcel(employees: Employee[], language: 'bn' | 'en' = 'bn'): void {
  const headers = language === 'bn' ? SPREADSHEET_COLUMNS_BN : SPREADSHEET_COLUMNS_EN;
  const dataRows = employees.map((emp, index) => {
    const formatToDDMMYYYY = (iso: string) => {
      if (!iso) return '';
      const parts = iso.split('-');
      if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
      return iso;
    };

    return [
      emp.serialNo || index + 1,
      emp.area,
      emp.branch,
      emp.name,
      emp.pin,
      emp.designation,
      emp.mobile,
      emp.email || '',
      formatToDDMMYYYY(emp.orgJoiningDate),
      formatToDDMMYYYY(emp.branchJoiningDate),
      formatToDDMMYYYY(emp.birthDate),
      emp.bloodGroup,
      emp.status || 'Active',
      emp.notes || ''
    ];
  });

  const ws = XLSX.utils.aoa_to_sheet([headers, ...dataRows]);
  ws['!cols'] = [
    { wch: 8 },  // Sl
    { wch: 28 }, // Area
    { wch: 24 }, // Branch
    { wch: 26 }, // Name
    { wch: 14 }, // PIN
    { wch: 22 }, // Designation
    { wch: 16 }, // Mobile
    { wch: 24 }, // Email
    { wch: 18 }, // Org Joining
    { wch: 18 }, // Branch Joining
    { wch: 16 }, // DOB
    { wch: 12 }, // Blood
    { wch: 12 }, // Status
    { wch: 22 }  // Notes
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Staff Database');
  const dateStr = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `SSS_Chattogram02_Staff_Database_${dateStr}.xlsx`);
}

export function downloadSampleExcelTemplate(): void {
  const headers = SPREADSHEET_COLUMNS_BN;
  const sampleData = [
    [
      1,
      'Chattogram Sadar (চট্টগ্রাম সদর)',
      'Panchlaish Branch',
      'মোঃ জাহিদ হোসেন',
      'SSS-92101',
      'Branch Manager',
      '01812345678',
      'zahid@sss.org.bd',
      '10/04/2020',
      '01/06/2023',
      '15/05/1990',
      'B+',
      'Active',
      'নমুনা ডাটা'
    ],
    [
      2,
      'Hathazari (হাটহাজারী)',
      'Hathazari Branch',
      'রোকেয়া বেগম',
      'SSS-92102',
      'Accountant',
      '01712345678',
      'rokeya@sss.org.bd',
      '15/08/2021',
      '01/09/2023',
      '20/08/1994',
      'A+',
      'Active',
      'নমুনা ডাটা'
    ]
  ];

  const ws = XLSX.utils.aoa_to_sheet([headers, ...sampleData]);
  ws['!cols'] = [
    { wch: 8 }, { wch: 28 }, { wch: 24 }, { wch: 26 }, { wch: 14 },
    { wch: 22 }, { wch: 16 }, { wch: 24 }, { wch: 18 }, { wch: 18 },
    { wch: 16 }, { wch: 12 }, { wch: 12 }, { wch: 22 }
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Staff Template');
  XLSX.writeFile(wb, 'SSS_Staff_Bulk_Import_Template.xlsx');
}

export async function parseSpreadsheetFile(file: File): Promise<{
  success: boolean;
  employees: Partial<Employee>[];
  errors: string[];
  totalRowsFound: number;
}> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const buffer = e.target?.result as ArrayBuffer;
        if (!buffer || buffer.byteLength === 0) {
          resolve({
            success: false,
            employees: [],
            errors: ['ফাইলটি ফাঁকা (File is empty)'],
            totalRowsFound: 0
          });
          return;
        }

        const workbook = XLSX.read(buffer, {
          type: 'array',
          cellDates: false,
          raw: true
        });

        if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
          resolve({
            success: false,
            employees: [],
            errors: ['কোনো শিট পাওয়া যায়নি (No worksheets found in file)'],
            totalRowsFound: 0
          });
          return;
        }

        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        const rawRows: unknown[][] = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          defval: '',
          blankrows: false
        });

        if (rawRows.length < 2) {
          resolve({
            success: false,
            employees: [],
            errors: ['ফাইলে পর্যাপ্ত ডাটা রো পাওয়া যায়নি (No data rows found)'],
            totalRowsFound: 0
          });
          return;
        }

        const headerRow = (rawRows[0] || []).map(c => String(c).toLowerCase().trim());
        
        const findColIdx = (aliases: string[], fallbackIdx: number): number => {
          for (const alias of aliases) {
            const idx = headerRow.findIndex(h => h.includes(alias.toLowerCase()));
            if (idx !== -1) return idx;
          }
          return fallbackIdx;
        };

        const idxSl = findColIdx(['ক্রমিক', 'sl', 'serial', 'no'], 0);
        const idxArea = findColIdx(['এরিয়া', 'অঞ্চল', 'area', 'region'], 1);
        const idxBranch = findColIdx(['শাখা', 'branch', 'office'], 2);
        const idxName = findColIdx(['নাম', 'কর্মী', 'name', 'employee'], 3);
        const idxPin = findColIdx(['পিন', 'pin', 'id'], 4);
        const idxDesignation = findColIdx(['পদবি', 'designation', 'role', 'position'], 5);
        const idxMobile = findColIdx(['মোবাইল', 'mobile', 'phone', 'contact'], 6);
        const idxEmail = findColIdx(['ইমেইল', 'email', 'mail'], 7);
        const idxOrgJoin = findColIdx(['সংস্থায়', 'org join', 'joining date'], 8);
        const idxBranchJoin = findColIdx(['শাখায়', 'branch join'], 9);
        const idxBirth = findColIdx(['জন্ম', 'birth', 'dob'], 10);
        const idxBlood = findColIdx(['রক্ত', 'blood'], 11);
        const idxStatus = findColIdx(['অবস্থা', 'status'], 12);
        const idxNotes = findColIdx(['মন্তব্য', 'note', 'remarks'], 13);

        const employees: Partial<Employee>[] = [];
        const errors: string[] = [];

        for (let i = 1; i < rawRows.length; i++) {
          const row = rawRows[i];
          if (!row || !Array.isArray(row) || row.length === 0) continue;

          const name = String(row[idxName] ?? '').trim();
          if (!name) {
            const hasAny = row.some(cell => String(cell ?? '').trim() !== '');
            if (hasAny) {
              errors.push(`সারি #${i + 1}: কর্মীর নাম পাওয়া যায়নি`);
            }
            continue;
          }

          const serialNo = parseInt(String(row[idxSl] ?? ''), 10) || i;
          const area = String(row[idxArea] ?? '').trim() || 'Chattogram Sadar (চট্টগ্রাম সদর)';
          const branch = String(row[idxBranch] ?? '').trim() || 'Panchlaish Branch';
          const pin = String(row[idxPin] ?? '').trim() || `SSS-${Math.floor(10000 + Math.random() * 90000)}`;
          const designation = String(row[idxDesignation] ?? '').trim() || 'Field Officer';
          const mobile = String(row[idxMobile] ?? '').trim();
          const email = String(row[idxEmail] ?? '').trim();
          const orgJoinClean = cleanSpreadsheetDate(row[idxOrgJoin]) || new Date().toISOString().slice(0, 10);
          const branchJoinClean = cleanSpreadsheetDate(row[idxBranchJoin]) || orgJoinClean;
          const birthClean = cleanSpreadsheetDate(row[idxBirth]) || '1995-01-01';
          const bloodGroup = normalizeBloodGroup(row[idxBlood]);
          const status = normalizeStatus(row[idxStatus]);
          const notes = String(row[idxNotes] ?? '').trim();

          employees.push({
            serialNo,
            area,
            branch,
            name,
            pin,
            designation,
            mobile,
            email,
            orgJoiningDate: orgJoinClean,
            branchJoiningDate: branchJoinClean,
            birthDate: birthClean,
            bloodGroup,
            status,
            notes,
            transferHistory: []
          });
        }

        resolve({
          success: employees.length > 0,
          employees,
          errors,
          totalRowsFound: rawRows.length - 1
        });
      } catch (err) {
        console.error('Spreadsheet parse error:', err);
        resolve({
          success: false,
          employees: [],
          errors: ['ফাইল প্রসেসিং ত্রুটি: ' + (err instanceof Error ? err.message : String(err))],
          totalRowsFound: 0
        });
      }
    };

    reader.onerror = () => {
      resolve({
        success: false,
        employees: [],
        errors: ['ফাইল পড়তে ব্যর্থ হয়েছে (Failed to read file)'],
        totalRowsFound: 0
      });
    };

    reader.readAsArrayBuffer(file);
  });
}

export function exportEmployeesToCsv(employees: Employee[], language: 'bn' | 'en' = 'bn'): void {
  const BOM = '\uFEFF';
  const headers = language === 'bn' ? SPREADSHEET_COLUMNS_BN : SPREADSHEET_COLUMNS_EN;
  const escapeField = (val: unknown): string => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const formatToDDMMYYYY = (iso: string) => {
    if (!iso) return '';
    const parts = iso.split('-');
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    return iso;
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
    escapeField(formatToDDMMYYYY(emp.orgJoiningDate)),
    escapeField(formatToDDMMYYYY(emp.branchJoiningDate)),
    escapeField(formatToDDMMYYYY(emp.birthDate)),
    escapeField(emp.bloodGroup),
    escapeField(emp.status || 'Active'),
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

export function downloadSampleCsvTemplate(): void {
  const BOM = '\uFEFF';
  const headers = SPREADSHEET_COLUMNS_BN;
  const sampleRows = [
    ['1', 'Chattogram Sadar (চট্টগ্রাম সদর)', 'Panchlaish Branch', 'মোঃ জাহিদ হোসেন', 'SSS-92101', 'Branch Manager', '01812345678', 'zahid@sss.org.bd', '10/04/2020', '01/06/2023', '15/05/1990', 'B+', 'Active', 'নমুনা তথ্য'],
    ['2', 'Hathazari (হাটহাজারী)', 'Hathazari Branch', 'রোকেয়া বেগম', 'SSS-92102', 'Accountant', '01712345678', 'rokeya@sss.org.bd', '15/08/2021', '01/09/2023', '20/08/1994', 'A+', 'Active', 'নমুনা তথ্য']
  ];
  const csvContent = BOM + [
    headers.map(h => `"${h}"`).join(','),
    ...sampleRows.map(r => r.map(c => `"${c}"`).join(','))
  ].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'SSS_Staff_Bulk_Import_Template.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
