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
import { BuyNowBoxComponent } from './components/buy-now-box/buy-now-box.component';
import { TestamonialComponent } from './components/testamonial/testamonial.component';
import { AvatarPortraitComponent } from './components/avatar-portrait/avatar-portrait.component';
import { CheckOutComponent } from './components/check-out/check-out.component';
import { PurchaseDataFormComponent } from './components/check-out/purchase-data-form/purchase-data-form.component';
import { ProductSummaryComponent } from './components/check-out/product-summary/product-summary.component';
import { ProductCardComponent } from './components/product-card/product-card.component';

@NgModule({
  declarations: [
    SubscribeComponent,
    PageHeroComponent,
    PostCollectionComponent,
    PostItemComponent,
    MatElevationDirective,
    BuyNowBoxComponent,
    TestamonialComponent,
    AvatarPortraitComponent,
    CheckOutComponent,
    PurchaseDataFormComponent,
    ProductSummaryComponent,
    ProductCardComponent
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
    MatElevationDirective,
    BuyNowBoxComponent,
    TestamonialComponent,
    AvatarPortraitComponent,
    CheckOutComponent,
    ProductCardComponent
  ]
})
export class SharedModule { }
