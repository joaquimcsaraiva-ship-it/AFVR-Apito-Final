BEGIN;

CREATE TABLE IF NOT EXISTS match_sources (
    id SERIAL PRIMARY KEY,

    match_id INTEGER NOT NULL
        REFERENCES matches(id)
        ON DELETE CASCADE,

    source VARCHAR(50) NOT NULL,
    source_priority INTEGER NOT NULL,

    source_url TEXT,

    home_team VARCHAR(180),
    away_team VARCHAR(180),

    home_score INTEGER,
    away_score INTEGER,

    played_at TIMESTAMP,

    collected_at TIMESTAMP NOT NULL DEFAULT NOW(),

    verified BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_match_sources_match
ON match_sources(match_id);

CREATE INDEX IF NOT EXISTS idx_match_sources_source
ON match_sources(source);

ALTER TABLE matches
ADD COLUMN IF NOT EXISTS official_source VARCHAR(50);

ALTER TABLE matches
ADD COLUMN IF NOT EXISTS verification_status VARCHAR(20)
DEFAULT 'official';

ALTER TABLE matches
ADD COLUMN IF NOT EXISTS source_url TEXT;

ALTER TABLE matches
ADD COLUMN IF NOT EXISTS conflict_detected BOOLEAN
DEFAULT FALSE;

COMMIT;