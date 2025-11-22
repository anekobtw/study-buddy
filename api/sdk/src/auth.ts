import { initializeApp, FirebaseApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  onAuthStateChanged,
  User,
  Auth,
} from "firebase/auth";

export interface FirebaseConfig {
  apiKey: string;
  authDomain?: string;
  projectId?: string;
  appId?: string;
}

export type TokenProvider = () => Promise<string | null>;

export class AuthManager {
  private app: FirebaseApp;
  private auth: Auth;
  private currentUser: User | null = null;

  constructor(config: FirebaseConfig) {
    this.app = initializeApp(config);
    this.auth = getAuth(this.app);

    // Track current user
    onAuthStateChanged(this.auth, (u) => {
      this.currentUser = u;
    });
  }

  get firebaseApp(): FirebaseApp {
    return this.app;
  }

  get firebaseAuth(): Auth {
    return this.auth;
  }

  async signInWithEmail(email: string, password: string): Promise<User> {
    const cred = await signInWithEmailAndPassword(this.auth, email, password);
    this.currentUser = cred.user;
    return cred.user;
  }

  async signOut(): Promise<void> {
    await fbSignOut(this.auth);
    this.currentUser = null;
  }

  /** Returns a fresh ID token string suitable for Authorization: Bearer */
  async getIdToken(forceRefresh = false): Promise<string | null> {
    const u = this.auth.currentUser;
    if (!u) return null;
    return await u.getIdToken(forceRefresh);
  }

  /** Utility for consumers that only need a token provider function */
  getTokenProvider(): TokenProvider {
    return async () => this.getIdToken(false);
  }
}
