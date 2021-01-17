import { PubSub } from '@google-cloud/pubsub';
import { adminProjectId } from '../config/environments-config';
import { AdminTopicNames } from '../../../shared-models/routes-and-paths/fb-function-names';
import { EmailPubMessage } from '../../../shared-models/email/email-pub-message.model';
import { EmailCategories } from '../../../shared-models/email/email-vars.model';
import { WebpageLoadFailureData } from '../../../shared-models/ssr/webpage-load-failure-data.model';
import * as functions from 'firebase-functions';
import { assert, assertUID } from '../config/global-helpers';
const pubSub = new PubSub();

export const transmitWebpageLoadFailureDataToAdmin = async (webpageLoadFailureData: WebpageLoadFailureData ) => {

  functions.logger.log('Transmit webpage load failure data received with this data', webpageLoadFailureData);

  const projectId = adminProjectId;
  const topicName = AdminTopicNames.TRIGGER_EMAIL_SEND_TOPIC;
  const emailCategory = EmailCategories.WEBPAGE_DATA_LOAD_FAILURE;
  const topic = pubSub.topic(`projects/${projectId}/topics/${topicName}`);
  const pubsubMsg: EmailPubMessage = {
    emailCategory,
    webpageLoadFailureData
  }
  const topicPublishRes = await topic.publishJSON(pubsubMsg)
    .catch(err => {functions.logger.log(`Failed to publish to topic "${topicName}" on project "${projectId}":`, err); throw new functions.https.HttpsError('internal', err);});
  functions.logger.log(`Publish to topic "${topicName}" on project "${projectId}" succeeded:`, topicPublishRes);
  
  return topicPublishRes;
}


/////// DEPLOYABLE FUNCTIONS ///////

export const triggerWebpageLoadFailureEmail = functions.https.onCall( async (data: WebpageLoadFailureData, context ) => {
  functions.logger.log('Transmit sub request received with this data', data);
  assertUID(context);
  assert(data, 'domain'); // Confirm the data has a key unique to this object type to loosly ensure the data is valid

  const webpageLoadFailureData: WebpageLoadFailureData = data;

  return transmitWebpageLoadFailureDataToAdmin(webpageLoadFailureData);
})