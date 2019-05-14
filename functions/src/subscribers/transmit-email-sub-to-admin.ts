import * as functions from 'firebase-functions';
import { now } from 'moment';
import { PubSub } from '@google-cloud/pubsub';
import { assert } from '../stripe/helpers';
import { AnonymousUser } from '../../../shared-models/user/anonymous-user.model';
import { EmailSubscriber } from '../../../shared-models/subscribers/email-subscriber.model';
import { SubscriptionSource } from '../../../shared-models/subscribers/subscription-source.model';
import { EmailSubData } from '../../../shared-models/subscribers/email-sub-data.model';

const pubSub = new PubSub();

const publishEmailSubToAdminTopic = async (subscriber: Partial<EmailSubscriber>) => {

  console.log('Commencing subscriber trasmission based on this data', subscriber);

  // Target topic in the admin PubSub (must add this project's service account to target project)
  // Courtesy of https://stackoverflow.com/a/55003466/6572208
  const topic = pubSub.topic('projects/explearning-admin/topics/save-email-sub');

  const topicPublishRes = await topic.publishJSON(subscriber)
    .catch(err => {
      console.log('Publish to topic failed', err);
      return err;
    });
  console.log('Res from topic publish', topicPublishRes);

  return topicPublishRes;
}

/////// DEPLOYABLE FUNCTIONS ///////


export const transmitEmailSubToAdmin = functions.https.onCall( async (data: EmailSubData, context ) => {
  console.log('Transmit sub request received with this data', data);
  
  // Ensure all key data is present
  const user: AnonymousUser = assert(data, 'user');
  const subSource: SubscriptionSource = assert(data, 'subSource');
  const email: string = assert(user.billingDetails, 'email');

  
  const partialSubscriber: Partial<EmailSubscriber> = {
    id: email, // Set id to the user's email
    publicUserData: user,
    active: true,
    lastUpdated: now(),
    lastSubSource: subSource
    // Sub source array is handled on the admin depending on if subscriber already exists
    // Created date set on admin server depending on if subscriber already exists
  }

  const transmitSubResponse = await publishEmailSubToAdminTopic(partialSubscriber)
    .catch(error => {
      console.log('Error transmitting subscriber', error);
      return error;
    })
  
  return transmitSubResponse;
})