import { PublicUser } from 'src/app/core/models/user/public-user.model';
import { Product } from 'src/app/core/models/products/product.model';

export interface State {
  user: PublicUser | null;
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
