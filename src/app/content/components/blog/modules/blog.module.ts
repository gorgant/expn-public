import { NgModule } from '@angular/core';

import { BlogRoutingModule } from './blog-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { BlogComponent } from '../components/blog/blog.component';
import { PostComponent } from '../components/post/post.component';
import { PostCardComponent } from '../components/post-card/post-card.component';

@NgModule({
  declarations: [
    BlogComponent,
    PostComponent,
    PostCardComponent
  ],
  imports: [
    SharedModule,
    BlogRoutingModule
  ]
})
export class BlogModule { }
