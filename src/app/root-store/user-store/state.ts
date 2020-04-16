import { PublicUser } from 'shared-models/user/public-user.model';
import { Product } from 'shared-models/products/product.model';

export interface State {
  isLoading: boolean;
  isSaving: boolean;
  isSubscribingUser: boolean;
  isTransmittingContactForm: boolean;
  isStoringNavStamp: boolean;
  isConfirmingSubOptIn: boolean;
  loadError: any;
  saveError: any;
  subscribeUserError: any;
  transmitContactFormError: any;
  storeNavStampError: any;
  confirmSubOptInError: any;
  user: PublicUser | null;
  cartItem: Product;
  userSessionId: string;
}

export const initialState: State = {
  isLoading: false,
  isSaving: false,
  isSubscribingUser: false,
  isTransmittingContactForm: false,
  isStoringNavStamp: false,
  isConfirmingSubOptIn: false,
  loadError: false,
  saveError: false,
  subscribeUserError: false,
  transmitContactFormError: false,
  storeNavStampError: false,
  confirmSubOptInError: false,
  user: null,
  cartItem: null,
  userSessionId: null,
};
