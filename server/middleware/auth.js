import { supabase, supabaseAdmin } from '../supabaseClient.js';

/**
 * Middleware to authenticate requests using Supabase Auth JWT.
 * It attaches the user profile and role directly from the Supabase Database (profiles table) to req.user.
 */
export const requireAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token de autorización inválido o faltante' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Verify JWT token with Supabase Auth
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({ error: 'Sesión inválida o expirada' });
    }

    // Direct Database Query: Fetch user role directly from Supabase 'profiles' table
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    // Attach user information to request
    req.user = {
      id: user.id,
      email: user.email,
      role: profile?.role || 'cliente',
    };

    next();
  } catch (error) {
    return res.status(500).json({ error: 'Error interno de autenticación' });
  }
};

/**
 * Middleware to restrict route access to Admin users only.
 */
export const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Usuario no autenticado' });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Acceso denegado: se requieren permisos de administrador' });
  }

  next();
};

/**
 * Middleware to restrict route access to Client (and Admin) users only.
 */
export const requireClient = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Usuario no autenticado' });
  }

  if (req.user.role !== 'cliente' && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Acceso denegado: se requiere rol de cliente' });
  }

  next();
};
