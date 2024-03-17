import { Injectable, inject } from "@angular/core";
import { FirebaseError } from "@angular/fire/app";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { of } from "rxjs";
import { catchError, concatMap, map, switchMap } from "rxjs/operators";
import * as PostStoreActions from './actions';
import { PostService } from "../../core/services/post.service";

@Injectable()
export class PostStoreEffects {

  private actions$ = inject(Actions);
  private postService = inject(PostService);

  constructor() { }

  fetchPostBoilerplateEffect$ = createEffect(() => this.actions$
    .pipe(
      ofType(PostStoreActions.fetchPostBoilerplateRequested),
      switchMap(action => 
        this.postService.fetchPostBoilerplate().pipe(
          map(postBoilerplateData => {
            return PostStoreActions.fetchPostBoilerplateCompleted({postBoilerplateData});
          }),
          catchError(error => {
            const fbError: FirebaseError = {
              code: error.code,
              message: error.message,
              name: error.name
            };
            return of(PostStoreActions.fetchPostBoilerplateFailed({error: fbError}));
          })
        )
      ),
    ),
  );

  fetchSinglePostEffect$ = createEffect(() => this.actions$
    .pipe(
      ofType(PostStoreActions.fetchSinglePostRequested),
      switchMap(action => 
        this.postService.fetchSinglePost(action.postId).pipe(
          map(post => {
            return PostStoreActions.fetchSinglePostCompleted({post});
          }),
          catchError(error => {
            const fbError: FirebaseError = {
              code: error.code,
              message: error.message,
              name: error.name
            };
            return of(PostStoreActions.fetchSinglePostFailed({error: fbError}));
          })
        )
      ),
    ),
  );


}