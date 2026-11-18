CREATE TABLE IF NOT EXISTS standings (
  id BIGSERIAL PRIMARY KEY,
  competition_id BIGINT NOT NULL,
  team_name VARCHAR(180) NOT NULL,
  played INTEGER NOT NULL DEFAULT 0,
  wins INTEGER NOT NULL DEFAULT 0,
  draws INTEGER NOT NULL DEFAULT 0,
  losses INTEGER NOT NULL DEFAULT 0,
  goals_for INTEGER NOT NULL DEFAULT 0,
  goals_against INTEGER NOT NULL DEFAULT 0,
  goal_difference INTEGER NOT NULL DEFAULT 0,
  points INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT standings_unique_team
    UNIQUE (competition_id, team_name),

  CONSTRAINT standings_competition_fk
    FOREIGN KEY (competition_id)
    REFERENCES competitions(id)
    ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_standings_competition
ON standings (competition_id);

CREATE INDEX IF NOT EXISTS idx_standings_points
ON standings (competition_id, points DESC);