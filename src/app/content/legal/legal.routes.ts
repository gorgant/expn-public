import { Routes } from "@angular/router";
import { PrivacyPolicyComponent } from "./privacy-policy/privacy-policy.component";
import { TermsAndConditionsComponent } from "./terms-and-conditions/terms-and-conditions.component";

export const LEGAL_ROUTES: Routes = [
  {
   path: '',
   component: PrivacyPolicyComponent,
  },
  {
    path: 'privacy-policy',
    component: PrivacyPolicyComponent,
   },
  {
    path: 'terms-and-conditions',
    component: TermsAndConditionsComponent,
   },
];