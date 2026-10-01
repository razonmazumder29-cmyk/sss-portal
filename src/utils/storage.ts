import { Employee, BranchItem, SettingsConfig, AuditLog, AdminUser } from '../types';
import { 
  INITIAL_AREAS, 
  INITIAL_BRANCHES, 
  INITIAL_DESIGNATIONS, 
  INITIAL_SETTINGS, 
  INITIAL_EMPLOYEES,
  INITIAL_ADMIN_USERS 
} from '../data/initialData';

const STORAGE_KEYS = {
  EMPLOYEES: 'sss_ctg02_employees_v2',
  AREAS: 'sss_ctg02_areas_v2',
  BRANCHES: 'sss_ctg02_branches_v2',
  DESIGNATIONS: 'sss_ctg02_designations_v2',
  SETTINGS: 'sss_ctg02_settings_v2',
  AUDIT_LOGS: 'sss_ctg02_audit_logs_v2',
  THEME: 'sss_ctg02_theme_v2',
  LANGUAGE: 'sss_ctg02_lang_v2',
  ADMIN_USERS: 'sss_ctg02_admin_users_v2',
  CURRENT_USER: 'sss_ctg02_current_user_v2',
  LAST_CLOUD_SYNC: 'sss_ctg02_last_cloud_sync_v2'
};

function secureEncode(data: unknown): string {
  try {
    const jsonStr = JSON.stringify(data);
    return btoa(encodeURIComponent(jsonStr));
  } catch (err) {
    console.error('Encoding error:', err);
    return JSON.stringify(data);
  }
}

function secureDecode<T>(cipher: string, fallback: T): T {
  try {
    if (!cipher) return fallback;
    if (cipher.startsWith('{') || cipher.startsWith('[')) {
      return JSON.parse(cipher) as T;
    }
    const decodedStr = decodeURIComponent(atob(cipher));
    return JSON.parse(decodedStr) as T;
  } catch {
    try {
      return JSON.parse(cipher) as T;
    } catch {
      return fallback;
    }
  }
}

