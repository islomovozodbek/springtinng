const fs = require('fs');
const { PROMPTS } = require('../src/data/prompts');

let sql = `
-- Prompts Table
CREATE TABLE IF NOT EXISTS public.prompts (
  id INTEGER PRIMARY KEY,
  text TEXT NOT NULL,
  category TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.prompts ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access" ON public.prompts
  FOR SELECT USING (true);

-- Insert Prompts
INSERT INTO public.prompts (id, text, category) VALUES
`;

const values = PROMPTS.map(p => 
  `(${p.id}, ${JSON.stringify(p.text)}, ${JSON.stringify(p.category)})`
).join(',\n');

sql += values + ';';

fs.writeFileSync('supabase-prompts.sql', sql);
console.log('Successfully generated supabase-prompts.sql');
