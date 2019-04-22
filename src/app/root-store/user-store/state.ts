import { AppUser } from 'src/app/core/models/user/app-user.model';
import { Product } from 'src/app/core/models/products/product.model';

export interface State {
  user: AppUser | null;
  isLoading: boolean;
  profileImageLoading: boolean;
  error?: any;
  userLoaded: boolean;
  cartItem: Product;
}

export const initialState: State = {
  user: null,
  isLoading: false,
  profileImageLoading: false,
  error: null,
  userLoaded: false,
  cartItem: null,
};
