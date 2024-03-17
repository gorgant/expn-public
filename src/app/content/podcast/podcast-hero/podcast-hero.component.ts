import { Component, ElementRef, SecurityContext, computed, inject, viewChild } from '@angular/core';
import { GlobalFieldValues, SiteSpecificFieldValues } from '../../../../../shared-models/content/string-vals.model';
import { PublicImagePaths } from '../../../../../shared-models/routes-and-paths/image-paths.model';
import { DomSanitizer } from '@angular/platform-browser';
import { UiService } from '../../../core/services/ui.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-podcast-hero',
  standalone: true,
  imports: [MatIconModule, MatButtonModule],
  templateUrl: './podcast-hero.component.html',
  styleUrl: './podcast-hero.component.scss'
})
export class PodcastHeroComponent {

  ACTION_MESSAGE = GlobalFieldValues.VIEW_COLLECTION;
  PODCAST_HERO_IMAGE_URL = PublicImagePaths.PODCAST;
  PAGE_TITLE = SiteSpecificFieldValues.expnPublic.podcastPageTitle;
  PAGE_SUBTITLE = SiteSpecificFieldValues.expnPublic.podcastPageHeroSubtitle;
  PAGE_DESCRIPTION = SiteSpecificFieldValues.expnPublic.podcastMetaDescription;
  
  private $contentStartTag = viewChild<ElementRef>('contentStartTag');

  private uiService = inject(UiService);
  private sanitizer = inject(DomSanitizer);

  $stylesObject = computed(() => {
    const backgroundImageUrl = `url(${this.PODCAST_HERO_IMAGE_URL})`;
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
