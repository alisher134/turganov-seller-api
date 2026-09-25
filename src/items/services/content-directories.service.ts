import { Injectable } from '@nestjs/common';
import { WbTokenCategory } from '@prisma/client';
import { WbClientService } from '../../wb-client/wb-client.service';
import { ensureStoreId } from '../../common/utils';

@Injectable()
export class ContentDirectoriesService {
  constructor(private readonly wbClient: WbClientService) {}

  async getParentCategories(storeId?: string, locale: string = 'ru') {
    return this.callDirectory(storeId, '/content/v2/object/parent/all', 'GET', {
      locale,
    });
  }

  async getSubjects(
    storeId?: string,
    name?: string,
    limit: number = 1000,
    offset: number = 0,
    parentId?: number,
  ) {
    const query: Record<string, string | number | boolean | undefined | null> =
      { limit, offset };
    if (name) query.name = name;
    if (parentId) query.parentID = parentId;
    return this.callDirectory(
      storeId,
      '/content/v2/object/parent/all',
      'GET',
      query,
    );
  }

  async getAllCategories(
    storeId?: string,
    name?: string,
    limit: number = 1000,
    locale: string = 'ru',
  ) {
    const query: Record<string, string | number | boolean | undefined | null> =
      { limit, locale };
    if (name) query.name = name;
    return this.callDirectory(storeId, '/content/v2/object/all', 'GET', query);
  }

  async getCharacteristics(
    storeId: string,
    subjectId: number,
    locale: string = 'ru',
  ) {
    ensureStoreId(storeId);
    return this.wbClient.request({
      storeId,
      service: 'content',
      path: `/content/v2/object/charcs/${subjectId}`,
      method: 'GET',
      category: WbTokenCategory.CONTENT,
      query: { locale },
    });
  }

  async getColors(storeId?: string, locale: string = 'ru') {
    return this.callDirectory(storeId, '/content/v2/directory/colors', 'GET', {
      locale,
    });
  }

  async getCountries(storeId?: string, locale: string = 'ru') {
    return this.callDirectory(
      storeId,
      '/content/v2/directory/countries',
      'GET',
      { locale },
    );
  }

  async getBrands(storeId?: string, search?: string) {
    const query: Record<string, string | number | boolean | undefined | null> =
      {};
    if (search) query.search = search;
    return this.callDirectory(storeId, '/api/content/v1/brands', 'GET', query);
  }

  async getTags(storeId: string) {
    ensureStoreId(storeId);
    return this.wbClient.request({
      storeId,
      service: 'content',
      path: '/content/v2/tags',
      method: 'GET',
      category: WbTokenCategory.CONTENT,
    });
  }

  async createTag(storeId: string, body: Record<string, unknown>) {
    ensureStoreId(storeId);
    return this.wbClient.request({
      storeId,
      service: 'content',
      path: '/content/v2/tag',
      method: 'POST',
      category: WbTokenCategory.CONTENT,
      body,
    });
  }

  async updateTag(storeId: string, id: number, body: Record<string, unknown>) {
    ensureStoreId(storeId);
    return this.wbClient.request({
      storeId,
      service: 'content',
      path: `/content/v2/tag/${id}`,
      method: 'PATCH',
      category: WbTokenCategory.CONTENT,
      body,
    });
  }

  async deleteTag(storeId: string, id: number) {
    ensureStoreId(storeId);
    return this.wbClient.request({
      storeId,
      service: 'content',
      path: `/content/v2/tag/${id}`,
      method: 'DELETE',
      category: WbTokenCategory.CONTENT,
    });
  }

  private async callDirectory(
    storeId?: string,
    path: string = '',
    method: 'GET' | 'POST' = 'GET',
    query?: Record<string, string | number | boolean | undefined | null>,
  ) {
    return this.wbClient.requestOrAll({
      storeId,
      service: 'content',
      path,
      method,
      category: WbTokenCategory.CONTENT,
      query,
    });
  }
}
