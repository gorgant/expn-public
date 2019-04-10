import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { AppRoutes } from 'src/app/core/models/routes-and-paths/app-routes.model';
import { Post } from 'src/app/core/models/posts/post.model';

@Component({
  selector: 'app-post-card',
  templateUrl: './post-card.component.html',
  styleUrls: ['./post-card.component.scss']
})
export class PostCardComponent implements OnInit {

  @Input() post: Post;

  constructor(
    private router: Router,
  ) { }

  ngOnInit() {
  }

  onSelectPost() {
    this.router.navigate([AppRoutes.BLOG, this.post.id]);
  }

}
