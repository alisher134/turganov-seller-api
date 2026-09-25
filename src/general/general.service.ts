import { Injectable, BadRequestException } from '@nestjs/common';
import { WbTokenCategory } from '@prisma/client';
import { WbClientService } from '../wb-client/wb-client.service';
import { GetNewsDto } from './dto/get-news.dto';

@Injectable()
export class GeneralService {
  constructor(private readonly wbClient: WbClientService) {}

  async ping(storeId?: string) {
    if (storeId && storeId !== 'all') {
      return this.wbClient.pingStore(storeId);
    }
    return this.wbClient.pingAllStores();
  }

  async getSellerInfo(storeId?: string) {
    if (storeId && storeId !== 'all') {
      return this.wbClient.request({
        storeId,
        service: 'common',
        path: '/api/v1/seller-info',
        method: 'GET',
      });
    }

    return this.wbClient.executeForAllStores({
      service: 'common',
      path: '/api/v1/seller-info',
      method: 'GET',
    });
  }

  async getRating(storeId?: string) {
    if (storeId && storeId !== 'all') {
      return this.wbClient.request({
        storeId,
        service: 'feedbacks',
        path: '/api/common/v1/rating',
        method: 'GET',
        category: WbTokenCategory.FEEDBACKS_QUESTIONS,
      });
    }

    return this.wbClient.executeForAllStores({
      service: 'feedbacks',
      path: '/api/common/v1/rating',
      method: 'GET',
      category: WbTokenCategory.FEEDBACKS_QUESTIONS,
    });
  }

  async getNews(dto: GetNewsDto) {
    const { storeId, from, fromId } = dto;
    const query: Record<string, string> = {};
    if (from) query['from'] = from;
    if (fromId) query['fromID'] = fromId;

    if (storeId && storeId !== 'all') {
      return this.wbClient.request({
        storeId,
        service: 'common',
        path: '/api/communications/v2/news',
        method: 'GET',
        query,
      });
    }

    return this.wbClient.executeForAllStores({
      service: 'common',
      path: '/api/communications/v2/news',
      method: 'GET',
      query,
    });
  }

  async getSubscriptions(storeId?: string) {
    if (storeId && storeId !== 'all') {
      return this.wbClient.request({
        storeId,
        service: 'common',
        path: '/api/common/v1/subscriptions',
        method: 'GET',
      });
    }

    return this.wbClient.executeForAllStores({
      service: 'common',
      path: '/api/common/v1/subscriptions',
      method: 'GET',
    });
  }

  async getTariffConstructorOptions(storeId?: string) {
    if (storeId && storeId !== 'all') {
      return this.wbClient.request({
        storeId,
        service: 'common',
        path: '/api/common/v1/tariff-constructor/options',
        method: 'GET',
      });
    }

    return this.wbClient.executeForAllStores({
      service: 'common',
      path: '/api/common/v1/tariff-constructor/options',
      method: 'GET',
    });
  }

  async getWbUsers(storeId: string, isInviteOnly?: boolean) {
    if (!storeId || storeId === 'all') {
      throw new BadRequestException(
        'Для управления пользователями укажите конкретный storeId',
      );
    }

    return this.wbClient.request({
      storeId,
      service: 'userManagement',
      path: '/api/v1/users',
      method: 'GET',
      query: isInviteOnly !== undefined ? { isInviteOnly } : undefined,
    });
  }

  async inviteWbUser(storeId: string, body: Record<string, unknown>) {
    if (!storeId || storeId === 'all') {
      throw new BadRequestException(
        'Для создания приглашения укажите конкретный storeId',
      );
    }

    return this.wbClient.request({
      storeId,
      service: 'userManagement',
      path: '/api/v1/invite',
      method: 'POST',
      body,
    });
  }

  async deleteWbUser(storeId: string, userId: string) {
    if (!storeId || storeId === 'all') {
      throw new BadRequestException(
        'Для удаления пользователя укажите конкретный storeId',
      );
    }

    return this.wbClient.request({
      storeId,
      service: 'userManagement',
      path: '/api/v1/user',
      method: 'DELETE',
      query: { id: userId },
    });
  }
}
