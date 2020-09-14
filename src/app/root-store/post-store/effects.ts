import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Observable, of } from 'rxjs';
import { Action } from '@ngrx/store';
import * as postFeatureActions from './actions';
import { switchMap, map, catchError, mergeMap } from 'rxjs/operators';
import { PostService } from 'src/app/core/services/post.service';

@Injectable()
export class PostStoreEffects {
  constructor(
    private postService: PostService,
    private actions$: Actions,
  ) { }

  @Effect()
  singlePostRequestedEffect$: Observable<Action> = this.actions$.pipe(
    ofType<postFeatureActions.SinglePostRequested>(
      postFeatureActions.ActionTypes.SINGLE_POST_REQUESTED
    ),
    switchMap(action =>
      this.postService.fetchSinglePost(action.payload.postId)
        .pipe(
          map(post => {
            if (!post) {
              throw new Error('Post not found');
            }
            return new postFeatureActions.SinglePostLoaded({ post });
          }),
          catchError(error => {
            return of(new postFeatureActions.LoadFailed({ error: error.message }));
          })
        )
    )
  );

  @Effect()
  featuredPostsRequestedEffect$: Observable<Action> = this.actions$.pipe(
    ofType<postFeatureActions.FeaturedPostsRequested>(
      postFeatureActions.ActionTypes.FEATURED_POSTS_REQUESTED
    ),
    switchMap(action =>
      this.postService.fetchFeaturedPosts()
        .pipe(
          map(posts => {
            if (!posts) {
              throw new Error('Featured posts not found');
            }
            return new postFeatureActions.FeaturedPostsLoaded({ posts });
          }),
          catchError(error => {
            return of(new postFeatureActions.FeaturedPostsLoadFailed({ error }));
          })
        )
    )
  );

  @Effect()
  blogIndexRequestedEffect$: Observable<Action> = this.actions$.pipe(
    ofType<postFeatureActions.BlogIndexRequested>(
      postFeatureActions.ActionTypes.BLOG_INDEX_REQUESTED
    ),
    switchMap(action =>
      this.postService.fetchBlogIndex()
        .pipe(
          map(blogIndex => {
            if (!blogIndex) {
              throw new Error('Post index not found');
            }
            return new postFeatureActions.BlogIndexLoaded({ blogIndex });
          }),
          catchError(error => {
            return of(new postFeatureActions.BlogIndexLoadFailed({ error }));
          })
        )
    )
  );

  @Effect()
  nextBlogIndexBatchEffect$: Observable<Action> = this.actions$.pipe(
    ofType<postFeatureActions.NextBlogIndexBatchRequested>(
      postFeatureActions.ActionTypes.NEXT_BLOG_INDEX_BATCH_REQUESTED
    ),
    switchMap(action =>
      this.postService.fetchNextBlogIndexBatch()
        .pipe(
          map(nextBlogIndexBatch => {
            if (!nextBlogIndexBatch || nextBlogIndexBatch.length < 1) {
              throw new Error('No additional blog index items available');
            }
            return new postFeatureActions.NextBlogIndexBatchLoaded({ nextBlogIndexBatch });
          }),
          catchError(error => {
            return of(new postFeatureActions.NextBlogIndexBatchLoadFailed({ error }));
          })
        )
    )
  );
}
