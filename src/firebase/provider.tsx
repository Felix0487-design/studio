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
} from 'firebase/auth';
import {
  getFirestore,
  Firestore,
  collection,
  onSnapshot,
  doc,
} from 'firebase/firestore';

import {firebaseConfig} from './config';
import { USERS } from '@/lib/auth';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';
import { errorEmitter } from './error-emitter';
import { FirestorePermissionError } from './errors';

type Vote = {
  optionId: string;
  userName: string;
};

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
      allVotes: Vote[];
      userVote: Vote | null;
      votesLoading: boolean;
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

  // Voting state
  const [allVotes, setAllVotes] = useState<Vote[]>([]);
  const [userVote, setUserVote] = useState<Vote | null>(null);
  const [votesLoading, setVotesLoading] = useState(true);

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

    const unsubscribeAuth = onAuthStateChanged(authInstance, (user) => {
      setUser(user);
      if (user && user.email) {
        const nameFromEmail = user.email.split('@')[0];
        const matchingUser = USERS.find(u => 
            u.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/\s/g, '') === nameFromEmail
        );
        setUserDisplayName(matchingUser || nameFromEmail);
      } else {
        setUserDisplayName(null);
      }
      setIsUserLoading(false);
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!db || !user) {
        setAllVotes([]);
        setUserVote(null);
        setVotesLoading(!db);
        return;
    };

    setVotesLoading(true);

    const votesCol = collection(db, 'votes');
    const unsubscribeAllVotes = onSnapshot(votesCol, (snapshot) => {
      const votesData = snapshot.docs.map(doc => doc.data() as Vote);
      setAllVotes(votesData);
      setVotesLoading(false);
    }, (error) => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({ path: votesCol.path, operation: 'list' }));
      setVotesLoading(false);
    });

    const userVoteDoc = doc(db, 'votes', user.uid);
    const unsubscribeUserVote = onSnapshot(userVoteDoc, (doc) => {
      if (doc.exists()) {
        setUserVote(doc.data() as Vote);
      } else {
        setUserVote(null);
      }
    }, (error) => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({ path: userVoteDoc.path, operation: 'get' }));
    });
    
    return () => {
        unsubscribeAllVotes();
        unsubscribeUserVote();
    };

  }, [db, user]);

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
        allVotes,
        userVote,
        votesLoading,
      }}
    >
      <FirebaseErrorListener />
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
