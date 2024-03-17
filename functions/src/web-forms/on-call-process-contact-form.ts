import { CallableOptions, CallableRequest, onCall } from 'firebase-functions/v2/https';
import { Timestamp } from '@google-cloud/firestore';
import { logger } from 'firebase-functions/v2';
import { ContactForm, ContactFormKeys } from '../../../shared-models/user/contact-form.model';
import { dispatchEmail } from '../email/helpers/dispatch-email';
import { EmailUserData } from '../../../shared-models/email/email-user-data.model';
import { PublicUser, PublicUserKeys } from '../../../shared-models/user/public-user.model';
import { ANONYMOUS_EMAIL_ID, EmailIdentifiers } from '../../../shared-models/email/email-vars.model';
import { EmailPubMessage } from '../../../shared-models/email/email-pub-message.model';
import { processEmailSubscription } from './on-call-process-email-subscription';
import { SubscriberData } from '../../../shared-models/email/subscriber-data.model';


const executeActions = async (contactForm: ContactForm): Promise<PublicUser | undefined> => {
  const subscriberData: SubscriberData = contactForm.subscriberData;
  let newUser: PublicUser | undefined = undefined;
  if (contactForm[ContactFormKeys.OPT_IN]) {
    newUser = await processEmailSubscription(subscriberData);
  }

  const emailUserData: EmailUserData = {
    ...subscriberData,
    [PublicUserKeys.CREATED_TIMESTAMP]: Timestamp.now() as any,
    [PublicUserKeys.EMAIL_GROUP_UNSUBSCRIBES]: null,
    [PublicUserKeys.EMAIL_GLOBAL_UNSUBSCRIBE]: null,
    [PublicUserKeys.EMAIL_OPT_IN_CONFIRMED]: false,
    [PublicUserKeys.EMAIL_OPT_IN_TIMESTAMP]: null, 
    [PublicUserKeys.EMAIL_OPT_OUT_TIMESTAMP]: null, 
    [PublicUserKeys.EMAIL_SENDGRID_CONTACT_CREATED_TIMESTAMP]: null,
    [PublicUserKeys.EMAIL_SENDGRID_CONTACT_ID]: null,
    [PublicUserKeys.EMAIL_SENDGRID_CONTACT_LIST_ARRAY]: null,
    [PublicUserKeys.EMAIL_VERIFIED]: false,
    [PublicUserKeys.ID]: newUser?.[PublicUserKeys.ID] || ANONYMOUS_EMAIL_ID,
    [PublicUserKeys.LAST_MODIFIED_TIMESTAMP]: Timestamp.now() as any,
    [PublicUserKeys.ONBOARDING_WELCOME_EMAIL_SENT]: false,
  };
  const emailIdentifier = EmailIdentifiers.CONTACT_FORM_CONFIRMATION;

  const emailPubMessage: EmailPubMessage = {
    emailIdentifier,
    emailUserData,
    contactForm
  };
  await dispatchEmail(emailPubMessage);

  return newUser;
}

/////// DEPLOYABLE FUNCTIONS ///////

const callableOptions: CallableOptions = {
  enforceAppCheck: true
};

export const onCallProcessContactForm = onCall(callableOptions, async (request: CallableRequest<ContactForm>): Promise<PublicUser | null> => {
  const contactForm: ContactForm = request.data;
  logger.log(`onCallProcessContactForm requested `, contactForm);

  const newUser = await executeActions(contactForm);

  return newUser || null;
});