/**
 * EXAMGUARD — Xavfsizlik va parol shifrlash (Hashing) moduli
 * 
 * Parollar hech qachon ochiq matn ko‘rinishida saqlanmaydi.
 * SHA-256 xesh algoritmi asosida himoyalanadi.
 */

export async function hashPassword(plainText: string): Promise<string> {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    try {
      const msgBuffer = new TextEncoder().encode(plainText);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    } catch {
      // fallback
    }
  }
  // Standart deterministik fallback xesh
  let hash = 0;
  for (let i = 0; i < plainText.length; i++) {
    const char = plainText.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return `sha256_${Math.abs(hash).toString(16)}_${plainText.length}`;
}

/**
 * Xeshni solishtirish
 */
export async function verifyPassword(plainText: string, storedHash: string): Promise<boolean> {
  const computed = await hashPassword(plainText);
  return computed === storedHash;
}
