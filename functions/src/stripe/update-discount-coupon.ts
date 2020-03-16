import * as functions from 'firebase-functions';
import { adminFirestore } from "../config/db-config";
import { AdminCollectionPaths } from "../../../shared-models/routes-and-paths/fb-collection-paths";
import { DiscountCouponValidationData, DiscountCouponQueryFields, DiscountCouponUser } from "../../../shared-models/billing/discount-coupon.model";
import { now } from "moment";
import admin = require("firebase-admin");
import { PublicTopicNames } from '../../../shared-models/routes-and-paths/fb-function-names';
import { catchErrors } from '../config/global-helpers';


const db: FirebaseFirestore.Firestore = adminFirestore;
const discountCouponCollection = db.collection(AdminCollectionPaths.DISCOUNT_COUPONS);

// Increment user use count and productIdList
const updateCouponUserData = async (couponParentDoc: FirebaseFirestore.DocumentReference, validationData: DiscountCouponValidationData) => {
  
  const discountUserIdDoc: FirebaseFirestore.DocumentReference = couponParentDoc.collection(AdminCollectionPaths.DISCOUNT_COUPON_USER_IDS).doc(validationData.userId);
  const discountUserEmailDoc: FirebaseFirestore.DocumentReference = couponParentDoc.collection(AdminCollectionPaths.DISCOUNT_COUPON_USER_EMAILS).doc(validationData[DiscountCouponQueryFields.USER_EMAIL]);

  const discountUserDataUpdatePartial: Partial<DiscountCouponUser> = {
    userEmail: validationData[DiscountCouponQueryFields.USER_EMAIL],
    userId: validationData[DiscountCouponQueryFields.USER_ID],
  };

  // Need to merge with a typeless object because the arrayUnion and increment function return values aren't interpreted correctly by the compiler
  const discountUserDataUpdateCombined = {
    ...discountUserDataUpdatePartial,
    [DiscountCouponQueryFields.USE_TIMESTAMPS]: admin.firestore.FieldValue.arrayUnion(now()),
    [DiscountCouponQueryFields.PRODUCT_ID_LIST]: admin.firestore.FieldValue.arrayUnion(validationData.product.id),
    [DiscountCouponQueryFields.USE_COUNT]: admin.firestore.FieldValue.increment(1)
  };
  
  // Use set here because we don't know if user data exists yet
  await discountUserIdDoc.set(discountUserDataUpdateCombined, {merge: true})
    .catch(err => {console.log(`Error updating discount coupon user ID doc in admin database:`, err); return err;});

  await discountUserEmailDoc.set(discountUserDataUpdateCombined, {merge: true})
    .catch(err => {console.log(`Error updating discount coupon user Email doc in admin database:`, err); return err;});

};

const incrementParentCouponUseCount = async (couponParentDoc: FirebaseFirestore.DocumentReference) => {
  const incrementCouponUseCount = {
    [DiscountCouponQueryFields.USE_COUNT]: admin.firestore.FieldValue.increment(1)
  };
  // Use update here because we know the coupon exists
  await couponParentDoc.update(incrementCouponUseCount)
    .catch(err => {console.log(`Error incrementing discount use in admin database:`, err); return err;});
};

const updateCouponData = async (validationData: DiscountCouponValidationData) => {

  const couponParentDoc: FirebaseFirestore.DocumentReference = discountCouponCollection.doc(validationData.couponCode);

  await incrementParentCouponUseCount(couponParentDoc)
      .catch(err => {console.log(`Error incrementing use count:`, err); return err;});

  await updateCouponUserData(couponParentDoc, validationData)
    .catch(err => {console.log(`Error incrementing use count:`, err); return err;});
};


/////// DEPLOYABLE FUNCTIONS ///////

const opts = {memory: '256MB', timeoutSeconds: 20};

// Listen for pubsub message
export const updateDiscountCoupon = functions.runWith((opts as functions.RuntimeOptions)).pubsub.topic(PublicTopicNames.UPDATE_DISCOUNT_COUPON_DATA).onPublish( async (message, context) => {
  
  const validationData = message.json as DiscountCouponValidationData;
  console.log('Update discount coupon data request received with this data', validationData)
  console.log('Context from pubsub', context);

  return catchErrors(updateCouponData(validationData));
});