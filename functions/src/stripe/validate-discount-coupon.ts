import * as functions from 'firebase-functions';
import { DiscountCouponChild, DiscountCouponParent, DiscountCouponErrors, DiscountCouponUser, DiscountCouponValidationData, DiscountCouponKeys } from '../../../shared-models/billing/discount-coupon.model';
import { assertUID } from '../config/global-helpers';
import { adminFirestore } from '../config/db-config';
import { AdminCollectionPaths } from '../../../shared-models/routes-and-paths/fb-collection-paths';
import { now } from 'moment';

const db: FirebaseFirestore.Firestore = adminFirestore;
const discountCouponCollection = db.collection(AdminCollectionPaths.DISCOUNT_COUPONS);
const currentTime = now();

// Screen both user ID and user email for usage records
const validateUserSpecificLimits = async (couponParentDoc: FirebaseFirestore.DocumentReference, parentDiscountCoupon: DiscountCouponParent, validationData: DiscountCouponValidationData): Promise<boolean> => {
  const discountUserIdDoc: FirebaseFirestore.DocumentReference = couponParentDoc.collection(AdminCollectionPaths.DISCOUNT_COUPON_USER_IDS).doc(validationData.userId);
  const discountUserIdDocSnapshot: FirebaseFirestore.DocumentSnapshot = await discountUserIdDoc.get()
    .catch(err => {console.log(`Error fetching discount discountUserIdDoc from admin database:`, err); throw new functions.https.HttpsError('internal', err);});
    
  const discountUserEmailDoc: FirebaseFirestore.DocumentReference = couponParentDoc.collection(AdminCollectionPaths.DISCOUNT_COUPON_USER_EMAILS).doc(validationData[DiscountCouponKeys.USER_EMAIL]);
  const discountUserEmailDocSnapshot: FirebaseFirestore.DocumentSnapshot = await discountUserEmailDoc.get()
    .catch(err => {console.log(`Error fetching discount discountUserEmailDoc from admin database:`, err); throw new functions.https.HttpsError('internal', err);});

  let discountUserIdDocData: DiscountCouponUser | null = null;
  let discountUserEmailDocData: DiscountCouponUser | null = null;

  // Check for user usage limit using user ID
  if (discountUserIdDocSnapshot.exists) {
    discountUserIdDocData = discountUserIdDocSnapshot.data() as DiscountCouponUser;
    if (parentDiscountCoupon.maxUsesPerUser && discountUserIdDocData.useCount >= parentDiscountCoupon.maxUsesPerUser) {
      console.log('User exceeded max uses based on user ID match');
      return false;
    }
  }
  
  // Check for user usage limit using user email
  if (discountUserEmailDocSnapshot.exists) {
    discountUserEmailDocData = discountUserEmailDocSnapshot.data() as DiscountCouponUser;
    if (parentDiscountCoupon.maxUsesPerUser && discountUserEmailDocData.useCount >= parentDiscountCoupon.maxUsesPerUser) {
      console.log('User exceeded max uses based on user email match');
      return false;
    }
  }

  return true;
}

// Check if the validation data product id is in the array of approved products
const validateProductSpecificLimits = async (parentDiscountCoupon: DiscountCouponParent, validationData: DiscountCouponValidationData) => {
  const validProducts: string[] = parentDiscountCoupon.approvedProductIds as string[];

  if (validProducts.includes(validationData.product.id)) {
    return true;
  }

  return false;
}

