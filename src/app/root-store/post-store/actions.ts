import { Action } from '@ngrx/store';
import { Post, BlogIndexPostRef } from 'shared-models/posts/post.model';

export enum ActionTypes {
  SINGLE_POST_REQUESTED = '[Posts] Single Post Requested',
  SINGLE_POST_LOADED = '[Posts] Single Post Loaded',
  ALL_POSTS_REQUESTED = '[Posts] All Posts Requested',
  ALL_POSTS_LOADED = '[Posts] All Posts Loaded',
  FEATURED_POSTS_REQUESTED = '[Posts] Featured Posts Requested',
  FEATURED_POSTS_LOADED = '[Posts] Featured Posts Loaded',
  BLOG_INDEX_REQUESTED = '[Posts] Post Index Requested',
  BLOG_INDEX_LOADED = '[Posts] Post Index Loaded',
  NEXT_BLOG_INDEX_BATCH_REQUESTED = '[Posts] Next Blog Index Batch Requested',
  NEXT_BLOG_INDEX_BATCH_LOADED = '[Posts] Next Blog Index Batch Loaded',
  LOAD_FAILED = '[Posts] Load Failed',
  FEATURED_POSTS_LOAD_FAILED = '[Posts] Featured Posts Load Failed',
  BLOG_INDEX_LOAD_FAILED = '[Posts] Blog Index Load Failed',
  NEXT_BLOG_INDEX_BATCH_LOAD_FAILED = '[Posts] Next Blog Index Batch Load Failed'
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
  constructor(public payload: { posts: BlogIndexPostRef[] }) {}
}

export class BlogIndexRequested implements Action {
  readonly type = ActionTypes.BLOG_INDEX_REQUESTED;
}

export class BlogIndexLoaded implements Action {
  readonly type = ActionTypes.BLOG_INDEX_LOADED;
  constructor(public payload: { blogIndex: BlogIndexPostRef[] }) {}
}

export class NextBlogIndexBatchRequested implements Action {
  readonly type = ActionTypes.NEXT_BLOG_INDEX_BATCH_REQUESTED;
}

export class NextBlogIndexBatchLoaded implements Action {
  readonly type = ActionTypes.NEXT_BLOG_INDEX_BATCH_LOADED;
  constructor(public payload: { nextBlogIndexBatch: BlogIndexPostRef[] }) {}
}

export class LoadFailed implements Action {
  readonly type = ActionTypes.LOAD_FAILED;
  constructor(public payload: { error: string }) {}
}

export class FeaturedPostsLoadFailed implements Action {
  readonly type = ActionTypes.FEATURED_POSTS_LOAD_FAILED;
  constructor(public payload: { error: string }) {}
}

export class BlogIndexLoadFailed implements Action {
  readonly type = ActionTypes.BLOG_INDEX_LOAD_FAILED;
  constructor(public payload: { error: string }) {}
}

export class NextBlogIndexBatchLoadFailed implements Action {
  readonly type = ActionTypes.NEXT_BLOG_INDEX_BATCH_LOAD_FAILED;
  constructor(public payload: { error: string }) {}
}


export type Actions =
  SinglePostRequested |
  SinglePostLoaded |
  AllPostsRequested |
  AllPostsLoaded |
  FeaturedPostsRequested |
  FeaturedPostsLoaded |
  BlogIndexRequested |
  BlogIndexLoaded |
  NextBlogIndexBatchRequested |
  NextBlogIndexBatchLoaded |
  LoadFailed |
  FeaturedPostsLoadFailed |
  BlogIndexLoadFailed |
  NextBlogIndexBatchLoadFailed
  ;
