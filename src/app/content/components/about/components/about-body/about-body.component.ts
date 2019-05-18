import { Component, OnInit } from '@angular/core';
import { PublicImagePaths } from 'src/app/core/models/routes-and-paths/image-paths.model';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-about-body',
  templateUrl: './about-body.component.html',
  styleUrls: ['./about-body.component.scss']
})
export class AboutBodyComponent implements OnInit {

  imagePaths = PublicImagePaths;
  videoUrl = `https://youtu.be/X949bB9fqMA`;

  videoHtml: SafeHtml;

  constructor(
    private sanitizer: DomSanitizer,
  ) { }

  ngOnInit() {
    this.configureVideoUrl(this.videoUrl);
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
