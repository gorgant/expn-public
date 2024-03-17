import { createAction, props } from "@ngrx/store";
import { Post } from "../../../../shared-models/posts/post.model";
import { FirebaseError } from "@angular/fire/app";
import { PostBoilerplate } from "../../../../shared-models/posts/post-boilerplate.model";

// Fetch Post Boilerplate

export const fetchPostBoilerplateRequested = createAction(
  '[Edit Post] Fetch PostBoilerplate Requested',
);

export const fetchPostBoilerplateCompleted = createAction(
  '[Post Service] Fetch PostBoilerplate Completed',
  props<{postBoilerplateData: PostBoilerplate}>()
);

export const fetchPostBoilerplateFailed = createAction(
  '[Post Service] Fetch PostBoilerplate Failed',
  props<{error: FirebaseError}>()
);

// Fetch Single Post

export const fetchSinglePostRequested = createAction(
  '[Post Component] Fetch Single Post Requested',
  props<{postId: string}>()
);

export const fetchSinglePostCompleted = createAction(
  '[Post Service] Fetch Single Post Completed',
  props<{post: Post}>()
);

export const fetchSinglePostFailed = createAction(
  '[Post Service] Fetch Single Post Failed',
  props<{error: FirebaseError}>()
);

// Purge Post State

export const purgePostState = createAction(
  '[AppWide] Purge Post State'
);

// Purge Post State Errors

export const purgePostStateErrors = createAction(
  '[AppWide] Purge Post State Errors'
);