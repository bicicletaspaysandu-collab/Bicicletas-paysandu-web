export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5001";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

// Supabase devuelve algunos errores de autenticación en inglés;
// se traducen aquí para mantener toda la interfaz en español.
const TRADUCCIONES: Record<string, string> = {
  "Invalid login credentials": "Correo electrónico o contraseña incorrectos",
  "Email not confirmed":
    "Debes confirmar tu correo electrónico antes de iniciar sesión",
  "User already registered": "Ya existe una cuenta con este correo electrónico",
  "Password should be at least 6 characters":
    "La contraseña debe tener al menos 6 caracteres",
  "Password should be at least 6 characters.":
    "La contraseña debe tener al menos 6 caracteres",
  "Unable to validate email address: invalid format":
    "El formato del correo electrónico no es válido",
  "Signup requires a valid password": "Debes ingresar una contraseña válida",
};

export function traducirError(mensaje: string): string {
  return TRADUCCIONES[mensaje] ?? mensaje;
}

interface ApiFetchOptions extends RequestInit {
  token?: string | null;
}

export async function apiFetch<T>(
  path: string,
  { token, headers, ...init }: ApiFetchOptions = {}
): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
    });
  } catch {
    throw new ApiError(
      "No se pudo conectar con el servidor. Verifica que el backend esté en funcionamiento.",
      0
    );
  }

  let body: unknown = null;
  try {
    body = await res.json();
  } catch {
    // respuesta sin cuerpo JSON
  }

  if (!res.ok) {
    const mensaje =
      (body as { error?: string } | null)?.error ??
      "Ocurrió un error inesperado";
    throw new ApiError(traducirError(mensaje), res.status);
  }

  return body as T;
}
