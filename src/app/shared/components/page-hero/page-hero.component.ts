import { Component, OnInit } from '@angular/core';
import { ImagePaths } from 'src/app/core/models/routes-and-paths/image-paths.model';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-page-hero',
  templateUrl: './page-hero.component.html',
  styleUrls: ['./page-hero.component.scss']
})
export class PageHeroComponent implements OnInit {

  // TODO: Set these with input? or slot or ngcontent
  imageUrl: string;
  pageTitle: string;
  pageSubTitle: string;

  stylesObject: {};

  constructor(
    private sanitizer: DomSanitizer,
  ) { }

  ngOnInit() {
    this.pageTitle = 'Test Title';
    this.pageSubTitle = 'Test subtitle text is cool because its a cool test and thats pretty cool to me';

    this.configureBackgroundStyleObject();
  }

  private configureBackgroundStyleObject() {
    console.log('Styles object being called');

    const backgroundImageUrl = `url(${ImagePaths.BLOG})`;

    const safeStyles = this.sanitizer.bypassSecurityTrustStyle(`${backgroundImageUrl}`); // Mark string as safe

    this.stylesObject = safeStyles;
  }

}
