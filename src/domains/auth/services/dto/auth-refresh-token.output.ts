export class AuthRefreshTokenOutput {
  readonly accessToken: string;
  readonly refreshToken: string;
  readonly expiresIn: number;
  readonly tokenType: string;

  private constructor(props: AuthRefreshTokenOutput) {
    Object.assign(this, props);
  }

  static create(
    input: Pick<
      AuthRefreshTokenOutput,
      'accessToken' | 'refreshToken' | 'expiresIn' | 'tokenType'
    >,
  ): AuthRefreshTokenOutput {
    return new AuthRefreshTokenOutput(input);
  }
}
