-- Fashion Stock Delivery App — Database Schema
-- Run this in your Supabase SQL editor

-- Users (for login)
create table public.users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  password_hash text not null,
  created_at timestamptz default now()
);

-- Dropdown option tables
create table public.brands (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz default now()
);

create table public.seasons (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz default now()
);

create table public.stores (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz default now()
);

create table public.payment_terms_options (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz default now()
);

create table public.collections (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz default now()
);

-- Main delivery orders table
create table public.delivery_orders (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid references public.brands(id) on delete set null,
  season_id uuid references public.seasons(id) on delete set null,
  store_id uuid references public.stores(id) on delete set null,
  collection_id uuid references public.collections(id) on delete set null,
  payment_terms_id uuid references public.payment_terms_options(id) on delete set null,
  ordered_amount numeric(14,2),
  delivery_amount numeric(14,2),
  actual_delivery_date date,
  deposit_payment numeric(14,2),
  delivery_qty integer,
  payment_status text default 'unpaid' check (payment_status in ('unpaid', 'deposit_paid', 'fully_paid')),
  invoice_date date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
