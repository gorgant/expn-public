import { Component, ElementRef, SecurityContext, computed, inject, viewChild } from '@angular/core';
import { UiService } from '../../../core/services/ui.service';
import { DomSanitizer } from '@angular/platform-browser';
import { GlobalFieldValues, SiteSpecificFieldValues } from '../../../../../shared-models/content/string-vals.model';
import { PublicImagePaths } from '../../../../../shared-models/routes-and-paths/image-paths.model';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-about-hero',
  standalone: true,
  imports: [MatIconModule, MatButtonModule],
  templateUrl: './about-hero.component.html',
  styleUrl: './about-hero.component.scss'
})
export class AboutHeroComponent {

  ACTION_MESSAGE = GlobalFieldValues.READ_MORE;
  ABOUT_ME_HERO_IMAGE_URL = PublicImagePaths.ABOUT_ME;
  PAGE_TITLE = SiteSpecificFieldValues.expnPublic.aboutPageTitle;
  PAGE_BLURB_PART_ONE = SiteSpecificFieldValues.expnPublic.aboutPageBlurbPartOne;
  PAGE_BLURB_PART_TWO = SiteSpecificFieldValues.expnPublic.aboutPageBlurbPartTwo;
  PAGE_DESCRIPTION = SiteSpecificFieldValues.expnPublic.aboutMetaDescription;

  private $contentStartTag = viewChild<ElementRef>('contentStartTag');

  private uiService = inject(UiService);
  private sanitizer = inject(DomSanitizer);

  $stylesObject = computed(() => {
    const backgroundImageUrl = `url(${this.ABOUT_ME_HERO_IMAGE_URL})`;
    let linearGradient = 'linear-gradient(0deg, rgba(0,0,0,0.5) 10%, rgba(9,9,121,0.006) 100%)';
    if  (this.uiService.$screenIsMobile()) {
      linearGradient = 'linear-gradient(0deg, rgba(0,0,0,0.5) 100%, rgba(9,9,121,0.006) 100%)';
    }
    const combinedStyles = `${linearGradient}, ${backgroundImageUrl}`; // Layer in the gradient
    const sanitizedStylesObject = this.sanitizer.sanitize(SecurityContext.STYLE, combinedStyles); // Sanitize styles object
    console.log('Produced this sanitized styles object', sanitizedStylesObject);
    return sanitizedStylesObject;
  });

  scrollToTextStart() {
    this.$contentStartTag()?.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

}
