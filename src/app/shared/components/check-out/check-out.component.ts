import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import {
  BILLING_VALIDATION_MESSAGES,
  CREDIT_CARD_VALIDATION_MESSAGES
} from 'src/app/core/models/forms-and-components/validation-messages.model';
import { ProductData } from 'src/app/core/models/products/product-data.model';
import { ImagePaths } from 'src/app/core/models/routes-and-paths/image-paths.model';
import { Store } from '@ngrx/store';
import { RootStoreState, UserStoreSelectors } from 'src/app/root-store';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-check-out',
  templateUrl: './check-out.component.html',
  styleUrls: ['./check-out.component.scss']
})
export class CheckOutComponent implements OnInit {

  productData$: Observable<ProductData>;

  imagePaths = ImagePaths;

  purchaseDataForm: FormGroup;
  billingValidationMessages = BILLING_VALIDATION_MESSAGES;
  creditCardValidationMessages = CREDIT_CARD_VALIDATION_MESSAGES;
  cardData: FormGroup;

  constructor(
    private fb: FormBuilder,
    private store$: Store<RootStoreState.State>
  ) { }

  ngOnInit() {


    this.initializeProductData();
    this.initializeForm();

  }

  private initializeProductData() {
    this.productData$ = this.store$.select(
      UserStoreSelectors.selectProductData
    );
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
        // cardType: ['', [Validators.required]],
        cardNumber: ['', [Validators.required]],
        cardMonth: ['', [Validators.required]],
        cardYear: ['', [Validators.required]],
        cardCvc: ['', [Validators.required]],
      })
    });
  }

  onSubmit() {
    console.log('Purchase Data', this.purchaseDataForm.value);
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
