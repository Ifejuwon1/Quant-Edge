import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { doc, onSnapshot, setDoc, collection, query, orderBy, limit } from 'firebase/firestore';
import { auth, db, googleProvider, handleFirestoreError, OperationType } from './firebase';
import { UserProfile, Trade } from './types';

interface FirebaseContextType {
  user: User | null;
  profile: UserProfile | null;
  trades: Trade[];
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

export function FirebaseProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        // Sync Profile
        const profileRef = doc(db, 'users', currentUser.uid);
        const unsubscribeProfile = onSnapshot(profileRef, (docSnap) => {
          if (docSnap.exists()) {
            setProfile(docSnap.data() as UserProfile);
          } else {
            // Create initial profile
            const initialProfile: UserProfile = {
              id: currentUser.uid,
              email: currentUser.email || '',
              displayName: currentUser.displayName || 'Trader',
              accountCapital: 10000,
              currency: 'USD'
            };
            setDoc(profileRef, initialProfile).catch(e => handleFirestoreError(e, OperationType.WRITE, `users/${currentUser.uid}`));
          }
        }, (error) => handleFirestoreError(error, OperationType.GET, `users/${currentUser.uid}`));

        // Sync Trades
        const tradesRef = collection(db, 'users', currentUser.uid, 'trades');
        const tradesQuery = query(tradesRef, orderBy('timestamp', 'desc'));
        const unsubscribeTrades = onSnapshot(tradesQuery, (snapshot) => {
          const tradesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Trade));
          setTrades(tradesData);
        }, (error) => handleFirestoreError(error, OperationType.LIST, `users/${currentUser.uid}/trades`));

        return () => {
          unsubscribeProfile();
          unsubscribeTrades();
        };
      } else {
        setProfile(null);
        setTrades([]);
      }
      setLoading(false);
    });

    return () => unsubscribeAuth();
  }, []);

  const login = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <FirebaseContext.Provider value={{ user, profile, trades, loading, login, logout }}>
      {children}
    </FirebaseContext.Provider>
  );
}

export function useFirebase() {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
}
