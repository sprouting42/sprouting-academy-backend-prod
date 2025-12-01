export class VerifyOtpInputDto {
  email: string;
  token: string;
  type: 'email' | 'sms' | 'phone_change';
}
