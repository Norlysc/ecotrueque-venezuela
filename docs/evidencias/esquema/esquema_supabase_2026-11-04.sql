-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.spatial_ref_sys (
  srid integer NOT NULL CHECK (srid > 0 AND srid <= 998999),
  auth_name character varying,
  auth_srid integer,
  srtext character varying,
  proj4text character varying,
  CONSTRAINT spatial_ref_sys_pkey PRIMARY KEY (srid)
);
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  email text NOT NULL,
  full_name text NOT NULL,
  avatar_url text,
  phone text,
  city text,
  state text,
  bio text,
  is_verified boolean DEFAULT false,
  eco_points integer DEFAULT 0,
  eco_level text DEFAULT 'seedling'::text CHECK (eco_level = ANY (ARRAY['seedling'::text, 'sprout'::text, 'guardian'::text, 'protector'::text, 'hero'::text, 'legend'::text])),
  reputation_score numeric DEFAULT 0.00,
  total_trades integer DEFAULT 0,
  active_listings_count integer DEFAULT 0,
  co2_saved_kg numeric DEFAULT 0,
  waste_reduced_kg numeric DEFAULT 0,
  push_token text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.listings (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  description text DEFAULT ''::text,
  type text NOT NULL CHECK (type = ANY (ARRAY['good'::text, 'service'::text])),
  category text NOT NULL,
  subcategory text,
  condition text CHECK (condition = ANY (ARRAY['new'::text, 'like_new'::text, 'good'::text, 'fair'::text, 'poor'::text])),
  images jsonb DEFAULT '[]'::jsonb,
  tags ARRAY DEFAULT '{}'::text[],
  looking_for text NOT NULL,
  estimated_value_usd numeric,
  latitude double precision,
  longitude double precision,
  location USER-DEFINED,
  city text,
  state text,
  status text DEFAULT 'active'::text CHECK (status = ANY (ARRAY['active'::text, 'paused'::text, 'traded'::text, 'expired'::text, 'deleted'::text])),
  views_count integer DEFAULT 0,
  favorites_count integer DEFAULT 0,
  eco_impact jsonb DEFAULT '{"co2_saved_kg": 0, "waste_reduced_kg": 0, "estimated_value_usd": 0}'::jsonb,
  search_vector tsvector,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT listings_pkey PRIMARY KEY (id),
  CONSTRAINT listings_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.favorites (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  listing_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT favorites_pkey PRIMARY KEY (id),
  CONSTRAINT favorites_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
  CONSTRAINT favorites_listing_id_fkey FOREIGN KEY (listing_id) REFERENCES public.listings(id)
);
CREATE TABLE public.trade_requests (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  requester_id uuid NOT NULL,
  owner_id uuid NOT NULL,
  requested_listing_id uuid NOT NULL,
  offered_listing_id uuid NOT NULL,
  message text,
  status text DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'accepted'::text, 'rejected'::text, 'cancelled'::text, 'completed'::text])),
  requester_confirmed boolean DEFAULT false,
  owner_confirmed boolean DEFAULT false,
  completed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT trade_requests_pkey PRIMARY KEY (id),
  CONSTRAINT trade_requests_requester_id_fkey FOREIGN KEY (requester_id) REFERENCES public.profiles(id),
  CONSTRAINT trade_requests_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.profiles(id),
  CONSTRAINT trade_requests_requested_listing_id_fkey FOREIGN KEY (requested_listing_id) REFERENCES public.listings(id),
  CONSTRAINT trade_requests_offered_listing_id_fkey FOREIGN KEY (offered_listing_id) REFERENCES public.listings(id)
);
CREATE TABLE public.trades (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  trade_request_id uuid NOT NULL,
  requester_id uuid NOT NULL,
  owner_id uuid NOT NULL,
  requested_listing_id uuid NOT NULL,
  offered_listing_id uuid NOT NULL,
  completed_at timestamp with time zone DEFAULT now(),
  eco_impact_total jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT trades_pkey PRIMARY KEY (id),
  CONSTRAINT trades_trade_request_id_fkey FOREIGN KEY (trade_request_id) REFERENCES public.trade_requests(id),
  CONSTRAINT trades_requester_id_fkey FOREIGN KEY (requester_id) REFERENCES public.profiles(id),
  CONSTRAINT trades_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.profiles(id),
  CONSTRAINT trades_requested_listing_id_fkey FOREIGN KEY (requested_listing_id) REFERENCES public.listings(id),
  CONSTRAINT trades_offered_listing_id_fkey FOREIGN KEY (offered_listing_id) REFERENCES public.listings(id)
);
CREATE TABLE public.conversations (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  trade_request_id uuid,
  participant_1_id uuid NOT NULL,
  participant_2_id uuid NOT NULL,
  last_message_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  listing_id uuid,
  CONSTRAINT conversations_pkey PRIMARY KEY (id),
  CONSTRAINT conversations_trade_request_id_fkey FOREIGN KEY (trade_request_id) REFERENCES public.trade_requests(id),
  CONSTRAINT conversations_participant_1_id_fkey FOREIGN KEY (participant_1_id) REFERENCES public.profiles(id),
  CONSTRAINT conversations_participant_2_id_fkey FOREIGN KEY (participant_2_id) REFERENCES public.profiles(id),
  CONSTRAINT conversations_listing_id_fkey FOREIGN KEY (listing_id) REFERENCES public.listings(id)
);
CREATE TABLE public.messages (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  conversation_id uuid NOT NULL,
  sender_id uuid NOT NULL,
  type text DEFAULT 'text'::text CHECK (type = ANY (ARRAY['text'::text, 'image'::text, 'trade_proposal'::text, 'system'::text])),
  content text,
  image_url text,
  trade_request_id uuid,
  is_read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT messages_pkey PRIMARY KEY (id),
  CONSTRAINT messages_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.conversations(id),
  CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.profiles(id),
  CONSTRAINT messages_trade_request_id_fkey FOREIGN KEY (trade_request_id) REFERENCES public.trade_requests(id)
);
CREATE TABLE public.reviews (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  trade_id uuid NOT NULL,
  reviewer_id uuid NOT NULL,
  reviewed_id uuid NOT NULL,
  rating smallint NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT reviews_pkey PRIMARY KEY (id),
  CONSTRAINT reviews_trade_id_fkey FOREIGN KEY (trade_id) REFERENCES public.trades(id),
  CONSTRAINT reviews_reviewer_id_fkey FOREIGN KEY (reviewer_id) REFERENCES public.profiles(id),
  CONSTRAINT reviews_reviewed_id_fkey FOREIGN KEY (reviewed_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.achievements (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  key text NOT NULL UNIQUE,
  title text NOT NULL,
  description text NOT NULL,
  emoji text NOT NULL,
  points_reward integer DEFAULT 0,
  requirement_type text NOT NULL,
  requirement_value integer NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT achievements_pkey PRIMARY KEY (id)
);
CREATE TABLE public.user_achievements (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  achievement_id uuid NOT NULL,
  unlocked_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_achievements_pkey PRIMARY KEY (id),
  CONSTRAINT user_achievements_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
  CONSTRAINT user_achievements_achievement_id_fkey FOREIGN KEY (achievement_id) REFERENCES public.achievements(id)
);
CREATE TABLE public.safe_spots (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  type text NOT NULL CHECK (type = ANY (ARRAY['police'::text, 'mall'::text, 'metro'::text, 'bank'::text, 'hospital'::text, 'public'::text])),
  address text NOT NULL,
  city text NOT NULL,
  state text NOT NULL,
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  location USER-DEFINED,
  is_24h boolean DEFAULT false,
  phone text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT safe_spots_pkey PRIMARY KEY (id)
);
CREATE TABLE public.notifications (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  type text NOT NULL,
  title text NOT NULL,
  body text NOT NULL,
  data jsonb DEFAULT '{}'::jsonb,
  is_read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT notifications_pkey PRIMARY KEY (id),
  CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.reports (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  reporter_id uuid NOT NULL,
  reported_user_id uuid,
  reported_listing_id uuid,
  reason text NOT NULL,
  description text,
  status text DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'reviewed'::text, 'resolved'::text])),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT reports_pkey PRIMARY KEY (id),
  CONSTRAINT reports_reporter_id_fkey FOREIGN KEY (reporter_id) REFERENCES public.profiles(id),
  CONSTRAINT reports_reported_user_id_fkey FOREIGN KEY (reported_user_id) REFERENCES public.profiles(id),
  CONSTRAINT reports_reported_listing_id_fkey FOREIGN KEY (reported_listing_id) REFERENCES public.listings(id)
);
CREATE TABLE public.v_user_id (
  id uuid
);
CREATE TABLE public.user_blocks (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  blocker_id uuid NOT NULL,
  blocked_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_blocks_pkey PRIMARY KEY (id),
  CONSTRAINT user_blocks_blocker_id_fkey FOREIGN KEY (blocker_id) REFERENCES public.profiles(id),
  CONSTRAINT user_blocks_blocked_id_fkey FOREIGN KEY (blocked_id) REFERENCES public.profiles(id)
);
