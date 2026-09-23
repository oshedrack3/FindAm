PRAGMA foreign_keys = OFF;

DROP TABLE IF EXISTS service_contents;
DROP TABLE IF EXISTS services;
DROP TABLE IF EXISTS organizations;
DROP TABLE IF EXISTS categories;

PRAGMA foreign_keys = ON;


CREATE TABLE categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  status INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE organizations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  website_url TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  status INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE places (
  id TEXT PRIMARY KEY,
  organization_id TEXT,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  phone TEXT,
  email TEXT,
  website_url TEXT,
  opening_hours TEXT,
  latitude REAL,
  longitude REAL,
  status INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (organization_id)
    REFERENCES organizations(id)
    ON DELETE SET NULL
);


CREATE TABLE solutions (
  id TEXT PRIMARY KEY,
  category_id TEXT,
  organization_id TEXT,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL,
  short_description TEXT,
  keywords TEXT,
  status INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id)
    REFERENCES categories(id)
    ON DELETE SET NULL,
  FOREIGN KEY (organization_id)
    REFERENCES organizations(id)
    ON DELETE SET NULL
);


CREATE TABLE solution_contents (
  id TEXT PRIMARY KEY,
  solution_id TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL,
  source_url TEXT,
  verification_status TEXT NOT NULL DEFAULT 'unverified',
  verified_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (solution_id)
    REFERENCES solutions(id)
    ON DELETE CASCADE
);


CREATE TABLE needs (
  id TEXT PRIMARY KEY,
  solution_id TEXT,
  phrase TEXT NOT NULL,
  type TEXT,
  status INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (solution_id)
    REFERENCES solutions(id)
    ON DELETE SET NULL
);


CREATE INDEX idx_solutions_category
ON solutions(category_id);

CREATE INDEX idx_solutions_organization
ON solutions(organization_id);

CREATE INDEX idx_solutions_type
ON solutions(type);

CREATE INDEX idx_solutions_status
ON solutions(status);

CREATE INDEX idx_places_organization
ON places(organization_id);

CREATE INDEX idx_places_state
ON places(state);

CREATE INDEX idx_places_city
ON places(city);

CREATE INDEX idx_places_status
ON places(status);

CREATE INDEX idx_needs_solution
ON needs(solution_id);

CREATE INDEX idx_needs_type
ON needs(type);

CREATE INDEX idx_needs_status
ON needs(status);