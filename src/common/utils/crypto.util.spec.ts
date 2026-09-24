import { encryptToken, decryptToken, maskToken } from './crypto.util';

describe('crypto.util (crypto-js)', () => {
  const secret = 'my-super-secret-test-key';
  const sampleToken = 'wb-token-1234567890abcdefghijklmnopqrstuvwxyz';

  it('should encrypt and decrypt a token correctly using crypto-js', () => {
    const encrypted = encryptToken(sampleToken, secret);
    expect(encrypted).not.toEqual(sampleToken);
    expect(typeof encrypted).toBe('string');
    expect(encrypted.length).toBeGreaterThan(10);

    const decrypted = decryptToken(encrypted, secret);
    expect(decrypted).toEqual(sampleToken);
  });

  it('should return original string if input is not encrypted ciphertext', () => {
    const plain = 'raw-token-not-encrypted';
    const result = decryptToken(plain, secret);
    expect(result).toEqual(plain);
  });

  it('should mask a token showing only prefix and suffix', () => {
    const masked = maskToken(sampleToken);
    expect(masked).toEqual('wb-tok...wxyz');
  });

  it('should handle short tokens safely in maskToken', () => {
    expect(maskToken('short')).toEqual('***');
    expect(maskToken('')).toEqual('');
  });
});
