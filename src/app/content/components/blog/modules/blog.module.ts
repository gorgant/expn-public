import { NgModule } from '@angular/core';

import { BlogRoutingModule } from './blog-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { BlogComponent } from '../components/blog/blog.component';
import { PostComponent } from '../components/post/post.component';

@NgModule({
  declarations: [
    BlogComponent,
    PostComponent,
  ],
  imports: [
    SharedModule,
    BlogRoutingModule
  ]
})
export class BlogModule { }
