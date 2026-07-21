-- ============================================================
-- BICICLETAS PAYSANDÚ — Asegurar Políticas de Base de Datos
-- Ejecuta este script en el SQL Editor de tu consola de Supabase
-- ============================================================

-- 1. Asegurar Tabla de Perfiles (profiles)
-- Limpiamos todas las políticas antiguas (tanto del otro proyecto como de este)
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow public read-only access to profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow users to read their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow users to update their own profile" ON public.profiles;

-- Creamos las políticas limpias sin recursividad infinita
CREATE POLICY "Allow users to read their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Allow users to update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);


-- 2. Asegurar Tabla de Reservas (reservations)
-- Removemos la política de acceso completo ('USING (true)') que anulaba RLS
DROP POLICY IF EXISTS "Allow system webhook / service role full access" ON public.reservations;


-- 3. Corregir Trigger de Registro de Usuarios
-- El trigger anterior intentaba guardar campos inexistentes (full_name, phone).
-- Esto reescribe la función para guardar correctamente (id, email, role) en 'profiles'.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (new.id, new.email, 'cliente');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- NOTA: Como el servidor Express ahora se conectará usando la clave 'service_role',
-- tendrá acceso completo a todas las tablas ignorando RLS. Por lo tanto, no
-- se requiere ninguna política abierta para que el backend funcione.
-- ============================================================

