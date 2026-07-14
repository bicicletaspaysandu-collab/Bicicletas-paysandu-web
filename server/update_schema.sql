-- Migration Update - Workshop Tracking & Catalog Categories

-- 1. Update Reservations table for workshop tracking
ALTER TABLE public.reservations DROP CONSTRAINT IF EXISTS reservations_status_check;

ALTER TABLE public.reservations 
  ADD CONSTRAINT reservations_status_check 
  CHECK (status IN ('confirmed', 'cancelled', 'ingresada', 'en_diagnostico', 'en_trabajo', 'lista_para_retirar', 'entregada'));

ALTER TABLE public.reservations ADD COLUMN IF NOT EXISTS bike_details JSONB;
ALTER TABLE public.reservations ADD COLUMN IF NOT EXISTS mechanic_notes TEXT;


-- 2. Update Products table for catalog filters and stock tracking
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'bicicleta' CHECK (category IN ('bicicleta', 'accesorio', 'repuesto', 'indumentaria'));
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS stock_status TEXT DEFAULT 'in_stock' CHECK (stock_status IN ('in_stock', 'low_stock', 'out_of_stock', 'on_demand'));
