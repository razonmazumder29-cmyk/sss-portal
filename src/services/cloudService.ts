import { 
  collection, 
  doc, 
  getDocs, 
  getDoc,
  getDocFromServer,
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  writeBatch,
  query,
  orderBy,
  limit,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { Employee, AdminUser, SettingsConfig, BranchItem, AuditLog, CloudSyncStatus } from '../types';
import { 
  INITIAL_EMPLOYEES, 
  INITIAL_ADMIN_USERS, 
  INITIAL_SETTINGS, 
  INITIAL_AREAS, 
  INITIAL_BRANCHES, 
  INITIAL_DESIGNATIONS 
} from '../data/initialData';
import { StorageService } from '../utils/storage';

// খালি (undefined) মান বাদ দিয়ে ডেটা পরিষ্কার করে, যাতে ক্লাউডে সেভ ব্যর্থ না হয়
const clean = <T,>(value: T): T => JSON.parse(JSON.stringify(value));

export const CloudService = {
  // Listeners
  subscribeEmployees(
    onSuccess: (employees: Employee[]) => void,
    onStatusChange?: (status: CloudSyncStatus) => void
  ) {
    try {
      const colRef = collection(db, 'employees');
      return onSnapshot(
        colRef,
        (snapshot) => {
          if (snapshot.empty) {
            // শুধু একদম নতুন ডেটাবেসে একবার নমুনা ডেটা বসবে।
            // কর্মী তালিকা ফাঁকা করে ফেললে আর নমুনা ডেটা ফিরে আসবে না।
            this.seedInitialDatabase()
              .then((result) => {
                if (result === 'exists') {
                  StorageService.saveEmployees([]);
                  onSuccess([]);
                } else if (result === 'error') {
                  onSuccess(StorageService.getEmployees());
                }
              })
              .catch((err) => console.error('Seed error:', err));
          } else {
            const list: Employee[] = [];
            snapshot.forEach((d) => {
              const data = d.data() as Employee;
              list.push({ ...data, id: d.id });
            });
            // Sort by serialNo
            list.sort((a, b) => (a.serialNo || 0) - (b.serialNo || 0));
            // Cache locally for offline fast fallback
            StorageService.saveEmployees(list);
            onSuccess(list);
          }
          if (onStatusChange) onStatusChange('connected');
        },
        (error) => {
          console.warn('Firestore real-time employee sync notice:', error);
          if (onStatusChange) onStatusChange('offline');
          // Fallback to local cache
          onSuccess(StorageService.getEmployees());
        }
      );
    } catch (err) {
      console.error('Failed to setup employee subscription:', err);
      if (onStatusChange) onStatusChange('offline');
      onSuccess(StorageService.getEmployees());
      return () => {};
    }
  },

  subscribeAdminUsers(onSuccess: (users: AdminUser[]) => void) {
    try {
      const colRef = collection(db, 'adminUsers');
      return onSnapshot(
        colRef,
        (snapshot) => {
          if (snapshot.empty) {
            onSuccess(StorageService.getAdminUsers());
          } else {
            const list: AdminUser[] = [];
            snapshot.forEach((d) => {
              list.push({ ...(d.data() as AdminUser), id: d.id });
            });
            StorageService.saveAdminUsers(list);
            onSuccess(list);
          }
        },
        (err) => {
          console.warn('Firestore adminUsers listener fallback to cache:', err);
          onSuccess(StorageService.getAdminUsers());
        }
      );
    } catch (err) {
      console.error('subscribeAdminUsers error:', err);
      onSuccess(StorageService.getAdminUsers());
      return () => {};
    }
  },

  subscribeSettings(onSuccess: (settings: SettingsConfig) => void) {
    try {
      const docRef = doc(db, 'settings', 'config');
      return onSnapshot(
        docRef,
        (docSnap) => {
          if (docSnap.exists()) {
            const data = {
              ...(docSnap.data() as SettingsConfig),
              orgNameBn: INITIAL_SETTINGS.orgNameBn,
              orgNameEn: INITIAL_SETTINGS.orgNameEn
            } as SettingsConfig;
            StorageService.saveSettings(data);
            onSuccess(data);
          } else {
            onSuccess(StorageService.getSettings());
          }
        },
        (err) => {
          console.warn('Firestore settings listener fallback:', err);
          onSuccess(StorageService.getSettings());
        }
      );
    } catch (err) {
      console.error('subscribeSettings error:', err);
      onSuccess(StorageService.getSettings());
      return () => {};
    }
  },

  subscribeMetadata(
    onSuccess: (data: { areas: string[]; branches: BranchItem[]; designations: string[] }) => void
  ) {
    try {
      const docRef = doc(db, 'metadata', 'structure');
      return onSnapshot(
        docRef,
        (docSnap) => {
          if (docSnap.exists()) {
            const val = docSnap.data() as { areas: string[]; branches: BranchItem[]; designations: string[] };
            if (val.areas) StorageService.saveAreas(val.areas);
            if (val.branches) StorageService.saveBranches(val.branches);
            if (val.designations) StorageService.saveDesignations(val.designations);
            onSuccess({
              areas: val.areas || StorageService.getAreas(),
              branches: val.branches || StorageService.getBranches(),
              designations: val.designations || StorageService.getDesignations()
            });
          } else {
            onSuccess({
              areas: StorageService.getAreas(),
              branches: StorageService.getBranches(),
              designations: StorageService.getDesignations()
            });
          }
        },
        (err) => {
          console.warn('Metadata listener fallback:', err);
          onSuccess({
            areas: StorageService.getAreas(),
            branches: StorageService.getBranches(),
            designations: StorageService.getDesignations()
          });
        }
      );
    } catch (err) {
      console.error('subscribeMetadata error:', err);
      onSuccess({
        areas: StorageService.getAreas(),
        branches: StorageService.getBranches(),
        designations: StorageService.getDesignations()
      });
      return () => {};
    }
  },

  // Auto Seed Database
  async seedInitialDatabase(): Promise<'seeded' | 'exists' | 'error'> {
    try {
      // ডেটাবেসে আগেই সেটিংস থাকলে বোঝা যায় আগে সেটআপ হয়েছে, তাই আর নমুনা ডেটা বসবে না
      const existing = await getDoc(doc(db, 'settings', 'config'));
      if (existing.exists()) return 'exists';

      const batch = writeBatch(db);
      // Seed employees
      INITIAL_EMPLOYEES.forEach((emp) => {
        const ref = doc(db, 'employees', emp.id);
        batch.set(ref, emp);
      });
      // Seed admin users
      INITIAL_ADMIN_USERS.forEach((usr) => {
        const ref = doc(db, 'adminUsers', usr.id);
        batch.set(ref, usr);
      });
      // Seed settings
      const settingsRef = doc(db, 'settings', 'config');
      batch.set(settingsRef, INITIAL_SETTINGS);
      // Seed metadata
      const metaRef = doc(db, 'metadata', 'structure');
      batch.set(metaRef, {
        areas: INITIAL_AREAS,
        branches: INITIAL_BRANCHES,
        designations: INITIAL_DESIGNATIONS
      });

      await batch.commit();
      console.log('Firebase central database successfully seeded with initial SSS Chattogram-02 records!');
      return 'seeded';
    } catch (err) {
      console.error('Error seeding initial Firestore data:', err);
      return 'error';
    }
  },

  // Save / Update Employee
  async saveEmployee(emp: Partial<Employee>, performedBy: string): Promise<string> {
    const id = emp.id || 'emp-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
    const docRef = doc(db, 'employees', id);
    const dataToSave = {
      ...emp,
      id
    };
    await setDoc(docRef, clean(dataToSave), { merge: true });

    // Also record audit log
    await this.logAuditAction({
      action: emp.id ? 'UPDATE' : 'CREATE',
      performedBy,
      details: `${emp.id ? 'Updated' : 'Added'} employee ${emp.name} (${emp.pin}) - ${emp.branch}`,
      employeeId: id,
      employeeName: emp.name
    });

    return id;
  },

  // Delete Employee
  async deleteEmployee(empId: string, empName: string, performedBy: string): Promise<void> {
    const docRef = doc(db, 'employees', empId);
    await deleteDoc(docRef);

    await this.logAuditAction({
      action: 'DELETE',
      performedBy,
      details: `Deleted employee ${empName} (ID: ${empId}) from central database`,
      employeeId: empId,
      employeeName: empName
    });
  },

  // Execute Transfer
  async executeTransfer(
    transferData: {
      employeeId: string;
      newArea: string;
      newBranch: string;
      transferDate: string;
      orderRef?: string;
      reason?: string;
    },
    performedBy: string
  ): Promise<void> {
    const empRef = doc(db, 'employees', transferData.employeeId);
    const snap = await getDoc(empRef);
    if (!snap.exists()) {
      throw new Error('Employee not found in central database');
    }
    const current = snap.data() as Employee;
    const newRecord = {
      id: 'tr-' + Date.now(),
      fromArea: current.area,
      fromBranch: current.branch,
      toArea: transferData.newArea,
      toBranch: transferData.newBranch,
      transferDate: transferData.transferDate,
      orderRef: transferData.orderRef || '',
      reason: transferData.reason || '',
      recordedAt: new Date().toISOString()
    };

    const updatedData: Partial<Employee> = {
      area: transferData.newArea,
      branch: transferData.newBranch,
      branchJoiningDate: transferData.transferDate, // Resets the 3-year branch tenure counter!
      lastTransferDate: transferData.transferDate,
      transferHistory: [newRecord, ...(current.transferHistory || [])]
    };

    await setDoc(empRef, updatedData, { merge: true });

    await this.logAuditAction({
      action: 'TRANSFER',
      performedBy,
      details: `Transferred ${current.name} (${current.pin}) from ${current.branch} to ${transferData.newBranch}`,
      employeeId: current.id,
      employeeName: current.name
    });
  },

  // Save Settings
  async saveSettings(settings: SettingsConfig, performedBy: string): Promise<void> {
    const docRef = doc(db, 'settings', 'config');
    await setDoc(docRef, settings, { merge: true });

    await this.logAuditAction({
      action: 'UPDATE',
      performedBy,
      details: 'Updated zone settings and email directory'
    });
  },

  // Save Metadata (Areas, Branches, Designations)
  async saveMetadata(
    metadata: { areas?: string[]; branches?: BranchItem[]; designations?: string[] },
    performedBy: string
  ): Promise<void> {
    const docRef = doc(db, 'metadata', 'structure');
    await setDoc(docRef, clean(metadata), { merge: true });

    await this.logAuditAction({
      action: 'UPDATE',
      performedBy,
      details: 'Updated administrative dropdown structure in central database'
    });
  },

  // সেভের পরে সার্ভার থেকে পড়ে যাচাই: নতুন তথ্য সত্যিই ক্লাউডে আছে কি না
  async verifyMetadataOnServer(
    metadata: { areas?: string[]; branches?: BranchItem[]; designations?: string[] }
  ): Promise<boolean> {
    const snap = await getDocFromServer(doc(db, 'metadata', 'structure'));
    const data = (snap.data() || {}) as { areas?: string[]; branches?: BranchItem[]; designations?: string[] };
    if (metadata.branches) {
      const ids = new Set((data.branches || []).map((b) => b.id));
      if (!metadata.branches.every((b) => ids.has(b.id))) return false;
    }
    if (metadata.areas) {
      const have = new Set(data.areas || []);
      if (!metadata.areas.every((a) => have.has(a))) return false;
    }
    if (metadata.designations) {
      const have = new Set(data.designations || []);
      if (!metadata.designations.every((d) => have.has(d))) return false;
    }
    return true;
  },

  // Admin User CRUD
  async saveAdminUser(user: AdminUser, performedBy: string): Promise<void> {
    const id = user.id || 'usr-' + Date.now();
    const docRef = doc(db, 'adminUsers', id);
    await setDoc(docRef, { ...user, id }, { merge: true });

    await this.logAuditAction({
      action: user.id ? 'UPDATE' : 'CREATE',
      performedBy,
      details: `${user.id ? 'Updated' : 'Created'} admin user @${user.username} (${user.role})`
    });
  },

  async deleteAdminUser(userId: string, username: string, performedBy: string): Promise<void> {
    const docRef = doc(db, 'adminUsers', userId);
    await deleteDoc(docRef);

    await this.logAuditAction({
      action: 'DELETE',
      performedBy,
      details: `Deleted admin user @${username}`
    });
  },

  // Bulk Import
  async bulkImportEmployees(newEmployees: Partial<Employee>[], performedBy: string): Promise<number> {
    const batch = writeBatch(db);
    let count = 0;
    newEmployees.forEach((emp) => {
      const id = emp.id || 'emp-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
      const ref = doc(db, 'employees', id);
      batch.set(ref, clean({ ...emp, id }), { merge: true });
      count++;
    });
    await batch.commit();

    await this.logAuditAction({
      action: 'CREATE',
      performedBy,
      details: `Bulk imported ${count} employees into central database`
    });

    return count;
  },

  // Audit Logging
  async logAuditAction(log: Omit<AuditLog, 'id' | 'timestamp'>): Promise<void> {
    try {
      const id = 'log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
      const docRef = doc(db, 'auditLogs', id);
      const entry: AuditLog = {
        ...log,
        id,
        timestamp: new Date().toISOString()
      };
      await setDoc(docRef, entry);
      StorageService.addAuditLog(log);
    } catch (err) {
      console.warn('Audit logging note:', err);
      StorageService.addAuditLog(log);
    }
  },

  // Force cloud sync / check connection
  async checkCloudConnection(): Promise<boolean> {
    try {
      const testRef = doc(db, 'settings', 'config');
      await getDoc(testRef);
      return true;
    } catch {
      return false;
    }
  }
};
