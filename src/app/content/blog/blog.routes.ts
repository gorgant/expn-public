import { Routes } from "@angular/router";
import { BlogComponent } from "./blog.component";
import { PostComponent } from "./post/post.component";
import { PostKeys } from "../../../../shared-models/posts/post.model";

export const BLOG_ROUTES: Routes = [
  {
   path: '',
   component: BlogComponent,
  },
  {
    path: `:${PostKeys.ID}/:${PostKeys.TITLE}`,
    component: PostComponent
  }
];