CREATE TABLE IF NOT EXISTS channels (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL, slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL DEFAULT '', stream_url TEXT NOT NULL DEFAULT '',
  logo_url TEXT NOT NULL DEFAULT '', category TEXT NOT NULL DEFAULT 'uncategorized',
  country TEXT NOT NULL DEFAULT 'id', featured BOOLEAN NOT NULL DEFAULT false,
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_channels_published ON channels(published);
CREATE INDEX IF NOT EXISTS idx_channels_category ON channels(category);
ALTER TABLE channels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read published channels" ON channels FOR SELECT USING (published = true);
