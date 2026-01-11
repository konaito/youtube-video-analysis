'use client';

import { User } from '@supabase/supabase-js';
import { createClient } from '../supabase/client';

const supabase = createClient();

export const auth = () => {
  return {
    getCurrentUser: async (): Promise<User | null> => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        console.error('Get user error:', error.message);
        return null;
      }
      return user;
    },
    
    signInAnonymously: async (): Promise<User | null> => {
      try {
        const { data, error } = await supabase.auth.signInAnonymously();
        
        if (error) {
          console.error('Anonymous sign in error:', error.message);
          throw error;
        }

        return data.user;
      } catch (error) {
        console.error('Sign in failed:', error);
        throw error;
      }
    },
    
    signOut: async (): Promise<void> => {
      try {
        const { error } = await supabase.auth.signOut();
        
        if (error) {
          console.error('Sign out error:', error.message);
          throw error;
        }

        console.log('Sign out successful');
      } catch (error) {
        console.error('Sign out failed:', error);
        throw error;
      }
    }
  };
};