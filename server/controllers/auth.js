import dns from 'dns';
import { supabase } from '../supabaseClient.js';

const DISPOSABLE_DOMAINS = new Set([
  'tempmail.com', 'mailinator.com', '10minutemail.com', 'guerrillamail.com',
  'dispostable.com', 'throwawaymail.com', 'yopmail.com', 'trashmail.com',
  'sharklasers.com', 'getnada.com', 'fake.com', 'test.com', 'example.com',
  'invalid.com', 'byom.de', 'maildrop.cc'
]);

async function verifyEmailDomain(email) {
  const trimmed = email ? email.trim().toLowerCase() : '';
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(trimmed)) {
    return { valid: false, error: 'Por favor, ingresá una dirección de correo electrónico válida.' };
  }

  const domain = trimmed.split('@')[1];
  if (DISPOSABLE_DOMAINS.has(domain)) {
    return { valid: false, error: 'No se permiten correos electrónicos temporales o de prueba. Por favor, usá tu correo real.' };
  }

  try {
    const mxRecords = await dns.promises.resolveMx(domain);
    if (!mxRecords || mxRecords.length === 0) {
      return { valid: false, error: `El dominio del correo (${domain}) no tiene servidores de correo activos.` };
    }
    return { valid: true };
  } catch (err) {
    return { valid: false, error: `El dominio del correo (${domain}) no existe o no se pudo verificar.` };
  }
}

export const signup = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'El correo electrónico y la contraseña son requeridos' });
  }

  const domainCheck = await verifyEmailDomain(email);
  if (!domainCheck.valid) {
    return res.status(400).json({ error: domainCheck.error });
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

