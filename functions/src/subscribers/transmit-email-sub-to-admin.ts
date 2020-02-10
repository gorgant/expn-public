import * as functions from 'firebase-functions';
import { PubSub } from '@google-cloud/pubsub';
import { assert } from '../stripe/helpers';
import { EmailSubscriber } from '../../../shared-models/subscribers/email-subscriber.model';
import { adminProjectId } from '../environments/config';
import { AdminTopicNames } from '../../../shared-models/routes-and-paths/fb-function-names';

const pubSub = new PubSub();

const publishEmailSubToAdminTopic = async (subscriber: Partial<EmailSubscriber>) => {

  console.log('Commencing subscriber trasmission based on this data', subscriber);

  const adminProject = adminProjectId;
  console.log('Publishing to this project topic', adminProject);

  // Target topic in the admin PubSub (must add this project's service account to target project)
  // Courtesy of https://stackoverflow.com/a/55003466/6572208
  const topic = pubSub.topic(`projects/${adminProject}/topics/${AdminTopicNames.SAVE_EMAIL_SUB_TOPIC}`);

  const topicPublishRes = await topic.publishJSON(subscriber)
    .catch(err => {
      console.log('Publish to topic failed', err);
      return err;
    });
  console.log('Res from topic publish', topicPublishRes);

  return topicPublishRes;
}


/////// DEPLOYABLE FUNCTIONS ///////


export const transmitEmailSubToAdmin = functions.https.onCall( async (data: Partial<EmailSubscriber>, context ) => {
  console.log('Transmit sub request received with this data', data);
  
  assert(data, 'lastSubSource'); // Confirm the data has a key unique to this object type to loosly ensure the data is valid

  const emailSubscriber: Partial<EmailSubscriber> = data;

  const transmitSubResponse = await publishEmailSubToAdminTopic(emailSubscriber)
    .catch(error => {
      console.log('Error transmitting subscriber', error);
      return error;
    })
  
  return transmitSubResponse;
})