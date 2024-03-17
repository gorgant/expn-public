import { Component, ElementRef, SecurityContext, computed, inject, viewChild } from '@angular/core';
import { PublicImagePaths } from '../../../../../shared-models/routes-and-paths/image-paths.model';
import { UiService } from '../../../core/services/ui.service';
import { DomSanitizer } from '@angular/platform-browser';
import { GlobalFieldValues, SiteSpecificFieldValues } from '../../../../../shared-models/content/string-vals.model';
import { PublicAppRoutes } from '../../../../../shared-models/routes-and-paths/app-routes.model';
import { RouterLink } from '@angular/router';
import { WebsiteUrls } from '../../../../../shared-models/meta/web-urls.model';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-home-hero',
  standalone: true,
  imports: [RouterLink, MatIconModule, MatButtonModule],
  templateUrl: './home-hero.component.html',
  styleUrl: './home-hero.component.scss'
})
export class HomeHeroComponent {
  
  
  APP_ROUTES = PublicAppRoutes;
  ACTION_MESSAGE = GlobalFieldValues.LEARN_MORE;
  ACADEMY_URL = WebsiteUrls.ACDMY_HOME;
  FREE_LESSONS_BUTTON_VALUE = GlobalFieldValues.FREE_LESSONS;
  HOME_HERO_IMAGE_URL = PublicImagePaths.HOME;
  PAGE_TITLE = SiteSpecificFieldValues.expnPublic.homePageTitle;
  
  private $contentStartTag = viewChild<ElementRef>('contentStartTag');
  
  private uiService = inject(UiService);
  private sanitizer = inject(DomSanitizer);

  $stylesObject = computed(() => {
    const backgroundImageUrl = `url(${this.HOME_HERO_IMAGE_URL})`;
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
