-- ============================================================
-- Melody · Tabla de colecciones con RLS
-- Ejecuta este script completo en Supabase → SQL Editor.
-- Es idempotente: puedes volver a ejecutarlo sin romper datos.
-- ============================================================

create extension if not exists pgcrypto;

create table if not exists public.collections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 1 and 80),
  description text check (description is null or char_length(description) <= 280),
  cover_index smallint not null default 0 check (cover_index between 0 and 3),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Índice para listar rápido las colecciones de cada usuario.
create index if not exists collections_user_updated_idx
  on public.collections (user_id, updated_at desc);

-- Mantiene updated_at al día en cada edición.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists collections_set_updated_at on public.collections;

create trigger collections_set_updated_at
  before update on public.collections
  for each row
  execute function public.set_updated_at();

-- ------------------------------------------------------------
-- Seguridad a nivel de fila (RLS)
-- Cada usuario solo puede operar sobre sus propios registros.
-- ------------------------------------------------------------
alter table public.collections enable row level security;

drop policy if exists "collections_select_own" on public.collections;
create policy "collections_select_own"
  on public.collections
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "collections_insert_own" on public.collections;
create policy "collections_insert_own"
  on public.collections
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "collections_update_own" on public.collections;
create policy "collections_update_own"
  on public.collections
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "collections_delete_own" on public.collections;
create policy "collections_delete_own"
  on public.collections
  for delete
  to authenticated
  using (auth.uid() = user_id);

-- Permisos de tabla para el rol autenticado (RLS sigue filtrando filas).
grant select, insert, update, delete on public.collections to authenticated;

-- Los usuarios anónimos no necesitan acceso directo a la tabla.
revoke all on public.collections from anon;
