import { createClient } from './supabase/client';
import { SupabaseClient } from '@supabase/supabase-js';

// Re-export browser client instance proxy for backward compatibility
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop: string) {
    const client = createClient();
    return (client as any)[prop];
  },
});

export { createClient };
