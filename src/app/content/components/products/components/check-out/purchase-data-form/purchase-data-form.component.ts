import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import {
  RootStoreState,
  UiStoreSelectors,
  UiStoreActions,
  BillingStoreActions,
  UserStoreActions,
  UserStoreSelectors,
  BillingStoreSelectors,
} from 'src/app/root-store';
import { Observable, Subscription, BehaviorSubject } from 'rxjs';
import { withLatestFrom, map, take } from 'rxjs/operators';
import { Product } from 'shared-models/products/product.model';
import { PublicUser } from 'shared-models/user/public-user.model';
import { GeographicData } from 'shared-models/forms-and-components/geography/geographic-data.model';
import { BILLING_VALIDATION_MESSAGES } from 'shared-models/forms-and-components/public-validation-messages.model';
import { Country } from 'shared-models/forms-and-components/geography/country.model';
import { BillingDetails, BillingKeys } from 'shared-models/billing/billing-details.model';

@Component({
  selector: 'app-purchase-data-form',
  templateUrl: './purchase-data-form.component.html',
  styleUrls: ['./purchase-data-form.component.scss']
})
export class PurchaseDataFormComponent implements OnInit, OnDestroy {

  @Input() product: Product;

  // This block asynchronously loads user data and patches invoice into purchase form
  @Input()
  set publicUser(user: PublicUser) {
    this._publicUser =  user;
    // Set item once is available
    if (user && !this.userLoaded) {
      this.userLoaded = true; // Prevents this from firing multiple times
      // If purchase data form isn't immediately available, wait for form to load, then patch values
      // This is the case when loading from separate page, user loads faster than form
      if (!this.purchaseDataForm) {
        this.formInitialized$
          .subscribe(formInitialized => {
            if (formInitialized) {
              this.patchUserBillingInfo(); // Once form is loaded, patch in values
            }
          });
      } else {
        this.patchUserBillingInfo(); // If form is already loaded, just patch the values in directly
      }
    }
  }
  // tslint:disable-next-line:variable-name
  private _publicUser: PublicUser;
  // tslint:disable-next-line:adjacent-overload-signatures
  get publicUser(): PublicUser {
    return this._publicUser;
  }
  private userLoaded: boolean;
  private formInitialized$ = new BehaviorSubject<boolean>(false);

  private autoSaveTicker: NodeJS.Timer; // Add "types": ["node"] to tsconfig.app.json to remove TS error from NodeJS.Timer function
  private autoSaveSubscription: Subscription;

  geographicData$: Observable<GeographicData>;
  private geographicDataRequested: boolean;

  purchaseDataForm: FormGroup;
  billingValidationMessages = BILLING_VALIDATION_MESSAGES;
  private nonUsStateCodeValue = 'non-us';

  constructor(
    private fb: FormBuilder,
    private store$: Store<RootStoreState.State>,
  ) { }

  ngOnInit() {
    this.initializeBillingDetailsForm();

    this.initializeGeographicData();

    // Clear out any previous billing data in the state
    this.store$.dispatch(new BillingStoreActions.PurgeBillingState());
  }

  onSubmit(event: Event) {
    event.preventDefault(); // Purchase takes place on Stripe form component
  }


  // This fires when the select field is changed, allowing access to the object
  // Without this, when saving the form, the field view value will not populate on the form
  getCountry(countryCode: string): void {
    this.store$.select(UiStoreSelectors.selectCountryByCode(countryCode))
      .pipe(take(1))
      .subscribe(country => {
        this.patchStateandCountryValues(country);
        this.patchPhoneDialPrefix(country);
        this.setStateValidators();

      });
  }

  private patchStateandCountryValues(country: Country) {
    // If switching from U.S. to another country and there is a U.S. state value present, purge it
    if (country.code !== 'US' && this.usStateCode.value && this.usStateCode.value !== this.nonUsStateCodeValue) {
      console.log('State value detected, removing it bc country changed');
      this.billingDetailsGroup.patchValue({
        [BillingKeys.STATE]: '',
        [BillingKeys.US_STATE_CODE]: this.nonUsStateCodeValue
      });
    }

    // If switching from U.S. to another country and there is a U.S. state value present, purge it
    if (country.code === 'US') {
      console.log('U.S. selected, clearing default stateCodeValue');
      this.billingDetailsGroup.patchValue({
        [BillingKeys.US_STATE_CODE]: ''
      });
    }

    this.billingDetailsGroup.patchValue({
      [BillingKeys.COUNTRY]: country.name
    });

  }

  private setStateValidators() {

    switch (this.countryCode.value) {
      case 'US':
        this.state.setValidators([Validators.required]);
        console.log('US country, adding state validators');
        break;
      case !'US':
        console.log('Non-us country, removing state validators');
        this.state.setValidators([]);
        break;
      default:
        console.log('Unknown country, removing state validators');
        this.state.setValidators([]);
        break;
    }

  }

