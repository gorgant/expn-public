import * as functions from 'firebase-functions';
import { Order } from '../../../shared-models/orders/order.model';
import { PubSub } from '@google-cloud/pubsub';
import { assert } from '../stripe/helpers';
import { currentEnvironmentType } from '../environments/config';
import { EnvironmentTypes, PRODUCTION_APPS, SANDBOX_APPS } from '../../../shared-models/environments/env-vars.model';
const pubSub = new PubSub();

const getAdminProjectName = (): string => {
  let projectName: string;

  switch (currentEnvironmentType) {
    case EnvironmentTypes.PRODUCTION:
      projectName = PRODUCTION_APPS.adminApp.projectId
      break;
    case EnvironmentTypes.SANDBOX:
      projectName = SANDBOX_APPS.adminApp.projectId
      break;
    default:
      projectName = SANDBOX_APPS.adminApp.projectId
      break;
  }
  return projectName;
}

const publishOrderToAdminTopic = async (order: Order) => {

  console.log('Commencing order trasmission based on this data', order);

  const adminProjectName = getAdminProjectName();
  console.log('Publishing to this project topic', adminProjectName);
  
  // Target topic in the admin PubSub (must add this project's service account to target project)
  // Courtesy of https://stackoverflow.com/a/55003466/6572208
  const topic = pubSub.topic(`projects/${adminProjectName}/topics/save-order`);

  const topicPublishRes = await topic.publishJSON(order)
    .catch(err => {
      console.log('Publish to topic failed', err);
      return err;
    });
  console.log('Res from topic publish', topicPublishRes);

  return topicPublishRes;
}

/////// DEPLOYABLE FUNCTIONS ///////

export const transmitOrderToAdmin = functions.https.onCall( async (data: Order, context ) => {
  console.log('Transmit order request received with this data', data);

  assert(data, 'orderNumber'); // Confirm the data has a key unique to this object type to loosly ensure the data is valid

  const order: Order = data;

  const transmitSubResponse = await publishOrderToAdminTopic(order)
    .catch(error => {
      console.log('Error transmitting subscriber', error);
      return error;
    })
  
  return transmitSubResponse;
})