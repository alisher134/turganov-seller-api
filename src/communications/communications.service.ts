import { Injectable, BadRequestException } from '@nestjs/common';
import { WbTokenCategory } from '@prisma/client';
import { WbClientService } from '../wb-client/wb-client.service';
import {
  GetFeedbacksDto,
  AnswerFeedbackDto,
  AnswerQuestionDto,
  SendChatMessageDto,
} from './dto';

@Injectable()
export class CommunicationsService {
  constructor(private readonly wbClient: WbClientService) {}

  // -------------------------------------------------------------
  // Feedbacks & Questions Counters
  // -------------------------------------------------------------

  async getNewFeedbacksQuestionsCount(storeId?: string) {
    if (storeId && storeId !== 'all') {
      return this.wbClient.request({
        storeId,
        service: 'feedbacks',
        path: '/api/v1/new-feedbacks-questions',
        method: 'GET',
        category: WbTokenCategory.FEEDBACKS_QUESTIONS,
      });
    }

    return this.wbClient.executeForAllStores({
      service: 'feedbacks',
      path: '/api/v1/new-feedbacks-questions',
      method: 'GET',
      category: WbTokenCategory.FEEDBACKS_QUESTIONS,
    });
  }

  // -------------------------------------------------------------
  // Questions
  // -------------------------------------------------------------

  async getQuestionsCountUnanswered(storeId?: string) {
    if (storeId && storeId !== 'all') {
      return this.wbClient.request({
        storeId,
        service: 'feedbacks',
        path: '/api/v1/questions/count-unanswered',
        method: 'GET',
        category: WbTokenCategory.FEEDBACKS_QUESTIONS,
      });
    }

    return this.wbClient.executeForAllStores({
      service: 'feedbacks',
      path: '/api/v1/questions/count-unanswered',
      method: 'GET',
      category: WbTokenCategory.FEEDBACKS_QUESTIONS,
    });
  }

  async getQuestions(dto: GetFeedbacksDto) {
    const {
      storeId,
      isAnswered,
      nmId,
      take = 100,
      skip = 0,
      order,
      dateFrom,
      dateTo,
    } = dto;
    const query: Record<string, any> = {
      isAnswered: isAnswered ?? false,
      take,
      skip,
    };
    if (nmId) query.nmId = nmId;
    if (order) query.order = order;
    if (dateFrom) query.dateFrom = dateFrom;
    if (dateTo) query.dateTo = dateTo;

    if (storeId && storeId !== 'all') {
      return this.wbClient.request({
        storeId,
        service: 'feedbacks',
        path: '/api/v1/questions',
        method: 'GET',
        category: WbTokenCategory.FEEDBACKS_QUESTIONS,
        query,
      });
    }

    return this.wbClient.executeForAllStores({
      service: 'feedbacks',
      path: '/api/v1/questions',
      method: 'GET',
      category: WbTokenCategory.FEEDBACKS_QUESTIONS,
      query,
    });
  }

  async getQuestionById(storeId: string, id: string) {
    this.ensureStoreId(storeId);
    return this.wbClient.request({
      storeId,
      service: 'feedbacks',
      path: '/api/v1/question',
      method: 'GET',
      category: WbTokenCategory.FEEDBACKS_QUESTIONS,
      query: { id },
    });
  }

  async answerQuestion(storeId: string, dto: AnswerQuestionDto) {
    this.ensureStoreId(storeId);
    return this.wbClient.request({
      storeId,
      service: 'feedbacks',
      path: '/api/v1/questions',
      method: 'PATCH',
      category: WbTokenCategory.FEEDBACKS_QUESTIONS,
      body: dto,
    });
  }

  // -------------------------------------------------------------
  // Feedbacks
  // -------------------------------------------------------------

  async getFeedbacksCountUnanswered(storeId?: string) {
    if (storeId && storeId !== 'all') {
      return this.wbClient.request({
        storeId,
        service: 'feedbacks',
        path: '/api/v1/feedbacks/count-unanswered',
        method: 'GET',
        category: WbTokenCategory.FEEDBACKS_QUESTIONS,
      });
    }

    return this.wbClient.executeForAllStores({
      service: 'feedbacks',
      path: '/api/v1/feedbacks/count-unanswered',
      method: 'GET',
      category: WbTokenCategory.FEEDBACKS_QUESTIONS,
    });
  }

