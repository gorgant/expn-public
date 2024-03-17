import { HttpsError } from 'firebase-functions/v2/https';
import { logger } from 'firebase-functions/v2';
import { getSgMail } from "../config";
import { EmailSenderAddresses, EmailSenderNames, EmailIdentifiers, SendgridEmailTemplateIds, SendgridEmailUnsubscribeGroupIds, AdminEmailAddresses } from "../../../../shared-models/email/email-vars.model";
import { currentEnvironmentType } from "../../config/environments-config";
import { EnvironmentTypes } from "../../../../shared-models/environments/env-vars.model";
import { MailDataRequired } from "@sendgrid/helpers/classes/mail";
import { EmailUserData } from "../../../../shared-models/email/email-user-data.model";
import { PublicCollectionPaths } from "../../../../shared-models/routes-and-paths/fb-collection-paths.model";
import { publicFirestore } from "../../config/db-config";
import { EmailData } from "@sendgrid/helpers/classes/email-address";
import { WebsiteUrls } from '../../../../shared-models/meta/web-urls.model';
import { DownloadableUrls } from '../../../../shared-models/meta/promo-urls.model';
import { SocialUrls } from '../../../../shared-models/meta/social-urls.model';
import { PublicUserKeys } from '../../../../shared-models/user/public-user.model';

const markIntroEmailSent = async (userData: EmailUserData) => {

  const onboardingWelcomeEmailSent: Partial<EmailUserData> = {
    onboardingWelcomeEmailSent: true
  }

  const fbRes = await publicFirestore.collection(PublicCollectionPaths.PUBLIC_USERS).doc(userData.id).update(onboardingWelcomeEmailSent)
    .catch(err => {logger.log(`Failed to update subscriber data in public database`, err); return err;});

  logger.log('Marked onboardingWelcomeEmailSent true', fbRes);
  return fbRes;
}

export const sendOnboardingWelcomeEmail = async (userData: EmailUserData) => {
  
  const sgMail = getSgMail();
  const fromEmail = EmailSenderAddresses.EXPN_DEFAULT;
  const fromName = EmailSenderNames.EXPN_DEFAULT;
  const toFirstName = userData[PublicUserKeys.FIRST_NAME];
  const toEmail = userData[PublicUserKeys.EMAIL];
  let recipientData: EmailData | EmailData[];
  let bccData: EmailData | EmailData[];
  const templateId: string = SendgridEmailTemplateIds.EXPN_ONBOARDING_WELCOME;
  const unsubscribeGroupId: number = SendgridEmailUnsubscribeGroupIds.EXPN_PRIMARY_NEWSLETTER;
  let categories: string[];

  logger.log('Sending Onboarding Welcome Email to:', toEmail);

  switch (currentEnvironmentType) {
    case EnvironmentTypes.PRODUCTION:
      recipientData = [
        {
          email: toEmail,
          name: toFirstName
        }
      ];
      categories = [EmailIdentifiers.ONBOARDING_WELCOME];
      bccData = '';
      break;
    case EnvironmentTypes.SANDBOX:
      recipientData = AdminEmailAddresses.EXPN_TEST_1;
      categories = [EmailIdentifiers.ONBOARDING_WELCOME, EmailIdentifiers.TEST_SEND];
      bccData = '';
      break;
    default:
      recipientData = AdminEmailAddresses.EXPN_ADMIN;
      categories = [EmailIdentifiers.ONBOARDING_WELCOME, EmailIdentifiers.TEST_SEND];
      bccData = '';
      break;
  }

  const msg: MailDataRequired = {
    to: recipientData,
    from: {
      email: fromEmail,
      name: fromName,
    },
    bcc: bccData,
    templateId,
    dynamicTemplateData: {
      academyUrl: WebsiteUrls.ACDMY_HOME,
      blogUrl: WebsiteUrls.EXPN_BLOG,
      downloadableUrl: DownloadableUrls.EXPN_DOWNLOADABLE,
      firstName: toFirstName, // Will populate first name greeting if name exists
      replyEmailAddress: EmailSenderAddresses.EXPN_NEWSLETTER, // TODO: Once production is live, change the Sendgrid website template variable name to newsletterEmailAddress and update this accordingly
      youTubeChannelUrl: SocialUrls.EXPN_YOUTUBE
    },
    trackingSettings: {
      subscriptionTracking: {
        enable: true, // Enable tracking in order to catch the unsubscribe webhook
      },
    },
    asm: {
      groupId: unsubscribeGroupId, // Set the unsubscribe group
    },
    categories
  };
  const sendgridResponse = await sgMail.send(msg)
    .catch(err => {logger.log(`Error sending email: ${msg} because:`, err); throw new HttpsError('internal', err);});
  
  // If email is successful, mark intro email sent
  if (sendgridResponse) {
    await markIntroEmailSent(userData);
  }

  logger.log('Email sent', msg);
  return sendgridResponse;
}
