import { Component, Input, OnInit, inject, input, signal } from '@angular/core';
import { PublicAppRoutes } from '../../../../../shared-models/routes-and-paths/app-routes.model';
import { BlogIndexRef, Post, PostKeys } from '../../../../../shared-models/posts/post.model';
import { RouterLink } from '@angular/router';
import { HelperService } from '../../../core/services/helpers.service';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-post-thumbnail',
  standalone: true,
  imports: [RouterLink, MatTooltipModule],
  templateUrl: './post-thumbnail.component.html',
  styleUrl: './post-thumbnail.component.scss'
})
export class PostThumbnailComponent implements OnInit {

  $blogIndexRef = input.required<BlogIndexRef>()

  APP_ROUTES = PublicAppRoutes;

  $postUrlSlug = signal(undefined as string | undefined);
  $thumbnailSrc = signal(undefined as string | undefined);

  private helperService = inject(HelperService);

  ngOnInit() {
    this.setUserFriendlyUrlString();
    this.setImageUrl();
  }

  private setUserFriendlyUrlString() {
    const userFriendlyUrlString = this.helperService.convertToFriendlyUrlFormat(this.$blogIndexRef().title);
    this.$postUrlSlug.set(userFriendlyUrlString);
  }

  private setImageUrl() {
    const largerImage = this.$blogIndexRef()[PostKeys.HERO_IMAGES].imageUrlLarge;
    const smallerImage = this.$blogIndexRef()[PostKeys.HERO_IMAGES].imageUrlSmall;

    this.$thumbnailSrc.set(smallerImage);
    return;
  }

}
