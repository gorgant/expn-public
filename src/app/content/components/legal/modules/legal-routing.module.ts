import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PrivacyPolicyComponent } from '../components/privacy-policy/privacy-policy.component';
import { TermsAndConditionsComponent } from '../components/terms-and-conditions/terms-and-conditions.component';

const routes: Routes = [
  {
    path: 'privacy-policy',
    component: PrivacyPolicyComponent
  },
  {
    path: 'terms-and-conditions',
    component: TermsAndConditionsComponent
  },
  {
    path: '',
    redirectTo: 'privacy-policy',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LegalRoutingModule { }
