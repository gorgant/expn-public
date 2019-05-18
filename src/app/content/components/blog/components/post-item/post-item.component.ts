import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { PublicAppRoutes } from 'src/app/core/models/routes-and-paths/app-routes.model';
import { Post } from 'src/app/core/models/posts/post.model';

@Component({
  selector: 'app-post-item',
  templateUrl: './post-item.component.html',
  styleUrls: ['./post-item.component.scss']
})
export class PostItemComponent implements OnInit {

  @Input() post: Post;

  appRoutes = PublicAppRoutes;

  constructor(
    private router: Router,
  ) { }

  ngOnInit() {
  }

  onSelectPost() {
    this.router.navigate([PublicAppRoutes.BLOG, this.post.id]);
  }

}
