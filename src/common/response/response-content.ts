import { ApiPropertyOptional } from '@nestjs/swagger';

import { Response } from '@/common/response/response';

export class ResponseContent<TResponse> extends Response {
  @ApiPropertyOptional({
    description: 'The response content (data) returned by the API',
    type: () => Object as TResponse,
  })
  responseContent?: TResponse;

  constructor(init?: Partial<ResponseContent<TResponse>>) {
    super(init);
    Object.assign(this, init);
  }

  public static override create<TResponse>(
    data?: Partial<ResponseContent<TResponse>>,
  ): ResponseContent<TResponse> {
    return new ResponseContent(data);
  }
}
