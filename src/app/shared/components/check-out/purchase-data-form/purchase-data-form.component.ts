import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import {
  BILLING_VALIDATION_MESSAGES,
  CREDIT_CARD_VALIDATION_MESSAGES
} from 'src/app/core/models/forms-and-components/validation-messages.model';
import { ProductData } from 'src/app/core/models/products/product-data.model';
import { Store } from '@ngrx/store';
import { RootStoreState, UiStoreSelectors } from 'src/app/root-store';
import { Observable } from 'rxjs';
import { Country } from 'src/app/core/models/forms-and-components/country.model';

@Component({
  selector: 'app-purchase-data-form',
  templateUrl: './purchase-data-form.component.html',
  styleUrls: ['./purchase-data-form.component.scss']
})
export class PurchaseDataFormComponent implements OnInit {

  @Input() productData: ProductData;

  countryList$: Observable<Country[]>;

  purchaseDataForm: FormGroup;
  billingValidationMessages = BILLING_VALIDATION_MESSAGES;
  creditCardValidationMessages = CREDIT_CARD_VALIDATION_MESSAGES;

  constructor(
    private fb: FormBuilder,
    private store$: Store<RootStoreState.State>
  ) { }

  ngOnInit() {
    this.initializeForm();

    // Categories store already initialized in nav bar component
    this.countryList$ = this.store$.select(
      UiStoreSelectors.selectCountryList
    );
  }

  // This fires when the Country select field is changed, allowing access to the category object
  // Without this, when saving the form, the category name will not populate on the form
  setCountry(countryCode: string) {
    this.store$.select(UiStoreSelectors.selectCountryByCode(countryCode))
      .subscribe(country => {
        this.purchaseDataForm.patchValue({
          country: country.name
        });
      });
  }

  onSubmit() {
    console.log('Purchase Data', this.purchaseDataForm.value);
  }

  private initializeForm() {
    this.purchaseDataForm = this.fb.group({
      billingDetailsGroup: this.fb.group({
        firstName: ['', [Validators.required]],
        lastName: ['', [Validators.required]],
        email: ['', [Validators.required, Validators.email]],
        phone: ['', [Validators.required]],
        billingOne: ['', [Validators.required]],
        billingTwo: [''],
        city: ['', [Validators.required]],
        state: ['', [Validators.required]],
        postalCode: ['', [Validators.required]],
        country: ['', [Validators.required]],
      }),
      creditCardDetailsGroup: this.fb.group({
        cardNumber: ['', [Validators.required]],
        cardMonth: ['', [Validators.required]],
        cardYear: ['', [Validators.required]],
        cardCvc: ['', [Validators.required]],
      })
    });
  }


  // These getters are used for easy access in the HTML template
  get billingDetailsGroup() { return this.purchaseDataForm.get('billingDetailsGroup'); }
  get firstName() { return this.purchaseDataForm.get('billingDetailsGroup.firstName'); }
  get lastName() { return this.purchaseDataForm.get('billingDetailsGroup.lastName'); }
  get email() { return this.purchaseDataForm.get('billingDetailsGroup.email'); }
  get phone() { return this.purchaseDataForm.get('billingDetailsGroup.phone'); }
  get billingOne() { return this.purchaseDataForm.get('billingDetailsGroup.billingOne'); }
  get billingTwo() { return this.purchaseDataForm.get('billingDetailsGroup.billingTwo'); }
  get city() { return this.purchaseDataForm.get('billingDetailsGroup.city'); }
  get state() { return this.purchaseDataForm.get('billingDetailsGroup.state'); }
  get postalCode() { return this.purchaseDataForm.get('billingDetailsGroup.postalCode'); }
  get country() { return this.purchaseDataForm.get('billingDetailsGroup.country'); }

  get creditCardDetailsGroup() { return this.purchaseDataForm.get('creditCardDetailsGroup'); }
  get cardType() { return this.purchaseDataForm.get('creditCardDetailsGroup.cardType'); }
  get cardNumber() { return this.purchaseDataForm.get('creditCardDetailsGroup.cardNumber'); }
  get cardMonth() { return this.purchaseDataForm.get('creditCardDetailsGroup.cardMonth'); }
  get cardYear() { return this.purchaseDataForm.get('creditCardDetailsGroup.cardYear'); }
  get cardCvc() { return this.purchaseDataForm.get('creditCardDetailsGroup.cardCvc'); }

}
