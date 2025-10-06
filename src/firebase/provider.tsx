// See the 'Firebase Usage Instructions' for more details on working with code scaffolding.
'use client';
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import {initializeApp, getApp, getApps, FirebaseApp} from 'firebase/app';
import {
  getAuth,
  Auth,
  onAuthStateChanged,
  User,
  connectAuthEmulator,
} from 'firebase/auth';
import {
  getFirestore,
  Firestore,
  connectFirestoreEmulator,
} from 'firebase/firestore';

import {firebaseConfig} from './config';
import { USERS } from '@/lib/auth';

/**
 * `FirebaseContext` providers access to the Firebase app instance
 * and authentication state.
 */
const FirebaseContext = createContext<
  | {
      firebaseApp: FirebaseApp;
      auth: Auth;
      db: Firestore;
      user: User | null;
      userDisplayName: string | null;
      isLoading: boolean;
      isUserLoading: boolean;
    }
  | undefined
>(undefined);

/**
 * `FirebaseProvider` is a component that provides the `FirebaseContext`
 * to its children.
 *
 * It is responsible for initializing Firebase and listening for
 * authentication state changes.
 */
export const FirebaseProvider = ({children}: {children: ReactNode}) => {
  const [firebaseApp, setFirebaseApp] = useState<FirebaseApp | null>(null);
  const [auth, setAuth] = useState<Auth | null>(null);
  const [db, setDb] = useState<Firestore | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userDisplayName, setUserDisplayName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUserLoading, setIsUserLoading] = useState(true);

  useEffect(() => {
    let app;
    if (!getApps().length) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApp();
    }

    const authInstance = getAuth(app);
    const dbInstance = getFirestore(app);

    setFirebaseApp(app);
    setAuth(authInstance);
    setDb(dbInstance);
    setIsLoading(false);

    const unsubscribe = onAuthStateChanged(authInstance, (user) => {
      setUser(user);
      if (user && user.email) {
        const nameFromEmail = user.email.split('@')[0];
        const matchingUser = USERS.find(u => 
            u.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() === nameFromEmail
        );
        setUserDisplayName(matchingUser || nameFromEmail);
      } else {
        setUserDisplayName(null);
      }
      setIsUserLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <FirebaseContext.Provider
      value={{
        firebaseApp: firebaseApp!,
        auth: auth!,
        db: db!,
        user,
        userDisplayName,
        isLoading,
        isUserLoading,
      }}
    >
      {children}
    </FirebaseContext.Provider>
  );
};

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
};
