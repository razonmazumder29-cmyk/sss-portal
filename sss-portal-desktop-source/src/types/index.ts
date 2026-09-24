export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'O+' | 'O-' | 'AB+' | 'AB-';

export interface TransferRecord {
  id: string;
  fromArea: string;
  fromBranch: string;
  toArea: string;
  toBranch: string;
  transferDate: string; // YYYY-MM-DD
  orderRef?: string;
  reason?: string;
  recordedAt: string;
}

export interface Employee {
  id: string;
  serialNo: number;
  area: string;
  branch: string;
  name: string;
  pin: string;
  designation: string;
  mobile: string;
  email: string;
  orgJoiningDate: string; // YYYY-MM-DD
  branchJoiningDate: string; // YYYY-MM-DD
  birthDate: string; // YYYY-MM-DD
  bloodGroup: BloodGroup;
  gender?: 'Male' | 'Female' | 'Other';
  status: 'Active' | 'Transferred' | 'On Leave';
  notes?: string;
  lastTransferDate?: string;
  transferHistory: TransferRecord[];
}

export interface BranchItem {
  id: string;
  name: string;
  area: string;
  code?: string;
  phone?: string;
}

export interface SettingsConfig {
  orgNameBn: string;
  orgNameEn: string;
  zoneNameBn: string;
  zoneNameEn: string;
  zoneEmailList: string[];
  zonePhone: string;
  adminPasswordHash: string;
  birthdayWishTemplateBn: string;
  birthdayWishTemplateEn: string;
  anniversaryWishTemplateBn: string;
  anniversaryWishTemplateEn: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  action: 'CREATE' | 'UPDATE' | 'TRANSFER' | 'DELETE' | 'EXPORT' | 'RESTORE' | 'LOGIN';
  performedBy: string;
  details: string;
  employeeId?: string;
  employeeName?: string;
}

export interface MilestoneItem {
  id: string;
  type: 'birthday' | 'anniversary';
  employee: Employee;
  years: number; // N-th birthday or N-th year in organization
  branchYears: number; // tenure in current branch
  date: string; // upcoming date in current year (YYYY-MM-DD)
  isToday: boolean;
  isTomorrow: boolean;
  daysUntil: number;
}
