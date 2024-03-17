import { logger } from 'firebase-functions/v2';
import { HttpsError } from 'firebase-functions/v2/https';
import { Timestamp } from '@google-cloud/firestore';
import { EmailUserData } from '../../../shared-models/email/email-user-data.model';
import { EmailIdentifiers, SendgridContactListId } from '../../../shared-models/email/email-vars.model';
import { PublicCollectionPaths } from '../../../shared-models/routes-and-paths/fb-collection-paths.model';
import { PublicUser, PublicUserKeys } from '../../../shared-models/user/public-user.model';
import { publicFirestore } from '../config/db-config';
import { convertPublicUserDataToEmailUserData, fetchPublicUserByEmail } from '../config/global-helpers';
import { dispatchEmail } from '../email/helpers/dispatch-email';
import { EmailPubMessage } from '../../../shared-models/email/email-pub-message.model';
import { SubscriberData } from '../../../shared-models/email/subscriber-data.model';
import { FieldValue } from 'firebase-admin/firestore';
import { resetSgContactOptInStatus } from '../email/helpers/reset-sg-contact-opt-in-status';

const publicUsersCollection = publicFirestore.collection(PublicCollectionPaths.PUBLIC_USERS);

const addPublicUserToDb = async (subscriberData: SubscriberData) => {
  const newUserId = publicUsersCollection.doc().id;
  const newUser: PublicUser = {
    ...subscriberData,
    [PublicUserKeys.CREATED_TIMESTAMP]: Timestamp.now() as any,
    [PublicUserKeys.EMAIL_GROUP_UNSUBSCRIBES]: null,
    [PublicUserKeys.EMAIL_GLOBAL_UNSUBSCRIBE]: null,
    [PublicUserKeys.EMAIL_OPT_IN_CONFIRMED]: false,
    [PublicUserKeys.EMAIL_OPT_IN_TIMESTAMP]: null,
    [PublicUserKeys.EMAIL_OPT_OUT_TIMESTAMP]: null,
    [PublicUserKeys.EMAIL_SENDGRID_CONTACT_CREATED_TIMESTAMP]: null,
    [PublicUserKeys.EMAIL_SENDGRID_CONTACT_ID]: null,
    [PublicUserKeys.EMAIL_SENDGRID_CONTACT_LIST_ARRAY]: [SendgridContactListId.EXPN_PRIMARY_NEWSLETTER], // Add user to the newsletter contact list
    [PublicUserKeys.EMAIL_VERIFIED]: false,
    [PublicUserKeys.ID]: newUserId,
    [PublicUserKeys.LAST_MODIFIED_TIMESTAMP]: Timestamp.now() as any,
    [PublicUserKeys.ONBOARDING_WELCOME_EMAIL_SENT]: false,
  };

  logger.log('Creating publicUser', newUser);

  await publicUsersCollection.doc(newUserId).set(newUser)
    .catch(err => {logger.log(`Failed to create user in public database:`, err); throw new HttpsError('internal', err);});
  
  return newUser;
}

const reauthenticateExistingPublicUser = async (existingUser: PublicUser) => {
  const isUnsubscribedInSg = !!existingUser[PublicUserKeys.EMAIL_GLOBAL_UNSUBSCRIBE] || !!existingUser[PublicUserKeys.EMAIL_GROUP_UNSUBSCRIBES];

  // If there is a record of the user
  if (isUnsubscribedInSg) {
    logger.log('Unsubscribe record found while reauthenticating existing user');
    await resetSgContactOptInStatus(existingUser);
  }

  const updatedUser: PublicUser = {
    ...existingUser,
    [PublicUserKeys.EMAIL_GROUP_UNSUBSCRIBES]: null,
    [PublicUserKeys.EMAIL_GLOBAL_UNSUBSCRIBE]: null,
    [PublicUserKeys.EMAIL_OPT_OUT_TIMESTAMP]: null,
    [PublicUserKeys.EMAIL_SENDGRID_CONTACT_LIST_ARRAY]: FieldValue.arrayUnion(SendgridContactListId.EXPN_PRIMARY_NEWSLETTER) as any, // Ensure user is on newsletter contact list
    [PublicUserKeys.EMAIL_VERIFIED]: false,
    [PublicUserKeys.LAST_MODIFIED_TIMESTAMP]: Timestamp.now() as any,
    [PublicUserKeys.ONBOARDING_WELCOME_EMAIL_SENT]: false,
  };

  logger.log('Reauthenticating existing publicUser', updatedUser);

  await publicUsersCollection.doc(existingUser[PublicUserKeys.ID]).set(updatedUser, {merge: true})
    .catch(err => {logger.log(`Failed to update user in public database:`, err); throw new HttpsError('internal', err);});

  return updatedUser;
}

const dispatchEmailVerificationEmail = async(publicUser: PublicUser) => {
  const emailUserData: EmailUserData = convertPublicUserDataToEmailUserData(publicUser);
  const emailIdentifier = EmailIdentifiers.EMAIL_VERIFICATION;
  const emailPubMessage: EmailPubMessage = {
    emailIdentifier,
    emailUserData
  };
  await dispatchEmail(emailPubMessage);
}

export const createPublicUser = async (subscriberData: SubscriberData): Promise<PublicUser> => {

  const existingUser = await fetchPublicUserByEmail(subscriberData[PublicUserKeys.EMAIL], publicUsersCollection);
  const existingUserOptedIn = existingUser ? existingUser[PublicUserKeys.EMAIL_OPT_IN_CONFIRMED] : false;
  const existingUserHasGroupUnsubscribeRecords = existingUser ? !!existingUser[PublicUserKeys.EMAIL_GROUP_UNSUBSCRIBES] : false;

  const skipAllActions = existingUser && existingUserOptedIn && !existingUserHasGroupUnsubscribeRecords;
  const reauthenticateUser = existingUser && (!existingUserOptedIn || existingUserHasGroupUnsubscribeRecords);

  // If user exists and is opted in, terminate function
  if (skipAllActions) {
    logger.log(`Will not create user, user with email ${subscriberData[PublicUserKeys.EMAIL]} already exists in database and has already opted in and has no groupUnsubscribeRecords`);
    return existingUser;
  }

  // If user exists and is not opted in or has existing unsubscribe records, run the user through the opt-in flow
  if (reauthenticateUser) {
    const updatedUser = await reauthenticateExistingPublicUser(existingUser);
    await dispatchEmailVerificationEmail(updatedUser);
    return updatedUser;
  }

  const newUser = await addPublicUserToDb(subscriberData);
  await dispatchEmailVerificationEmail(newUser);

  return newUser;
}