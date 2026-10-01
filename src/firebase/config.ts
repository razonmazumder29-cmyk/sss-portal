import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, initializeFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

const customDbId = (firebaseConfig as { firestoreDatabaseId?: string }).firestoreDatabaseId;

// খালি (undefined) ঘর থাকলেও যেন সেভ ব্যর্থ না হয়, সেজন্য ignoreUndefinedProperties চালু
function createDb(): Firestore {
  try {
    return customDbId
      ? initializeFirestore(app, { ignoreUndefinedProperties: true }, customDbId)
      : initializeFirestore(app, { ignoreUndefinedProperties: true });
  } catch {
    return customDbId ? getFirestore(app, customDbId) : getFirestore(app);
  }
}

export const db: Firestore = createDb();

export const auth: Auth = getAuth(app);
export default app;
