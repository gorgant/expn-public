import { createFeatureSelector, createSelector, MemoizedSelector } from "@ngrx/store";
import { PostState } from "./state";
import { AdminStoreFeatureKeys } from "../../../../shared-models/store/feature-keys.model";
import { Post } from "../../../../shared-models/posts/post.model";

const selectPostState = createFeatureSelector<PostState>(AdminStoreFeatureKeys.POST);

const getFetchPostBoilerplateError = (state: PostState) => state.fetchPostBoilerplateError;
const getFetchPostBoilerplateProcessing = (state: PostState) => state.fetchPostBoilerplateProcessing;
const getFetchSinglePostError = (state: PostState) => state.fetchSinglePostError;
const getFetchSinglePostProcessing = (state: PostState) => state.fetchSinglePostProcessing;
const getPostBoilerplateData = (state: PostState) => state.postBoilerplateData;

export const selectFetchPostBoilerplateError = createSelector(
  selectPostState,
  getFetchPostBoilerplateError
);

export const selectFetchPostBoilerplateProcessing = createSelector(
  selectPostState,
  getFetchPostBoilerplateProcessing
);

export const selectFetchSinglePostError = createSelector(
  selectPostState,
  getFetchSinglePostError
);

export const selectFetchSinglePostProcessing = createSelector(
  selectPostState,
  getFetchSinglePostProcessing
);

export const selectPostBoilerplateData = createSelector(
  selectPostState,
  getPostBoilerplateData
);

export const selectPostById: (postId: string) => MemoizedSelector<object, Post | undefined> = (postId: string) => createSelector(
  selectPostState,
  postState => postState.entities[postId]
);