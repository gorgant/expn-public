import { EntityAdapter, createEntityAdapter, EntityState } from '@ngrx/entity';
import { Post, BlogIndexPostRef } from 'shared-models/posts/post.model';

export const featureAdapter: EntityAdapter<Post | BlogIndexPostRef>
  = createEntityAdapter<Post | BlogIndexPostRef>(
    {
      selectId: (post: Post | BlogIndexPostRef) => post.id,

      // Sort by reverse published date
      sortComparer: (a: Post | BlogIndexPostRef, b: Post | BlogIndexPostRef): number => {
        const publishedDateA = a.publishedDate;
        const publishedDateB = b.publishedDate;
        return publishedDateB.toString().localeCompare(publishedDateA.toString(), undefined, {numeric: true});
      }
    }
  );

export interface State extends EntityState<Post | BlogIndexPostRef> {
  isLoading?: boolean;
  error?: any;
  postsLoaded?: boolean;
  featuredPostsLoaded?: boolean;
  blogIndexLoaded?: boolean;
}

export const initialState: State = featureAdapter.getInitialState(
  {
    isLoading: false,
    error: null,
    postsLoaded: false,
    featuredPostsLoaded: false,
    blogIndexLoaded: false,
  }
);
