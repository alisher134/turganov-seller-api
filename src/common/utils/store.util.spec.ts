import { BadRequestException } from '@nestjs/common';
import { ensureStoreId, isAllStores } from './store.util';

describe('store.util', () => {
  describe('isAllStores', () => {
    it('should return true for undefined, null, empty string, or "all"', () => {
      expect(isAllStores(undefined)).toBe(true);
      expect(isAllStores(null)).toBe(true);
      expect(isAllStores('')).toBe(true);
      expect(isAllStores('   ')).toBe(true);
      expect(isAllStores('all')).toBe(true);
      expect(isAllStores(' all ')).toBe(true);
    });

    it('should return false for valid store IDs', () => {
      expect(isAllStores('store-123')).toBe(false);
      expect(isAllStores('shop-abc')).toBe(false);
    });
  });

  describe('ensureStoreId', () => {
    it('should return trimmed storeId when valid', () => {
      expect(ensureStoreId('store-123')).toBe('store-123');
      expect(ensureStoreId('  store-456  ')).toBe('store-456');
    });

    it('should throw BadRequestException for missing or "all" storeId', () => {
      expect(() => ensureStoreId()).toThrow(BadRequestException);
      expect(() => ensureStoreId(null)).toThrow(BadRequestException);
      expect(() => ensureStoreId('')).toThrow(BadRequestException);
      expect(() => ensureStoreId('all')).toThrow(BadRequestException);
      expect(() => ensureStoreId(' all ')).toThrow(BadRequestException);
    });
  });
});
