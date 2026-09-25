import {
  Controller,
  Get,
  Post,
  Patch,
  Query,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { CommunicationsService } from './communications.service';
import {
  GetFeedbacksDto,
  AnswerFeedbackDto,
  AnswerQuestionDto,
  SendChatMessageDto,
} from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Communications')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.LEAD_ADMIN, Role.ADMIN)
@Controller('communications')
export class CommunicationsController {
  constructor(private readonly commsService: CommunicationsService) {}

  @Get('new-counts')
  async getNewCounts(@Query('storeId') storeId?: string) {
    return this.commsService.getNewFeedbacksQuestionsCount(storeId);
  }

  @Get('questions/count-unanswered')
  async getQuestionsCountUnanswered(@Query('storeId') storeId?: string) {
    return this.commsService.getQuestionsCountUnanswered(storeId);
  }

  @Get('questions')
  async getQuestions(@Query() dto: GetFeedbacksDto) {
    return this.commsService.getQuestions(dto);
  }

  @Get('question/:id')
  async getQuestionById(
    @Query('storeId') storeId: string,
    @Param('id') id: string,
  ) {
    return this.commsService.getQuestionById(storeId, id);
  }

  @Patch('questions')
  async answerQuestion(
    @Query('storeId') storeId: string,
    @Body() dto: AnswerQuestionDto,
  ) {
    return this.commsService.answerQuestion(storeId, dto);
  }

  @Get('feedbacks/count-unanswered')
  async getFeedbacksCountUnanswered(@Query('storeId') storeId?: string) {
    return this.commsService.getFeedbacksCountUnanswered(storeId);
  }

  @Get('feedbacks')
  async getFeedbacks(@Query() dto: GetFeedbacksDto) {
    return this.commsService.getFeedbacks(dto);
  }

  @Get('feedback/:id')
  async getFeedbackById(
    @Query('storeId') storeId: string,
    @Param('id') id: string,
  ) {
    return this.commsService.getFeedbackById(storeId, id);
  }

  @Post('feedbacks/answer')
  async answerFeedback(
    @Query('storeId') storeId: string,
    @Body() dto: AnswerFeedbackDto,
  ) {
    return this.commsService.answerFeedback(storeId, dto);
  }

  @Get('chats')
  async getChats(@Query('storeId') storeId: string) {
    return this.commsService.getChats(storeId);
  }

  @Get('chat/events')
  async getChatEvents(
    @Query('storeId') storeId: string,
    @Query('next') next?: string,
  ) {
    return this.commsService.getChatEvents(
      storeId,
      next ? parseInt(next, 10) : undefined,
    );
  }

  @Post('chat/message')
  async sendChatMessage(
    @Query('storeId') storeId: string,
    @Body() dto: SendChatMessageDto,
  ) {
    return this.commsService.sendChatMessage(storeId, dto);
  }

  @Get('claims')
  async getClaims(
    @Query('storeId') storeId?: string,
    @Query('isArchive') isArchive?: string,
  ) {
    return this.commsService.getClaims(
      storeId,
      isArchive ? isArchive === 'true' : undefined,
    );
  }

  @Patch('claims/:id')
  async patchClaim(
    @Query('storeId') storeId: string,
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
  ) {
    return this.commsService.patchClaim(storeId, id, body);
  }
}
