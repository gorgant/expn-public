import { CallableOptions, CallableRequest, onCall } from 'firebase-functions/v2/https';
import { logger } from 'firebase-functions/v2';
import { createPublicUser } from '../user/create-public-user';
import { PublicUser } from '../../../shared-models/user/public-user.model';
import { SubscriberData } from '../../../shared-models/email/subscriber-data.model';

// Creates a public user and sends a welcome email
export const processEmailSubscription = async (subscriberData: SubscriberData): Promise<PublicUser> => {
  return createPublicUser(subscriberData);
}

/////// DEPLOYABLE FUNCTIONS ///////

const callableOptions: CallableOptions = {
  enforceAppCheck: true
};

export const onCallProcessEmailSubscription = onCall(callableOptions, async (request: CallableRequest<SubscriberData>): Promise<PublicUser> => {
  const subscriberData: SubscriberData = request.data;
  logger.log(`onCallProcessSubscriber requested `, subscriberData);

  const publicUser = await processEmailSubscription(subscriberData);
  return publicUser;
});