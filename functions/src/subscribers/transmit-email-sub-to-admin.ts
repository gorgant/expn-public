import * as functions from 'firebase-functions';
import { PubSub } from '@google-cloud/pubsub';
import { assert, assertUID } from '../config/global-helpers';
import { EmailSubscriber } from '../../../shared-models/subscribers/email-subscriber.model';
import { adminProjectId } from '../config/environments-config';
import { AdminTopicNames } from '../../../shared-models/routes-and-paths/fb-function-names';

const pubSub = new PubSub();

const publishEmailSubToAdminTopic = async (subscriber: Partial<EmailSubscriber>) => {

  const projectId = adminProjectId;
  const topicName = AdminTopicNames.SAVE_EMAIL_SUB_TOPIC;
  const topic = pubSub.topic(`projects/${projectId}/topics/${topicName}`);
  const pubsubMsg = subscriber;

  const topicPublishRes = await topic.publishJSON(pubsubMsg)
    .catch(err => {console.log(`Failed to publish to topic "${topicName}" on project "${projectId}":`, err); throw new functions.https.HttpsError('internal', err);});
  console.log(`Publish to topic "${topicName}" on project "${projectId}" succeeded:`, topicPublishRes);

  return topicPublishRes;
}


/////// DEPLOYABLE FUNCTIONS ///////


export const transmitEmailSubToAdmin = functions.https.onCall( async (data: Partial<EmailSubscriber>, context ) => {
  console.log('Transmit sub request received with this data', data);
  assertUID(context);
  assert(data, 'lastSubSource'); // Confirm the data has a key unique to this object type to loosly ensure the data is valid

  const emailSubscriber: Partial<EmailSubscriber> = data;

  return publishEmailSubToAdminTopic(emailSubscriber);
})