ALTER TABLE standings
ADD COLUMN IF NOT EXISTS group_name VARCHAR(100);

ALTER TABLE standings
DROP CONSTRAINT IF EXISTS standings_unique_team;

ALTER TABLE standings
ADD CONSTRAINT standings_unique_team
UNIQUE (
  competition_id,
  group_name,
  team_name
);