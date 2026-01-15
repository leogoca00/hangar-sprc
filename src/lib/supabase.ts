import { createClient } from '@supabase/supabase-js';

// Variables de entorno - configurar en Vercel
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '⚠️ Supabase no configurado. Configura VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Helper para verificar conexión
export async function checkSupabaseConnection(): Promise<boolean> {
  try {
    const { error } = await supabase.from('camiones').select('id').limit(1);
    return !error;
  } catch {
    return false;
  }
}
