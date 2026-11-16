CREATE TABLE IF NOT EXISTS match_candidates (
    id SERIAL PRIMARY KEY,

    club_article_id INTEGER NOT NULL
        REFERENCES club_articles(id)
        ON DELETE CASCADE,

    score VARCHAR(20) NOT NULL,

    home_goals INTEGER NOT NULL,
    away_goals INTEGER NOT NULL,

    candidate_type VARCHAR(50),

    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_match_candidates_article
ON match_candidates(club_article_id);