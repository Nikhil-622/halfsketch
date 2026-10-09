import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { firebaseAuth, firebaseDb, firebaseReady } from "./firebase";

export interface CartLine {
  slug: string;
  quantity: number;
}

export interface UserProfile {
  email: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  cart: CartLine[];
}

const emptyProfile = (email = ""): UserProfile => ({
  email,
  name: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  postalCode: "",
  cart: [],
});

interface AuthCtx {
  ready: boolean;
  configured: boolean;
  user: User | null;
  profile: UserProfile | null;
  signInEmail: (email: string, password: string) => Promise<void>;
  signUpEmail: (email: string, password: string, name: string) => Promise<void>;
  signInGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
  saveProfile: (patch: Partial<UserProfile>) => Promise<void>;
  saveCart: (cart: CartLine[]) => Promise<void>;
  loadCart: () => Promise<CartLine[]>;
}

const Ctx = createContext<AuthCtx | null>(null);

function userRef(uid: string) {
  const db = firebaseDb();
  if (!db) throw new Error("Firebase is not configured.");
  return doc(db, "users", uid);
}

function asProfile(data: Record<string, unknown> | undefined, email: string): UserProfile {
  const rawCart = data?.["cart"];
  const cart = Array.isArray(rawCart)
    ? rawCart.flatMap((line) => {
        if (!line || typeof line !== "object") return [];
        const slug = "slug" in line && typeof line.slug === "string" ? line.slug : "";
        const quantity = "quantity" in line ? Number(line.quantity) : 0;
        return slug && quantity > 0 ? [{ slug, quantity }] : [];
      })
    : [];
  const text = (key: string) => (typeof data?.[key] === "string" ? data[key] : "");
  return {
    email: text("email") || email,
    name: text("name"),
    phone: text("phone"),
    address: text("address"),
    city: text("city"),
    state: text("state"),
    postalCode: text("postalCode"),
    cart,
  };
}

async function readProfile(user: User): Promise<UserProfile> {
  const snap = await getDoc(userRef(user.uid));
  if (!snap.exists()) {
    const profile = emptyProfile(user.email ?? "");
    profile.name = user.displayName ?? "";
    await setDoc(userRef(user.uid), profile);
    return profile;
  }
  return asProfile(snap.data(), user.email ?? "");
}

export function authErrorMessage(error: unknown): string {
  const code = error && typeof error === "object" && "code" in error ? String(error.code) : "";
  if (code === "auth/invalid-credential" || code === "auth/wrong-password" || code === "auth/user-not-found") return "That email or password is not right.";
  if (code === "auth/email-already-in-use") return "An account with that email already exists. Sign in instead.";
  if (code === "auth/weak-password") return "Use a password of at least 6 characters.";
  if (code === "auth/invalid-email") return "Enter a valid email address.";
  if (code === "auth/popup-closed-by-user") return "Google sign-in was closed before it finished.";
  if (code === "auth/unauthorized-domain") return "This site is not an authorized domain in Firebase yet.";
  return error instanceof Error ? error.message : "Something went wrong. Please try again.";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const auth = firebaseAuth();
    if (!auth) {
      setReady(true);
      return;
    }
    return onAuthStateChanged(auth, (next) => {
      setUser(next);
      if (!next) {
        setProfile(null);
        setReady(true);
        return;
      }
      readProfile(next)
        .then(setProfile)
        .catch(() => setProfile(emptyProfile(next.email ?? "")))
        .finally(() => setReady(true));
    });
  }, []);

  const signInEmail = useCallback(async (email: string, password: string) => {
    const auth = firebaseAuth();
    if (!auth) throw new Error("Firebase is not configured.");
    await signInWithEmailAndPassword(auth, email.trim(), password);
  }, []);

  const signUpEmail = useCallback(async (email: string, password: string, name: string) => {
    const auth = firebaseAuth();
    if (!auth) throw new Error("Firebase is not configured.");
    const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
    const created = { ...emptyProfile(cred.user.email ?? email.trim()), name: name.trim() };
    await setDoc(userRef(cred.user.uid), created);
    setProfile(created);
  }, []);

  const signInGoogle = useCallback(async () => {
    const auth = firebaseAuth();
    if (!auth) throw new Error("Firebase is not configured.");
    await signInWithPopup(auth, new GoogleAuthProvider());
  }, []);

  const signOutUser = useCallback(async () => {
    const auth = firebaseAuth();
    if (auth) await signOut(auth);
  }, []);

  const saveProfile = useCallback(async (patch: Partial<UserProfile>) => {
    const current = firebaseAuth()?.currentUser;
    if (!current) throw new Error("Sign in to save your details.");
    const email = current.email ?? "";
    await setDoc(userRef(current.uid), { ...patch, email }, { merge: true });
    setProfile((prev) => ({ ...(prev ?? emptyProfile(email)), ...patch, email }));
  }, []);

  const saveCart = useCallback(async (cart: CartLine[]) => {
    const current = firebaseAuth()?.currentUser;
    if (!current) return;
    await setDoc(userRef(current.uid), { cart }, { merge: true });
    setProfile((prev) => (prev ? { ...prev, cart } : prev));
  }, []);

  const loadCart = useCallback(async () => {
    const current = firebaseAuth()?.currentUser;
    if (!current) return [];
    const snap = await getDoc(userRef(current.uid));
    return asProfile(snap.data(), current.email ?? "").cart;
  }, []);

  const value: AuthCtx = {
    ready,
    configured: firebaseReady,
    user,
    profile,
    signInEmail,
    signUpEmail,
    signInGoogle,
    signOutUser,
    saveProfile,
    saveCart,
    loadCart,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
