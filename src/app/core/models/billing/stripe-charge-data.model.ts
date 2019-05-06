export interface StripeChargeData {
  source: stripe.Source;
  anonymousUID: string;
  amountPaid: number;
  productId: string;
}
