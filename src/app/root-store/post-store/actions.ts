import { Action } from '@ngrx/store';
import { Post } from 'src/app/core/models/posts/post.model';

export enum ActionTypes {
  SINGLE_POST_REQUESTED = '[Posts] Single Post Requested',
  SINGLE_POST_LOADED = '[Posts] Single Post Loaded',
  ALL_POSTS_REQUESTED = '[Posts] All Posts Requested',
  ALL_POSTS_LOADED = '[Posts] All Posts Loaded',
  FEATURED_POSTS_REQUESTED = '[Posts] Featured Posts Requested',
  FEATURED_POSTS_LOADED = '[Posts] Featured Posts Loaded',
  POST_LOAD_FAILURE = '[Posts] Load Failure',
}

export class SinglePostRequested implements Action {
  readonly type = ActionTypes.SINGLE_POST_REQUESTED;
  constructor(public payload: { postId: string }) {}
}

export class SinglePostLoaded implements Action {
  readonly type = ActionTypes.SINGLE_POST_LOADED;
  constructor(public payload: { post: Post }) {}
}

export class AllPostsRequested implements Action {
  readonly type = ActionTypes.ALL_POSTS_REQUESTED;
}

export class AllPostsLoaded implements Action {
  readonly type = ActionTypes.ALL_POSTS_LOADED;
  constructor(public payload: { posts: Post[] }) {}
}

export class FeaturedPostsRequested implements Action {
  readonly type = ActionTypes.FEATURED_POSTS_REQUESTED;
}

export class FeaturedPostsLoaded implements Action {
  readonly type = ActionTypes.FEATURED_POSTS_LOADED;
  constructor(public payload: { posts: Post[] }) {}
}

export class LoadErrorDetected implements Action {
  readonly type = ActionTypes.POST_LOAD_FAILURE;
  constructor(public payload: { error: string }) {}
}

export type Actions =
  SinglePostRequested |
  SinglePostLoaded |
  AllPostsRequested |
  AllPostsLoaded |
  FeaturedPostsRequested |
  FeaturedPostsLoaded |
  LoadErrorDetected
  ;
