import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import {
  BILLING_VALIDATION_MESSAGES,
  CREDIT_CARD_VALIDATION_MESSAGES
} from 'src/app/core/models/forms-and-components/validation-messages.model';
import { Product } from 'src/app/core/models/products/product.model';
import { Store } from '@ngrx/store';
import {
  RootStoreState,
  UiStoreSelectors,
  UiStoreActions,
  BillingStoreActions,
  UserStoreActions,
  UserStoreSelectors,
} from 'src/app/root-store';
import { Observable, Subscription, BehaviorSubject } from 'rxjs';
import { withLatestFrom, map, take } from 'rxjs/operators';
import { GeographicData } from 'src/app/core/models/forms-and-components/geography/geographic-data.model';
import { BillingDetails } from 'src/app/core/models/billing/billing-details.model';
import { CreditCardDetails } from 'src/app/core/models/billing/credit-card-details.model';
import { now } from 'moment';
import { Invoice } from 'src/app/core/models/billing/invoice.model';
import { AnonymousUser } from 'src/app/core/models/user/anonymous-user.model';
import { AngularFirestore } from '@angular/fire/firestore';

@Component({
  selector: 'app-purchase-data-form',
  templateUrl: './purchase-data-form.component.html',
  styleUrls: ['./purchase-data-form.component.scss']
})
export class PurchaseDataFormComponent implements OnInit, OnDestroy {

  @Input() product: Product;

