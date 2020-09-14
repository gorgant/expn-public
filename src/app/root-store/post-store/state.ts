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
  isLoading: boolean;
  isLoadingFeaturedPosts: boolean;
  isLoadingBlogIndex: boolean;
  isLoadingNextBlogIndexBatch: boolean;
  loadError: any;
  featuredPostLoadError: any;
  blogIndexLoadError: any;
  nextBlogIndexBatchLoadError: any;
  postsLoaded: boolean;
  blogIndexLoaded: boolean;
}

export const initialState: State = featureAdapter.getInitialState(
  {
    isLoading: false,
    isLoadingFeaturedPosts: false,
    isLoadingBlogIndex: false,
    isLoadingNextBlogIndexBatch: false,
    loadError: null,
    featuredPostLoadError: null,
    blogIndexLoadError: null,
    nextBlogIndexBatchLoadError: null,
    postsLoaded: false,
    blogIndexLoaded: false,
  }
);
