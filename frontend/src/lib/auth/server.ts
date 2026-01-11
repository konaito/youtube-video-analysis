import { User } from '@supabase/supabase-js';
import { NextRequest } from 'next/server';
import { createClient } from '../supabase/server';

export const auth = () => {
  return {
    getCurrentUser: async (): Promise<User | null> => {
      try {
        const supabase = await createClient();
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error) {
          console.error('Get user error:', error.message);
          return null;
        }
        
        return user;
      } catch (error) {
        console.error('Server auth error:', error);
        return null;
      }
    },

    getSession: async () => {
      try {
        const supabase = await createClient();
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Get session error:', error.message);
          return null;
        }
        
        return session;
      } catch (error) {
        console.error('Server session error:', error);
        return null;
      }
    },

    getUserFromRequest: async (request: NextRequest): Promise<User | null> => {
      try {
        const supabase = await createClient();
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error) {
          console.error('Get user from request error:', error.message);
          return null;
        }
        
        return user;
      } catch (error) {
        console.error('Request auth error:', error);
        return null;
      }
    },

    requireAuth: async (): Promise<{ user: User | null; error: Response | null }> => {
      try {
        const supabase = await createClient();
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error || !user) {
          return {
            user: null,
            error: new Response(
              JSON.stringify({ error: 'Unauthorized' }),
              {
                status: 401,
                headers: { 'Content-Type': 'application/json' },
              }
            ),
          };
        }
        
        return { user, error: null };
      } catch (error) {
        console.error('Auth requirement check failed:', error);
        return {
          user: null,
          error: new Response(
            JSON.stringify({ error: 'Authentication failed' }),
            {
              status: 500,
              headers: { 'Content-Type': 'application/json' },
            }
          ),
        };
      }
    },

    getAuthenticatedSupabase: async () => {
      const supabase = await createClient();
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) {
        throw new Error('Authentication required');
      }
      
      return { supabase, user };
    },

    getUserId: async (): Promise<string | null> => {
      try {
        const supabase = await createClient();
        const { data: { user }, error } = await supabase.auth.getUser();
        return error || !user ? null : user.id;
      } catch {
        return null;
      }
    },

    isAuthenticated: async (): Promise<boolean> => {
      try {
        const supabase = await createClient();
        const { data: { user }, error } = await supabase.auth.getUser();
        return !error && !!user;
      } catch {
        return false;
      }
    },

    isAdmin: async (): Promise<boolean> => {
      try {
        const supabase = await createClient();
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error || !user) return false;
        
        // Future: check user.app_metadata.role etc.
        // Currently returns false for anonymous users
        return false;
      } catch {
        return false;
      }
    }
  };
};