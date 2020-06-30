import { State } from './state';
import { MemoizedSelector, createFeatureSelector, createSelector } from '@ngrx/store';
import * as fromPosts from './reducer';
import { Post, BlogIndexPostRef } from 'shared-models/posts/post.model';
import { PublicFeatureNames } from 'shared-models/ngrx-store/feature-names';

const getIsLoading = (state: State): boolean => state.isLoading;
const getFeaturedPostsLoading = (state: State): boolean => state.isLoadingFeaturedPosts;
const getBlogIndexLoading = (state: State): boolean => state.isLoadingBlogIndex;
const getLoadError = (state: State): any => state.loadError;
const getFeaturedPostsLoadError = (state: State): any => state.featuredPostLoadError;
const getBlogIndexLoadError = (state: State): any => state.blogIndexLoadError;
const getPostsLoaded = (state: State): boolean => state.postsLoaded;
const getBlogIndexLoaded = (state: State): boolean => state.blogIndexLoaded;

export const selectPostState: MemoizedSelector<object, State>
= createFeatureSelector<State>(PublicFeatureNames.POSTS);

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

export const selectLoadError: MemoizedSelector<object, any>
  = createSelector(selectPostState, getLoadError);
export const selectFeaturedPostsLoadError: MemoizedSelector<object, any>
  = createSelector(selectPostState, getFeaturedPostsLoadError);
export const selectBlogIndexLoadError: MemoizedSelector<object, any>
  = createSelector(selectPostState, getBlogIndexLoadError);


export const selectIsLoading: MemoizedSelector<object, boolean>
  = createSelector(selectPostState, getIsLoading);
export const selectFeaturedPostsLoading: MemoizedSelector<object, boolean>
  = createSelector(selectPostState, getFeaturedPostsLoading);
export const selectBlogIndexLoading: MemoizedSelector<object, boolean>
  = createSelector(selectPostState, getBlogIndexLoading);
export const selectPostsLoaded: MemoizedSelector<object, boolean>
  = createSelector(selectPostState, getPostsLoaded);
export const selectBlogIndexLoaded: MemoizedSelector<object, boolean>
  = createSelector(selectPostState, getBlogIndexLoaded);
