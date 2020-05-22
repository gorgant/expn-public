import { BrowserModule, BrowserTransferStateModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from './material.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { NavigationModule } from './navigation/modules/navigation.module';
import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireStorageModule } from '@angular/fire/storage';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFireFunctionsModule } from '@angular/fire/functions';
import { environment } from '../environments/environment';
import { RootStoreModule } from './root-store';
import { HttpClientModule } from '@angular/common/http';

import { TransferHttpCacheModule } from '@nguniversal/common';
import { DownloadPromoComponent } from './shared/components/email-collection/download-promo/download-promo.component';
import { PRODUCTION_APPS, SANDBOX_APPS } from 'shared-models/environments/env-vars.model';
import { SubProgressTrackerComponent } from './shared/components/email-collection/sub-progress-tracker/sub-progress-tracker.component';



@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule.withServerTransition(
        {
          appId: environment.production ? PRODUCTION_APPS.explearningPublicApp.projectId : SANDBOX_APPS.explearningPublicApp.projectId
        }
      ),
    TransferHttpCacheModule,
    BrowserTransferStateModule,
    BrowserAnimationsModule,
    HttpClientModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule,
    AngularFireAuthModule,
    AngularFireStorageModule,
    AngularFireFunctionsModule,
    MaterialModule,
    FlexLayoutModule.withConfig({ssrObserveBreakpoints: ['gt-sm', 'gt-md', 'lt-md']}),
    RootStoreModule,
    NavigationModule,
    AppRoutingModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
  entryComponents: [
    DownloadPromoComponent,
    SubProgressTrackerComponent
  ]
})
export class AppModule { }
