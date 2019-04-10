import { EntityAdapter, createEntityAdapter, EntityState } from '@ngrx/entity';
import { Post } from 'src/app/core/models/posts/post.model';

export const featureAdapter: EntityAdapter<Post>
  = createEntityAdapter<Post>(
    {
      selectId: (post: Post) => post.id,

      // // Sort by published date
      // sortComparer: (a: Post, b: Post): number => {
      //   const publishedDateA = a.publishedDate;
      //   const publishedDateB = b.publishedDate;
      //   return publishedDateA.toString().localeCompare(publishedDateB.toString(), undefined, {numeric: true});
      // }
    }
  );

export interface State extends EntityState<Post> {
  isLoading?: boolean;
  error?: any;
  postsLoaded?: boolean;
}

export const initialState: State = featureAdapter.getInitialState(
  {
    isLoading: false,
    error: null,
    postsLoaded: false,
  }
);