  // This block asynchronously loads user data and patches invoice into purchase form
  @Input()
  set anonymousUser(user: AnonymousUser) {
    this._anonymousUser =  user;
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
  private _anonymousUser: AnonymousUser;
  // tslint:disable-next-line:adjacent-overload-signatures
  get anonymousUser(): AnonymousUser {
    return this._anonymousUser;
  }
  private userLoaded: boolean;
  private formInitialized$ = new BehaviorSubject<boolean>(false);
  private formValuesPatched: boolean;

  private autoSaveTicker: NodeJS.Timer; // Add "types": ["node"] to tsconfig.app.json to remove TS error from NodeJS.Timer function
  private autoSaveSubscription: Subscription;

  geographicData$: Observable<GeographicData>;
  private geographicDataRequested: boolean;

  purchaseDataForm: FormGroup;
  billingValidationMessages = BILLING_VALIDATION_MESSAGES;
  creditCardValidationMessages = CREDIT_CARD_VALIDATION_MESSAGES;
  private nonUsStateCodeValue = 'non-us';

  private invoiceId: string;
  private invoiceInitialized: boolean;
  private initInvoiceTimeout: NodeJS.Timer; // Add "types": ["node"] to tsconfig.app.json to remove TS error from NodeJS.Timer function
  private invoiceSubmitted: boolean;

  constructor(
    private fb: FormBuilder,
    private store$: Store<RootStoreState.State>,
    private afs: AngularFirestore // Used purely to generate an invoice ID
  ) { }

  ngOnInit() {
    this.initializeForm();

    this.initializeGeographicData();

  }

  onSubmit() {
    this.invoiceSubmitted = true;
    this.updateUserBillingAndCCDetails();
    // TODO: dispatch process invoice action and update user details
  }

  // This fires when the select field is changed, allowing access to the object
  // Without this, when saving the form, the field view value will not populate on the form
  setCountry(countryCode: string): void {
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
  setUsState(stateAbbr: string): void {
    this.store$.select(UiStoreSelectors.selectUsStateByAbbr(stateAbbr))
      .pipe(take(1))
      .subscribe(usState => {
        this.billingDetailsGroup.patchValue({
          state: usState.name
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

  private initializeForm(): void {
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
        cardName: [''],
        cardNumber: ['', [Validators.required]],
        cardMonth: ['', [Validators.required]],
        cardYear: ['', [Validators.required]],
        cardCvc: ['', [Validators.required]],
      })
    });
    console.log('Form initialized');
    this.formInitialized$.next(true);
    this.formInitialized$.complete();

    // Auto-create an invoice after 5 seconds on the checkout page
    this.initInvoiceTimeout = setTimeout(() => {
      if (!this.invoiceInitialized) {
        this.initializeInvoice();
      }
      this.createAutoSaveTicker();
    }, 5000);
  }




  private initializeInvoice(): void {
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

    // Set the global invoice id
    this.invoiceId = this.afs.createId();

    const invoiceNoId: Invoice = {
      id: this.invoiceId,
      orderNumber: this.invoiceId.substr(0, 8),
      anonymousUID: this.anonymousUser.id,
      productName: this.product.name,
      productId: this.product.id,
      purchasePrice: this.product.price,
      billingDetails,
      creditCardDetails,
      lastModified: now()
    };

    this.store$.dispatch(new BillingStoreActions.CreateNewInvoiceRequested({invoiceNoId}));
    this.invoiceInitialized = true;
    console.log('Invoice initialized', invoiceNoId);
  }

  private patchUserBillingInfo(): void {
    const billingDetails = this.anonymousUser.billingDetails ? this.anonymousUser.billingDetails : null;
    const creditCardDetails = this.anonymousUser.creditCardDetails ? this.anonymousUser.creditCardDetails : null;
    if (billingDetails) {
      this.billingDetailsGroup.patchValue(this.anonymousUser.billingDetails);
    }
    if (creditCardDetails) {
      this.creditCardDetailsGroup.patchValue(this.anonymousUser.creditCardDetails);
    }
    console.log('User details patched in');
  }

  private createAutoSaveTicker() {
    // Set interval at 5 seconds
    const step = 5000;

    this.autoSaveSubscription = this.store$.select(UserStoreSelectors.selectAppUser)
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

  private killInitProductTimeout(): void {
    clearTimeout(this.initInvoiceTimeout);
  }

  private autoSave(user: AnonymousUser) {
    // Cancel autosave if no changes to content
    if (!this.changesDetected(user) || this.formIsBlank()) {
      console.log('No changes to form, no auto save');
      return;
    }
    // Prevents auto-save from overwriting final form submission data
    if (this.invoiceSubmitted) {
      console.log('Form already submitted, no auto save');
      return;
    }
    this.updateUserBillingAndCCDetails();
    console.log('Auto saving');
  }

  private changesDetected(user: AnonymousUser): boolean {
    const serverBillingDetails = JSON.stringify(this.sortObjectByKeyName(user.billingDetails));
    const formBillingDetails = JSON.stringify(this.sortObjectByKeyName(this.billingDetailsGroup.value));
    const serverCreditCardDetails = JSON.stringify(this.sortObjectByKeyName(user.creditCardDetails));
    const formCreditCardDetails = JSON.stringify(this.sortObjectByKeyName(this.creditCardDetailsGroup.value));

    // console.log('Server billing details', serverBillingDetails);
    // console.log('For billing details', formBillingDetails);
    // console.log('Server credit card details', serverCreditCardDetails);
    // console.log('Form credit card details', formCreditCardDetails);

    if (
      serverBillingDetails === formBillingDetails &&
      serverCreditCardDetails === formCreditCardDetails
    ) {
      return false;
    }
    return true;
  }

  private sortObjectByKeyName(object: {}): {} {
    const keyArray = Object.keys(object);
    keyArray.sort();
    const sortedObject = keyArray.map(key => {
      return object[key];
    });
    return sortedObject;
  }

  private updateUserBillingAndCCDetails() {
    const updatedUser: AnonymousUser = {
      ...this.anonymousUser,
      billingDetails: this.billingDetailsGroup.value,
      creditCardDetails: this.creditCardDetailsGroup.value,
    };
    this.store$.dispatch(new UserStoreActions.StoreUserDataRequested({userData: updatedUser}));
  }

  private formIsBlank() {
    // const formValuesString = JSON.stringify(this.purchaseDataForm.value);
    const formTouched = this.purchaseDataForm.dirty;
    if (formTouched) {
      return false;
    }
    console.log('Form has not been touched');
    return true;
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
  get cardName() { return this.purchaseDataForm.get('creditCardDetailsGroup.cardName'); }
  get cardNumber() { return this.purchaseDataForm.get('creditCardDetailsGroup.cardNumber'); }
  get cardMonth() { return this.purchaseDataForm.get('creditCardDetailsGroup.cardMonth'); }
  get cardYear() { return this.purchaseDataForm.get('creditCardDetailsGroup.cardYear'); }
  get cardCvc() { return this.purchaseDataForm.get('creditCardDetailsGroup.cardCvc'); }

  ngOnDestroy() {

    // Auto save product if navigating away
    if (this.invoiceInitialized && !this.invoiceSubmitted && !this.formIsBlank()) {
      this.updateUserBillingAndCCDetails();
    }

    if (this.autoSaveSubscription) {
      this.autoSaveSubscription.unsubscribe();
    }

    if (this.autoSaveTicker) {
      this.killAutoSaveTicker();
    }

    if (this.initInvoiceTimeout) {
      this.killInitProductTimeout();
    }
  }

}
