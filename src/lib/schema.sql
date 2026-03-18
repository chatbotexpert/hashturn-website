-- HashTurn Database Schema
-- Run this once in your Neon dashboard (SQL editor) before deploying.

CREATE TABLE IF NOT EXISTS blog_posts (
  slug        TEXT PRIMARY KEY,
  title       TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  pub_date    TEXT NOT NULL DEFAULT '',
  updated_date TEXT,
  author      TEXT NOT NULL DEFAULT 'HashTurn Team',
  tags        TEXT NOT NULL DEFAULT '[]',   -- JSON array string
  hero_image  TEXT NOT NULL DEFAULT '',
  content     TEXT NOT NULL DEFAULT '',
  noindex     BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS projects (
  slug          TEXT PRIMARY KEY,
  title         TEXT NOT NULL,
  client        TEXT NOT NULL DEFAULT '',
  service       TEXT NOT NULL DEFAULT '',
  tools         TEXT NOT NULL DEFAULT '[]', -- JSON array string
  description   TEXT NOT NULL DEFAULT '',
  results       TEXT NOT NULL DEFAULT '',
  hero_image    TEXT NOT NULL DEFAULT '',
  content       TEXT NOT NULL DEFAULT '',
  featured      BOOLEAN NOT NULL DEFAULT FALSE,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reviews (
  id         TEXT PRIMARY KEY,
  name       TEXT NOT NULL,
  location   TEXT NOT NULL DEFAULT '',
  initials   TEXT NOT NULL DEFAULT '',
  rating     INTEGER NOT NULL DEFAULT 5,
  review_text TEXT NOT NULL DEFAULT '',
  source     TEXT NOT NULL DEFAULT 'Google',
  featured   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS team_members (
  id            TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT '',
  bio           TEXT NOT NULL DEFAULT '',
  avatar        TEXT NOT NULL DEFAULT '',
  avatar_color  TEXT NOT NULL DEFAULT '#22c55e',
  image         TEXT NOT NULL DEFAULT '',
  linkedin      TEXT NOT NULL DEFAULT '',
  display_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS submissions (
  id           TEXT PRIMARY KEY,
  name         TEXT NOT NULL,
  email        TEXT NOT NULL,
  company      TEXT NOT NULL DEFAULT '',
  budget       TEXT NOT NULL DEFAULT '',
  service      TEXT NOT NULL DEFAULT '',
  message      TEXT NOT NULL,
  how          TEXT NOT NULL DEFAULT '',
  tools        TEXT NOT NULL DEFAULT '',
  timeline     TEXT NOT NULL DEFAULT '',
  source       TEXT NOT NULL DEFAULT 'contact',
  status       TEXT NOT NULL DEFAULT 'new',
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
