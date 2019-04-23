import { AnonymousUser } from 'src/app/core/models/user/anonymous-user.model';
import { Product } from 'src/app/core/models/products/product.model';

export interface State {
  user: AnonymousUser | null;
  isLoading: boolean;
  userLoaded: boolean;
  error?: any;
  cartItem: Product;
}

export const initialState: State = {
  user: null,
  isLoading: false,
  userLoaded: false,
  error: null,
  cartItem: null,
};
