import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  scryptSync,
} from 'node:crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const SALT_LENGTH = 32;
const KEY_LENGTH = 32;

/**
 * Derives a 256-bit key from a passphrase using scrypt.
 * Salt is stored alongside the ciphertext for decryption.
 */
function deriveKey(secret: string, salt: Buffer): Buffer {
  return scryptSync(secret, salt, KEY_LENGTH);
}

/**
 * Encrypts a plaintext string using AES-256-GCM.
 *
 * Output format: base64(salt:iv:authTag:ciphertext)
 * - salt (32 bytes) — unique per encryption for key derivation
 * - iv (16 bytes) — initialization vector
 * - authTag (16 bytes) — GCM authentication tag
 * - ciphertext — encrypted data
 */
export function encryptToken(plainText: string, secret: string): string {
  if (!plainText) return '';
  if (!secret) {
    throw new Error('Encryption secret is required for token encryption');
  }

  const salt = randomBytes(SALT_LENGTH);
  const key = deriveKey(secret, salt);
  const iv = randomBytes(IV_LENGTH);

  const cipher = createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([
    cipher.update(plainText, 'utf8'),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  // Pack: salt + iv + authTag + ciphertext → base64
  const packed = Buffer.concat([salt, iv, authTag, encrypted]);
  return packed.toString('base64');
}

/**
 * Decrypts a ciphertext produced by `encryptToken`.
 *
 * Also handles legacy CryptoJS AES-CBC ciphertext (base64 starting with "U2Fsd")
 * for backwards compatibility during migration. Legacy tokens will be returned
 * as-is if they cannot be decrypted with the new format — they should be
 * re-encrypted on next token update.
 */
export function decryptToken(cipherText: string, secret: string): string {
  if (!cipherText) return '';
  if (!secret) {
    throw new Error('Encryption secret is required for token decryption');
  }

  try {
    const packed = Buffer.from(cipherText, 'base64');

    // Minimum size: salt(32) + iv(16) + authTag(16) + at least 1 byte of data
    if (packed.length < SALT_LENGTH + IV_LENGTH + AUTH_TAG_LENGTH + 1) {
      // Too short — likely a raw token or legacy format
      return cipherText;
    }

    const salt = packed.subarray(0, SALT_LENGTH);
    const iv = packed.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
    const authTag = packed.subarray(
      SALT_LENGTH + IV_LENGTH,
      SALT_LENGTH + IV_LENGTH + AUTH_TAG_LENGTH,
    );
    const encrypted = packed.subarray(
      SALT_LENGTH + IV_LENGTH + AUTH_TAG_LENGTH,
    );

    const key = deriveKey(secret, salt);
    const decipher = createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]);

    return decrypted.toString('utf8');
  } catch {
    // If decryption fails (e.g. legacy CryptoJS format or raw token),
    // return as-is — the caller should handle re-encryption
    return cipherText;
  }
}

/**
 * Masks a token for safe display: shows first 6 and last 4 characters.
 */
export function maskToken(token: string): string {
  if (!token) return '';
  const raw = token.trim();
  if (raw.length <= 10) {
    return '***';
  }
  return `${raw.slice(0, 6)}...${raw.slice(-4)}`;
}
