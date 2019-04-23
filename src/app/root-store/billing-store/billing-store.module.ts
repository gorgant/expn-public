import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreModule } from '@ngrx/store';
import { featureReducer } from './reducer';
import { EffectsModule } from '@ngrx/effects';
import { BillingStoreEffects } from './effects';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    StoreModule.forFeature('billing', featureReducer),
    EffectsModule.forFeature([BillingStoreEffects])
  ],
  providers: [BillingStoreEffects]
})
export class BillingStoreModule { }
