import { initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

const env = import.meta.env;
const firebaseConfig = {
  apiKey: env["VITE_FIREBASE_API_KEY"] ?? "",
  authDomain: env["VITE_FIREBASE_AUTH_DOMAIN"] ?? "",
  projectId: env["VITE_FIREBASE_PROJECT_ID"] ?? "",
  storageBucket: env["VITE_FIREBASE_STORAGE_BUCKET"] ?? "",
  messagingSenderId: env["VITE_FIREBASE_MESSAGING_SENDER_ID"] ?? "",
  appId: env["VITE_FIREBASE_APP_ID"] ?? "",
};

export const firebaseReady = Boolean(
  firebaseConfig.apiKey && firebaseConfig.authDomain && firebaseConfig.projectId && firebaseConfig.appId,
);

let app: FirebaseApp | null = null;

function firebaseApp(): FirebaseApp | null {
  if (!firebaseReady || typeof window === "undefined") return null;
  if (!app) app = initializeApp(firebaseConfig);
  return app;
}

export function firebaseAuth(): Auth | null {
  const ready = firebaseApp();
  return ready ? getAuth(ready) : null;
}

export function firebaseDb(): Firestore | null {
  const ready = firebaseApp();
  return ready ? getFirestore(ready) : null;
}
