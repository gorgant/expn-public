import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BlogComponent } from '../components/blog/blog.component';
import { PostComponent } from '../components/post/post.component';

const routes: Routes = [
  {
    path: '',
    component: BlogComponent
  },
  {
    path: ':id/:postTitle',
    component: PostComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BlogRoutingModule { }
