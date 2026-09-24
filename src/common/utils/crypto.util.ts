import * as CryptoJS from 'crypto-js';

const DEFAULT_SECRET =
  process.env.TOKEN_ENCRYPTION_KEY ||
  process.env.JWT_SECRET ||
  'default-turganov-seller-secret-key-32b';

export function encryptToken(
  plainText: string,
  secret: string = DEFAULT_SECRET,
): string {
  if (!plainText) return '';
  return CryptoJS.AES.encrypt(plainText, secret).toString();
}

export function decryptToken(
  cipherText: string,
  secret: string = DEFAULT_SECRET,
): string {
  if (!cipherText) return '';
  try {
    const bytes = CryptoJS.AES.decrypt(cipherText, secret);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    return decrypted || cipherText;
  } catch {
    return cipherText;
  }
}

export function maskToken(token: string): string {
  if (!token) return '';
  const raw = token.trim();
  if (raw.length <= 10) {
    return '***';
  }
  return `${raw.slice(0, 6)}...${raw.slice(-4)}`;
}
