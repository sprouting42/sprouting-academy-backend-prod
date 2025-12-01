import { ApiPropertyOptional } from '@nestjs/swagger';

import { ResponseContent } from '@/common/response/response-content';

export class ResponseRequest<
  TRequest,
  TResponse,
> extends ResponseContent<TResponse> {
  @ApiPropertyOptional({
    description: 'The request payload associated with this response',
  })
  request?: TRequest;

  constructor(init?: Partial<ResponseRequest<TRequest, TResponse>>) {
    super();
    Object.assign(this, init);
  }

  public static override create<TRequest, TResponse>(
    data?: Partial<ResponseRequest<TRequest, TResponse>>,
  ): ResponseRequest<TRequest, TResponse> {
    return new ResponseRequest(data);
  }
}
