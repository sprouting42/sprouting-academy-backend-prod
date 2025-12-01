export type CreateChargeInput = {
  userId: string;
  orderId: string;
  cardNumber: string;
  cardName: string;
  expirationMonth: number;
  expirationYear: number;
  securityCode: string;
  city?: string;
  postalCode?: string;
  description?: string;
};
