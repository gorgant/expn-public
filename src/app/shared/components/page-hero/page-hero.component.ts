import { Component, OnInit, Input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { PageHeroData } from 'src/app/core/models/forms-and-components/page-hero-data.model';

@Component({
  selector: 'app-page-hero',
  templateUrl: './page-hero.component.html',
  styleUrls: ['./page-hero.component.scss']
})
export class PageHeroComponent implements OnInit {

  @Input() heroData: PageHeroData;

  // TODO: Set these with input? or slot or ngcontent
  imageUrl: string;
  pageTitle: string;
  pageSubtitle: string;

  stylesObject: {};

  constructor(
    private sanitizer: DomSanitizer,
  ) { }

  ngOnInit() {
    this.pageTitle = this.heroData.pageTitle;
    this.pageSubtitle = this.heroData.pageSubtitle;
    this.imageUrl = this.heroData.imageUrl;

    this.configureBackgroundStyleObject();
  }

  private configureBackgroundStyleObject() {
    console.log('Styles object being called');

    const backgroundImageUrl = `url(${this.imageUrl})`;
    const linearGradient = 'linear-gradient(0deg, rgba(0,0,0,0.5) 0%, rgba(9,9,121,0.006) 100%)';
    const combinedStyles = `${linearGradient}, ${backgroundImageUrl}`; // Layer in the gradient

    const safeStyles = this.sanitizer.bypassSecurityTrustStyle(`${combinedStyles}`); // Mark string as safe

    this.stylesObject = safeStyles;
  }

}
