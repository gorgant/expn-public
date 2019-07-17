import { EntityAdapter, createEntityAdapter, EntityState } from '@ngrx/entity';
import { Post } from 'shared-models/posts/post.model';

export const featureAdapter: EntityAdapter<Post>
  = createEntityAdapter<Post>(
    {
      selectId: (post: Post) => post.id,

      // Sort by reverse published date
      sortComparer: (a: Post, b: Post): number => {
        const publishedDateA = a.publishedDate;
        const publishedDateB = b.publishedDate;
        return publishedDateB.toString().localeCompare(publishedDateA.toString(), undefined, {numeric: true});
      }
    }
  );

export interface State extends EntityState<Post> {
  isLoading?: boolean;
  error?: any;
  postsLoaded?: boolean;
  featuredPostsLoaded?: boolean;
}

export const initialState: State = featureAdapter.getInitialState(
  {
    isLoading: false,
    error: null,
    postsLoaded: false,
    featuredPostsLoaded: false,
  }
);
