import { Component, OnInit } from '@angular/core';
import { PageHeroData } from 'src/app/core/models/forms-and-components/page-hero-data.model';
import { ImageProps } from 'src/app/core/models/images/image-props.model';
import { ImagePaths } from 'src/app/core/models/routes-and-paths/image-paths.model';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent implements OnInit {

  heroData: PageHeroData;

  constructor() { }

  ngOnInit() {
    this.initializeHeroData();
  }

  private initializeHeroData() {
    const aboutImageProps: ImageProps = {
      src: ImagePaths.CONTACT,
      sizes: null,
      srcset: null,
      width: null,
    };

    this.heroData = {
      pageTitle: 'Contact Me',
      pageSubtitle: 'Questions, suggestions, and thoughtful input are welcome',
      imageProps: aboutImageProps,
      actionMessage: 'Get in Touch'
    };
  }

}
