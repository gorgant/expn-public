import { AuthStoreState } from './auth-store';
import { UserStoreState } from './user-store';
import { PostStoreState } from './post-store';
import { UiStoreState } from './ui-store';
import { ProductStoreState } from './product-store';
import { BillingStoreState } from './billing-store';
import { PodcastStoreState } from './podcast-store';

export interface State {
  auth: AuthStoreState.State;
  user: UserStoreState.State;
  posts: PostStoreState.State;
  products: ProductStoreState.State;
  ui: UiStoreState.State;
  billing: BillingStoreState.State;
  podcasts: PodcastStoreState.State;
}
