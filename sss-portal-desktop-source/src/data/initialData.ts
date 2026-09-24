import { Employee, BranchItem, SettingsConfig } from '../types';

export const INITIAL_AREAS: string[] = [
  'Chattogram Sadar (সদর)',
  'Hathazari (হাটহাজারী)',
  'Patiya (পটিয়া)',
  'Raozan (রাউজান)',
  'Sitakunda (সীতাকুণ্ড)'
];

export const INITIAL_BRANCHES: BranchItem[] = [
  { id: 'br-1', name: 'Panchlaish Branch', area: 'Chattogram Sadar (সদর)', code: 'CTG-01', phone: '01819001122' },
  { id: 'br-2', name: 'Agrabad Branch', area: 'Chattogram Sadar (সদর)', code: 'CTG-02', phone: '01819001123' },
  { id: 'br-3', name: 'GEC More Branch', area: 'Chattogram Sadar (সদর)', code: 'CTG-03', phone: '01819001124' },
  { id: 'br-4', name: 'Muradpur Branch', area: 'Chattogram Sadar (সদর)', code: 'CTG-04', phone: '01819001125' },
  { id: 'br-5', name: 'Hathazari Branch', area: 'Hathazari (হাটহাজারী)', code: 'HTZ-01', phone: '01819001126' },
  { id: 'br-6', name: 'Fatikchhari Branch', area: 'Hathazari (হাটহাজারী)', code: 'HTZ-02', phone: '01819001127' },
  { id: 'br-7', name: 'Patiya Branch', area: 'Patiya (পটিয়া)', code: 'PTY-01', phone: '01819001128' },
  { id: 'br-8', name: 'Boalkhali Branch', area: 'Patiya (পটিয়া)', code: 'PTY-02', phone: '01819001129' },
  { id: 'br-9', name: 'Anwara Branch', area: 'Patiya (পটিয়া)', code: 'PTY-03', phone: '01819001130' },
  { id: 'br-10', name: 'Raozan Branch', area: 'Raozan (রাউজান)', code: 'RZN-01', phone: '01819001131' },
  { id: 'br-11', name: 'Rangunia Branch', area: 'Raozan (রাউজান)', code: 'RZN-02', phone: '01819001132' },
  { id: 'br-12', name: 'Sitakunda Branch', area: 'Sitakunda (সীতাকুণ্ড)', code: 'STK-01', phone: '01819001133' },
  { id: 'br-13', name: 'Mirsharai Branch', area: 'Sitakunda (সীতাকুণ্ড)', code: 'STK-02', phone: '01819001134' }
];

export const INITIAL_DESIGNATIONS: string[] = [
  'Zonal Manager',
  'Area Manager',
  'Branch Manager',
  'Assistant Branch Manager',
  'Accountant',
  'Senior Field Officer',
  'Field Officer',
  'Customer Service Officer',
  'Office Assistant'
];

export const INITIAL_SETTINGS: SettingsConfig = {
  orgNameBn: 'সোসাইটি ফর সোসাল সার্ভিস (এসএসএস)',
  orgNameEn: 'Society for Social Service (SSS)',
  zoneNameBn: 'চট্টগ্রাম-০২',
  zoneNameEn: 'Chattogram-02',
  zoneEmailList: [
    'sss.zone.chattogram02@gmail.com',
    'sss.chattogram02.admin@outlook.com',
    'hrd.sss.bangladesh@gmail.com',
    'panchlaish.branch@sss.org.bd',
    'patiya.branch@sss.org.bd'
  ],
  zonePhone: '+8801819000002',
  adminPasswordHash: 'admin123',
  birthdayWishTemplateBn: 'জন্মদিনের আন্তরিক শুভেচ্ছা ও দীর্ঘায়ু কামনা করছি।',
  birthdayWishTemplateEn: 'Wishing you a very Happy Birthday and successful year ahead.',
  anniversaryWishTemplateBn: 'সংস্থায় গৌরবময় কর্মবর্ষপূর্তিতে আন্তরিক অভিনন্দন ও শুভেচ্ছা।',
  anniversaryWishTemplateEn: 'Heartiest congratulations on completing your work anniversary.'
};

