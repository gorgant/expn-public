import { Routes } from "@angular/router";

export const CONTENT_ROUTES: Routes = [
  {
    path: '',
    loadChildren: () => import('./home/home.routes').then(m => m.HOME_ROUTES)
  },
  {
    path: 'about',
    loadChildren: () => import('./about/about.routes').then(m => m.ABOUT_ROUTES)
  },
  {
    path: 'blog',
    loadChildren: () => import('./blog/blog.routes').then(m => m.BLOG_ROUTES)
  },
  {
    path: 'contact',
    loadChildren: () => import('./contact/contact.routes').then(m => m.CONTACT_ROUTES)
  },
  {
    path: 'legal',
    loadChildren: () => import('./legal/legal.routes').then(m => m.LEGAL_ROUTES)
  },
  {
    path: 'podcast  ',
    loadChildren: () => import('./podcast/podcast.routes').then(m => m.PODCAST_ROUTES)
  },

]