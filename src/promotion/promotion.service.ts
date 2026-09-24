import { Injectable, BadRequestException } from '@nestjs/common';
import { WbTokenCategory } from '@prisma/client';
import { WbClientService } from '../wb-client/wb-client.service';
import { GetAdvertsDto } from './dto/get-adverts.dto';

@Injectable()
export class PromotionService {
  constructor(private readonly wbClient: WbClientService) {}

  async getPromotionCount(storeId?: string) {
    if (storeId && storeId !== 'all') {
      return this.wbClient.request({
        storeId,
        service: 'promotion',
        path: '/adv/v1/promotion/count',
        method: 'GET',
        category: WbTokenCategory.ADVERTS,
      });
    }

    return this.wbClient.executeForAllStores({
      service: 'promotion',
      path: '/adv/v1/promotion/count',
      method: 'GET',
      category: WbTokenCategory.ADVERTS,
    });
  }

  async getAdverts(dto: GetAdvertsDto) {
    const { storeId, statuses, paymentType } = dto;
    const query: Record<string, any> = {};
    if (statuses) query.statuses = statuses;
    if (paymentType) query.payment_type = paymentType;

    if (storeId && storeId !== 'all') {
      return this.wbClient.request({
        storeId,
        service: 'promotion',
        path: '/api/advert/v2/adverts',
        method: 'GET',
        category: WbTokenCategory.ADVERTS,
        query,
      });
    }

    return this.wbClient.executeForAllStores({
      service: 'promotion',
      path: '/api/advert/v2/adverts',
      method: 'GET',
      category: WbTokenCategory.ADVERTS,
      query,
    });
  }

  async getBalance(storeId?: string) {
    if (storeId && storeId !== 'all') {
      return this.wbClient.request({
        storeId,
        service: 'promotion',
        path: '/adv/v1/balance',
        method: 'GET',
        category: WbTokenCategory.ADVERTS,
      });
    }

    return this.wbClient.executeForAllStores({
      service: 'promotion',
      path: '/adv/v1/balance',
      method: 'GET',
      category: WbTokenCategory.ADVERTS,
    });
  }

  async getBudget(storeId: string, campaignId: number) {
    this.ensureStoreId(storeId);
    return this.wbClient.request({
      storeId,
      service: 'promotion',
      path: '/adv/v1/budget',
      method: 'GET',
      category: WbTokenCategory.ADVERTS,
      query: { id: campaignId },
    });
  }

  async startCampaign(storeId: string, campaignId: number) {
    this.ensureStoreId(storeId);
    return this.wbClient.request({
      storeId,
      service: 'promotion',
      path: '/adv/v0/start',
      method: 'GET',
      category: WbTokenCategory.ADVERTS,
      query: { id: campaignId },
    });
  }

  async pauseCampaign(storeId: string, campaignId: number) {
    this.ensureStoreId(storeId);
    return this.wbClient.request({
      storeId,
      service: 'promotion',
      path: '/adv/v0/pause',
      method: 'GET',
      category: WbTokenCategory.ADVERTS,
      query: { id: campaignId },
    });
  }

  async stopCampaign(storeId: string, campaignId: number) {
    this.ensureStoreId(storeId);
    return this.wbClient.request({
      storeId,
      service: 'promotion',
      path: '/adv/v0/stop',
      method: 'GET',
      category: WbTokenCategory.ADVERTS,
      query: { id: campaignId },
    });
  }

  async getFullStats(storeId: string, dates: string[]) {
    this.ensureStoreId(storeId);
    return this.wbClient.request({
      storeId,
      service: 'promotion',
      path: '/adv/v3/fullstats',
      method: 'POST',
      category: WbTokenCategory.ADVERTS,
      body: dates.map((d) => ({ dates: [d] })),
    });
  }

  async getPromotionsCalendar(storeId?: string) {
    if (storeId && storeId !== 'all') {
      return this.wbClient.request({
        storeId,
        service: 'prices',
        path: '/api/v1/calendar/promotions',
        method: 'GET',
        category: WbTokenCategory.PRICES,
      });
    }

    return this.wbClient.executeForAllStores({
      service: 'prices',
      path: '/api/v1/calendar/promotions',
      method: 'GET',
      category: WbTokenCategory.PRICES,
    });
  }

  private ensureStoreId(storeId?: string) {
    if (!storeId || storeId === 'all') {
      throw new BadRequestException(
        'Для этой операции необходимо указать конкретный storeId',
      );
    }
  }
}
