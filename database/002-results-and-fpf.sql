ALTER TABLE competitions
  ADD COLUMN IF NOT EXISTS fpf_competition_id BIGINT,
  ADD COLUMN IF NOT EXISTS fpf_season_id INTEGER,
  ADD COLUMN IF NOT EXISTS fpf_association_id INTEGER;

CREATE UNIQUE INDEX IF NOT EXISTS competitions_fpf_competition_id_unique
  ON competitions (fpf_competition_id);

CREATE TABLE IF NOT EXISTS matches (
  id BIGSERIAL PRIMARY KEY,
  competition_id BIGINT NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
  external_id TEXT UNIQUE,
  home_team VARCHAR(180) NOT NULL,
  away_team VARCHAR(180) NOT NULL,
  played_at TIMESTAMPTZ,
  venue VARCHAR(250),
  home_score INTEGER CHECK (home_score IS NULL OR home_score >= 0),
  away_score INTEGER CHECK (away_score IS NULL OR away_score >= 0),
  status VARCHAR(20) NOT NULL DEFAULT 'scheduled'
    CHECK (status IN ('scheduled', 'played', 'postponed', 'cancelled')),
  source VARCHAR(10) NOT NULL DEFAULT 'manual'
    CHECK (source IN ('manual', 'fpf')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS matches_competition_played_at_idx
  ON matches (competition_id, played_at, id);
