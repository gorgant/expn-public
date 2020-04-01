import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { DiscountCouponChild, DiscountCouponErrors, DiscountCouponValidationData } from 'shared-models/billing/discount-coupon.model';
import { Store } from '@ngrx/store';
import { RootStoreState, BillingStoreSelectors, BillingStoreActions } from 'src/app/root-store';
import { Observable, Subscription } from 'rxjs';
import { withLatestFrom, takeWhile } from 'rxjs/operators';
import { PublicUser } from 'shared-models/user/public-user.model';
import { Product } from 'shared-models/products/product.model';
import { BillingDetails } from 'shared-models/billing/billing-details.model';

@Component({
  selector: 'app-coupon-form',
  templateUrl: './coupon-form.component.html',
  styleUrls: ['./coupon-form.component.scss']
})
export class CouponFormComponent implements OnInit, OnDestroy {

  @Input() billingDetailsForm: FormGroup;
  @Input() publicUser: PublicUser;
  @Input() product: Product;

  couponForm: FormGroup;
  couponCodeFieldActive = false;

  validateCouponProcessing$: Observable<boolean>;
  validateCouponResponse$: Observable<DiscountCouponChild>;
  couponSubmitted: boolean;
  validationAttempts = 0;
  validationAttemptLimit = 5;
  invalidReason: string;

  billingFormInvalid: boolean;
  billingFormSubscription: Subscription;

  constructor(
    private fb: FormBuilder,
    private store$: Store<RootStoreState.State>,
  ) { }

  ngOnInit() {
    this.initializeCouponForm();
    this.initializeCouponValidationStatus();
  }

  private submitCouponForValidation(couponCode: string, userEmail: string) {
    const validationData: DiscountCouponValidationData = {
      couponCode,
      userEmail,
      userId: this.publicUser.id,
      product: this.product,
      isStripeCharge: false,
    };
    this.couponSubmitted = true;
    this.validationAttempts++;
    this.couponCode.setErrors(null); // Remove any error property from the field (if it exists)
    this.store$.dispatch(new BillingStoreActions.ValidateCouponRequested({validationData}));

    this.validateCouponProcessing$
      .pipe(
        withLatestFrom(this.validateCouponResponse$),
        takeWhile(() => this.couponSubmitted) // Prevents memory leak between attempts
      )
      .subscribe(([processing, response]) => {
        console.log('Observable fired', processing, response);

        // Ignore if still processing
        if (processing) {
          return;
        }

        // Listen for response after processing is complete
        const discountCoupon: DiscountCouponChild = response;
        if (discountCoupon && discountCoupon.valid) {
          console.log('Valid coupon detected, applying discount');
          this.couponSubmitted = false; // Reset coupon submission (clears observable)
        }

        if (discountCoupon && !discountCoupon.valid) {
          this.invalidReason = discountCoupon.invalidReason ? discountCoupon.invalidReason : DiscountCouponErrors.DEFAULT;
          this.couponCode.setErrors({valid: false}); // Manually apply the error property to the field
          this.couponSubmitted = false; // Reset coupon submission (clears observable)
          console.log('Invalid coupon detected');
        }
      });
  }

  // Ensures the billing form is valid before a coupon is submitted
  private monitorBillingFormStatus() {
    Object.keys(this.billingDetailsForm.controls).forEach(key => {
      this.billingDetailsForm.controls[key].markAsDirty();
      this.billingDetailsForm.controls[key].markAsTouched();
    });

    if (this.billingDetailsForm.invalid) {
      this.invalidReason = DiscountCouponErrors.FORM_NOT_COMPLETE;
      this.billingFormInvalid = true;
      this.couponCode.setErrors({valid: false});
      Object.keys(this.couponForm.controls).forEach(key => {
        this.couponForm.controls[key].markAsDirty();
        this.couponForm.controls[key].markAsTouched();
      });

    }

    this.billingFormSubscription = this.billingDetailsForm.valueChanges.subscribe(val => {
      if (this.billingDetailsForm.invalid) {
        console.log('Billing form invalid, locking coupon form');
        this.invalidReason = DiscountCouponErrors.FORM_NOT_COMPLETE;
        this.billingFormInvalid = true;
        this.couponCode.setErrors({valid: false});
        if (this.couponCode.untouched) {
          Object.keys(this.couponForm.controls).forEach(key => {
            this.couponForm.controls[key].markAsDirty();
            this.couponForm.controls[key].markAsTouched();
          });
        }
      } else {
        if (this.invalidReason === DiscountCouponErrors.FORM_NOT_COMPLETE) {
          this.billingFormInvalid = false;
          this.invalidReason = '';
          this.couponCode.setErrors(null);
        }
      }
    });


  }

  private initializeCouponForm(): void {
    this.couponForm = this.fb.group({
      couponCode: [''],
    });
  }

  private initializeCouponValidationStatus() {
    this.validateCouponProcessing$ = this.store$.select(BillingStoreSelectors.selectIsValidatingCoupon);
    this.validateCouponResponse$ = this.store$.select(BillingStoreSelectors.selectDiscountCoupon);
  }

  onToggleCouponCodeField() {
    this.couponCodeFieldActive = !this.couponCodeFieldActive;
    this.monitorBillingFormStatus();
  }

  onValidateCoupon(event: Event) {

    console.log('Coupon submitted for validation', this.couponFormData);
    const couponCode = this.couponFormData.couponCode;
    const billingDetails: BillingDetails = this.billingDetailsForm.value;

    // Secondary protection against unwanted submission
    if (this.billingFormInvalid) {
      console.log('Billing form invalid, aborting submission');
      return;
    }

    // Exit with no server call if validation limit exceeded
    if (this.validationAttempts > this.validationAttemptLimit) {
      this.invalidReason = DiscountCouponErrors.EXCEEDED_VALIDATION_ATTEMPTS;
      this.couponCode.setErrors({valid: false}); // Manually apply the error property to the field
      this.couponCode.disable();
      this.couponCode.patchValue('');
      return;
    }

    // Form validation checks passed, submit to server for validation
    const userEmail: string = billingDetails.email.trim();
    this.submitCouponForValidation(couponCode, userEmail);
  }


  get couponCode() { return this.couponForm.get('couponCode'); }

  get couponFormData(): DiscountCouponChild { return this.couponForm.value; }

  ngOnDestroy() {
    if (this.billingFormSubscription) {
      this.billingFormSubscription.unsubscribe();
    }
  }

}
