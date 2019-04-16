import { AuthStoreState } from './auth-store';
import { UserStoreState } from './user-store';
import { PostStoreState } from './post-store';
import { UiStoreState } from './ui-store';

export interface State {
  auth: AuthStoreState.State;
  user: UserStoreState.State;
  posts: PostStoreState.State;
  ui: UiStoreState.State;
}
