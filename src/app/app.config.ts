import { ApplicationConfig, PLATFORM_ID, inject, isDevMode, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { APP_ROUTES } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { getApp, initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAnalytics, provideAnalytics, ScreenTrackingService } from '@angular/fire/analytics';
import { initializeAppCheck, ReCaptchaEnterpriseProvider, provideAppCheck, CustomProvider } from '@angular/fire/app-check';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getFunctions, provideFunctions } from '@angular/fire/functions';
import { getPerformance, providePerformance } from '@angular/fire/performance';
import { environment } from '../environments/environment';
import { provideStore } from '@ngrx/store';
import { provideRouterStore } from '@ngrx/router-store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { reducers } from './root-store/root-store.state';
import { PodcastEpisodeStoreEffects } from './root-store/podcast-episode-store/effects';
import { PostStoreEffects } from './root-store/post-store/effects';
import { UserStoreEffects } from './root-store/user-store/effects';

import { isPlatformServer } from '@angular/common';
import { BlogIndexRefStoreEffects } from './root-store/blog-index-ref-store/effects';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(APP_ROUTES),
    provideClientHydration(),

    // Angularfire Providers
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAnalytics(() => getAnalytics()), 
    provideFirestore(() => getFirestore()), 
    provideFunctions(() => getFunctions()), 
    providePerformance(() => getPerformance()),
    provideAppCheck(() => {
      // Don't initialise AppCheck if running in server
      // Workaround for https://github.com/angular/angularfire/issues/3488
      const platformId = inject(PLATFORM_ID);
      if (isPlatformServer(platformId)) {
        return '' as any;
      }

      let provider: CustomProvider | ReCaptchaEnterpriseProvider;

      provider = new ReCaptchaEnterpriseProvider(environment.reCaptchaEnterpriseProviderKey);

      // Initialise AngularFire app check using provider
      const appCheck = initializeAppCheck(getApp(), {
        provider: provider
      });
      return appCheck;
    }),


    // NGRX Providers
    provideStore(reducers, {
      runtimeChecks: {
          strictStateSerializability: true,
          strictActionSerializability: true,
          strictActionTypeUniqueness: false,
      }
    }),
    provideEffects(
      [
        BlogIndexRefStoreEffects,
        PodcastEpisodeStoreEffects,
        PostStoreEffects,
        UserStoreEffects
      ]
    ),
    provideStoreDevtools({ maxAge: 25, logOnly: !isDevMode() }),
    provideRouterStore(),
    
    // Other providers
    ScreenTrackingService,
    provideAnimationsAsync()
  ]
};
