import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { BaseController } from '@/common/controllers/base.controller';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { CurrentLanguage } from '@/common/decorators/language.decorator';
import { ApiDocLanguageHeader } from '@/common/docs/api-language-header.doc';
import { AuthenticationGuard } from '@/common/guards/authentication.guard';
import { ResponseContent } from '@/common/response/response-content';
import { API_CONTROLLER_CONFIG } from '@/constants/api-controller';
import { AddItemRequestBody } from '@/domains/cart/controller/contracts/add-item.request';
import { AddItemResponse } from '@/domains/cart/controller/contracts/add-item.response';
import { CartResponse } from '@/domains/cart/controller/contracts/cart.response';
import { DeleteItemResponse } from '@/domains/cart/controller/contracts/delete-item.response';
import { ApiDocAddItemDoc } from '@/domains/cart/controller/docs/cart-add-item';
import { ApiDocDeleteItemDoc } from '@/domains/cart/controller/docs/cart-delete-item';
import { ApiDocGetCartDoc } from '@/domains/cart/controller/docs/cart-get';
import { CartService } from '@/domains/cart/services/cart.service';
import type { ICartService } from '@/domains/cart/services/interfaces/cart.service.interface';
import { Language } from '@/enums/language.enum';
import { UserAccount } from '@/infrastructures/database/dto/user-account.dto';

@UseGuards(AuthenticationGuard)
@ApiTags(API_CONTROLLER_CONFIG.CART.TAG)
@ApiDocLanguageHeader()
@Controller(API_CONTROLLER_CONFIG.CART.PREFIX)
export class CartController extends BaseController {
  constructor(
    @Inject(CartService.TOKEN)
    private readonly cartService: ICartService,
  ) {
    super();
  }

  @Get(API_CONTROLLER_CONFIG.CART.ROUTE.GET_CART)
  @ApiDocGetCartDoc()
  @HttpCode(HttpStatus.OK)
  async getCart(
    @CurrentUser() user: UserAccount,
    @CurrentLanguage() language: Language,
  ): Promise<ResponseContent<CartResponse>> {
    try {
      const result = await this.cartService.getCart(language, user.userId);

      return this.actionResponse<CartResponse, string>(result);
    } catch (error) {
      return this.actionResponseError(language, error);
    }
  }

  @Post(API_CONTROLLER_CONFIG.CART.ROUTE.ADD_ITEM)
  @ApiDocAddItemDoc()
  @HttpCode(HttpStatus.CREATED)
  async addItemToCart(
    @CurrentUser() user: UserAccount,
    @Body() body: AddItemRequestBody,
    @CurrentLanguage() language: Language,
  ): Promise<ResponseContent<AddItemResponse>> {
    try {
      const result = await this.cartService.addItemToCart(language, {
        userId: user.userId,
        courseId: body.courseId,
      });

      return this.actionResponse<
        AddItemResponse,
        { userId: string; courseId: string }
      >(result);
    } catch (error) {
      return this.actionResponseError(language, error);
    }
  }

  @Delete(API_CONTROLLER_CONFIG.CART.ROUTE.DELETE_ITEM)
  @ApiDocDeleteItemDoc()
  @HttpCode(HttpStatus.OK)
  async deleteItemFromCart(
    @CurrentUser() user: UserAccount,
    @Param('itemId') itemId: string,
    @CurrentLanguage() language: Language,
  ): Promise<ResponseContent<DeleteItemResponse>> {
    try {
      const result = await this.cartService.deleteItemFromCart(
        language,
        user.userId,
        itemId,
      );

      return this.actionResponse<DeleteItemResponse, string>(result);
    } catch (error) {
      return this.actionResponseError(language, error);
    }
  }
}
