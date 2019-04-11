import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../material.module';
import { SubscribeComponent } from './components/subscribe/subscribe.component';
import { PageHeroComponent } from './components/page-hero/page-hero.component';
import { EInActionComponent } from './components/e-in-action/e-in-action.component';

@NgModule({
  declarations: [
    SubscribeComponent,
    PageHeroComponent,
    EInActionComponent
  ],
  imports: [
    CommonModule,
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
    PageHeroComponent
  ]
})
export class SharedModule { }
