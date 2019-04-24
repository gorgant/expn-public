import { Invoice } from 'src/app/core/models/billing/invoice.model';
import { PaymentResponseMsg } from 'src/app/core/models/billing/payment-response-msg.model';

export interface State {
  isLoading: boolean;
  invoiceLoaded: boolean;
  paymentResponseMsg: PaymentResponseMsg;
  invoice: Invoice;
  paymentProcessing: boolean;
  error?: any;
}

export const initialState: State = {
  isLoading: false,
  invoiceLoaded: false,
  paymentResponseMsg: null,
  invoice: null,
  paymentProcessing: false,
  error: null,
};
