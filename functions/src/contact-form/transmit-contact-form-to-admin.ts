import * as functions from 'firebase-functions';
import { PubSub } from '@google-cloud/pubsub';
import { assert, assertUID } from '../config/global-helpers';
import { ContactForm } from '../../../shared-models/user/contact-form.model'
import { adminProjectId } from '../config/environments-config';
import { AdminTopicNames } from '../../../shared-models/routes-and-paths/fb-function-names';

const pubSub = new PubSub();

const publishContactFormToAdminTopic = async (contactForm: ContactForm) => {
  const projectId = adminProjectId;
  const topicName = AdminTopicNames.SAVE_CONTACT_FORM_TOPIC;
  const topic = pubSub.topic(`projects/${projectId}/topics/${topicName}`);
  const pubsubMsg = contactForm;

  const topicPublishRes = await topic.publishJSON(pubsubMsg)
    .catch(err => {functions.logger.log(`Failed to publish to topic "${topicName}" on project "${projectId}":`, err); throw new functions.https.HttpsError('internal', err);});
  functions.logger.log(`Publish to topic "${topicName}" on project "${projectId}" succeeded:`, topicPublishRes);

  return topicPublishRes;
}


/////// DEPLOYABLE FUNCTIONS ///////

export const transmitContactFormToAdmin = functions.https.onCall( async (data: ContactForm, context ) => {
  functions.logger.log('Transmit contact form request received with this data', data);
  assertUID(context);
  
  assert(data, 'message'); // Confirm the data has a key unique to this object type to loosly ensure the data is valid

  const contactForm: ContactForm = data;

  return publishContactFormToAdminTopic(contactForm);
});