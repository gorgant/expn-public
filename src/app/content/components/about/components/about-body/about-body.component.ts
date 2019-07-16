import { Component, OnInit } from '@angular/core';
import { PublicImagePaths } from 'src/app/core/models/routes-and-paths/image-paths.model';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { PublicAppRoutes } from 'src/app/core/models/routes-and-paths/app-routes.model';
import { environment } from 'src/environments/environment';
import { ProductIdList, ProductUrlSlugList } from 'src/app/core/models/products/product-id-list.model';

@Component({
  selector: 'app-about-body',
  templateUrl: './about-body.component.html',
  styleUrls: ['./about-body.component.scss']
})
export class AboutBodyComponent implements OnInit {

  appRoutes = PublicAppRoutes;
  imagePaths = PublicImagePaths;
  videoUrl = `https://youtu.be/X949bB9fqMA`;

  videoHtml: SafeHtml;

  private productionEnvironment: boolean = environment.production;
  remoteCoachUrl: string;

  constructor(
    private sanitizer: DomSanitizer,
  ) { }

  ngOnInit() {
    this.configureVideoUrl(this.videoUrl);
    this.setProductPathsBasedOnEnvironment();
  }

  private setProductPathsBasedOnEnvironment() {
    switch (this.productionEnvironment) {
      case true:
        console.log('Setting productIdList to production');
        // tslint:disable-next-line:max-line-length
        this.remoteCoachUrl = `${this.appRoutes.PRODUCTS}/${ProductIdList.REMOTE_COACH}/${ProductUrlSlugList.REMOTE_COACH}`;
        break;
      case false:
        console.log('Setting productIdList to sandbox');
        // tslint:disable-next-line:max-line-length
        this.remoteCoachUrl = `${this.appRoutes.PRODUCTS}/${ProductIdList.SANDBOX_REMOTE_COACH}/${ProductUrlSlugList.SANDBOX_REMOTE_COACH}`;
        break;
      default:
        console.log('Setting productIdList to sandbox');
        // tslint:disable-next-line:max-line-length
        this.remoteCoachUrl = `${this.appRoutes.PRODUCTS}/${ProductIdList.SANDBOX_REMOTE_COACH}/${ProductUrlSlugList.SANDBOX_REMOTE_COACH}`;
        break;
    }
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
