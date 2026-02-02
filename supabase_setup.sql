-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Create Products Table
create table products (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  price numeric not null,
  image_url text,
  stock_status text default 'IN_STOCK', -- 'IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK'
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Create Orders Table (Cloud Version)
create table orders (
  id uuid default uuid_generate_v4() primary key,
  customer_name text not null,
  customer_phone text not null,
  customer_email text, -- Optional
  shipping_method text default 'PICKUP', -- 'PICKUP', 'DELIVERY', '7-11'
  seven_eleven_address text, -- Store Name + Address
  seven_eleven_store_id text, -- Store ID for logistics (GreenWorld/Neweb)
  items jsonb not null, -- Snapshot of items at time of purchase
  special_requests text,
  status text default 'PENDING',
  total_amount numeric not null, -- MOM-FRIENDLY: Ensure calculations are valid
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Enable Row Level Security (RLS)
alter table products enable row level security;
alter table orders enable row level security;

-- 4. Create Policies
-- Products: Everyone can view active products
create policy "Public Products View" on products
  for select using (is_active = true);

-- Products: Only authenticated users (Admin) can insert/update/delete
create policy "Admin Manage Products" on products
  for all using (auth.role() = 'authenticated');

-- Orders: Everyone can create an order (Guest Checkout)
create policy "Public Create Order" on orders
  for insert with check (true);

-- Orders: Only Admin can view/update all orders
create policy "Admin View Orders" on orders
  for select using (auth.role() = 'authenticated');

create policy "Admin Update Orders" on orders
  for update using (auth.role() = 'authenticated');

-- 5. Storage Bucket Setup
-- Note: You usually create buckets in the Supabase UI.
-- Bucket Name: 'products'
-- Public: true
-- RLS Policy: Public Select, Admin Insert/Update/Delete.
