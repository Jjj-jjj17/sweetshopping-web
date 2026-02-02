-- Create system_logs table for observability
create table system_logs (
  id uuid default uuid_generate_v4() primary key,
  level text not null, -- 'INFO', 'WARN', 'ERROR'
  message text not null,
  context jsonb, -- Extra details
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS: Only Admin can view logs
alter table system_logs enable row level security;

create policy "Admin View Logs" on system_logs
  for select using (auth.role() = 'authenticated');

-- Public can insert logs? (e.g. client side crash)
-- Yes, but maybe restrict to 'anon' role if needed, or just open for now.
create policy "Public Insert Logs" on system_logs
  for insert with check (true);
