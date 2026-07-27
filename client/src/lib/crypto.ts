/**
 * Client-side cryptographic helper to pre-hash passwords before transmission.
 * Uses native Web Crypto API (crypto.subtle.digest).
 */
export async function hashPassword(password: string): Promise<string> {
  if (!password) return "";
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await window.crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  } catch (err) {
    console.warn("Web Crypto API fallback:", err);
    return password;
  }
}
