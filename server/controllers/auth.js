import { supabase } from '../supabaseClient.js';

export const signup = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'El correo electrónico y la contraseña son requeridos' });
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.status(201).json({ message: 'Usuario registrado exitosamente', user: data.user });
};

export const login = async (req, res) => {
  const { email, password, rawPassword } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'El correo electrónico y la contraseña son requeridos' });
  }

  // 1. Try signing in with the provided password (SHA-256 pre-hashed)
  let { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  // 2. Backward compatibility fallback: If user was registered before pre-hashing and rawPassword is provided
  if (error && rawPassword && rawPassword !== password) {
    const fallbackRes = await supabase.auth.signInWithPassword({
      email,
      password: rawPassword,
    });
    if (!fallbackRes.error && fallbackRes.data) {
      data = fallbackRes.data;
      error = null;
    }
  }

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.status(200).json({
    message: 'Inicio de sesión exitoso',
    session: {
      access_token: data.session?.access_token,
      refresh_token: data.session?.refresh_token,
      expires_at: data.session?.expires_at,
    },
    user: data.user,
  });
};

export const getProfile = async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token de autorización inválido o faltante' });
  }

  const token = authHeader.split(' ')[1];
  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    return res.status(401).json({ error: error?.message || 'Sesión inválida' });
  }

  res.json({ user });
};

