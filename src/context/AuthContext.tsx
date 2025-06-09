import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { auth } from '../../firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  onAuthStateChanged,
  UserCredential,
  Auth
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  register: (email: string, password: string) => Promise<UserCredential>;
  login: (email: string, password: string) => Promise<UserCredential>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  register: () => Promise.reject(),
  login: () => Promise.reject(),
  logout: () => Promise.reject(),
  resetPassword: () => Promise.reject()
});

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        console.log('Auth state changed:', firebaseUser?.email); // Add logging
        if (firebaseUser) {
          const userToStore: User = {
            uid: firebaseUser.uid,
            email: firebaseUser.email || '', // Add fallback for null email
            displayName: firebaseUser.displayName || '',
            metadata: {
              creationTime: firebaseUser.metadata.creationTime || '',
              lastSignInTime: firebaseUser.metadata.lastSignInTime || ''
            }
          };
          
          console.log('Setting user in context:', userToStore);
          setUser(userToStore);
          await AsyncStorage.setItem('user', JSON.stringify(userToStore));
        } else {
          console.log('No user, clearing storage');
          setUser(null);
          await AsyncStorage.removeItem('user');
        }
      } catch (error) {
        console.error('Auth state change error:', error);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  // Register, login, logout, and reset password functions
  const register = async (email: string, password: string): Promise<UserCredential> => {
    return createUserWithEmailAndPassword(auth, email, password);
  };

  const login = async (email: string, password: string): Promise<UserCredential> => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const logout = async (): Promise<void> => {
    await signOut(auth);
    await AsyncStorage.removeItem('user');
  };

  const resetPassword = async (email: string): Promise<void> => {
    return sendPasswordResetEmail(auth, email);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        register,
        login,
        logout,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
