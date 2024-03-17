import { Injectable, inject } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { UiService } from './ui.service';
import { environment } from '../../../environments/environment';
import { PRODUCTION_APPS, SANDBOX_APPS } from '../../../../shared-models/environments/env-vars.model';
import { metaTagDefaults } from '../../../../shared-models/meta/metatags.model';
import { DOCUMENT } from '@angular/common';
import { Analytics, logEvent } from '@angular/fire/analytics';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {

  private productionEnvironment: boolean = environment.production;

  private canonicalLink!: HTMLLinkElement;
  private domDoc = inject(DOCUMENT);

  private titleService = inject(Title);
  private metaTagService = inject(Meta);
  private uiService = inject(UiService);
  private fbAnalytics = inject(Analytics)
  private router = inject(Router);


  constructor() { 
    if (!this.uiService.$isServerPlatform()) {
      this.trackPageViews();
    }
  }

  private trackPageViews(): void {

    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        const pagePath = event.urlAfterRedirects;
        console.log('Logging pageview of this pagePath', pagePath);
        logEvent(this.fbAnalytics, 'page_view', { page_path: pagePath });
      }
    });
  }

  setSeoTags(title: string, description: string, imagePath: string, urlPath: string, keywords?: string, type?: string) {

    const fullImagePath = this.getFullImagePath(imagePath);
    const canonicalUrl = this.getFulllUrl(urlPath);

    this.titleService.setTitle(title);
    this.metaTagService.updateTag({
      name: 'description',
      content: description
    });
    this.metaTagService.updateTag({
      name: 'keywords',
      content: keywords ? keywords : metaTagDefaults.expnPublic.metaTagDefaultKeywords
    });

    // Social Media Tags
    this.metaTagService.updateTag({
      property: 'og:title',
      content: title
    });
    this.metaTagService.updateTag({
      property: 'og:description',
      content: description
    });
    this.metaTagService.updateTag({
      property: 'og:image',
      content: fullImagePath
    });
    this.metaTagService.updateTag({
      property: 'og:image:secure_url',
      content: fullImagePath
    });
    this.metaTagService.updateTag({
      property: 'og:image:alt',
      content: title
    });
    this.metaTagService.updateTag({
      property: 'og:url',
      content: canonicalUrl
    });
    this.metaTagService.updateTag({
      property: 'og:type',
      content: type ? type : 'website'
    });

    // Twitter Tags
    this.metaTagService.updateTag({
      name: 'twitter:title',
      content: title,
    });
    this.metaTagService.updateTag({
      name: 'twitter:description',
      content: description,
    });
    this.metaTagService.updateTag({
      name: 'twitter:image:src',
      content: fullImagePath,
    });
    this.metaTagService.updateTag({
      name: 'twitter:image:alt',
      content: title
    });

    // Google+ Tags
    // These require the selector to be specified, otherwise forms duplicate
    this.metaTagService.updateTag({
      itemprop: 'name',
      content: title
    },
    `itemprop='name'`
    );
    this.metaTagService.updateTag({
      itemprop: 'description',
      content: description
    },
    `itemprop='description'`
    );
    this.metaTagService.updateTag({
      itemprop: 'image',
      content: fullImagePath
    },
    `itemprop='image'`
    );

    // Set canonical link (create and append new one if doesn't exist)
    if (!this.canonicalLink) {
      this.canonicalLink = this.domDoc.createElement('link');
      this.canonicalLink.setAttribute('rel', 'canonical');
      this.domDoc.head.appendChild(this.canonicalLink);
    }
    this.canonicalLink.setAttribute('href', canonicalUrl);

  }

  private getFullImagePath(path: string) {

    // Dynamic images will include the full origin in URL (served from Firebase storage)
    if (path.includes('https://')) {
      return path;
    }

    // Statically served assets (e.g. home page background) require origin to be added (served from origin file folder vs firebase storage)
    const origin = this.productionEnvironment ? `https://${PRODUCTION_APPS.expnPublicApp.websiteDomain}` : `https://${SANDBOX_APPS.expnPublicApp.websiteDomain}`;
    const imagePath = `${origin}/${path}`;
    return imagePath;
  }

  private getFulllUrl(path: string) {
    const origin = this.productionEnvironment ? `https://${PRODUCTION_APPS.expnPublicApp.websiteDomain}` : `https://${SANDBOX_APPS.expnPublicApp.websiteDomain}`;

    let fullPath: string;

    // Handle possible preceding slash
    if (path.charAt(0) === '/') {
      fullPath = `${origin}${path}`;
    } else {
      fullPath = `${origin}/${path}`;
    }
    return fullPath;
  }
}
