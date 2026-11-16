CREATE TABLE IF NOT EXISTS club_articles (
    id SERIAL PRIMARY KEY,

    club_source_id INTEGER NOT NULL
        REFERENCES club_sources(id)
        ON DELETE CASCADE,

    article_url TEXT,

    title TEXT NOT NULL,

    content TEXT,

    published_at TIMESTAMP NULL,

    scraped_at TIMESTAMP NOT NULL DEFAULT NOW(),

    created_at TIMESTAMP NOT NULL DEFAULT NOW(),

    UNIQUE (club_source_id, title)
);

CREATE INDEX IF NOT EXISTS idx_club_articles_club
ON club_articles(club_source_id);

CREATE INDEX IF NOT EXISTS idx_club_articles_scraped
ON club_articles(scraped_at DESC);