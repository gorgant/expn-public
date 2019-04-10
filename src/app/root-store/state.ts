import { AuthStoreState } from './auth-store';
import { UserStoreState } from './user-store';
import { PostStoreState } from './post-store';

export interface State {
  auth: AuthStoreState.State;
  user: UserStoreState.State;
  posts: PostStoreState.State;
}
