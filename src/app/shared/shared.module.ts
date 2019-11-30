import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MaterialModule } from '../material.module';
import { SubscribeComponent } from './components/email-collection/subscribe/subscribe.component';
import { PageHeroComponent } from './components/page-hero/page-hero.component';
import { PostCollectionComponent } from '../content/components/blog/components/post-collection/post-collection.component';
import { PostItemComponent } from '../content/components/blog/components/post-item/post-item.component';
import { RouterModule } from '@angular/router';
import { MatElevationDirective } from './directives/mat-elevation.directive';
import { TestamonialComponent } from './components/testamonial/testamonial.component';
import { AvatarPortraitComponent } from './components/avatar-portrait/avatar-portrait.component';
import { ScrollableDirective } from './directives/scrollable.directive';
import { AppShellNoRenderDirective } from './directives/app-shell-no-render.directive';
import { AppShellRenderDirective } from './directives/app-shell-render.directive';
import { LazyLoadImageModule, scrollPreset } from 'ng-lazyload-image';
import { DownloadPromoComponent } from './components/email-collection/download-promo/download-promo.component';

@NgModule({
  declarations: [
    SubscribeComponent,
    PageHeroComponent,
    PostCollectionComponent,
    PostItemComponent,
    MatElevationDirective,
    TestamonialComponent,
    AvatarPortraitComponent,
    ScrollableDirective,
    AppShellNoRenderDirective,
    AppShellRenderDirective,
    DownloadPromoComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    MaterialModule,
    FlexLayoutModule,
    LazyLoadImageModule,
  ],
  exports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MaterialModule,
    FlexLayoutModule,
    SubscribeComponent,
    PageHeroComponent,
    PostCollectionComponent,
    PostItemComponent,
    MatElevationDirective,
    TestamonialComponent,
    AvatarPortraitComponent,
    ScrollableDirective,
    AppShellNoRenderDirective,
    AppShellRenderDirective,
    LazyLoadImageModule,
    DownloadPromoComponent
  ]
})
export class SharedModule { }
