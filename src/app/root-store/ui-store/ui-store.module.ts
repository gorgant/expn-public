import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreModule } from '@ngrx/store';
import { featureReducer } from './reducer';
import { EffectsModule } from '@ngrx/effects';
import { UiStoreEffects } from './effects';
import { PublicFeatureNames } from 'shared-models/ngrx-store/feature-names';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    StoreModule.forFeature(PublicFeatureNames.UI, featureReducer),
    EffectsModule.forFeature([UiStoreEffects])
  ],
  providers: [UiStoreEffects]
})
export class UiStoreModule { }
