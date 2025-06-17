
import { User, Session } from '@supabase/supabase-js';
import { ReactNode } from 'react';

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<any>;
}

export interface AuthProviderProps {
  children: ReactNode;
}

export interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
}
