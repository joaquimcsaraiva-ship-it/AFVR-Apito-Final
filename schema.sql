--
-- PostgreSQL database dump
--

\restrict S04wlUBvvOczVIdJhSwkZiFOFu2NE1v99EaPlmp6pYoR3b3tfk6FLJ7SoPKXhyn

-- Dumped from database version 18.7
-- Dumped by pg_dump version 18.7

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: club_articles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.club_articles (
    id integer NOT NULL,
    club_source_id integer NOT NULL,
    article_url text,
    title text NOT NULL,
    content text,
    published_at timestamp without time zone,
    scraped_at timestamp without time zone DEFAULT now() NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    category character varying(50)
);


ALTER TABLE public.club_articles OWNER TO postgres;

--
-- Name: club_articles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.club_articles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.club_articles_id_seq OWNER TO postgres;

--
-- Name: club_articles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.club_articles_id_seq OWNED BY public.club_articles.id;


--
-- Name: club_sources; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.club_sources (
    id integer NOT NULL,
    club_name character varying(150) NOT NULL,
    website_url text,
    facebook_url text,
    instagram_url text,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.club_sources OWNER TO postgres;

--
-- Name: club_sources_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.club_sources_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.club_sources_id_seq OWNER TO postgres;

--
-- Name: club_sources_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.club_sources_id_seq OWNED BY public.club_sources.id;


--
-- Name: competitions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.competitions (
    id bigint NOT NULL,
    name character varying(150) NOT NULL,
    season character varying(9) NOT NULL,
    sport character varying(20) NOT NULL,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    fpf_competition_id bigint,
    fpf_season_id integer,
    fpf_association_id integer,
    CONSTRAINT competitions_sport_check CHECK (((sport)::text = ANY ((ARRAY['football'::character varying, 'futsal'::character varying])::text[])))
);


ALTER TABLE public.competitions OWNER TO postgres;

--
-- Name: competitions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.competitions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.competitions_id_seq OWNER TO postgres;

--
-- Name: competitions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.competitions_id_seq OWNED BY public.competitions.id;


--
-- Name: match_candidates; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.match_candidates (
    id integer NOT NULL,
    club_article_id integer NOT NULL,
    score character varying(20) NOT NULL,
    home_goals integer NOT NULL,
    away_goals integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.match_candidates OWNER TO postgres;

--
-- Name: match_candidates_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.match_candidates_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.match_candidates_id_seq OWNER TO postgres;

--
-- Name: match_candidates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.match_candidates_id_seq OWNED BY public.match_candidates.id;


--
-- Name: match_sources; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.match_sources (
    id integer NOT NULL,
    match_id integer NOT NULL,
    source character varying(50) NOT NULL,
    source_priority integer NOT NULL,
    source_url text,
    home_team character varying(180),
    away_team character varying(180),
    home_score integer,
    away_score integer,
    played_at timestamp without time zone,
    collected_at timestamp without time zone DEFAULT now() NOT NULL,
    verified boolean DEFAULT false NOT NULL
);


ALTER TABLE public.match_sources OWNER TO postgres;

--
-- Name: match_sources_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.match_sources_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.match_sources_id_seq OWNER TO postgres;

--
-- Name: match_sources_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.match_sources_id_seq OWNED BY public.match_sources.id;


--
-- Name: matches; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.matches (
    id bigint NOT NULL,
    competition_id bigint NOT NULL,
    external_id text,
    home_team character varying(180) NOT NULL,
    away_team character varying(180) NOT NULL,
    played_at timestamp with time zone,
    venue character varying(250),
    home_score integer,
    away_score integer,
    status character varying(20) DEFAULT 'scheduled'::character varying NOT NULL,
    source character varying(10) DEFAULT 'manual'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    group_name character varying(100),
    official_source character varying(50),
    verification_status character varying(20) DEFAULT 'official'::character varying,
    source_url text,
    conflict_detected boolean DEFAULT false,
    conflict_reasons jsonb,
    CONSTRAINT matches_away_score_check CHECK (((away_score IS NULL) OR (away_score >= 0))),
    CONSTRAINT matches_home_score_check CHECK (((home_score IS NULL) OR (home_score >= 0))),
    CONSTRAINT matches_source_check CHECK (((source)::text = ANY ((ARRAY['manual'::character varying, 'fpf'::character varying])::text[]))),
    CONSTRAINT matches_status_check CHECK (((status)::text = ANY ((ARRAY['scheduled'::character varying, 'played'::character varying, 'postponed'::character varying, 'cancelled'::character varying])::text[])))
);


ALTER TABLE public.matches OWNER TO postgres;

--
-- Name: matches_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.matches_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.matches_id_seq OWNER TO postgres;

--
-- Name: matches_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.matches_id_seq OWNED BY public.matches.id;


--
-- Name: club_articles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.club_articles ALTER COLUMN id SET DEFAULT nextval('public.club_articles_id_seq'::regclass);


--
-- Name: club_sources id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.club_sources ALTER COLUMN id SET DEFAULT nextval('public.club_sources_id_seq'::regclass);


--
-- Name: competitions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.competitions ALTER COLUMN id SET DEFAULT nextval('public.competitions_id_seq'::regclass);


--
-- Name: match_candidates id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.match_candidates ALTER COLUMN id SET DEFAULT nextval('public.match_candidates_id_seq'::regclass);


--
-- Name: match_sources id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.match_sources ALTER COLUMN id SET DEFAULT nextval('public.match_sources_id_seq'::regclass);


--
-- Name: matches id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.matches ALTER COLUMN id SET DEFAULT nextval('public.matches_id_seq'::regclass);


--
-- Name: club_articles club_articles_club_source_id_title_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.club_articles
    ADD CONSTRAINT club_articles_club_source_id_title_key UNIQUE (club_source_id, title);


--
-- Name: club_articles club_articles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.club_articles
    ADD CONSTRAINT club_articles_pkey PRIMARY KEY (id);


--
-- Name: club_sources club_sources_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.club_sources
    ADD CONSTRAINT club_sources_pkey PRIMARY KEY (id);


--
-- Name: competitions competitions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.competitions
    ADD CONSTRAINT competitions_pkey PRIMARY KEY (id);


--
-- Name: match_candidates match_candidates_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.match_candidates
    ADD CONSTRAINT match_candidates_pkey PRIMARY KEY (id);


--
-- Name: match_sources match_sources_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.match_sources
    ADD CONSTRAINT match_sources_pkey PRIMARY KEY (id);


--
-- Name: matches matches_external_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.matches
    ADD CONSTRAINT matches_external_id_key UNIQUE (external_id);


--
-- Name: matches matches_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.matches
    ADD CONSTRAINT matches_pkey PRIMARY KEY (id);


--
-- Name: competitions_fpf_competition_id_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX competitions_fpf_competition_id_unique ON public.competitions USING btree (fpf_competition_id);


--
-- Name: idx_club_articles_club; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_club_articles_club ON public.club_articles USING btree (club_source_id);


--
-- Name: idx_club_articles_scraped; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_club_articles_scraped ON public.club_articles USING btree (scraped_at DESC);


--
-- Name: idx_match_candidates_article; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_match_candidates_article ON public.match_candidates USING btree (club_article_id);


--
-- Name: idx_match_sources_match; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_match_sources_match ON public.match_sources USING btree (match_id);


--
-- Name: idx_match_sources_source; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_match_sources_source ON public.match_sources USING btree (source);


--
-- Name: matches_competition_played_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX matches_competition_played_at_idx ON public.matches USING btree (competition_id, played_at, id);


--
-- Name: ux_club_sources_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ux_club_sources_name ON public.club_sources USING btree (club_name);


--
-- Name: club_articles club_articles_club_source_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.club_articles
    ADD CONSTRAINT club_articles_club_source_id_fkey FOREIGN KEY (club_source_id) REFERENCES public.club_sources(id) ON DELETE CASCADE;


--
-- Name: match_candidates match_candidates_club_article_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.match_candidates
    ADD CONSTRAINT match_candidates_club_article_id_fkey FOREIGN KEY (club_article_id) REFERENCES public.club_articles(id) ON DELETE CASCADE;


--
-- Name: match_sources match_sources_match_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.match_sources
    ADD CONSTRAINT match_sources_match_id_fkey FOREIGN KEY (match_id) REFERENCES public.matches(id) ON DELETE CASCADE;


--
-- Name: matches matches_competition_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.matches
    ADD CONSTRAINT matches_competition_id_fkey FOREIGN KEY (competition_id) REFERENCES public.competitions(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict S04wlUBvvOczVIdJhSwkZiFOFu2NE1v99EaPlmp6pYoR3b3tfk6FLJ7SoPKXhyn

