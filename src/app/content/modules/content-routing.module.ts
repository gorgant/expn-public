import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from '../components/home/home.component';
import { AboutComponent } from '../components/about/about.component';
import { BlogComponent } from '../components/blog/blog.component';
import { ServicesComponent } from '../components/services/services.component';
import { PodcastComponent } from '../components/podcast/podcast.component';
import { ContactComponent } from '../components/contact/contact.component';

const routes: Routes = [
  {
    path: 'home',
    component: HomeComponent
  },
  {
    path: 'about',
    component: AboutComponent
  },
  {
    path: 'services',
    component: ServicesComponent
  },
  {
    path: 'blog',
    component: BlogComponent
  },
  {
    path: 'podcast',
    component: PodcastComponent
  },
  {
    path: 'contact',
    component: ContactComponent
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ContentRoutingModule { }
