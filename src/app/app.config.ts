import { APP_INITIALIZER, ApplicationConfig, InjectionToken, Injector, PLATFORM_ID, importProvidersFrom, inject, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';

import { APP_ROUTES } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { getApp, initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAnalytics, provideAnalytics, ScreenTrackingService } from '@angular/fire/analytics';
import { initializeAppCheck, ReCaptchaEnterpriseProvider, provideAppCheck, CustomProvider, AppCheck } from '@angular/fire/app-check';
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

// import type { app } from 'firebase-admin';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { BlogIndexRefStoreEffects } from './root-store/blog-index-ref-store/effects';

// // Custom Appcheck Provider courtesy of https://github.com/angular/angularfire/issues/3128#issuecomment-1862983959 and https://github.com/angular/angularfire/blob/master/samples/advanced/src/app/app.module.ts#L47-L57
// // Required to run appcheck in SSR
// export const FIREBASE_ADMIN = new InjectionToken<app.App>('firebase-admin');
// export function initializeAppCheckFactory(platformId: Object, injector: Injector) {
//   if (isPlatformBrowser(platformId)) {
//     console.log('Platform browser detected with this id', platformId);
//     const admin = injector.get<app.App|null>(FIREBASE_ADMIN, null);
//     if (admin) {
//       const provider = new CustomProvider({ getToken: () =>
//         admin.
//           appCheck().
//           createToken(environment.firebase.appId, { ttlMillis: 604_800_000, /* 1 week */ }).
//           then(({ token, ttlMillis: expireTimeMillis }) => ({ token, expireTimeMillis } ))
//       });
//       return initializeAppCheck(undefined, { provider, isTokenAutoRefreshEnabled: false });
//     } else {
//       const provider = new ReCaptchaEnterpriseProvider(environment.reCaptchaEnterpriseProviderKey);
//       return initializeAppCheck(undefined, { provider, isTokenAutoRefreshEnabled: true });
//     }
//   } else {
//     console.log('Server rendering detected, terminating appCheckFactory');
//     return undefined;
//   }
// }

export const appConfig: ApplicationConfig = {
  providers: [
    // {
    //   provide: APP_INITIALIZER,
    //   useFactory: (platformId: Object) => () => {
    //     if (isPlatformBrowser(platformId)) {
    //       // Initialize Firebase AppCheck here
    //       // initializeAppCheck(undefined, {
    //       //   provider: new ReCaptchaEnterpriseProvider(environment.reCaptchaEnterpriseProviderKey),
    //       //   isTokenAutoRefreshEnabled: true
    //       // });
    //       importProvidersFrom(
    //         provideAppCheck(() => {
    //           const provider = new ReCaptchaEnterpriseProvider(environment.reCaptchaEnterpriseProviderKey);
    //           return initializeAppCheck(undefined, { provider, isTokenAutoRefreshEnabled: true });
    //         })
    //       )
    //     }
    //   },
    //   deps: [PLATFORM_ID],
    //   multi: true,
    // },
    provideRouter(APP_ROUTES),
    provideClientHydration(),

    // Angularfire Providers
    importProvidersFrom(
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
    ),

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
