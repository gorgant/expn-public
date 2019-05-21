import { NgModule } from '@angular/core';

import { LegalRoutingModule } from './legal-routing.module';
import { PrivacyPolicyComponent } from '../components/privacy-policy/privacy-policy.component';
import { TermsAndConditionsComponent } from '../components/terms-and-conditions/terms-and-conditions.component';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  declarations: [
    PrivacyPolicyComponent,
    TermsAndConditionsComponent
  ],
  imports: [
    SharedModule,
    LegalRoutingModule
  ]
})
export class LegalModule { }
