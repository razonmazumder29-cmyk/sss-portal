import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

const customDbId = (firebaseConfig as { firestoreDatabaseId?: string }).firestoreDatabaseId;

export const db: Firestore = customDbId
  ? getFirestore(app, customDbId)
  : getFirestore(app);

export const auth: Auth = getAuth(app);
export default app;