  private patchPhoneDialPrefix(country: Country) {
    const dialPrefix = `+${country.dial} `;
    let existingPhoneValue = this[BillingKeys.PHONE].value as string;
    if (existingPhoneValue.includes('+')) {
      if (existingPhoneValue.includes(' ')) {
        existingPhoneValue = existingPhoneValue.substr(existingPhoneValue.indexOf(' ') + 1);
      } else {
        existingPhoneValue = '';
      }
    }
    this.billingDetailsGroup.patchValue({
      [BillingKeys.PHONE]: existingPhoneValue ? `${dialPrefix}${existingPhoneValue}` : dialPrefix
    });
  }

  // This fires when the select field is changed, allowing access to the object
  // Without this, when saving the form, the field view value not populate on the form
  setUsState(stateAbbr: string): void {
    this.store$.select(UiStoreSelectors.selectUsStateByAbbr(stateAbbr))
      .pipe(take(1))
      .subscribe(usState => {
        this.billingDetailsGroup.patchValue({
          [BillingKeys.STATE]: usState.name
        });
      });
  }

  private initializeGeographicData(): void {
    this.geographicData$ = this.store$.select(UiStoreSelectors.selectGeographicData)
    .pipe(
      withLatestFrom(
        this.store$.select(UiStoreSelectors.selectGeographicDataLoaded)
      ),
      map(([geographicData, geoStoreLoaded]) => {
        if (!geoStoreLoaded && !this.geographicDataRequested) {
          console.log('No geo data loaded, fetching from server');
          this.store$.dispatch(new UiStoreActions.GeographicDataRequested());
        }
        this.geographicDataRequested = true; // Prevents loading from firing more than needed
        return geographicData;
      })
    );
  }

  private initializeBillingDetailsForm(): void {
    this.purchaseDataForm = this.fb.group({
      billingDetailsGroup: this.fb.group({
        [BillingKeys.FIRST_NAME]: ['', [Validators.required]],
        [BillingKeys.LAST_NAME]: ['', [Validators.required]],
        [BillingKeys.EMAIL]: ['', [Validators.required, Validators.email]],
        [BillingKeys.PHONE]: ['', [Validators.required]],
        [BillingKeys.BILLING_ONE]: ['', [Validators.required]],
        [BillingKeys.BILLING_TWO]: [''],
        [BillingKeys.CITY]: ['', [Validators.required]],
        [BillingKeys.STATE]: ['', []],
        [BillingKeys.US_STATE_CODE]: [this.nonUsStateCodeValue, [Validators.required]],
        [BillingKeys.COUNTRY]: [''],
        [BillingKeys.COUNTRY_CODE]: ['', [Validators.required]]
      })
    });
    console.log('Form initialized');
    this.formInitialized$.next(true);
    this.formInitialized$.complete();

    this.createAutoSaveTicker();

  }

  private patchUserBillingInfo(): void {
    const billingDetails = this.publicUser.billingDetails ? this.publicUser.billingDetails : null;
    if (billingDetails) {
      this.billingDetailsGroup.patchValue(this.publicUser.billingDetails);
      this.setStateValidators();
    }

    console.log('User details patched in');
  }

  private createAutoSaveTicker() {
    // Set interval at 5 seconds
    const step = 5000;

    this.autoSaveSubscription = this.store$.select(UserStoreSelectors.selectUser)
      .subscribe(user => {
        if (this.autoSaveTicker) {
          // Clear old interval
          this.killAutoSaveTicker();
          console.log('clearing old interval');
        }
        if (user) {
          // Refresh interval every step count
          console.log('Creating autosave ticker');
          this.autoSaveTicker = setInterval(() => {
            this.autoSave(user);
          }, step);
        }
      });
  }

  private killAutoSaveTicker(): void {
    clearInterval(this.autoSaveTicker);
  }

  private autoSave(user: PublicUser) {
    // Cancel autosave if no changes to content
    if (!this.changesDetected(user) || this.formIsBlank()) {
      console.log('No changes to form, no auto save');
      return;
    }

    // Prevents auto-save from overwriting final form submission data
    this.store$.select(BillingStoreSelectors.selectIsProcessingPayment)
      .pipe(take(1))
      .subscribe(paymentProcessing => {
        if (paymentProcessing) {
          console.log('Payment processing, no auto save');
          return;
        }
        this.updateUserBillingDetails(); // Execute auto-save logic
        console.log('Auto saving');
      });
  }

  private changesDetected(user: PublicUser): boolean {
    const serverBillingDetailsNoPostal = {...user.billingDetails};
    delete serverBillingDetailsNoPostal.postalCode; // Remove postal code from server version since it isn't collected in form
    const serverBillingDetails = JSON.stringify(this.sortObjectByKeyName(serverBillingDetailsNoPostal));
    const formBillingDetails = JSON.stringify(this.sortObjectByKeyName(this.trimmedBillingDetailsData));

    // console.log('Server Billing Details', serverBillingDetails);
    // console.log('Form Billing Details', formBillingDetails);

    if (serverBillingDetails === formBillingDetails) {
      return false;
    }
    return true;
  }

