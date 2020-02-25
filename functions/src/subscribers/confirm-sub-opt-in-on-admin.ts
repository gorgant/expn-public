import * as functions from 'firebase-functions';
import { EmailSubscriber } from '../../../shared-models/subscribers/email-subscriber.model';
import { SubOptInConfirmationData } from '../../../shared-models/subscribers/sub-opt-in-confirmation-data.model';
import { adminFirestore } from '../config/db-config';
import { AdminCollectionPaths } from '../../../shared-models/routes-and-paths/fb-collection-paths';
import { assertUID, catchErrors } from '../config/global-helpers';

const markSubscriberConfirmed = async (subConfData: SubOptInConfirmationData): Promise<boolean> => {

  const db: FirebaseFirestore.Firestore = adminFirestore;

  const subDoc: FirebaseFirestore.DocumentSnapshot = await db.collection(AdminCollectionPaths.SUBSCRIBERS).doc(subConfData.subId).get()
    .catch(err => {console.log(`Error fetching podcast feed:`, err); return err;});
  
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

  console.log('Confirm sub opt in on admin request received with this data', subData);
  assertUID(context);
  
  return catchErrors(markSubscriberConfirmed(subData));
});