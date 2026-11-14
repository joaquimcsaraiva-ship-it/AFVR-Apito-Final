	CREATE TABLE IF NOT EXISTS club_sources (
    id SERIAL PRIMARY KEY,

    club_name VARCHAR(150) NOT NULL,

    website_url TEXT NOT NULL,

    facebook_url TEXT,
    instagram_url TEXT,

    active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_club_sources_name
ON club_sources (club_name);