export const StorageService = {
  getEmployees(): Employee[] {
    const raw = localStorage.getItem(STORAGE_KEYS.EMPLOYEES);
    if (!raw) {
      this.saveEmployees(INITIAL_EMPLOYEES);
      return INITIAL_EMPLOYEES;
    }
    return secureDecode<Employee[]>(raw, INITIAL_EMPLOYEES);
  },

  saveEmployees(employees: Employee[]): void {
    localStorage.setItem(STORAGE_KEYS.EMPLOYEES, secureEncode(employees));
  },

  getAreas(): string[] {
    const raw = localStorage.getItem(STORAGE_KEYS.AREAS);
    if (!raw) {
      this.saveAreas(INITIAL_AREAS);
      return INITIAL_AREAS;
    }
    return secureDecode<string[]>(raw, INITIAL_AREAS);
  },

  saveAreas(areas: string[]): void {
    localStorage.setItem(STORAGE_KEYS.AREAS, secureEncode(areas));
  },

  getBranches(): BranchItem[] {
    const raw = localStorage.getItem(STORAGE_KEYS.BRANCHES);
    if (!raw) {
      this.saveBranches(INITIAL_BRANCHES);
      return INITIAL_BRANCHES;
    }
    return secureDecode<BranchItem[]>(raw, INITIAL_BRANCHES);
  },

  saveBranches(branches: BranchItem[]): void {
    localStorage.setItem(STORAGE_KEYS.BRANCHES, secureEncode(branches));
  },

  getDesignations(): string[] {
    const raw = localStorage.getItem(STORAGE_KEYS.DESIGNATIONS);
    if (!raw) {
      this.saveDesignations(INITIAL_DESIGNATIONS);
      return INITIAL_DESIGNATIONS;
    }
    return secureDecode<string[]>(raw, INITIAL_DESIGNATIONS);
  },

  saveDesignations(designations: string[]): void {
    localStorage.setItem(STORAGE_KEYS.DESIGNATIONS, secureEncode(designations));
  },

  getSettings(): SettingsConfig {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) {
      this.saveSettings(INITIAL_SETTINGS);
      return INITIAL_SETTINGS;
    }
    const stored = secureDecode<SettingsConfig>(raw, INITIAL_SETTINGS);
    // সংস্থার নাম সবসময় ডিফল্ট মান থেকে আসবে (পুরনো সংরক্ষিত নাম ওভাররাইড হবে)
    return { ...stored, orgNameBn: INITIAL_SETTINGS.orgNameBn, orgNameEn: INITIAL_SETTINGS.orgNameEn };
  },

  saveSettings(settings: SettingsConfig): void {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, secureEncode(settings));
  },

  getAdminUsers(): AdminUser[] {
    const raw = localStorage.getItem(STORAGE_KEYS.ADMIN_USERS);
    if (!raw) {
      this.saveAdminUsers(INITIAL_ADMIN_USERS);
      return INITIAL_ADMIN_USERS;
    }
    return secureDecode<AdminUser[]>(raw, INITIAL_ADMIN_USERS);
  },

  saveAdminUsers(users: AdminUser[]): void {
    localStorage.setItem(STORAGE_KEYS.ADMIN_USERS, secureEncode(users));
  },

  getCurrentUser(): AdminUser {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (raw) {
      const parsed = secureDecode<AdminUser | null>(raw, null);
      if (parsed) return parsed;
    }
    const all = this.getAdminUsers();
    // Default to Super Admin for immediate management
    return all.find(u => u.role === 'Super Admin') || INITIAL_ADMIN_USERS[0];
  },

  saveCurrentUser(user: AdminUser): void {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, secureEncode(user));
  },

  getAuditLogs(): AuditLog[] {
    const raw = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
    if (!raw) return [];
    return secureDecode<AuditLog[]>(raw, []);
  },

  addAuditLog(log: Omit<AuditLog, 'id' | 'timestamp'>): void {
    const logs = this.getAuditLogs();
    const newEntry: AuditLog = {
      ...log,
      id: 'log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      timestamp: new Date().toISOString()
    };
    logs.unshift(newEntry);
    const trimmed = logs.slice(0, 200);
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, secureEncode(trimmed));
  },

  getTheme(): 'light' | 'dark' {
    return (localStorage.getItem(STORAGE_KEYS.THEME) as 'light' | 'dark') || 'light';
  },

  saveTheme(theme: 'light' | 'dark'): void {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
    if (typeof document !== 'undefined') {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
        document.body?.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
        document.body?.classList.remove('dark');
      }
    }
  },

  getLanguage(): 'bn' | 'en' {
    return (localStorage.getItem(STORAGE_KEYS.LANGUAGE) as 'bn' | 'en') || 'bn';
  },

  saveLanguage(lang: 'bn' | 'en'): void {
    localStorage.setItem(STORAGE_KEYS.LANGUAGE, lang);
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
    }
  },

  createFullBackupJson(): string {
    const backup = {
      version: '3.0',
      exportedAt: new Date().toISOString(),
      organization: 'SSS Chattogram-02',
      employees: this.getEmployees(),
      areas: this.getAreas(),
      branches: this.getBranches(),
      designations: this.getDesignations(),
      settings: this.getSettings(),
      adminUsers: this.getAdminUsers(),
      auditLogs: this.getAuditLogs()
    };
    return JSON.stringify(backup, null, 2);
  },

  restoreBackupJson(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (Array.isArray(data.employees)) {
        this.saveEmployees(data.employees);
      }
      if (Array.isArray(data.areas)) {
        this.saveAreas(data.areas);
      }
      if (Array.isArray(data.branches)) {
        this.saveBranches(data.branches);
      }
      if (Array.isArray(data.designations)) {
        this.saveDesignations(data.designations);
      }
      if (data.settings && typeof data.settings === 'object') {
        this.saveSettings({ ...INITIAL_SETTINGS, ...data.settings });
      }
      if (Array.isArray(data.adminUsers) && data.adminUsers.length > 0) {
        this.saveAdminUsers(data.adminUsers);
      }
      this.addAuditLog({
        action: 'RESTORE',
        performedBy: 'Admin',
        details: `Restored database backup containing ${data.employees?.length || 0} employees`
      });
      return true;
    } catch (err) {
      console.error('Restore failed:', err);
      return false;
    }
  },

  resetToDefaults(): void {
    this.saveEmployees(INITIAL_EMPLOYEES);
    this.saveAreas(INITIAL_AREAS);
    this.saveBranches(INITIAL_BRANCHES);
    this.saveDesignations(INITIAL_DESIGNATIONS);
    this.saveSettings(INITIAL_SETTINGS);
    this.saveAdminUsers(INITIAL_ADMIN_USERS);
    this.addAuditLog({
      action: 'UPDATE',
      performedBy: 'Admin',
      details: 'Reset system to default Chattogram-02 zone database'
    });
  }
};