// Initial employee list: Note today is 2026-09-24
export const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: 'emp-1',
    serialNo: 1,
    area: 'Chattogram Sadar (সদর)',
    branch: 'Panchlaish Branch',
    name: 'Md. Tariqul Islam',
    pin: 'SSS-70412',
    designation: 'Zonal Manager',
    mobile: '01819234567',
    email: 'tariqul.islam@sss.org.bd',
    orgJoiningDate: '2016-09-24', // Today is 10th anniversary!
    branchJoiningDate: '2023-01-15',
    birthDate: '1982-11-14',
    bloodGroup: 'B+',
    gender: 'Male',
    status: 'Active',
    notes: 'Zone Head, Chattogram-02',
    transferHistory: [
      {
        id: 'tr-1',
        fromArea: 'Hathazari (হাটহাজারী)',
        fromBranch: 'Hathazari Branch',
        toArea: 'Chattogram Sadar (সদর)',
        toBranch: 'Panchlaish Branch',
        transferDate: '2023-01-15',
        orderRef: 'SSS/HR/TR/2023/042',
        reason: 'Promotion to Zonal Manager',
        recordedAt: '2023-01-15T09:00:00.000Z'
      }
    ]
  },
  {
    id: 'emp-2',
    serialNo: 2,
    area: 'Chattogram Sadar (সদর)',
    branch: 'Agrabad Branch',
    name: 'Nasrin Sultana',
    pin: 'SSS-78219',
    designation: 'Branch Manager',
    mobile: '01712987654',
    email: 'nasrin.agrabad@gmail.com',
    orgJoiningDate: '2019-03-10',
    branchJoiningDate: '2024-02-01',
    birthDate: '1989-09-24', // Today is Birthday (37th)!
    bloodGroup: 'O+',
    gender: 'Female',
    status: 'Active',
    notes: 'Best Branch Manager Award 2025',
    transferHistory: []
  },
  {
    id: 'emp-3',
    serialNo: 3,
    area: 'Patiya (পটিয়া)',
    branch: 'Patiya Branch',
    name: 'Kazi Mohammad Rafiq',
    pin: 'SSS-81045',
    designation: 'Area Manager',
    mobile: '01823456789',
    email: 'rafiq.patiya@gmail.com',
    orgJoiningDate: '2018-09-24', // Today is 8th anniversary!
    branchJoiningDate: '2022-07-01',
    birthDate: '1986-04-12',
    bloodGroup: 'A+',
    gender: 'Male',
    status: 'Active',
    notes: 'In-charge of Patiya Area',
    transferHistory: []
  },
  {
    id: 'emp-4',
    serialNo: 4,
    area: 'Hathazari (হাটহাজারী)',
    branch: 'Hathazari Branch',
    name: 'Sharmin Akter',
    pin: 'SSS-84310',
    designation: 'Accountant',
    mobile: '01911432109',
    email: 'sharmin.sss.hathazari@gmail.com',
    orgJoiningDate: '2021-06-15',
    branchJoiningDate: '2023-08-10',
    birthDate: '1993-09-25', // Tomorrow is Birthday!
    bloodGroup: 'AB+',
    gender: 'Female',
    status: 'Active',
    notes: '',
    transferHistory: []
  },
  {
    id: 'emp-5',
    serialNo: 5,
    area: 'Raozan (রাউজান)',
    branch: 'Raozan Branch',
    name: 'Abdul Mannan Chowdhury',
    pin: 'SSS-79541',
    designation: 'Branch Manager',
    mobile: '01834567890',
    email: 'mannan.raozan@gmail.com',
    orgJoiningDate: '2020-09-26', // Next 7 days anniversary (6th)!
    branchJoiningDate: '2023-11-01',
    birthDate: '1988-01-20',
    bloodGroup: 'A-',
    gender: 'Male',
    status: 'Active',
    notes: '',
    transferHistory: []
  },
  {
    id: 'emp-6',
    serialNo: 6,
    area: 'Chattogram Sadar (সদর)',
    branch: 'GEC More Branch',
    name: 'Tanvir Ahmed',
    pin: 'SSS-88124',
    designation: 'Senior Field Officer',
    mobile: '01733221100',
    email: 'tanvir.gec@gmail.com',
    orgJoiningDate: '2022-04-05',
    branchJoiningDate: '2024-05-15',
    birthDate: '1995-09-28', // Next 7 days birthday!
    bloodGroup: 'O+',
    gender: 'Male',
    status: 'Active',
    notes: '',
    transferHistory: []
  },
  {
    id: 'emp-7',
    serialNo: 7,
    area: 'Sitakunda (সীতাকুণ্ড)',
    branch: 'Sitakunda Branch',
    name: 'Rashedul Karim',
    pin: 'SSS-83210',
    designation: 'Assistant Branch Manager',
    mobile: '01855667788',
    email: 'rashed.sitakunda@gmail.com',
    orgJoiningDate: '2021-09-29', // This month anniversary (5th)!
    branchJoiningDate: '2024-01-10',
    birthDate: '1991-07-18',
    bloodGroup: 'B+',
    gender: 'Male',
    status: 'Active',
    notes: '',
    transferHistory: []
  },
  {
    id: 'emp-8',
    serialNo: 8,
    area: 'Patiya (পটিয়া)',
    branch: 'Boalkhali Branch',
    name: 'Farzana Yesmin',
    pin: 'SSS-89456',
    designation: 'Field Officer',
    mobile: '01678123456',
    email: 'farzana.boalkhali@gmail.com',
    orgJoiningDate: '2023-10-12',
    branchJoiningDate: '2023-10-12',
    birthDate: '1997-09-30', // This month birthday!
    bloodGroup: 'B-',
    gender: 'Female',
    status: 'Active',
    notes: '',
    transferHistory: []
  },
  {
    id: 'emp-9',
    serialNo: 9,
    area: 'Chattogram Sadar (সদর)',
    branch: 'Muradpur Branch',
    name: 'Mohammad Shahidul Alam',
    pin: 'SSS-76540',
    designation: 'Branch Manager',
    mobile: '01844998877',
    email: 'shahidul.muradpur@gmail.com',
    orgJoiningDate: '2017-02-14',
    branchJoiningDate: '2022-09-01',
    birthDate: '1985-06-08',
    bloodGroup: 'O-',
    gender: 'Male',
    status: 'Active',
    notes: 'Experienced Branch Manager',
    transferHistory: []
  },
  {
    id: 'emp-10',
    serialNo: 10,
    area: 'Hathazari (হাটহাজারী)',
    branch: 'Fatikchhari Branch',
    name: 'Jannatul Ferdous',
    pin: 'SSS-90342',
    designation: 'Customer Service Officer',
    mobile: '01988776655',
    email: 'jannat.fatikchhari@gmail.com',
    orgJoiningDate: '2024-03-01',
    branchJoiningDate: '2024-03-01',
    birthDate: '1999-12-05',
    bloodGroup: 'A+',
    gender: 'Female',
    status: 'Active',
    notes: '',
    transferHistory: []
  },
  {
    id: 'emp-11',
    serialNo: 11,
    area: 'Sitakunda (সীতাকুণ্ড)',
    branch: 'Mirsharai Branch',
    name: 'Golam Sarwar',
    pin: 'SSS-82194',
    designation: 'Field Officer',
    mobile: '01711002233',
    email: 'sarwar.mirsharai@gmail.com',
    orgJoiningDate: '2020-05-18',
    branchJoiningDate: '2023-04-15',
    birthDate: '1992-03-22',
    bloodGroup: 'AB-',
    gender: 'Male',
    status: 'Active',
    notes: '',
    transferHistory: []
  },
  {
    id: 'emp-12',
    serialNo: 12,
    area: 'Raozan (রাউজান)',
    branch: 'Rangunia Branch',
    name: 'Kamrul Hasan',
    pin: 'SSS-86711',
    designation: 'Accountant',
    mobile: '01822334455',
    email: 'kamrul.rangunia@gmail.com',
    orgJoiningDate: '2022-08-20',
    branchJoiningDate: '2024-06-01',
    birthDate: '1994-10-15',
    bloodGroup: 'B+',
    gender: 'Male',
    status: 'Active',
    notes: '',
    transferHistory: []
  }
];
