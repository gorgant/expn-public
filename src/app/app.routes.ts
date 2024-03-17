import { Routes } from '@angular/router';
import { PublicAppRoutes } from '../../shared-models/routes-and-paths/app-routes.model';

export const APP_ROUTES: Routes = [
  {
    path: PublicAppRoutes.ABOUT_ME.slice(1),
    loadChildren: () => import('./content/about/about.routes').then(m => m.ABOUT_ROUTES)
  },
  {
    path: PublicAppRoutes.BLOG.slice(1),
    loadChildren: () => import('./content/blog/blog.routes').then(m => m.BLOG_ROUTES)
  },
  {
    path: PublicAppRoutes.CONTACT.slice(1),
    loadChildren: () => import('./content/contact/contact.routes').then(m => m.CONTACT_ROUTES)
  },
  {
    path: PublicAppRoutes.EMAIL_VERIFICATION.slice(1),
    loadChildren: () => import('./email-verification/email-verification.routes').then(m => m.EMAIL_VERIFICATION_ROUTES)
  },
  {
    path: PublicAppRoutes.HOME,
    loadChildren: () => import('./content/home/home.routes').then(m => m.HOME_ROUTES)
  },
  {
    path: PublicAppRoutes.PODCAST.slice(1),
    loadChildren: () => import('./content/podcast/podcast.routes').then(m => m.PODCAST_ROUTES)
  },
  {
    path: PublicAppRoutes.PRIVACY_POLICY.slice(1),
    loadChildren: () => import('./content/legal/privacy-policy/privacy-policy.routes').then(m => m.PRIVACY_POLICY_ROUTES)
  },
  {
    path: PublicAppRoutes.TERMS_AND_CONDITIONS.slice(1),
    loadChildren: () => import('./content/legal/terms-and-conditions/terms-and-conditions.routes').then(m => m.TERMS_AND_CONDITIONS_ROUTES)
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full'
  },

];
