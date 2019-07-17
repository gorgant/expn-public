import { PublicUser } from 'shared-models/user/public-user.model';
import { Product } from 'shared-models/products/product.model';

export interface State {
  user: PublicUser | null;
  isLoading: boolean;
  userLoaded: boolean;
  error?: any;
  cartItem: Product;
  subscribeProcessing: boolean;
  subscribeSubmitted: boolean;
  contactFormProcessing: boolean;
  contactFormSubmitted: boolean;
  userSessionId: string;
}

export const initialState: State = {
  user: null,
  isLoading: false,
  userLoaded: false,
  error: null,
  cartItem: null,
  subscribeProcessing: false,
  subscribeSubmitted: false,
  contactFormProcessing: false,
  contactFormSubmitted: false,
  userSessionId: null
};