export const validateCouponOnAdmin = async (validationData: DiscountCouponValidationData): Promise<DiscountCouponChild> => {
  
  const couponParentDoc: FirebaseFirestore.DocumentReference = discountCouponCollection.doc(validationData.couponCode);

  let systemError: any;
  const couponParentSnapshot: FirebaseFirestore.DocumentSnapshot | void = await discountCouponCollection.doc(validationData.couponCode).get()
    
    .catch(err => {
      console.error(`Error fetching discount coupon from admin database:`, err); 
      systemError = err;
    });

  // Catch system errors
  if (systemError) {
    const invalidCoupon: DiscountCouponChild = {
      couponCode: validationData.couponCode,
      discountPercentage: 0,
      valid: false,
      invalidReason: DiscountCouponErrors.SYSTEM_ERROR
    };
    return invalidCoupon;
  }

  // Verify coupon exists
  if (couponParentSnapshot && !couponParentSnapshot.exists) {
    console.log('Coupon does not exist');
    const invalidCoupon: DiscountCouponChild = {
      couponCode: validationData.couponCode,
      discountPercentage: 0,
      valid: false,
      invalidReason: DiscountCouponErrors.DOES_NOT_EXIST
    };
    return invalidCoupon;
  }

  const parentDiscountCoupon: DiscountCouponParent = (couponParentSnapshot as FirebaseFirestore.DocumentSnapshot).data() as DiscountCouponParent;

  // Verify is active
  if (!parentDiscountCoupon.active) {
    console.log('Coupon not active');
    const invalidCoupon: DiscountCouponChild = {
      couponCode: validationData.couponCode,
      discountPercentage: 0,
      valid: false,
      invalidReason: DiscountCouponErrors.NOT_ACTIVE
    };
    return invalidCoupon;
  }

  // Verify below use limit
  if (parentDiscountCoupon.useCount >= parentDiscountCoupon.maxUses) {
    console.log('Coupon exceeds max use limit');
    const invalidCoupon: DiscountCouponChild = {
      couponCode: validationData.couponCode,
      discountPercentage: 0,
      valid: false,
      invalidReason: DiscountCouponErrors.EXCEEDED_MAX_USES
    };
    return invalidCoupon;
  }

  // Verify coupon has not expired
  if (currentTime > parentDiscountCoupon.expirationDate) {
    console.log('Coupon has expired');
    const invalidCoupon: DiscountCouponChild = {
      couponCode: validationData.couponCode,
      discountPercentage: 0,
      valid: false,
      invalidReason: DiscountCouponErrors.EXPIRED
    };
    return invalidCoupon;
  }

  // Verify coupon user limit
  if (parentDiscountCoupon.userSpecific) {
    const passesUserSpecificLimitValidation = await validateUserSpecificLimits(couponParentDoc, parentDiscountCoupon, validationData)
      .catch(err => {
        console.error(`Error validating user specific limits:`, err); 
        systemError = err;
      });
    
    // Catch system errors
    if (systemError) {
      const invalidCoupon: DiscountCouponChild = {
        couponCode: validationData.couponCode,
        discountPercentage: 0,
        valid: false,
        invalidReason: DiscountCouponErrors.SYSTEM_ERROR
      };
      return invalidCoupon;
    }

    // Screen user specific limits
    if (!passesUserSpecificLimitValidation) {
      console.log('User has exceeded max uses for this coupon');
      const invalidCoupon: DiscountCouponChild = {
        couponCode: validationData.couponCode,
        discountPercentage: 0,
        valid: false,
        invalidReason: DiscountCouponErrors.EXCEEDED_MAX_USES_PER_USER
      };
      return invalidCoupon;
    }
  }

  // Verify product limits
  if (parentDiscountCoupon.productSpecific) {
    const passesProductSpecificValidation = await validateProductSpecificLimits(parentDiscountCoupon, validationData)
      .catch(err => {
        console.error(`Error validating product specific limits:`, err); 
        systemError = err;
      });
    
    // Catch system errors
    if (systemError) {
      const invalidCoupon: DiscountCouponChild = {
        couponCode: validationData.couponCode,
        discountPercentage: 0,
        valid: false,
        invalidReason: DiscountCouponErrors.SYSTEM_ERROR
      };
      return invalidCoupon;
    }
  
    // Screen product specific limits
    if (!passesProductSpecificValidation) {
      console.log('Product is not valid for this coupon');
      const invalidCoupon: DiscountCouponChild = {
        couponCode: validationData.couponCode,
        discountPercentage: 0,
        valid: false,
        invalidReason: DiscountCouponErrors.INVALID_PRODUCT
      };
      return invalidCoupon;
    }
  }

  // If all validation checks pass, create and return a valid coupon
  const validCoupon: DiscountCouponChild = {
    couponCode: validationData.couponCode,
    discountPercentage: parentDiscountCoupon.discountPercentage,
    valid: true
  };

  console.log('Valid coupon detected', validCoupon);
  return validCoupon;
}


/////// DEPLOYABLE FUNCTIONS ///////

export const validateDiscountCoupon = functions.https.onCall( async (validationData: DiscountCouponValidationData, context): Promise<DiscountCouponChild> => {
  console.log('Validate discount coupon request received with this data', validationData);
  assertUID(context);

  return await validateCouponOnAdmin(validationData);

});