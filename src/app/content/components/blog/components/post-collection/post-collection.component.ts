import { Component, OnInit, Input } from '@angular/core';
import { Post } from 'shared-models/posts/post.model';

@Component({
  selector: 'app-post-collection',
  templateUrl: './post-collection.component.html',
  styleUrls: ['./post-collection.component.scss']
})
export class PostCollectionComponent implements OnInit {

  @Input() posts: Post[];

  constructor() { }

  ngOnInit() {
  }

}
