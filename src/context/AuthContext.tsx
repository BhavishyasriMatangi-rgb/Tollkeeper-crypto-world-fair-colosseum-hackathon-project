import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../lib/types';
import { getStoredUser, saveStoredUser } from '../lib/storage';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  loginAsGuest: () => void;
  loginWithEmail: (email: string, name?: string) => void;
  loginWithPhantom: () => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(() => getStoredUser());

  useEffect(() => {
    saveStoredUser(user);
  }, [user]);

  const loginAsGuest = () => {
    const guestUser: UserProfile = {
      id: `guest_${Date.now()}`,
      name: 'Guest Gatekeeper',
      type: 'guest',
      createdAt: Date.now(),
    };
    setUser(guestUser);
  };

  const loginWithEmail = (email: string, name?: string) => {
    const emailUser: UserProfile = {
      id: `usr_${Date.now()}`,
      email,
      name: name || email.split('@')[0],
      type: 'email',
      createdAt: Date.now(),
    };
    setUser(emailUser);
  };

  const loginWithPhantom = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      const solana = (window as any).solana;
      if (!solana || !solana.isPhantom) {
        return {
          success: false,
          error: 'Phantom wallet extension was not detected in your browser. Install Phantom or continue as guest.',
        };
      }

      const response = await solana.connect();
      const pubkey = response.publicKey.toString();

      const phantomUser: UserProfile = {
        id: `phantom_${pubkey.substring(0, 8)}`,
        name: `${pubkey.substring(0, 4)}...${pubkey.substring(pubkey.length - 4)}`,
        phantomAddress: pubkey,
        type: 'phantom',
        createdAt: Date.now(),
      };

      setUser(phantomUser);
      return { success: true };
    } catch (err: any) {
      return {
        success: false,
        error: err?.message || 'Connection to Phantom was cancelled or rejected.',
      };
    }
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loginAsGuest,
        loginWithEmail,
        loginWithPhantom,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
