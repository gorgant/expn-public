import { Component, OnInit, Input } from '@angular/core';
import { UiService } from 'src/app/core/services/ui.service';
import { Post } from 'shared-models/posts/post.model';
import { PublicAppRoutes } from 'shared-models/routes-and-paths/app-routes.model';

@Component({
  selector: 'app-post-item',
  templateUrl: './post-item.component.html',
  styleUrls: ['./post-item.component.scss']
})
export class PostItemComponent implements OnInit {

  @Input() post: Post;
  postUrlSlug: string;
  thumbnailSrc: string;

  appRoutes = PublicAppRoutes;

  constructor(
    private uiService: UiService
  ) { }

  ngOnInit() {
    this.setUserFriendlyUrlString();
    this.thumbnailSrc = this.post.imageProps.srcset.split(' ')[0]; // Get smallest image in the src set
  }

  private setUserFriendlyUrlString() {
    this.postUrlSlug = this.uiService.convertToFriendlyUrlFormat(this.post.title);
  }

}
