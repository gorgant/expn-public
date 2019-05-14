import { Component, OnInit } from '@angular/core';
import { ImageProps } from 'src/app/core/models/images/image-props.model';
import { ImagePaths } from 'src/app/core/models/routes-and-paths/image-paths.model';
import { PageHeroData } from 'src/app/core/models/forms-and-components/page-hero-data.model';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent implements OnInit {

  heroData: PageHeroData;

  constructor() { }

  ngOnInit() {
    this.initializeHeroData();
  }

  private initializeHeroData() {
    const aboutImageProps: ImageProps = {
      src: ImagePaths.ABOUT_ME,
      sizes: null,
      srcset: null,
      width: null,
    };

    // Text is added in-line because layout is specific to About Me page
    this.heroData = {
      pageTitle: null,
      pageSubtitle: null,
      imageProps: aboutImageProps,
      actionMessage: 'Read More'
    };
  }

}
