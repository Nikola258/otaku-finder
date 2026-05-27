// supabase.js
// Dit bestand maakt de verbinding met je Supabase project.
// Importeer dit bestand overal waar je de database of auth nodig hebt.

import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
);