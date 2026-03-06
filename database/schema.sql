-- =========================================================
-- TABLA: menu_items
-- Guarda todos los productos de la carta principal
-- =========================================================
create table if not exists public.menu_items (
  id bigint generated always as identity primary key,
  name text not null,
  description text,
  price numeric(10,2) not null,
  category text not null,
  available boolean not null default true
);

-- =========================================================
-- TABLA: specials
-- Guarda los destacados editables del bar
-- type define qué especial es cada uno
-- =========================================================
create table if not exists public.specials (
  id bigint generated always as identity primary key,
  type text not null unique,
  title text not null,
  description text,
  price numeric(10,2),
  start_time text,
  end_time text,
  updated_at timestamptz not null default now()
);

-- =========================================================
-- DATOS INICIALES PARA specials
-- Esto te deja cargados los 3 bloques editables desde el inicio
-- =========================================================
insert into public.specials (type, title, description, price, start_time, end_time)
values
  ('plato_dia', 'Plato del día', 'Especial del chef', 14.50, '13:00', '16:00'),
  ('menu_semana', 'Menú de la semana', 'Entrante + principal + bebida', 18.90, '13:00', '23:00'),
  ('vino_casa', 'Vino de la casa', 'Copa recomendada', 4.50, '19:00', '23:30')
on conflict (type) do nothing;