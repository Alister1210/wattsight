// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://mwbmhcycfobbncqspwyd.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im13Ym1oY3ljZm9iYm5jcXNwd3lkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMxNjcxMTMsImV4cCI6MjA1ODc0MzExM30.ybyU-ePi_fUgroc3dnEYnpZ90o6mHwmwDbB5Q5sSyAI";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);