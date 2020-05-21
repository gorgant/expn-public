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
    mergeMap(action =>
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

  // @Effect()
  // allPostsRequestedEffect$: Observable<Action> = this.actions$.pipe(
  //   ofType<postFeatureActions.AllPostsRequested>(
  //     postFeatureActions.ActionTypes.ALL_POSTS_REQUESTED
  //   ),
  //   switchMap(action =>
  //     this.postService.fetchAllPosts()
  //       .pipe(
  //         map(posts => {
  //           if (!posts) {
  //             throw new Error('Posts not found');
  //           }
  //           return new postFeatureActions.AllPostsLoaded({ posts });
  //         }),
  //         catchError(error => {
  //           return of(new postFeatureActions.LoadErrorDetected({ error }));
  //         })
  //       )
  //   )
  // );

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
            return of(new postFeatureActions.LoadFailed({ error }));
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
            return of(new postFeatureActions.LoadFailed({ error }));
          })
        )
    )
  );
}
