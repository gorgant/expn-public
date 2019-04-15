import { AppUser } from 'src/app/core/models/user/app-user.model';
import { ProductData } from 'src/app/core/models/products/product-data.model';

export interface State {
  user: AppUser | null;
  isLoading: boolean;
  profileImageLoading: boolean;
  error?: any;
  userLoaded: boolean;
  productData: ProductData;
}

export const initialState: State = {
  user: null,
  isLoading: false,
  profileImageLoading: false,
  error: null,
  userLoaded: false,
  productData: null,
};
