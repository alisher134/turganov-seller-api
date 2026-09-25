import { BadRequestException } from '@nestjs/common';

/**
 * Returns true if storeId is missing, empty, or equals 'all'.
 */
export function isAllStores(storeId?: string | null): boolean {
  return !storeId || storeId.trim() === '' || storeId.trim() === 'all';
}

/**
 * Validates that a specific storeId is provided (not empty and not 'all').
 * Throws BadRequestException if storeId is missing or 'all'.
 * Returns the validated, trimmed storeId.
 */
export function ensureStoreId(storeId?: string | null): string {
  if (isAllStores(storeId)) {
    throw new BadRequestException(
      'Для этой операции необходимо указать конкретный storeId',
    );
  }
  return storeId!.trim();
}
