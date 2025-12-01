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
import { ApiTags } from '@nestjs/swagger';

import { BaseController } from '@/common/controllers/base.controller';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { CurrentLanguage } from '@/common/decorators/language.decorator';
import { AuthenticationGuard } from '@/common/guards/authentication.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { ResponseContent } from '@/common/response/response-content';
import { API_CONTROLLER_CONFIG } from '@/constants/api-controller';
import { CreateEnrollmentRequestBody } from '@/domains/enrollment/controller/contracts/create-enrollment.request';
import { CreateEnrollmentResponse } from '@/domains/enrollment/controller/contracts/create-enrollment.response';
import { EnrollmentResponse } from '@/domains/enrollment/controller/contracts/enrollment.response';
import { ApiDocCreateEnrollment } from '@/domains/enrollment/controller/docs/enrollment-create.doc';
import { ApiDocGetEnrollmentById } from '@/domains/enrollment/controller/docs/enrollment-get-by-id.doc';
import { ApiDocGetMyEnrollments } from '@/domains/enrollment/controller/docs/enrollment-get-my.doc';
import { EnrollmentService } from '@/domains/enrollment/services/enrollment.service';
import type { IEnrollmentService } from '@/domains/enrollment/services/interfaces/enrollment.service.interface';
import type { Language } from '@/enums/language.enum';

@UseGuards(AuthenticationGuard, RolesGuard)
@ApiTags(API_CONTROLLER_CONFIG.ENROLLMENT.TAG)
@Controller(API_CONTROLLER_CONFIG.ENROLLMENT.PREFIX)
export class EnrollmentController extends BaseController {
  constructor(
    @Inject(EnrollmentService.TOKEN)
    private readonly enrollmentService: IEnrollmentService,
  ) {
    super();
  }

  @Post()
  @ApiDocCreateEnrollment()
  @HttpCode(HttpStatus.CREATED)
  async createEnrollment(
    @CurrentUser() user: { userId: string },
    @CurrentLanguage() language: Language,
    @Body() body: CreateEnrollmentRequestBody,
  ): Promise<ResponseContent<CreateEnrollmentResponse>> {
    const userId = user.userId;
    try {
      const result = await this.enrollmentService.createEnrollment({
        userId,
        courseId: body.courseId,
      });

      return this.actionResponse(result as never);
    } catch (error) {
      return this.actionResponseError(language, error, body);
    }
  }

  @Get(':id')
  @ApiDocGetEnrollmentById()
  @HttpCode(HttpStatus.OK)
  async getEnrollmentById(
    @Param('id') id: string,
    @CurrentLanguage() language: Language,
  ): Promise<ResponseContent<EnrollmentResponse>> {
    try {
      const result = await this.enrollmentService.getEnrollmentById(id);

      return this.actionResponse(result as never);
    } catch (error) {
      return this.actionResponseError(language, error, { id });
    }
  }

  @Get()
  @ApiDocGetMyEnrollments()
  @HttpCode(HttpStatus.OK)
  async getMyEnrollments(
    @CurrentUser() user: { userId: string },
    @CurrentLanguage() language: Language,
  ): Promise<ResponseContent<EnrollmentResponse[]>> {
    const userId = user.userId;
    try {
      const result = await this.enrollmentService.getMyEnrollments(userId);

      return this.actionResponse(result as never);
    } catch (error) {
      return this.actionResponseError(language, error, { userId });
    }
  }
}