  async getFeedbacks(dto: GetFeedbacksDto) {
    const {
      storeId,
      isAnswered,
      nmId,
      take = 100,
      skip = 0,
      order,
      dateFrom,
      dateTo,
    } = dto;
    const query: Record<string, any> = {
      isAnswered: isAnswered ?? false,
      take,
      skip,
    };
    if (nmId) query.nmId = nmId;
    if (order) query.order = order;
    if (dateFrom) query.dateFrom = dateFrom;
    if (dateTo) query.dateTo = dateTo;

    if (storeId && storeId !== 'all') {
      return this.wbClient.request({
        storeId,
        service: 'feedbacks',
        path: '/api/v1/feedbacks',
        method: 'GET',
        category: WbTokenCategory.FEEDBACKS_QUESTIONS,
        query,
      });
    }

    return this.wbClient.executeForAllStores({
      service: 'feedbacks',
      path: '/api/v1/feedbacks',
      method: 'GET',
      category: WbTokenCategory.FEEDBACKS_QUESTIONS,
      query,
    });
  }

  async getFeedbackById(storeId: string, id: string) {
    this.ensureStoreId(storeId);
    return this.wbClient.request({
      storeId,
      service: 'feedbacks',
      path: '/api/v1/feedback',
      method: 'GET',
      category: WbTokenCategory.FEEDBACKS_QUESTIONS,
      query: { id },
    });
  }

  async answerFeedback(storeId: string, dto: AnswerFeedbackDto) {
    this.ensureStoreId(storeId);
    return this.wbClient.request({
      storeId,
      service: 'feedbacks',
      path: '/api/v1/feedbacks/answer',
      method: 'POST',
      category: WbTokenCategory.FEEDBACKS_QUESTIONS,
      body: dto,
    });
  }

  // -------------------------------------------------------------
  // Buyer Chats
  // -------------------------------------------------------------

  async getChats(storeId: string) {
    this.ensureStoreId(storeId);
    return this.wbClient.request({
      storeId,
      service: 'chat',
      path: '/api/v1/seller/chats',
      method: 'GET',
      category: WbTokenCategory.BUYER_CHAT,
    });
  }

  async getChatEvents(storeId: string, next?: number) {
    this.ensureStoreId(storeId);
    return this.wbClient.request({
      storeId,
      service: 'chat',
      path: '/api/v1/seller/events',
      method: 'GET',
      category: WbTokenCategory.BUYER_CHAT,
      query: next ? { next } : undefined,
    });
  }

  async sendChatMessage(storeId: string, dto: SendChatMessageDto) {
    this.ensureStoreId(storeId);
    return this.wbClient.request({
      storeId,
      service: 'chat',
      path: '/api/v1/seller/message',
      method: 'POST',
      category: WbTokenCategory.BUYER_CHAT,
      body: dto,
    });
  }

  // -------------------------------------------------------------
  // Claims (Returns)
  // -------------------------------------------------------------

  async getClaims(storeId?: string, isArchive?: boolean) {
    const query: Record<string, any> = {};
    if (isArchive !== undefined) query.is_archive = isArchive;

    if (storeId && storeId !== 'all') {
      return this.wbClient.request({
        storeId,
        service: 'returns',
        path: '/api/v1/claims',
        method: 'GET',
        category: WbTokenCategory.RETURNS,
        query,
      });
    }

    return this.wbClient.executeForAllStores({
      service: 'returns',
      path: '/api/v1/claims',
      method: 'GET',
      category: WbTokenCategory.RETURNS,
      query,
    });
  }

  async patchClaim(storeId: string, claimId: string, body: any) {
    this.ensureStoreId(storeId);
    return this.wbClient.request({
      storeId,
      service: 'returns',
      path: '/api/v1/claim',
      method: 'PATCH',
      category: WbTokenCategory.RETURNS,
      query: { id: claimId },
      body,
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
