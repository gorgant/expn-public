import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import {
  BILLING_VALIDATION_MESSAGES,
  CREDIT_CARD_VALIDATION_MESSAGES
} from 'src/app/core/models/forms-and-components/validation-messages.model';
import { ProductData } from 'src/app/core/models/products/product-data.model';
import { Store } from '@ngrx/store';
import { RootStoreState, UiStoreSelectors, UiStoreActions } from 'src/app/root-store';
import { Observable } from 'rxjs';
import { withLatestFrom, map, take } from 'rxjs/operators';
import { GeographicData } from 'src/app/core/models/forms-and-components/geography/geographic-data.model';
import { BillingDetails } from 'src/app/core/models/products/billing-details.model';
import { CreditCardDetails } from 'src/app/core/models/products/credit-card-details.model';
import { Invoice } from 'src/app/core/models/products/invoice.model';
import { now } from 'moment';

@Component({
  selector: 'app-purchase-data-form',
  templateUrl: './purchase-data-form.component.html',
  styleUrls: ['./purchase-data-form.component.scss']
})
export class PurchaseDataFormComponent implements OnInit {

  @Input() productData: ProductData;

  geographicData$: Observable<GeographicData>;
  geographicDataLoaded: boolean;

  purchaseDataForm: FormGroup;
  billingValidationMessages = BILLING_VALIDATION_MESSAGES;
  creditCardValidationMessages = CREDIT_CARD_VALIDATION_MESSAGES;
  nonUsStateCodeValue = 'non-us';

  constructor(
    private fb: FormBuilder,
    private store$: Store<RootStoreState.State>
  ) { }

  ngOnInit() {
    this.initializeForm();

    // Categories store already initialized in nav bar component
    this.geographicData$ = this.store$.select(UiStoreSelectors.selectGeographicData)
      .pipe(
        withLatestFrom(
          this.store$.select(UiStoreSelectors.selectGeographicDataLoaded)
        ),
        map(([geographicData, geoStoreLoaded]) => {
          if (!geoStoreLoaded && !this.geographicDataLoaded) {
            console.log('No geo data loaded, fetching from server');
            this.store$.dispatch(new UiStoreActions.GeographicDataRequested());
          }
          this.geographicDataLoaded = true; // Prevents loading from firing more than needed
          return geographicData;
        })
      );
  }

  // This fires when the select field is changed, allowing access to the object
  // Without this, when saving the form, the field view value will not populate on the form
  setCountry(countryCode: string) {
    this.store$.select(UiStoreSelectors.selectCountryByCode(countryCode))
      .pipe(take(1))
      .subscribe(country => {
        // If switching from U.S. to another country and there is a U.S. state value present, purge it
        if (country.code !== 'US' && this.usStateCode.value && this.usStateCode.value !== this.nonUsStateCodeValue) {
          console.log('State value detected, removing it bc country changed');
          this.billingDetailsGroup.patchValue({
            state: '',
            usStateCode: this.nonUsStateCodeValue
          });
        }

        // If switching from U.S. to another country and there is a U.S. state value present, purge it
        if (country.code === 'US') {
          console.log('U.S. selected, clearing default stateCodeValue');
          this.billingDetailsGroup.patchValue({
            usStateCode: ''
          });
        }


        this.billingDetailsGroup.patchValue({
          country: country.name
        });
      });
  }

  // This fires when the select field is changed, allowing access to the object
  // Without this, when saving the form, the field view value not populate on the form
  setUsState(stateAbbr: string) {
    this.store$.select(UiStoreSelectors.selectUsStateByAbbr(stateAbbr))
      .pipe(take(1))
      .subscribe(usState => {
        this.billingDetailsGroup.patchValue({
          state: usState.name
        });
      });
  }

  onSubmit() {
    const billingDetails: BillingDetails = {
      firstName: this.firstName.value,
      lastName: this.lastName.value,
      email: this.email.value,
      phone: this.phone.value,
      billingOne: this.billingOne.value,
      billingTwo: this.billingTwo.value,
      city: this.city.value,
      state: this.state.value,
      usStateCode: this.usStateCode.value,
      postalCode: this.postalCode.value,
      country: this.country.value,
      countryCode: this.countryCode.value,
    };

    const creditCardDetails: CreditCardDetails = {
      cardName: `${this.firstName.value} ${this.lastName.value}`,
      cardNumber: this.cardNumber.value,
      cardMonth: this.cardMonth.value,
      cardYear: this.cardYear.value,
      cardCvc: this.cardCvc.value,
    };

    const invoice: Invoice = {
      invoiceId: 'TEMP INVOICE ID',
      productName: this.productData.title,
      productId: 'TEMP PRDOUCT ID',
      purchaseDate: now(),
      purchasePrice: this.productData.price,
      customerId: 'TEMP CUSTOMER ID',
      billingDetails,
      creditCardDetails,
    };

    console.log('Purchase Data', invoice);
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
        usStateCode: [this.nonUsStateCodeValue, [Validators.required]],
        postalCode: ['', [Validators.required]],
        country: [''],
        countryCode: ['', [Validators.required]]
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
  get usStateCode() { return this.purchaseDataForm.get('billingDetailsGroup.usStateCode'); }
  get postalCode() { return this.purchaseDataForm.get('billingDetailsGroup.postalCode'); }
  get country() { return this.purchaseDataForm.get('billingDetailsGroup.country'); }
  get countryCode() { return this.purchaseDataForm.get('billingDetailsGroup.countryCode'); }

  get creditCardDetailsGroup() { return this.purchaseDataForm.get('creditCardDetailsGroup'); }
  get cardType() { return this.purchaseDataForm.get('creditCardDetailsGroup.cardType'); }
  get cardNumber() { return this.purchaseDataForm.get('creditCardDetailsGroup.cardNumber'); }
  get cardMonth() { return this.purchaseDataForm.get('creditCardDetailsGroup.cardMonth'); }
  get cardYear() { return this.purchaseDataForm.get('creditCardDetailsGroup.cardYear'); }
  get cardCvc() { return this.purchaseDataForm.get('creditCardDetailsGroup.cardCvc'); }

}
