import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { PublicAppRoutes } from 'shared-models/routes-and-paths/app-routes.model';
import { PublicImagePaths } from 'shared-models/routes-and-paths/image-paths.model';
import { ProductIdList, ProductUrlSlugList } from 'shared-models/products/product-id-list.model';
import { metaTagsContentPages } from 'shared-models/analytics/metatags.model';

@Component({
  selector: 'app-about-body',
  templateUrl: './about-body.component.html',
  styleUrls: ['./about-body.component.scss']
})
export class AboutBodyComponent implements OnInit {

  appRoutes = PublicAppRoutes;
  imagePaths = PublicImagePaths;
  videoUrl = metaTagsContentPages.explearningPublic.aboutBodyVideoUrl;

  videoHtml: SafeHtml;

  remoteCoachUrl: string;

  constructor(
    private sanitizer: DomSanitizer,
  ) { }

  ngOnInit() {
    this.configureVideoUrl(this.videoUrl);
    this.setProductPath();
  }

  private setProductPath() {
    this.remoteCoachUrl = `${this.appRoutes.PRODUCTS}/${ProductIdList.EXPLEARNING_REMOTE_COACH}/${ProductUrlSlugList.REMOTE_COACH}`;
  }

  private configureVideoUrl(videoUrl: string) {
    const videoId = videoUrl.split('/').pop();
    // tslint:disable-next-line:max-line-length
    const embedHtml = `<iframe src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
    const safeVideoLink = this.sanitizer.bypassSecurityTrustHtml(embedHtml);
    this.videoHtml = safeVideoLink;
    console.log('video data loaded', this.videoHtml);
  }

}
