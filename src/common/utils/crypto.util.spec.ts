import { encryptToken, decryptToken, maskToken } from './crypto.util';

describe('crypto.util (aes-256-gcm)', () => {
  const secret = 'my-super-secret-test-key';
  const sampleToken = 'wb-token-1234567890abcdefghijklmnopqrstuvwxyz';

  it('should encrypt and decrypt a token correctly using AES-256-GCM', () => {
    const encrypted = encryptToken(sampleToken, secret);
    expect(encrypted).not.toEqual(sampleToken);
    expect(typeof encrypted).toBe('string');
    expect(encrypted.length).toBeGreaterThan(10);

    const decrypted = decryptToken(encrypted, secret);
    expect(decrypted).toEqual(sampleToken);
  });

  it('should produce different ciphertexts for the same plaintext (random salt + IV)', () => {
    const encrypted1 = encryptToken(sampleToken, secret);
    const encrypted2 = encryptToken(sampleToken, secret);
    expect(encrypted1).not.toEqual(encrypted2);

    // But both should decrypt to the same value
    expect(decryptToken(encrypted1, secret)).toEqual(sampleToken);
    expect(decryptToken(encrypted2, secret)).toEqual(sampleToken);
  });

  it('should return empty string for empty input', () => {
    expect(encryptToken('', secret)).toEqual('');
    expect(decryptToken('', secret)).toEqual('');
  });

  it('should return original string if input is not encrypted ciphertext', () => {
    const plain = 'raw-token-not-encrypted';
    const result = decryptToken(plain, secret);
    expect(result).toEqual(plain);
  });

  it('should fail to decrypt with a wrong secret and return ciphertext as-is', () => {
    const encrypted = encryptToken(sampleToken, secret);
    const result = decryptToken(encrypted, 'wrong-secret');
    // GCM auth check will fail, so it falls back to returning ciphertext
    expect(result).toEqual(encrypted);
  });

  it('should handle unicode content', () => {
    const unicode = 'Тестовый токен с юникодом 🔑';
    const encrypted = encryptToken(unicode, secret);
    const decrypted = decryptToken(encrypted, secret);
    expect(decrypted).toEqual(unicode);
  });

  it('should mask a token showing only prefix and suffix', () => {
    const masked = maskToken(sampleToken);
    expect(masked).toEqual('wb-tok...wxyz');
  });

  it('should throw an error if secret is missing or empty', () => {
    expect(() => encryptToken(sampleToken, '')).toThrow(
      'Encryption secret is required',
    );
    expect(() => decryptToken('some-cipher', '')).toThrow(
      'Encryption secret is required',
    );
  });
});
