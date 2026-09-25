import { Injectable } from '@nestjs/common';
import { WbTokenCategory } from '@prisma/client';
import { WbClientService } from '../../wb-client/wb-client.service';
import { ensureStoreId } from '../../common/utils';
import { GetCardsDto } from '../dto';

@Injectable()
export class CardsService {
  constructor(private readonly wbClient: WbClientService) {}

  async getCards(dto: GetCardsDto) {
    const { storeId, settings } = dto;
    const body = {
      settings: settings || {
        cursor: { limit: 100 },
        filter: { withPhoto: -1 },
      },
    };

    return this.wbClient.requestOrAll({
      storeId,
      service: 'content',
      path: '/content/v2/get/cards/list',
      method: 'POST',
      category: WbTokenCategory.CONTENT,
      body,
    });
  }

  async createCard(storeId: string, cards: Record<string, unknown>[]) {
    ensureStoreId(storeId);
    return this.wbClient.request({
      storeId,
      service: 'content',
      path: '/content/v2/cards/upload',
      method: 'POST',
      category: WbTokenCategory.CONTENT,
      body: cards,
    });
  }

  async updateCard(storeId: string, cards: Record<string, unknown>[]) {
    ensureStoreId(storeId);
    return this.wbClient.request({
      storeId,
      service: 'content',
      path: '/content/v2/cards/update',
      method: 'POST',
      category: WbTokenCategory.CONTENT,
      body: cards,
    });
  }

  async getCardLimits(storeId?: string) {
    return this.wbClient.requestOrAll({
      storeId,
      service: 'content',
      path: '/content/v2/cards/limits',
      method: 'GET',
      category: WbTokenCategory.CONTENT,
    });
  }

  async getCardErrors(storeId?: string, locale: string = 'ru') {
    return this.wbClient.requestOrAll({
      storeId,
      service: 'content',
      path: '/content/v2/cards/error/list',
      method: 'GET',
      category: WbTokenCategory.CONTENT,
      query: { locale },
    });
  }

  async generateBarcodes(storeId: string, count: number = 1) {
    ensureStoreId(storeId);
    return this.wbClient.request({
      storeId,
      service: 'content',
      path: '/content/v2/barcodes',
      method: 'POST',
      category: WbTokenCategory.CONTENT,
      body: { count },
    });
  }
}
