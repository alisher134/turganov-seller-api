import * as bcrypt from 'bcryptjs';
import {
  hashData,
  compareData,
  hashPassword,
  comparePassword,
} from './hash.util';

jest.mock('bcryptjs');

describe('hash utility functions', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('hashData', () => {
    it('should call bcrypt.hash with default salt rounds (10)', async () => {
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_value');

      const result = await hashData('plain_password');

      expect(bcrypt.hash).toHaveBeenCalledWith('plain_password', 10);
      expect(result).toBe('hashed_value');
    });

    it('should call bcrypt.hash with custom salt rounds', async () => {
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_value_custom');

      const result = await hashData('plain_password', 12);

      expect(bcrypt.hash).toHaveBeenCalledWith('plain_password', 12);
      expect(result).toBe('hashed_value_custom');
    });

    it('hashPassword alias should behave identically to hashData', async () => {
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password_alias');

      const result = await hashPassword('plain_password');

      expect(bcrypt.hash).toHaveBeenCalledWith('plain_password', 10);
      expect(result).toBe('hashed_password_alias');
    });
  });

  describe('compareData', () => {
    it('should call bcrypt.compare and return true on match', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await compareData('plain_password', 'hashed_value');

      expect(bcrypt.compare).toHaveBeenCalledWith(
        'plain_password',
        'hashed_value',
      );
      expect(result).toBe(true);
    });

    it('should call bcrypt.compare and return false on mismatch', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await compareData('wrong_password', 'hashed_value');

      expect(bcrypt.compare).toHaveBeenCalledWith(
        'wrong_password',
        'hashed_value',
      );
      expect(result).toBe(false);
    });

    it('comparePassword alias should behave identically to compareData', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await comparePassword('plain_password', 'hashed_value');

      expect(bcrypt.compare).toHaveBeenCalledWith(
        'plain_password',
        'hashed_value',
      );
      expect(result).toBe(true);
    });
  });
});
