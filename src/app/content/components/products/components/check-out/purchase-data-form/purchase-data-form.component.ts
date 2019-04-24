import { Component, OnInit, Input, AfterViewInit, OnDestroy } from '@angular/core';
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
  BillingStoreSelectors,
} from 'src/app/root-store';
import { Observable, BehaviorSubject, Subscription } from 'rxjs';
import { withLatestFrom, map, take, takeWhile } from 'rxjs/operators';
import { GeographicData } from 'src/app/core/models/forms-and-components/geography/geographic-data.model';
import { BillingDetails } from 'src/app/core/models/billing/billing-details.model';
import { CreditCardDetails } from 'src/app/core/models/billing/credit-card-details.model';
import { now } from 'moment';
import { Invoice } from 'src/app/core/models/billing/invoice.model';
import { AnonymousUser } from 'src/app/core/models/user/anonymous-user.model';

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
      this.loadExistingInvoiceData();
      this.userLoaded = true;
      // If purchase data form isn't immediately available, wait for form to load, then patch values
      // This is the case when loading from separate page
      if (!this.purchaseDataForm) {
        this.formInitialized$
          .subscribe(formInitialized => {
            if (formInitialized) {
              this.patchExistingValuesIntoForm();
            }
          });
      } else {
        this.patchExistingValuesIntoForm();
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


  invoiceData$: Observable<Invoice>;
  private invoiceDataRequested: boolean;
  private invoiceSubscription: Subscription;

  geographicData$: Observable<GeographicData>;
  private geographicDataRequested: boolean;

  private purchaseDataForm: FormGroup;
  billingValidationMessages = BILLING_VALIDATION_MESSAGES;
  creditCardValidationMessages = CREDIT_CARD_VALIDATION_MESSAGES;
  private nonUsStateCodeValue = 'non-us';

  private invoiceInitialized: boolean;

  constructor(
    private fb: FormBuilder,
    private store$: Store<RootStoreState.State>,
  ) { }

  ngOnInit() {
    this.initializeForm();

    this.initializeGeographicData();

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
        cardNumber: ['', [Validators.required]],
        cardMonth: ['', [Validators.required]],
        cardYear: ['', [Validators.required]],
        cardCvc: ['', [Validators.required]],
      })
    });
    console.log('Form initialized');
    this.formInitialized$.next(true);
    this.formInitialized$.complete();
  }

  private loadExistingInvoiceData(): void {
    this.invoiceData$ = this.store$.select(BillingStoreSelectors.selectInvoice)
      .pipe(
        withLatestFrom(this.store$.select(BillingStoreSelectors.selectInvoiceLoaded)),
        map(([invoice, invoiceLoaded]) => {
          if (!invoiceLoaded && !this.invoiceDataRequested) {
            this.store$.dispatch(new BillingStoreActions.LoadLatestInvoiceRequested({userId: this.anonymousUser.id}));
          }
          this.invoiceDataRequested = true;
          console.log('Loaded invoice data');
          return invoice;
        })
      );
  }

  private patchExistingValuesIntoForm(): void {
    this.invoiceSubscription = this.invoiceData$
      .pipe(
        takeWhile(invoice => {
          console.log('Taking for now', this.formValuesPatched);
          return !this.formValuesPatched;
        })
      )
      .subscribe(invoice => {
        // If invoice exists, patch invoice values
        if (invoice) {
          this.invoiceInitialized = true;
          console.log('Patching values into form');
          this.billingDetailsGroup.patchValue(invoice.billingDetails);
          this.creditCardDetailsGroup.patchValue(invoice.creditCardDetails);
          this.formValuesPatched = true;
        } else {
          console.log('No invoice exists for user');
        }
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

    const invoiceNoId: Invoice = {
      anonymousUID: this.anonymousUser.id,
      productName: this.product.name,
      productId: this.product.id,
      purchaseDate: now(),
      purchasePrice: this.product.price,
      billingDetails,
      creditCardDetails,
      lastModified: now()
    };

    this.store$.dispatch(new BillingStoreActions.CreateNewInvoiceRequested({invoiceNoId}));
    this.invoiceInitialized = true;
    console.log('Invoice initialized', invoiceNoId);
  }

  private createAutoSaveTicker() {
    // Set interval at 5 seconds
    const step = 5000;


    this.autoSaveSubscription = this.productService.fetchSingleProduct(this.productId)
      .subscribe(product => {
        if (this.autoSaveTicker) {
          // Clear old interval
          this.killAutoSaveTicker();
          console.log('clearing old interval');
        }
        if (product) {
          // Refresh interval every 10 seconds
          console.log('Creating autosave ticker');
          this.autoSaveTicker = setInterval(() => {
            this.autoSave(product);
          }, step);
        }
      });

  }

  private autoSave(product: Product) {
    // Cancel autosave if no changes to content
    if (!this.changesDetected(product)) {
      console.log('No changes to content, no auto save');
      return;
    }
    this.updateInvoice();
    console.log('Auto saving post');
  }

  private changesDetected(invoice: Invoice): boolean {
    if (

    ) {
      return false;
    }
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
  get cardType() { return this.purchaseDataForm.get('creditCardDetailsGroup.cardType'); }
  get cardNumber() { return this.purchaseDataForm.get('creditCardDetailsGroup.cardNumber'); }
  get cardMonth() { return this.purchaseDataForm.get('creditCardDetailsGroup.cardMonth'); }
  get cardYear() { return this.purchaseDataForm.get('creditCardDetailsGroup.cardYear'); }
  get cardCvc() { return this.purchaseDataForm.get('creditCardDetailsGroup.cardCvc'); }

  ngOnDestroy() {
    if (this.invoiceSubscription) {
      this.invoiceSubscription.unsubscribe();
    }
  }

}
