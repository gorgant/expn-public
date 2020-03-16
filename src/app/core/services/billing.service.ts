import { Injectable } from '@angular/core';
import { Observable, throwError, from } from 'rxjs';
import { catchError, take, tap } from 'rxjs/operators';
import { AngularFireFunctions } from '@angular/fire/functions';
import { Stripe as StripeDefs } from 'stripe';
import { AngularFirestore } from '@angular/fire/firestore';
import { now } from 'moment';
import { StripeChargeData } from 'shared-models/billing/stripe-charge-data.model';
import { PublicFunctionNames } from 'shared-models/routes-and-paths/fb-function-names';
import { PublicUser } from 'shared-models/user/public-user.model';
import { Order } from 'shared-models/orders/order.model';
import { StripeChargeMetadata } from 'shared-models/billing/stripe-object-metadata.model';
import { DiscountCouponChild, DiscountCouponValidationData } from 'shared-models/billing/discount-coupon.model';

@Injectable({
  providedIn: 'root'
})
export class BillingService {

  constructor(
    private afs: AngularFirestore,
    private fns: AngularFireFunctions,
  ) { }

  validateCoupon(validationData: DiscountCouponValidationData): Observable<DiscountCouponChild> {
    // const fakeServerPromise = new Promise<DiscountCouponChild>((resolve, reject) => {
    //   setTimeout(() => {
    //     const fakeCoupon: DiscountCouponChild = {
    //       couponCode: 'fakeCoupon',
    //       discountPercentage: 0.5,
    //       valid: false,
    //     };
    //     if (couponCode === fakeCoupon.couponCode) {
    //       fakeCoupon.valid = true;
    //       resolve(fakeCoupon);
    //     } else {
    //       resolve(fakeCoupon);
    //     }

    //     // reject('Test rejection error');
    //   }, 3000);

    // });

    // const res = from(fakeServerPromise)
    //   .pipe(
    //     catchError(error => {
    //       console.log('Error validating coupon', error);
    //       return throwError(error);
    //     })
    //   );

    // return res;
    const validateCouponFunction: (validationData: DiscountCouponValidationData) => Observable<DiscountCouponChild> =
      this.fns.httpsCallable(
        PublicFunctionNames.VALIDATE_DISCOUNT_COUPON
      );
    const res = validateCouponFunction(validationData)
      .pipe(
        take(1),
        tap(validateCouponRes => {
          console.log('Coupon validation complete', validateCouponRes);
        }),
        catchError(error => {
          console.log('Error validating coupon', error);
          return throwError(error);
        })
      );

    return res;
  }

  processPayment(billingData: StripeChargeData): Observable<StripeDefs.Charge> {

    const chargeFunction: (data: StripeChargeData) => Observable<StripeDefs.Charge> = this.fns.httpsCallable(
      PublicFunctionNames.STRIPE_PROCESS_CHARGE
    );
    const res = chargeFunction(billingData)
      .pipe(
        take(1),
        tap(stripeChargeRes => {
          console.log('Payment processed', stripeChargeRes);
        }),
        catchError(error => {
          console.log('Error processing payment', error);
          return throwError(error);
        })
      );

    return res;
  }

  // This is fired if a charge is processed successfully
  transmitOrderToAdmin(stripeCharge: StripeDefs.Charge, user: PublicUser): Observable<any> {
    console.log('Transmitting order to admin');

    const order = this.convertStripeChargeToOrder(stripeCharge, user);

    const transmitOrderFunction: (data: Order) => Observable<any> = this.fns.httpsCallable(
      PublicFunctionNames.TRANSMIT_ORDER_TO_ADMIN
    );
    const res = transmitOrderFunction(order)
      .pipe(
        take(1),
        tap(response => {
          console.log('Order transmitted to admin', response);
        }),
        catchError(error => {
          console.log('Error transmitting order', error);
          return throwError(error);
        })
      );

    return res;
  }

  convertStripeChargeToOrder(stripeCharge: StripeDefs.Charge, user: PublicUser): Order {
    // Ensure all key data is present
    const stripeChargeId: string = stripeCharge.id;
    const stripeCustomerId: string = stripeCharge.customer as string;
    const firstName: string = user.billingDetails.firstName;
    const lastName: string = user.billingDetails.lastName;
    const email: string = stripeCharge.billing_details.email; // Isn't in the type definitions but exists on the object
    const publicUser: PublicUser = user;
    const productId: string = stripeCharge.metadata[StripeChargeMetadata.PRODUCT_ID];
    const listPrice: number = parseFloat(stripeCharge.metadata[StripeChargeMetadata.LIST_PRICE]);
    const discountCouponCode: string = stripeCharge.metadata[StripeChargeMetadata.DISCOUNT_COUPON_CODE] ?
      stripeCharge.metadata[StripeChargeMetadata.DISCOUNT_COUPON_CODE] : null;
    const amountPaid: number = stripeCharge.amount / 100;

    const orderId = this.afs.createId();
    const orderNumber = orderId.substring(orderId.length - 8, orderId.length); // Create a user friendly 8 digit order ID

    const order: Order = {
      id: orderId,
      orderNumber,
      createdDate: now(),
      stripeChargeId,
      stripeCustomerId,
      firstName,
      lastName,
      email,
      publicUser,
      productId,
      listPrice,
      discountCouponCode,
      amountPaid,
      status: 'inactive',
    };

    return order;
  }

}
