import { Component, ElementRef, SecurityContext, computed, inject, viewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { GlobalFieldValues, SiteSpecificFieldValues } from '../../../../../shared-models/content/string-vals.model';
import { PublicImagePaths } from '../../../../../shared-models/routes-and-paths/image-paths.model';
import { UiService } from '../../../core/services/ui.service';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-contact-hero',
  standalone: true,
  imports: [MatIconModule, MatButtonModule],
  templateUrl: './contact-hero.component.html',
  styleUrl: './contact-hero.component.scss'
})
export class ContactHeroComponent {

  ACTION_MESSAGE = GlobalFieldValues.GET_IN_TOUCH;
  CONTACT_HERO_IMAGE_URL = PublicImagePaths.CONTACT;
  PAGE_TITLE = SiteSpecificFieldValues.expnPublic.contactPageTitle;
  PAGE_SUBTITLE = SiteSpecificFieldValues.expnPublic.contactPageHeroSubtitle;
  PAGE_DESCRIPTION = SiteSpecificFieldValues.expnPublic.contactMetaDescription;
  
  private $contentStartTag = viewChild<ElementRef>('contentStartTag');

  private uiService = inject(UiService);
  private sanitizer = inject(DomSanitizer);

  $stylesObject = computed(() => {
    const backgroundImageUrl = `url(${this.CONTACT_HERO_IMAGE_URL})`;
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
