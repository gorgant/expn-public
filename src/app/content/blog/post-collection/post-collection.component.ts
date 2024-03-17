import { Component, Input, input } from '@angular/core';
import { PostThumbnailComponent } from "../post-thumbnail/post-thumbnail.component";
import { BlogIndexRef, Post } from '../../../../../shared-models/posts/post.model';

@Component({
    selector: 'app-post-collection',
    standalone: true,
    templateUrl: './post-collection.component.html',
    styleUrl: './post-collection.component.scss',
    imports: [PostThumbnailComponent]
})
export class PostCollectionComponent {

  $blogIndexRefs = input.required<BlogIndexRef[]>();

}
