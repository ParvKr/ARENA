-- ==========================
-- ARENA V0.1P INITIAL SCHEMA
-- 001_initial_schema.sql
-- ==========================

-- Enable UUID generation
create extension if not exists "pgcrypto";

-- =========================================
-- A) PROFILES (extends Supabase auth.users)
-- =========================================

create table public.profiles (
    user_id         uuid primary key references auth.users(id) on delete cascade,
    username        text unique not null 
                    check (username ~ '^[a-zA-Z0-9_]{3,20}$'),
    display_name    text not null 
                    check (char_length(display_name) between 2 and 60),
    bio             text check (char_length(bio) <= 300),
    avatar_url      text,
    arena_role      text not null default 'competitor' 
                    check (arena_role in ('competitor', 'judge', 'admin')),
    rank_tier       text not null default 'Contender'
                    check (rank_tier in ('Contender', 'Rising', 'Ranked', 'Elite', 'Legend')),
    total_points    integer not null default 0 check (total_points >= 0),
    sprint_count    integer not null default 0 check (sprint_count >= 0),
    created_at      timestamptz not null default now(),
    updated_at      timestamptz not null default now()
);

-- ==========
-- B) SPRINTS
-- ==========

create table public.sprints (
    id              uuid primary key default gen_random_uuid(),
    sprint_number   integer unique not null,
    title           text not null check (char_length(title) between 5 and 120),
    discipline      text not null default 'SPECIAL CATEGORY',
    brief_content   jsonb not null default '{}',
    prize_data      jsonb not null default '{}',
    sprint_status   text not null default 'draft'
                    check (sprint_status in ('draft', 'live', 'judging', 'complete')),
    open_at         timestamptz,
    close_at        timestamptz,
    results_at      timestamptz,
    created_by      uuid references auth.users(id),
    created_at      timestamptz not null default now(),
    updated_at      timestamptz not null default now(),
    
    -- Ensure timeline integrity
    constraint      sprint_dates_valid check (close_at is null or open_at is null or close_at > open_at),
    -- Prevent live/completed sprints from having missing timestamps
    constraint      active_sprint_dates_required check (
                        sprint_status = 'draft' or 
                        (open_at is not null and close_at is not null)
                    )
);

-- ==============
-- C) SUBMISSIONS
-- ==============

create table public.submissions (
    id                      uuid primary key default gen_random_uuid(),
    sprint_id               uuid not null references public.sprints(id) on delete restrict,
    user_id                 uuid not null references auth.users(id) on delete restrict,
    main_file_url           text not null, 
    main_file_type          text not null check (main_file_type in ('image/png', 'image/jpeg', 'application/pdf')),
    process_file_urls       text[] not null default '{}',
    brief_interpretation    text not null check (char_length(brief_interpretation) between 50 and 300),
    tools_used              text not null check (char_length(tools_used) between 1 and 100),
    time_spent_hours        integer not null check (time_spent_hours between 1 and 48),
    note_to_judges          text check (char_length(note_to_judges) <= 500),
    is_disqualified         boolean not null default false,
    disqualify_reason       text,
    disqualified_at         timestamptz,
    disqualified_by         uuid references auth.users(id),
    submitted_at            timestamptz not null default now(),
    
    -- Business Rules Engine
    unique (sprint_id, user_id),
    constraint disqualify_requires_reason check (not is_disqualified or disqualify_reason is not null)
);

-- ======================
-- D) JUDGING ASSIGNMENTS
-- ======================

create table public.judging_assignments (
    id              uuid primary key default gen_random_uuid(),
    sprint_id       uuid not null references public.sprints(id) on delete cascade,
    judge_user_id   uuid not null references auth.users(id) on delete restrict,
    is_complete     boolean not null default false,
    completed_at    timestamptz,
    assigned_at     timestamptz not null default now(),
    unique (sprint_id, judge_user_id)
);

-- =========================
-- E) SCORES
-- =========================

create table public.scores (
    id                uuid primary key default gen_random_uuid(),
    submission_id     uuid not null references public.submissions(id) on delete cascade,
    judge_user_id     uuid not null references auth.users(id) on delete restrict,
    concept_score     smallint not null check (concept_score between 0 and 10),
    craft_score       smallint not null check (craft_score between 0 and 10),
    adherence_score   smallint not null check (adherence_score between 0 and 10),
    originality_score smallint not null check (originality_score between 0 and 10),
    impact_score      smallint not null check (impact_score between 0 and 10),
    feedback          text check (char_length(feedback) >= 10 and char_length(feedback) <= 500),
    raw_total_score   smallint generated always as (concept_score + craft_score + adherence_score + originality_score + impact_score) stored,
    scored_at         timestamptz not null default now(),
    updated_at        timestamptz not null default now(),
    
    unique (submission_id, judge_user_id)
);

-- =========================
-- F) RESULTS (immutable once published)
-- =========================

create table public.results (
    id                  uuid primary key default gen_random_uuid(),
    sprint_id           uuid not null references public.sprints(id) on delete restrict,
    submission_id       uuid not null references public.submissions(id) on delete restrict,
    rank                smallint not null check (rank >= 1),
    normalized_score    numeric(5,2) not null check (normalized_score between 0 and 100),
    points_awarded      smallint not null check (points_awarded >= 0),
    published_at        timestamptz,
    
    unique (sprint_id, submission_id),
    unique (sprint_id, rank)
);

-- =========================
-- G) AUDIT LOG (immutable)
-- =========================

create table public.audit_log (
    id              uuid primary key default gen_random_uuid(),
    actor_id        uuid references auth.users(id),
    actor_action    text not null,
    entity_type     text not null,
    entity_id       uuid,
    metadata        jsonb not null default '{}',
    created_at      timestamptz not null default now()
);

-- AUDIT LOG APPEND ONLY ENGINE
create rule no_update_audit as on update to public.audit_log do instead nothing;
create rule no_delete_audit as on delete to public.audit_log do instead nothing;