import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreModule } from '@ngrx/store';
import { featureReducer } from './reducer';
import { EffectsModule } from '@ngrx/effects';
import { ProductStoreEffects } from './effects';
import { PublicFeatureNames } from 'shared-models/ngrx-store/feature-names';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    StoreModule.forFeature(PublicFeatureNames.PRODUCTS, featureReducer),
    EffectsModule.forFeature([ProductStoreEffects])
  ],
  providers: [ProductStoreEffects]
})
export class ProductStoreModule { }
