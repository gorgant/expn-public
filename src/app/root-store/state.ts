import { AuthStoreState } from './auth-store';
import { UserStoreState } from './user-store';
import { PostStoreState } from './post-store';
import { UiStoreState } from './ui-store';
import { ProductStoreState } from './product-store';
import { BillingStoreState } from './billing-store';
import { PodcastStoreState } from './podcast-store';
import { PublicFeatureNames } from 'shared-models/ngrx-store/feature-names';

export interface State {
  [PublicFeatureNames.AUTH]: AuthStoreState.State;
  [PublicFeatureNames.USER]: UserStoreState.State;
  [PublicFeatureNames.POSTS]: PostStoreState.State;
  [PublicFeatureNames.PRODUCTS]: ProductStoreState.State;
  [PublicFeatureNames.UI]: UiStoreState.State;
  [PublicFeatureNames.BILLING]: BillingStoreState.State;
  [PublicFeatureNames.PODCASTS]: PodcastStoreState.State;
}
