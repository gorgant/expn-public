import * as functions from 'firebase-functions';
import { adminFirestore } from "../config/db-config";
import { AdminCollectionPaths } from "../../../shared-models/routes-and-paths/fb-collection-paths";
import { DiscountCouponValidationData, DiscountCouponKeys, DiscountCouponUser } from "../../../shared-models/billing/discount-coupon.model";
import { now } from "moment";
import admin = require("firebase-admin");
import { PublicTopicNames } from '../../../shared-models/routes-and-paths/fb-function-names';


const db: FirebaseFirestore.Firestore = adminFirestore;
const discountCouponCollection = db.collection(AdminCollectionPaths.DISCOUNT_COUPONS);

// Increment user use count and productIdList
const updateCouponUserData = async (couponParentDoc: FirebaseFirestore.DocumentReference, validationData: DiscountCouponValidationData) => {
  
  const discountUserIdDoc: FirebaseFirestore.DocumentReference = couponParentDoc.collection(AdminCollectionPaths.DISCOUNT_COUPON_USER_IDS).doc(validationData.userId);
  const discountUserEmailDoc: FirebaseFirestore.DocumentReference = couponParentDoc.collection(AdminCollectionPaths.DISCOUNT_COUPON_USER_EMAILS).doc(validationData[DiscountCouponKeys.USER_EMAIL]);

  const discountUserDataUpdatePartial: Partial<DiscountCouponUser> = {
    userEmail: validationData[DiscountCouponKeys.USER_EMAIL],
    userId: validationData[DiscountCouponKeys.USER_ID],
  };

  // Need to merge with a typeless object because the arrayUnion and increment function return values aren't interpreted correctly by the compiler
  const discountUserDataUpdateCombined = {
    ...discountUserDataUpdatePartial,
    [DiscountCouponKeys.USE_TIMESTAMPS]: admin.firestore.FieldValue.arrayUnion(now()),
    [DiscountCouponKeys.PRODUCT_ID_LIST]: admin.firestore.FieldValue.arrayUnion(validationData.product.id),
    [DiscountCouponKeys.USE_COUNT]: admin.firestore.FieldValue.increment(1)
  };
  
  // Use set here because we don't know if user data exists yet
  await discountUserIdDoc.set(discountUserDataUpdateCombined, {merge: true})
    .catch(err => {functions.logger.log(`Error updating discount coupon user ID doc in admin database:`, err); throw new functions.https.HttpsError('internal', err);});

  await discountUserEmailDoc.set(discountUserDataUpdateCombined, {merge: true})
    .catch(err => {functions.logger.log(`Error updating discount coupon user Email doc in admin database:`, err); throw new functions.https.HttpsError('internal', err);});

};

const incrementParentCouponUseCount = async (couponParentDoc: FirebaseFirestore.DocumentReference) => {
  const incrementCouponUseCount = {
    [DiscountCouponKeys.USE_COUNT]: admin.firestore.FieldValue.increment(1)
  };
  // Use update here because we know the coupon exists
  await couponParentDoc.update(incrementCouponUseCount)
    .catch(err => {functions.logger.log(`Error incrementing discount use in admin database:`, err); throw new functions.https.HttpsError('internal', err);});
};

const updateCouponData = async (validationData: DiscountCouponValidationData) => {

  const couponParentDoc: FirebaseFirestore.DocumentReference = discountCouponCollection.doc(validationData.couponCode);

  await incrementParentCouponUseCount(couponParentDoc);

  await updateCouponUserData(couponParentDoc, validationData);
};


/////// DEPLOYABLE FUNCTIONS ///////

const opts = {memory: '256MB', timeoutSeconds: 20};

// Listen for pubsub message
export const updateDiscountCoupon = functions.runWith((opts as functions.RuntimeOptions)).pubsub.topic(PublicTopicNames.UPDATE_DISCOUNT_COUPON_DATA).onPublish( async (message, context) => {
  
  const validationData = message.json as DiscountCouponValidationData;
  functions.logger.log('Update discount coupon data request received with this data', validationData)
  functions.logger.log('Context from pubsub', context);

  return updateCouponData(validationData);
});