import * as functions from 'firebase-functions';
import { Order } from '../../../shared-models/orders/order.model';
import { PubSub } from '@google-cloud/pubsub';
import { assert } from '../stripe/helpers';
const pubSub = new PubSub();

const publishOrderToAdminTopic = async (order: Order) => {

  console.log('Commencing order trasmission based on this data', order);
  
  // Target topic in the admin PubSub (must add this project's service account to target project)
  // Courtesy of https://stackoverflow.com/a/55003466/6572208
  const topic = pubSub.topic('projects/explearning-admin/topics/save-order');

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