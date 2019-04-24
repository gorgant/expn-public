import { CreditCardDetails } from './credit-card-details.model';
import { BillingDetails } from './billing-details.model';

export interface Invoice {
  id?: string;
  anonymousUID: string;
  productName: string;
  productId: string;
  purchaseDate: number;
  purchasePrice: number;
  billingDetails: BillingDetails;
  creditCardDetails: CreditCardDetails;
  lastModified: number;
  orderNumber?: string; // A subset of invoiceId
  orderSubmitted?: boolean; // Set when user clicks purchase
  paymentComplete?: boolean; // Set when server confirms payment has been processed
}
