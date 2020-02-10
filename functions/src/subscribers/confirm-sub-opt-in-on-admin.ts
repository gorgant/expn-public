import * as functions from 'firebase-functions';
import { EmailSubscriber } from '../../../shared-models/subscribers/email-subscriber.model';
import { SubOptInConfirmationData } from '../../../shared-models/subscribers/sub-opt-in-confirmation-data.model';
import { adminFirestore } from '../db';
import { AdminCollectionPaths } from '../../../shared-models/routes-and-paths/fb-collection-paths';

const markSubscriberConfirmed = async (subConfData: SubOptInConfirmationData): Promise<boolean> => {

  const db: FirebaseFirestore.Firestore = adminFirestore;

  const subDoc: FirebaseFirestore.DocumentSnapshot = await db.collection(AdminCollectionPaths.SUBSCRIBERS).doc(subConfData.subId).get()
    .catch(error => {
      console.log('Error fetching subscriber doc', error)
      return error;
    });
  
  if (!subDoc.exists) {
    console.log('Subscriber does not exist');
    return false;
  }

  const existingSubscriberData: EmailSubscriber = subDoc.data() as EmailSubscriber;

  if (existingSubscriberData.publicUserData.id !== subConfData.pubId) {
    console.log('Subscriber id does not match public id');
    return false;
  }

  const optInConfirmed: Partial<EmailSubscriber> = {
    optInConfirmed: true
  };

  if (existingSubscriberData.optInConfirmed) {
    console.log('Subscriber already confirmed, no action taken')
    return true;
  }

  await db.collection(AdminCollectionPaths.SUBSCRIBERS).doc(subConfData.subId).update(optInConfirmed)
    .catch(error => {
      console.log('Error updating subscriber doc', error)
      return error;
    });
  
  return true;

}


/////// DEPLOYABLE FUNCTIONS ///////


export const confirmSubOptInOnAdmin = functions.https.onCall( async (subData: SubOptInConfirmationData, context ) => {
  
  // If no sub id, exit function
  if (!subData.subId) {
    return;
  }

  const subscriberConfirmed = await markSubscriberConfirmed(subData);
  

  console.log('Transmit this sub ID to admin for confirmation', subData);

  return subscriberConfirmed;
});