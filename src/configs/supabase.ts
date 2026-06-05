import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mezwaxbsvtvhiyqndsjo.supabase.co';
const supabaseKey = 'sb_publishable_AyMddUtooBaqaaNuBnXuMQ_2GjtZ08D';

export const supabase = createClient(supabaseUrl, supabaseKey);