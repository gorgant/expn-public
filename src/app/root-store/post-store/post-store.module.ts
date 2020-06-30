import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreModule } from '@ngrx/store';
import { featureReducer } from './reducer';
import { EffectsModule } from '@ngrx/effects';
import { PostStoreEffects } from './effects';
import { PublicFeatureNames } from 'shared-models/ngrx-store/feature-names';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    StoreModule.forFeature(PublicFeatureNames.POSTS, featureReducer),
    EffectsModule.forFeature([PostStoreEffects])
  ],
  providers: [PostStoreEffects]
})
export class PostStoreModule { }
