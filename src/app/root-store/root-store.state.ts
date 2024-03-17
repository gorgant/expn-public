import { ActionReducerMap } from '@ngrx/store';
import { routerReducer, RouterReducerState } from '@ngrx/router-store';
import { PublicStoreFeatureKeys } from '../../../shared-models/store/feature-keys.model';
import { PodcastEpisodeStoreState, PostStoreState, UserStoreState } from '.';
import { postStoreReducer } from './post-store/reducer';
import { userStoreReducer } from './user-store/reducer';
import { podcastEpisodeStoreReducer } from './podcast-episode-store/reducer';
import { BlogIndexRefStoreState } from './blog-index-ref-store';
import { blogIndexRefStoreReducer } from './blog-index-ref-store/reducer';

export interface AppState {
  [PublicStoreFeatureKeys.BLOG_INDEX_REF]: BlogIndexRefStoreState.BlogIndexRefState;
  [PublicStoreFeatureKeys.PODCAST_EPISODE]: PodcastEpisodeStoreState.PodcastEpisodeState;
  [PublicStoreFeatureKeys.POST]: PostStoreState.PostState;
  [PublicStoreFeatureKeys.USER]: UserStoreState.UserState;
  router: RouterReducerState<any>;
}

export const reducers: ActionReducerMap<AppState> = {
  [PublicStoreFeatureKeys.BLOG_INDEX_REF]: blogIndexRefStoreReducer,
  [PublicStoreFeatureKeys.PODCAST_EPISODE]: podcastEpisodeStoreReducer,
  [PublicStoreFeatureKeys.POST]: postStoreReducer,
  [PublicStoreFeatureKeys.USER]: userStoreReducer,
  router: routerReducer
};
