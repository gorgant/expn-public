import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../material.module';
import { SubscribeComponent } from './components/subscribe/subscribe.component';
import { PageHeroComponent } from './components/page-hero/page-hero.component';
import { PostCollectionComponent } from './components/post-collection/post-collection.component';
import { PostItemComponent } from './components/post-item/post-item.component';
import { RouterModule } from '@angular/router';
import { MatElevationDirective } from './directives/mat-elevation.directive';

@NgModule({
  declarations: [
    SubscribeComponent,
    PageHeroComponent,
    PostCollectionComponent,
    PostItemComponent,
    MatElevationDirective
  ],
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MaterialModule,
    FlexLayoutModule,
  ],
  exports: [
    CommonModule,
    ReactiveFormsModule,
    MaterialModule,
    FlexLayoutModule,
    SubscribeComponent,
    PageHeroComponent,
    PostCollectionComponent,
    PostItemComponent,
    MatElevationDirective
  ]
})
export class SharedModule { }
