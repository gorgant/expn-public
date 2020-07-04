import * as functions from 'firebase-functions';
import { Order } from '../../../shared-models/orders/order.model';
import { PubSub } from '@google-cloud/pubsub';
import { assert, assertUID } from '../config/global-helpers';
import { adminProjectId } from '../config/environments-config';
import { AdminTopicNames } from '../../../shared-models/routes-and-paths/fb-function-names';
const pubSub = new PubSub();

const publishOrderToAdminTopic = async (order: Order) => {

  const projectId = adminProjectId;
  const topicName = AdminTopicNames.SAVE_ORDER_TOPIC;
  const topic = pubSub.topic(`projects/${projectId}/topics/${topicName}`);
  const pubsubMsg = order;

  const topicPublishRes = await topic.publishJSON(pubsubMsg)
    .catch(err => {functions.logger.log(`Failed to publish to topic "${topicName}" on project "${projectId}":`, err); throw new functions.https.HttpsError('internal', err);});
  functions.logger.log(`Publish to topic "${topicName}" on project "${projectId}" succeeded:`, topicPublishRes);

  return topicPublishRes;
}

/////// DEPLOYABLE FUNCTIONS ///////

export const transmitOrderToAdmin = functions.https.onCall( async (data: Order, context ) => {
  functions.logger.log('Transmit order request received with this data', data);
  assertUID(context);

  assert(data, 'orderNumber'); // Confirm the data has a key unique to this object type to loosly ensure the data is valid

  const order: Order = data;

  return publishOrderToAdminTopic(order);
})