import { EntityAdapter, EntityState, createEntityAdapter } from "@ngrx/entity";
import { Post, PostHeroImageData } from "../../../../shared-models/posts/post.model";
import { FirebaseError } from "@angular/fire/app";
import { PostBoilerplate } from "../../../../shared-models/posts/post-boilerplate.model";

export const featureAdapter: EntityAdapter<Post> = createEntityAdapter<Post>({
  selectId: (post: Post) => post.id,
});

export interface PostState extends EntityState<Post> {
  fetchPostBoilerplateError: FirebaseError | Error | null,
  fetchPostBoilerplateProcessing: boolean,
  fetchSinglePostError: FirebaseError | Error | null,
  fetchSinglePostProcessing: boolean,

  postBoilerplateData: PostBoilerplate | null,
}

export const initialPostState: PostState = featureAdapter.getInitialState(
  {
    fetchPostBoilerplateError: null,
    fetchPostBoilerplateProcessing: false,
    fetchSinglePostError: null,
    fetchSinglePostProcessing: false,

    postBoilerplateData: null,
  }
);