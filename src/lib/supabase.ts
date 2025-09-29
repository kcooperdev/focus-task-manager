import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as
  | string
  | undefined;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let supabase: any;

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
} else {
  // Fallback stub so the app can run without configured Supabase
  // This avoids build/runtime errors in components that import the client.
  const notConfigured = () => new Error("Supabase is not configured");

  // Very small subset used by the app; keep as `any` to avoid type friction.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const stub: any = {
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({
        data: { subscription: { unsubscribe: () => void 0 } },
      }),
      signInWithPassword: async () => ({ data: null, error: notConfigured() }),
      signUp: async () => ({ data: null, error: notConfigured() }),
      signOut: async () => ({ error: null }),
    },
    from: () => ({
      select: async () => ({ data: [], error: notConfigured() }),
      insert: async () => ({ data: null, error: notConfigured() }),
      update: async () => ({ data: null, error: notConfigured() }),
      delete: async () => ({ data: null, error: notConfigured() }),
      eq: () => stub.from(),
      order: () => stub.from(),
    }),
  };

  supabase = stub;
}

export { supabase };
