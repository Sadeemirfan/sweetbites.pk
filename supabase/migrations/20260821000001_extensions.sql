-- Phase 2 — extensions
-- pgcrypto provides gen_random_uuid(), used as the default for every
-- table's `id` column. Supabase projects ship with this enabled already;
-- this is just belt-and-suspenders for a project created from scratch.
create extension if not exists pgcrypto;
