export class AuthOtpOutput {
  readonly message: string;
  readonly email: string;

  private constructor(props: AuthOtpOutput) {
    Object.assign(this, props);
  }

  static create(
    input: Pick<AuthOtpOutput, 'message' | 'email'>,
  ): AuthOtpOutput {
    return new AuthOtpOutput({
      message: input.message,
      email: input.email,
    });
  }
}
