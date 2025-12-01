export class AuthSignOutOutput {
  readonly message: string;

  private constructor(props: AuthSignOutOutput) {
    Object.assign(this, props);
  }

  static create(input: Pick<AuthSignOutOutput, 'message'>): AuthSignOutOutput {
    return new AuthSignOutOutput({
      message: input.message,
    });
  }
}
