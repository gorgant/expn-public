import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreModule } from '@ngrx/store';
import { featureReducer } from './reducer';
import { EffectsModule } from '@ngrx/effects';
import { UiStoreEffects } from './effects';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    StoreModule.forFeature('ui', featureReducer),
    EffectsModule.forFeature([UiStoreEffects])
  ],
  providers: [UiStoreEffects]
})
export class UiStoreModule { }
