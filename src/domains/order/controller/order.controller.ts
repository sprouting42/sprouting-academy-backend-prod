import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { BaseController } from '@/common/controllers/base.controller';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { CurrentLanguage } from '@/common/decorators/language.decorator';
import { ApiDocLanguageHeader } from '@/common/docs/api-language-header.doc';
import { AuthenticationGuard } from '@/common/guards/authentication.guard';
import { ResponseContent } from '@/common/response/response-content';
import { API_CONTROLLER_CONFIG } from '@/constants/api-controller';
import { CreateOrderRequestBody } from '@/domains/order/controller/contracts/create-order.request';
import { CreateOrderResponse } from '@/domains/order/controller/contracts/create-order.response';
import { OrderResponse } from '@/domains/order/controller/contracts/order.response';
import { ApiDocCreateOrder } from '@/domains/order/controller/docs/order-create-order';
import type { IOrderService } from '@/domains/order/services/interfaces/order.service.interface';
import { OrderService } from '@/domains/order/services/order.service';
import { Language } from '@/enums/language.enum';

@UseGuards(AuthenticationGuard)
@ApiTags(API_CONTROLLER_CONFIG.ORDER?.TAG ?? 'Order')
@ApiDocLanguageHeader()
@Controller(API_CONTROLLER_CONFIG.ORDER?.PREFIX ?? 'order')
export class OrderController extends BaseController {
  constructor(
    @Inject(OrderService.TOKEN)
    private readonly orderService: IOrderService,
  ) {
    super();
  }

  @Post()
  @ApiDocCreateOrder()
  @HttpCode(HttpStatus.CREATED)
  async createOrder(
    @CurrentUser() user: { userId: string },
    @Body() body: CreateOrderRequestBody,
    @CurrentLanguage() language: Language,
  ): Promise<ResponseContent<CreateOrderResponse>> {
    try {
      const result = await this.orderService.createOrder(language, {
        userId: user.userId,
        courseIds: body.items.map(item => item.courseId),
        couponId: body.couponId,
      });

      return this.actionResponse(result as never);
    } catch (error) {
      return this.actionResponseError(language, error);
    }
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get order by ID',
    description:
      'Get order details by order ID (requires authentication, user can only access their own orders)',
  })
  @HttpCode(HttpStatus.OK)
  async getOrderById(
    @Param('id') id: string,
    @CurrentUser() user: { userId: string },
    @CurrentLanguage() language: Language,
  ): Promise<ResponseContent<OrderResponse>> {
    try {
      const result = await this.orderService.getOrderById(id, language);

      return this.actionResponse(result as never);
    } catch (error) {
      return this.actionResponseError(language, error, { id });
    }
  }

  @Get()
  @ApiOperation({
    summary: 'Get my orders',
    description:
      'Get all orders for the authenticated user (requires authentication)',
  })
  @HttpCode(HttpStatus.OK)
  async getMyOrders(
    @CurrentUser() user: { userId: string },
    @CurrentLanguage() language: Language,
  ): Promise<ResponseContent<OrderResponse[]>> {
    try {
      const result = await this.orderService.getMyOrders(user.userId, language);

      return this.actionResponse(result as never);
    } catch (error) {
      return this.actionResponseError(language, error, { userId: user.userId });
    }
  }
}
