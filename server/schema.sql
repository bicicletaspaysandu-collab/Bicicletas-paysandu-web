-- Database Schema - Bicicletas Paysandú

-- 1. Profiles Table (linking to Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'cliente' CHECK (role IN ('cliente', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Allow public read-only access to profiles" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Allow users to update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Trigger to automatically create a profile when a new user signs up in auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (new.id, new.email, 'cliente');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- 2. Products Table (Catalog)
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL CHECK (price >= 0), -- Strictly in USD
  image_url TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'bicicleta' CHECK (category IN ('bicicleta', 'accesorio', 'repuesto', 'indumentaria')),
  stock_status TEXT NOT NULL DEFAULT 'in_stock' CHECK (stock_status IN ('in_stock', 'low_stock', 'out_of_stock', 'on_demand')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Products Policies
CREATE POLICY "Allow public read access to products" ON public.products
  FOR SELECT USING (true);

CREATE POLICY "Allow full access to products for admins only" ON public.products
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );


-- 3. Reservations Table (Bookings via Cal.com)
CREATE TABLE IF NOT EXISTS public.reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  cal_booking_id INTEGER UNIQUE NOT NULL,
  cal_booking_uid TEXT UNIQUE,
  client_email TEXT NOT NULL,
  client_name TEXT NOT NULL,
  service_type TEXT NOT NULL, -- e.g., 'Ajuste y Regulación', 'Servicio Básico', 'Engrase General'
  bike_brand TEXT NOT NULL,
  bike_details JSONB, -- Stores bike model, color, serial serial number, and issues
  reservation_date DATE NOT NULL,
  time_slot TIME NOT NULL,
  price NUMERIC NOT NULL CHECK (price >= 0), -- Calculated price in local currency ($ UYU)
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'ingresada', 'en_diagnostico', 'en_trabajo', 'lista_para_retirar', 'entregada')),
  mechanic_notes TEXT, -- Diagnostic and status notes left by mechanics
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for reservations
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

-- Reservations Policies
CREATE POLICY "Allow users to read their own reservations" ON public.reservations
  FOR SELECT USING (
    auth.uid() = user_id OR 
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Allow system webhook / service role full access" ON public.reservations
  FOR ALL USING (true);
