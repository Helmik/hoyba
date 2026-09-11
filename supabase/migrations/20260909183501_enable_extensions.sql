-- Migration: Enable core PostgreSQL extensions
-- PostGIS for geospatial indexing and distance queries
-- pg_trgm for typo-tolerant trigram similarity search
-- unaccent for accent-insensitive search queries

CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS unaccent WITH SCHEMA extensions;
