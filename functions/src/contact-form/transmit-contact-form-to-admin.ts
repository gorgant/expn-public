import * as functions from 'firebase-functions';
import { PubSub } from '@google-cloud/pubsub';
import { assert } from '../stripe/helpers';
import { ContactForm } from '../../../shared-models/user/contact-form.model'
import { adminProjectId } from '../environments/config';
import { AdminTopicNames } from '../../../shared-models/routes-and-paths/fb-function-names';

const pubSub = new PubSub();

const publishContactFormToAdminTopic = async (contactForm: ContactForm) => {

  console.log('Commencing contact form trasmission based on this data', contactForm);

  const adminProject = adminProjectId;
  console.log('Publishing to this project topic', adminProject);

  // Target topic in the admin PubSub (must add this project's service account to target project)
  // Courtesy of https://stackoverflow.com/a/55003466/6572208
  const topic = pubSub.topic(`projects/${adminProject}/topics/${AdminTopicNames.SAVE_CONTACT_FORM_TOPIC}`);

  const topicPublishRes = await topic.publishJSON(contactForm)
    .catch(err => {
      console.log('Publish to topic failed', err);
      return err;
    });
  console.log('Res from topic publish', topicPublishRes);

  return topicPublishRes;
}


/////// DEPLOYABLE FUNCTIONS ///////

export const transmitContactFormToAdmin = functions.https.onCall( async (data: ContactForm, context ) => {
  console.log('Transmit contact form request received with this data', data);
  
  assert(data, 'message'); // Confirm the data has a key unique to this object type to loosly ensure the data is valid

  const contactForm: ContactForm = data;

  const transmitContactFormResponse = await publishContactFormToAdminTopic(contactForm)
    .catch(error => {
      console.log('Error transmitting contact form', error);
      return error;
    })
  
  return transmitContactFormResponse;
});