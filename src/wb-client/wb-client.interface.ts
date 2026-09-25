import { WbTokenCategory } from '@prisma/client';
import { WbServiceType } from './wb-client.constants';

export interface WbRequestOptions {
  storeId: string;
  service: WbServiceType;
  path: string;
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  category?: WbTokenCategory;
  query?: Record<string, string | number | boolean | undefined | null>;
  body?: unknown;
  headers?: Record<string, string>;
  timeoutMs?: number;
}

export interface WbRequestOrAllOptions extends Omit<
  WbRequestOptions,
  'storeId'
> {
  storeId?: string | null;
}

export interface WbMultiStoreResult<T> {
  storeId: string;
  storeName: string;
  success: boolean;
  data?: T;
  error?: string;
  statusCode?: number;
}
