import { State } from './state';
import { MemoizedSelector, createFeatureSelector, createSelector } from '@ngrx/store';
import * as fromPosts from './reducer';
import { Post } from 'shared-models/posts/post.model';
import { BlogIndexPostRef } from 'shared-models/posts/blog-index-post-ref.model';

const getError = (state: State): any => state.error;
const getIsLoading = (state: State): boolean => state.isLoading;
const getPostsLoaded = (state: State): boolean => state.postsLoaded;
const getFeaturedPostsLoaded = (state: State): boolean => state.featuredPostsLoaded;
const getblogIndexLoaded = (state: State): boolean => state.blogIndexLoaded;

export const selectPostState: MemoizedSelector<object, State>
= createFeatureSelector<State>('posts');

export const selectAllPosts: (state: object) => Post[] | BlogIndexPostRef[] = createSelector(
  selectPostState,
  fromPosts.selectAll
);

export const selectFeaturedPosts = createSelector(
  selectAllPosts,
  posts => posts.filter(post => post.featured)
);

// A cosmetic filter, will return all posts in entity adapter (which on first load will be only the index)
export const selectblogIndex = createSelector(
  selectAllPosts,
  posts => posts.filter(post  => post.published)
);

export const selectPostById: (postId: string) => MemoizedSelector<object, Post | BlogIndexPostRef>
= (postId: string) => createSelector(
  selectPostState,
  postsState => postsState.entities[postId]
);

export const selectPostError: MemoizedSelector<object, any> = createSelector(
  selectPostState,
  getError
);

export const selectPostIsLoading: MemoizedSelector<object, boolean>
= createSelector(selectPostState, getIsLoading);

export const selectPostsLoaded: MemoizedSelector<object, boolean>
= createSelector(selectPostState, getPostsLoaded);

export const selectFeaturedPostsLoaded: MemoizedSelector<object, boolean>
= createSelector(selectPostState, getFeaturedPostsLoaded);

export const selectblogIndexLoaded: MemoizedSelector<object, boolean>
= createSelector(selectPostState, getblogIndexLoaded);