  private sortObjectByKeyName(object: {}): {} {
    // Check for object, if new user, billing details don't yet exist
    if (object) {
      const keyArray = Object.keys(object);
      keyArray.sort();
      const sortedObject = keyArray.map(key => object[key]);
      return sortedObject;
    }
    return {};
  }

  private updateUserBillingDetails() {
    const updatedUser: PublicUser = {
      ...this.publicUser,
      billingDetails: this.trimmedBillingDetailsData,
    };
    this.store$.dispatch(new UserStoreActions.StoreUserDataRequested({userData: updatedUser}));
  }

  private formIsBlank() {
    const formTouched = this.purchaseDataForm.dirty;
    if (formTouched) {
      return false;
    }
    console.log('Form has not been touched');
    return true;
  }

  // These getters are used for easy access in the HTML template
  get billingDetailsGroup() { return this.purchaseDataForm.get('billingDetailsGroup'); }
  // get billingDetailsData(): BillingDetails { return this.trimmedBillingDetailsData; }
  get [BillingKeys.FIRST_NAME]() { return this.purchaseDataForm.get(`billingDetailsGroup.${BillingKeys.FIRST_NAME}`); }
  get [BillingKeys.LAST_NAME]() { return this.purchaseDataForm.get(`billingDetailsGroup.${BillingKeys.LAST_NAME}`); }
  get [BillingKeys.EMAIL]() { return this.purchaseDataForm.get(`billingDetailsGroup.${BillingKeys.EMAIL}`); }
  get [BillingKeys.PHONE]() { return this.purchaseDataForm.get(`billingDetailsGroup.${BillingKeys.PHONE}`); }
  get [BillingKeys.BILLING_ONE]() { return this.purchaseDataForm.get(`billingDetailsGroup.${BillingKeys.BILLING_ONE}`); }
  get [BillingKeys.BILLING_TWO]() { return this.purchaseDataForm.get(`billingDetailsGroup.${BillingKeys.BILLING_TWO}`); }
  get [BillingKeys.CITY]() { return this.purchaseDataForm.get(`billingDetailsGroup.${BillingKeys.CITY}`); }
  get [BillingKeys.STATE]() { return this.purchaseDataForm.get(`billingDetailsGroup.${BillingKeys.STATE}`); }
  get [BillingKeys.US_STATE_CODE]() { return this.purchaseDataForm.get(`billingDetailsGroup.${BillingKeys.US_STATE_CODE}`); }
  get [BillingKeys.COUNTRY]() { return this.purchaseDataForm.get(`billingDetailsGroup.${BillingKeys.COUNTRY}`); }
  get [BillingKeys.COUNTRY_CODE]() { return this.purchaseDataForm.get(`billingDetailsGroup.${BillingKeys.COUNTRY_CODE}`); }
  // Get trimmed version of billing details
  get trimmedBillingDetailsData(): Partial<BillingDetails> {
    // Partial because postal code isn't collected in this form
    const trimmedData: Partial<BillingDetails> = {
      [BillingKeys.FIRST_NAME]: (this[BillingKeys.FIRST_NAME].value as string).trim(),
      [BillingKeys.LAST_NAME]: (this[BillingKeys.LAST_NAME].value as string).trim(),
      [BillingKeys.EMAIL]: (this[BillingKeys.EMAIL].value as string).trim(),
      [BillingKeys.PHONE]: (this[BillingKeys.PHONE].value as string).trim(),
      [BillingKeys.BILLING_ONE]: (this[BillingKeys.BILLING_ONE].value as string).trim(),
      [BillingKeys.BILLING_TWO]: (this[BillingKeys.BILLING_TWO].value as string).trim(),
      [BillingKeys.CITY]: (this[BillingKeys.CITY].value as string).trim(),
      [BillingKeys.STATE]: (this[BillingKeys.STATE].value as string).trim(),
      [BillingKeys.US_STATE_CODE]: (this[BillingKeys.US_STATE_CODE].value as string).trim(),
      // [BillingKeys.POSTAL_CODE]: null, // Not included because not collected on this form
      [BillingKeys.COUNTRY]: (this[BillingKeys.COUNTRY].value as string).trim(),
      [BillingKeys.COUNTRY_CODE]: (this[BillingKeys.COUNTRY_CODE].value as string).trim()
    };
    return trimmedData;
  }

  ngOnDestroy() {

    // Auto save product if navigating away
    if (!this.formIsBlank()) {
      this.updateUserBillingDetails();
    }

    if (this.autoSaveSubscription) {
      this.autoSaveSubscription.unsubscribe();
    }

    if (this.autoSaveTicker) {
      this.killAutoSaveTicker();
    }

  }

}
