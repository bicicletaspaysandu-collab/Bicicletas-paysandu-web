/**
 * Front-end email validation helper.
 * Validates syntax format and checks against disposable/fake email domains.
 */

const DISPOSABLE_DOMAINS = new Set([
  "tempmail.com",
  "mailinator.com",
  "10minutemail.com",
  "guerrillamail.com",
  "dispostable.com",
  "throwawaymail.com",
  "yopmail.com",
  "trashmail.com",
  "sharklasers.com",
  "getnada.com",
  "fake.com",
  "test.com",
  "example.com",
  "invalid.com",
  "byom.de",
  "maildrop.cc"
]);

export interface EmailValidationResult {
  valid: boolean;
  error?: string;
}

export function validateEmailFormat(email: string): EmailValidationResult {
  const trimmed = email.trim().toLowerCase();

  // Basic syntax regex check
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(trimmed)) {
    return {
      valid: false,
      error: "Por favor, ingresá una dirección de correo electrónico válida (ej: usuario@dominio.com)."
    };
  }

  const domain = trimmed.split("@")[1];

  if (DISPOSABLE_DOMAINS.has(domain)) {
    return {
      valid: false,
      error: "No se permiten correos electrónicos temporales o de prueba. Por favor, usá tu correo real."
    };
  }

  return { valid: true };
}
